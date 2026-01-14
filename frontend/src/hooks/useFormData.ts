import { useState, useCallback, useEffect, useMemo } from 'react';
import { Champ } from '@/src/types';
import { submitReponses, getDraftForPatient } from '@/src/lib/api';
import { handleError } from '@/src/lib/errorHandler';
import { parseCalculatedField, calculateFieldValue, formatCalculatedValue } from '@/src/lib/formulaCalculator';

/**
 * Options for the useFormData hook.
 */
export interface UseFormDataOptions {
    /** FormulaireMedecin ID */
    formulaireMedecinId: number | null;
    /** Authentication token */
    token: string | null;
    /** User role */
    userRole: 'chercheur' | 'medecin' | undefined;
    /** Initial patient identifier */
    initialPatientId?: string;
    /** Form fields for calculating values */
    champs?: Champ[];
    /** Toast notification function */
    showToast?: (message: string, type: 'success' | 'error' | 'info') => void;
    /** Callback on successful form submission */
    onSuccess?: () => void;
}

/**
 * Return type for the useFormData hook.
 */
export interface UseFormDataReturn {
    /** Current responses map (champId -> value) */
    reponses: Record<string, any>;
    /** Patient identifier */
    patientIdentifier: string;
    /** Set patient identifier */
    setPatientIdentifier: (id: string) => void;
    /** Handle response change for a field */
    handleReponseChange: (champId: string, valeur: any) => void;
    /** Whether current data is a draft */
    isDraft: boolean;
    /** Whether draft is being saved */
    isSaving: boolean;
    /** Whether form is being submitted */
    isSubmitting: boolean;
    /** Save current state as draft */
    saveDraft: () => Promise<void>;
    /** Submit form */
    submitForm: () => Promise<void>;
    /** Map of champId to variable name for calculations */
    champsMap: Map<string, string>;
    /** Format responses for API */
    formatReponsesForApi: (reponses: Record<string, any>) => Record<string, string>;
    /** Reset form to initial state */
    resetForm: () => void;
}

/**
 * Hook for managing form data, draft saving, and submission.
 * Extracts logic from remplir/page.tsx for reusability.
 * 
 * @example
 * ```tsx
 * const { 
 *   reponses, 
 *   handleReponseChange, 
 *   saveDraft, 
 *   submitForm 
 * } = useFormData({
 *   formulaireMedecinId: 123,
 *   token: authToken,
 *   userRole: 'medecin',
 *   champs: formulaire.champs,
 *   showToast
 * });
 * ```
 */
