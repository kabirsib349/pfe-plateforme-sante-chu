"use client";

import React, { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/src/hooks/useAuth";
import { useToast } from "@/src/hooks/useToast";
import { ToastContainer } from "@/src/components/ToastContainer";
import { ArrowLeftIcon, BookOpenIcon, UserIcon, CalendarDaysIcon, ExclamationCircleIcon } from "@heroicons/react/24/outline";
import { ConfirmationModal } from "@/src/components/ui/ConfirmationModal";
import { getFormulaireRecu, submitReponses, marquerCommeLu, getDraftForPatient } from "@/src/lib/api";
import { handleError } from "@/src/lib/errorHandler";
import { config } from "@/src/lib/config";
import { parseCalculatedField, calculateFieldValue, formatCalculatedValue } from "@/src/lib/formulaCalculator";

function RemplirFormulaireContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { token, user } = useAuth();
    // helper to navigate back according to role
    const goBack = () => {
        if (user?.role === 'chercheur') {
            router.push('/dashboard-chercheur?tab=allforms');
        } else {
            router.push('/dashboard-medecin');
        }
    };
    const { showToast, toasts, removeToast } = useToast();
    const formulaireRecuId = searchParams.get('id');

    const [formulaireRecu, setFormulaireRecu] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [reponses, setReponses] = useState<Record<string, any>>({});
    const [patientIdentifier, setPatientIdentifier] = useState<string>(searchParams.get('patient') || '');
    const [champsMap, setChampsMap] = useState<Map<string, string>>(new Map());
    const [isDraft, setIsDraft] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);

    // Rediriger si pas médecin sauf si on vient en tant que chercheur (source=chercheur)
    useEffect(() => {
        const source = searchParams.get('source');
        if (user) {
            if (user.role !== 'medecin' && source !== 'chercheur') {
                router.push('/dashboard-chercheur');
            }
        }
    }, [user, router, searchParams]);

    useEffect(() => {
        const fetchFormulaireRecu = async () => {
            if (!formulaireRecuId || !token) {
                setError('ID de formulaire manquant ou non authentifié');
                setIsLoading(false);
                return;
            }

            try {
                const data = await getFormulaireRecu(token, parseInt(formulaireRecuId));
                setFormulaireRecu({ formulaire: data });

                // Construire la map champId -> nomVariable pour les calculs
                const map = new Map<string, string>();
                data.champs?.forEach((champ: any) => {
                    // Extraire le nomVariable du label (format attendu)
                    const nomVariable = champ.label?.toUpperCase().replace(/\s+/g, '_') || '';
                    map.set(champ.idChamp.toString(), nomVariable);
                });
                setChampsMap(map);


                // Marquer comme lu uniquement si l'utilisateur courant est un médecin
                if (user && user.role === 'medecin') {
                    marquerCommeLu(token, parseInt(formulaireRecuId)).catch(err => {
                        if (config.features.enableDebug) {
                            console.error('[FormRemplir] Erreur marquage lu:', err);
                        }
                    });
                }
            } catch (err) {
                const formattedError = handleError(err, 'RemplirFormulaire');
                setError(formattedError.userMessage);
            } finally {
                setIsLoading(false);
            }
        };

        fetchFormulaireRecu();
    }, [formulaireRecuId, token]);

    const handleReponseChange = (champId: string, valeur: any) => {
        setReponses(prev => {
            const newReponses = { ...prev, [champId]: valeur };

            // Recalculer tous les champs calculés
            formulaireRecu?.formulaire?.champs?.forEach((champ: any) => {
                const calculatedField = parseCalculatedField(champ.unite);
                if (calculatedField) {
                    const calculatedValue = calculateFieldValue(champ.unite, newReponses, champsMap);
                    if (calculatedValue !== null) {
                        newReponses[champ.idChamp] = formatCalculatedValue(calculatedValue);
                    }
                }
            });

            return newReponses;
        });
    };

    // Helper pour formater les réponses avant envoi (Map<String, String>)
    const formatReponsesForApi = (currentReponses: Record<string, any>) => {
        const reponsesMap: Record<string, string> = {};

        // Champs normaux
        Object.keys(currentReponses).forEach(champId => {
            reponsesMap[champId] = Array.isArray(currentReponses[champId])
                ? JSON.stringify(currentReponses[champId])
                : currentReponses[champId]?.toString() || '';
        });

        // Add calculated field values
        formulaireRecu?.formulaire?.champs?.forEach((champ: any) => {
            if (champ.type?.toUpperCase() === 'CALCULE') {
                const uniteData = champ.unite?.split(':')[1] || '';
                const [formule, champsRequisStr] = uniteData.split('|');
                const champsRequis = champsRequisStr?.split(',') || [];

                // Get values for required fields
                const valeursChamps: Record<string, number> = {};
                let tousRemplis = true;

                champsRequis.forEach((nomVar: string) => {
                    const champRequis = formulaireRecu.formulaire.champs.find(
                        (c: any) => c.label.toUpperCase().replace(/\s+/g, '_') === nomVar
                    );
                    if (champRequis && currentReponses[champRequis.idChamp]) {
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
                        console.error('Erreur calcul pour sauvegarde:', error);
                    }
                }
            }
        });

        return reponsesMap;
    };

    // Sauvegarde manuelle du brouillon
    const handleSaveDraft = async () => {
        if (!token || !formulaireRecuId || !patientIdentifier.trim()) {
            showToast('Veuillez renseigner l\'identifiant patient', 'info');
            return;
        }

        if (Object.keys(reponses).length === 0) {
            showToast('Le formulaire est vide', 'info');
            return;
        }

        setIsSaving(true);
        try {
            await submitReponses(token, {
                formulaireMedecinId: parseInt(formulaireRecuId),
                patientIdentifier: patientIdentifier.trim(),
                reponses: formatReponsesForApi(reponses)
            }, true);  // true = brouillon

            setIsDraft(true);
            showToast('Brouillon sauvegardé avec succès', 'success');
        } catch (error) {
            const formattedError = handleError(error, 'SaveDraft');
            showToast(formattedError.userMessage, 'error');
        } finally {
            setIsSaving(false);
        }
    };

    // Charger le brouillon quand l'identifiant patient change (uniquement pour les médecins)
    useEffect(() => {
        const loadDraft = async () => {
            // Le mode brouillon n'est disponible que pour les médecins
            if (!patientIdentifier || !formulaireRecuId || !token || user?.role !== 'medecin') return;

            try {
                const draft = await getDraftForPatient(
                    token,
                    parseInt(formulaireRecuId),
                    patientIdentifier
                );

                if (draft && draft.reponses && draft.reponses.length > 0) {
                    const reponsesMap: Record<string, any> = {};
                    draft.reponses.forEach((reponse: any) => {
                        if (reponse.champ && reponse.champ.idChamp) {
                            reponsesMap[reponse.champ.idChamp.toString()] = reponse.valeur;
                        }
                    });
                    setReponses(reponsesMap);
                    setIsDraft(true);
                }
            } catch (error) {
                // Nouveau patient, formulaire vierge
                if (config.features.enableDebug) {
                    console.log('[FormRemplir] Nouveau patient, pas de brouillon');
                }
            }
        };

        loadDraft();
    }, [patientIdentifier, formulaireRecuId, token, user]);

    const handleInitialSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitModalOpen(true);
    };

    const handleConfirmSubmit = async () => {
        if (!token || !formulaireRecuId) {
            showToast('Erreur: Authentification ou ID manquant', 'error');
            return;
        }

        if (!patientIdentifier.trim()) {
            showToast('Veuillez saisir un identifiant patient', 'error');
            return;
        }

        setIsSending(true);
        try {
            await submitReponses(token, {
                formulaireMedecinId: parseInt(formulaireRecuId),
                patientIdentifier: patientIdentifier.trim(),
                reponses: formatReponsesForApi(reponses)
            }, false);  // false = soumission finale

            showToast('Formulaire enregistré avec succès pour le patient ' + patientIdentifier, 'success');
            setTimeout(() => {
                if (user?.role === 'chercheur') {
                    router.push('/dashboard-chercheur?tab=data');
                } else {
                    router.push('/dashboard-medecin');
                }
            }, 1500);
        } catch (error) {
            const formattedError = handleError(error, 'SubmitReponses');
            showToast(formattedError.userMessage, 'error');
        } finally {
            setIsSending(false);
            setIsSubmitModalOpen(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Chargement du formulaire...</p>
                </div>
            </div>
        );
    }

    if (error || !formulaireRecu) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <ExclamationCircleIcon className="w-12 h-12 text-red-600 mx-auto mb-4" />
                    <p className="text-gray-900 font-semibold mb-2">Erreur</p>
                    <p className="text-gray-600">{error || 'Formulaire non trouvé'}</p>
                    <button
                        onClick={() => goBack()}
                        className="mt-4 text-blue-600 hover:text-blue-800"
                    >
                        Retour au dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header et Contenu centré */}
            <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">

                {/* Bouton Retour */}
                <button
                    onClick={() => goBack()}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-2 transition-colors"
                >
                    <ArrowLeftIcon className="w-5 h-5" />
                    <span>Retour au dashboard</span>
                </button>

                <form onSubmit={handleInitialSubmit} className="space-y-6">

                    {/* Carte Titre (Style Google Form) */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 border-t-[10px] border-t-blue-600 p-6">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            {formulaireRecu.formulaire.titre}
                        </h1>
                        {formulaireRecu.formulaire.description && (
                            <p className="text-gray-600 mb-6 text-base">{formulaireRecu.formulaire.description}</p>
                        )}

                        <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-gray-100 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                                <BookOpenIcon className="w-4 h-4" />
                                {formulaireRecu.formulaire.etude?.titre || 'N/A'}
                            </span>
                            <span className="flex items-center gap-1">
                                <UserIcon className="w-4 h-4" />
                                Par {formulaireRecu.formulaire.chercheur?.nom || 'N/A'}
                            </span>
                            <span className="flex items-center gap-1">
                                <CalendarDaysIcon className="w-4 h-4" />
                                {new Date(formulaireRecu.formulaire.dateCreation).toLocaleDateString('fr-FR')}
                            </span>
                        </div>
                    </div>

                    {/* Carte Identifiant Patient */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <label className="block text-base font-semibold text-gray-900 mb-3">
                            Identifiant Patient <span className="text-red-600">*</span>
                        </label>
                        <div className="relative">
                            <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                value={patientIdentifier}
                                onChange={(e) => setPatientIdentifier(e.target.value)}
                                placeholder="Ex: P-2024-001"
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                required
                            />
                        </div>
                        <p className="mt-2 text-sm text-gray-500">
                            Identifiant unique du patient pour cette étude.
                        </p>
                    </div>

                    <div className="space-y-6 mt-6">
                        {formulaireRecu.formulaire.champs && formulaireRecu.formulaire.champs.length > 0 ? (
                            formulaireRecu.formulaire.champs.map((champ: any, index: number) => (
                                <div key={champ.idChamp} className="p-4 border border-gray-200 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow">
                                    <label className="block text-sm font-medium text-gray-900 mb-2">
                                        {index + 1}. {champ.label}
                                        {champ.obligatoire && <span className="text-red-600 ml-1">*</span>}
                                    </label>

                                    {champ.type?.toUpperCase() === 'TEXTE' && (() => {
                                        const isCalculated = parseCalculatedField(champ.unite);

                                        if (isCalculated) {
                                            // Champ calculé - lecture seule
                                            return (
                                                <div>
                                                    <div className="relative">
                                                        <input
                                                            type="text"
                                                            value={reponses[champ.idChamp] || ''}
                                                            readOnly
                                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 font-semibold"
                                                            placeholder="Calculé automatiquement"
                                                        />
                                                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                                            <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                                            </svg>
                                                        </div>
                                                    </div>
                                                    <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                                        </svg>
                                                        Calculé automatiquement : {isCalculated.formula}
                                                    </p>
                                                </div>
                                            );
                                        }

                                        // Champ texte normal
                                        return (
                                            <textarea
                                                required={champ.obligatoire}
                                                maxLength={500}
                                                rows={3}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                                                placeholder="(max 500 caractères)"
                                                onChange={(e) => handleReponseChange(champ.idChamp, e.target.value)}
                                            />
                                        );
                                    })()}

                                    {champ.type?.toUpperCase() === 'NOMBRE' && (
                                        <div>
                                            <input
                                                type="number"
                                                required={champ.obligatoire}
                                                min={champ.valeurMin ?? undefined}
                                                max={champ.valeurMax ?? undefined}
                                                step="any"
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                placeholder="Votre reponse"
                                                onChange={(e) => handleReponseChange(champ.idChamp, e.target.value)}
                                            />
                                            {(champ.valeurMin !== null && champ.valeurMin !== undefined) || (champ.valeurMax !== null && champ.valeurMax !== undefined) ? (
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {champ.valeurMin !== null && champ.valeurMin !== undefined && champ.valeurMax !== null && champ.valeurMax !== undefined
                                                        ? `Valeur entre ${champ.valeurMin} et ${champ.valeurMax}`
                                                        : champ.valeurMin !== null && champ.valeurMin !== undefined
                                                            ? `Valeur minimum: ${champ.valeurMin}`
                                                            : `Valeur maximum: ${champ.valeurMax}`}
                                                    {champ.unite && ` ${champ.unite}`}
                                                </p>
                                            ) : champ.unite ? (
                                                <p className="text-xs text-gray-500 mt-1">Unité: {champ.unite}</p>
                                            ) : null}
                                        </div>
                                    )}

                                    {champ.type?.toUpperCase() === 'CALCULE' && (() => {
                                        // Parse formula and required fields from unite
                                        const uniteData = champ.unite?.split(':')[1] || '';
                                        const [formule, champsRequisStr] = uniteData.split('|');
                                        const champsRequis = champsRequisStr?.split(',') || [];

                                        // Get values for required fields
                                        const valeursChamps: Record<string, number> = {};
                                        let tousRemplis = true;

                                        // Find the required fields and get their values
                                        champsRequis.forEach((nomVar: string) => {
                                            const champRequis = formulaireRecu?.formulaire?.champs?.find(
                                                (c: any) => c.label.toUpperCase().replace(/\s+/g, '_') === nomVar
                                            );
                                            if (champRequis && reponses[champRequis.idChamp]) {
                                                valeursChamps[nomVar] = parseFloat(reponses[champRequis.idChamp]);
                                            } else {
                                                tousRemplis = false;
                                            }
                                        });

                                        // Calculate the value if all required fields are filled
                                        let valeurCalculee: number | null = null;
                                        if (tousRemplis && formule) {
                                            try {
                                                // Simple formula evaluation for POIDS/(TAILLE^2)
                                                // Replace variable names with their values
                                                let formuleEvaluable = formule;
                                                Object.keys(valeursChamps).forEach(nomVar => {
                                                    formuleEvaluable = formuleEvaluable.replace(
                                                        new RegExp(nomVar, 'g'),
                                                        valeursChamps[nomVar].toString()
                                                    );
                                                });

                                                // Replace ^ with ** for JavaScript
                                                formuleEvaluable = formuleEvaluable.replace(/\^/g, '**');

                                                // Evaluate the formula
                                                const resultat = eval(formuleEvaluable);

                                                // Round to 2 decimal places
                                                if (!isNaN(resultat)) {
                                                    valeurCalculee = Math.round(resultat * 100) / 100;
                                                }
                                            } catch (error) {
                                                console.error('Erreur de calcul:', error);
                                            }
                                        }

                                        return (
                                            <div className="bg-blue-50 border-2 border-blue-400 rounded-lg px-4 py-3">
                                                <p className="text-sm text-blue-800 mb-2 font-semibold">
                                                    Champ calculé automatiquement
                                                </p>
                                                {valeurCalculee !== null ? (
                                                    <div className="bg-white border border-blue-300 rounded px-3 py-2">
                                                        <p className="text-2xl font-bold text-blue-900">
                                                            {valeurCalculee}
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <p className="text-xs text-blue-600">
                                                        Remplissez les champs requis : {champsRequis.join(', ')}
                                                    </p>
                                                )}
                                            </div>
                                        );
                                    })()}

                                    {champ.type?.toUpperCase() === 'DATE' && (
                                        <input
                                            type="date"
                                            required={champ.obligatoire}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            onChange={(e) => handleReponseChange(champ.idChamp, e.target.value)}
                                        />
                                    )}

                                    {(champ.type?.toUpperCase() === 'CHOIX_UNIQUE' || champ.type?.toUpperCase() === 'RADIO') && (
                                        <div className="space-y-1 mt-2">
                                            {champ.listeValeur?.options?.map((option: any, index: number) => (
                                                <label key={`${champ.idChamp}-${index}`} className="flex items-center gap-3 py-2 px-2 rounded hover:bg-gray-100 transition-colors cursor-pointer group">
                                                    <div className="relative flex items-center">
                                                        <input
                                                            type="radio"
                                                            name={`champ_${champ.idChamp}`}
                                                            value={option.libelle}
                                                            checked={reponses[champ.idChamp] === option.libelle}
                                                            required={champ.obligatoire}
                                                            onChange={(e) => handleReponseChange(champ.idChamp, e.target.value)}
                                                            className="h-5 w-5 text-blue-600 border-gray-300 focus:ring-blue-500"
                                                        />
                                                    </div>
                                                    <span className="text-gray-700 group-hover:text-gray-900">{option.libelle}</span>
                                                </label>
                                            ))}
                                        </div>
                                    )}

                                    {(champ.type?.toUpperCase() === 'CASE_A_COCHER' || champ.type?.toUpperCase() === 'CHECKBOX' || champ.type?.toUpperCase() === 'CHOIX_MULTIPLE') && (
                                        <div className="space-y-1 mt-2">
                                            {champ.listeValeur?.options?.map((option: any, index: number) => {
                                                const currentValues = Array.isArray(reponses[champ.idChamp]) ? reponses[champ.idChamp] : [];
                                                const isChecked = currentValues.includes(option.libelle);

                                                return (
                                                    <label key={`${champ.idChamp}-${index}`} className="flex items-center gap-3 py-2 px-2 rounded hover:bg-gray-100 transition-colors cursor-pointer group">
                                                        <div className="relative flex items-center">
                                                            <input
                                                                type="checkbox"
                                                                name={`champ_${champ.idChamp}`}
                                                                value={option.libelle}
                                                                checked={isChecked}
                                                                onChange={(e) => {
                                                                    const val = e.target.value;
                                                                    const newValues = e.target.checked
                                                                        ? [...currentValues, val]
                                                                        : currentValues.filter((v: string) => v !== val);
                                                                    handleReponseChange(champ.idChamp, newValues);
                                                                }}
                                                                className="h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                                            />
                                                        </div>
                                                        <span className="text-gray-700 group-hover:text-gray-900">{option.libelle}</span>
                                                    </label>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500 text-center py-8">Aucune question dans ce formulaire</p>
                        )}
                    </div>



                    <div className="mt-8 flex justify-end gap-4">
                        <button
                            type="button"
                            onClick={() => goBack()}
                            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            Annuler
                        </button>

                        {/* Bouton brouillon uniquement pour les médecins */}
                        {user?.role === 'medecin' && (
                            <button
                                type="button"
                                onClick={handleSaveDraft}
                                disabled={isSending || isSaving}
                                className="inline-flex items-center gap-2 px-6 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                                </svg>
                                {isSaving ? 'Sauvegarde...' : 'Sauvegarder brouillon'}
                            </button>
                        )}

                        <button
                            type="submit"
                            disabled={isSending}
                            className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {isSending ? 'Envoi en cours...' : 'Soumettre'}
                        </button>
                    </div>
                </form>
            </div>
            <ConfirmationModal
                isOpen={isSubmitModalOpen}
                onClose={() => setIsSubmitModalOpen(false)}
                onConfirm={handleConfirmSubmit}
                title="Confirmer la soumission"
                message="Êtes-vous sûr de vouloir soumettre ce formulaire ? Une fois soumis, vous ne pourrez plus le modifier."
                confirmText="Soumettre"
                variant="info"
            />
            <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
        </div>
    );
}

export default function RemplirFormulaire() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Chargement...</div>}>
            <RemplirFormulaireContent />
        </Suspense>
    );
}