export function useFormData({
    formulaireMedecinId,
    token,
    userRole,
    initialPatientId = '',
    champs = [],
    showToast,
    onSuccess
}: UseFormDataOptions): UseFormDataReturn {
    const [reponses, setReponses] = useState<Record<string, any>>({});
    const [patientIdentifier, setPatientIdentifier] = useState(initialPatientId);
    const [isDraft, setIsDraft] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Build map of champId -> nomVariable for calculations
    const champsMap = useMemo(() => {
        const map = new Map<string, string>();
        champs.forEach((champ) => {
            const nomVariable = champ.label?.toUpperCase().replace(/\s+/g, '_') || '';
            if (champ.idChamp) {
                map.set(champ.idChamp.toString(), nomVariable);
            }
        });
        return map;
    }, [champs]);

    // Load draft when patient identifier changes (only for medecins)
    useEffect(() => {
        const loadDraft = async () => {
            if (!patientIdentifier || !formulaireMedecinId || !token || userRole !== 'medecin') {
                return;
            }

            try {
                const draft = await getDraftForPatient(token, formulaireMedecinId, patientIdentifier);

                if (draft?.reponses && Array.isArray(draft.reponses) && draft.reponses.length > 0) {
                    const reponsesMap: Record<string, any> = {};
                    draft.reponses.forEach((reponse: any) => {
                        if (reponse.champ?.idChamp) {
                            reponsesMap[reponse.champ.idChamp.toString()] = reponse.valeur;
                        }
                    });
                    setReponses(reponsesMap);
                    setIsDraft(true);
                }
            } catch (error) {
                // New patient, empty form - this is expected
                console.debug('[useFormData] No draft found for patient');
            }
        };

        loadDraft();
    }, [patientIdentifier, formulaireMedecinId, token, userRole]);

    // Handle response change with automatic recalculation
    const handleReponseChange = useCallback((champId: string, valeur: any) => {
        setReponses(prev => {
            const newReponses = { ...prev, [champId]: valeur };

            // Recalculate all calculated fields
            champs.forEach((champ) => {
                const calculatedField = parseCalculatedField(champ.unite);
                if (calculatedField) {
                    const calculatedValue = calculateFieldValue(champ.unite, newReponses, champsMap);
                    if (calculatedValue !== null && champ.idChamp) {
                        newReponses[champ.idChamp] = formatCalculatedValue(calculatedValue);
                    }
                }
            });

            return newReponses;
        });
    }, [champs, champsMap]);

    // Format responses for API submission
    const formatReponsesForApi = useCallback((currentReponses: Record<string, any>): Record<string, string> => {
        const reponsesMap: Record<string, string> = {};

        // Normal fields
        Object.keys(currentReponses).forEach(champId => {
            reponsesMap[champId] = Array.isArray(currentReponses[champId])
                ? JSON.stringify(currentReponses[champId])
                : currentReponses[champId]?.toString() || '';
        });

        // Add calculated field values
        champs.forEach((champ) => {
            if (champ.type?.toUpperCase() === 'CALCULE' && champ.idChamp) {
                const uniteData = champ.unite?.split(':')[1] || '';
                const [formule, champsRequisStr] = uniteData.split('|');
                const champsRequis = champsRequisStr?.split(',') || [];

                // Get values for required fields
                const valeursChamps: Record<string, number> = {};
                let tousRemplis = true;

                champsRequis.forEach((nomVar: string) => {
                    const champRequis = champs.find(
                        (c) => c.label?.toUpperCase().replace(/\s+/g, '_') === nomVar
                    );
                    if (champRequis?.idChamp && currentReponses[champRequis.idChamp]) {
                        valeursChamps[nomVar] = parseFloat(currentReponses[champRequis.idChamp]);
                    } else {
                        tousRemplis = false;
                    }
                });

                // Calculate if all required fields are filled
                if (tousRemplis && formule) {
                    try {
                        let formuleEvaluable = formule;
                        Object.keys(valeursChamps).forEach(nomVar => {
                            formuleEvaluable = formuleEvaluable.replace(
                                new RegExp(nomVar, 'g'),
                                valeursChamps[nomVar].toString()
                            );
                        });
                        formuleEvaluable = formuleEvaluable.replace(/\^/g, '**');
                        const resultat = eval(formuleEvaluable);

                        if (!isNaN(resultat)) {
                            const valeurCalculee = Math.round(resultat * 100) / 100;
                            reponsesMap[champ.idChamp.toString()] = valeurCalculee.toString();
                        }
                    } catch (error) {
                        console.error('[useFormData] Calculation error:', error);
                    }
                }
            }
        });

        return reponsesMap;
    }, [champs]);

    // Save as draft
    const saveDraft = useCallback(async () => {
        if (!token || !formulaireMedecinId || !patientIdentifier.trim()) {
            showToast?.("Veuillez renseigner l'identifiant patient", 'info');
            return;
        }

        if (Object.keys(reponses).length === 0) {
            showToast?.('Le formulaire est vide', 'info');
            return;
        }

        setIsSaving(true);
        try {
            await submitReponses(token, {
                formulaireMedecinId,
                patientIdentifier: patientIdentifier.trim(),
                reponses: formatReponsesForApi(reponses)
            }, true); // true = draft

            setIsDraft(true);
            showToast?.('Brouillon sauvegardé avec succès', 'success');
        } catch (error) {
            const formattedError = handleError(error, 'SaveDraft');
            showToast?.(formattedError.userMessage, 'error');
        } finally {
            setIsSaving(false);
        }
    }, [token, formulaireMedecinId, patientIdentifier, reponses, formatReponsesForApi, showToast]);

    // Submit form
    const submitForm = useCallback(async () => {
        if (!token || !formulaireMedecinId) {
            showToast?.('Erreur: Authentification ou ID manquant', 'error');
            return;
        }

        if (!patientIdentifier.trim()) {
            showToast?.('Veuillez saisir un identifiant patient', 'error');
            return;
        }

        setIsSubmitting(true);
        try {
            await submitReponses(token, {
                formulaireMedecinId,
                patientIdentifier: patientIdentifier.trim(),
                reponses: formatReponsesForApi(reponses)
            }, false); // false = final submission

            showToast?.(`Formulaire enregistré avec succès pour le patient ${patientIdentifier}`, 'success');
            onSuccess?.();
        } catch (error) {
            const formattedError = handleError(error, 'SubmitReponses');
            showToast?.(formattedError.userMessage, 'error');
        } finally {
            setIsSubmitting(false);
        }
    }, [token, formulaireMedecinId, patientIdentifier, reponses, formatReponsesForApi, showToast, onSuccess]);

    // Reset form
    const resetForm = useCallback(() => {
        setReponses({});
        setPatientIdentifier('');
        setIsDraft(false);
    }, []);

    return {
        reponses,
        patientIdentifier,
        setPatientIdentifier,
        handleReponseChange,
        isDraft,
        isSaving,
        isSubmitting,
        saveDraft,
        submitForm,
        champsMap,
        formatReponsesForApi,
        resetForm
    };
}
