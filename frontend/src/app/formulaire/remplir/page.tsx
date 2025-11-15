"use client";

import React, { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/src/hooks/useAuth";
import { useToast } from "@/src/hooks/useToast";
import { ToastContainer } from "@/src/components/ToastContainer";
import { ArrowLeftIcon, BookOpenIcon, UserIcon, CalendarDaysIcon } from "@heroicons/react/24/outline";
import { getFormulaireRecu, submitReponses, marquerCommeLu } from "@/src/lib/api";
import { handleError } from "@/src/lib/errorHandler";
import { config } from "@/src/lib/config";
import { parseCalculatedField, calculateFieldValue, formatCalculatedValue } from "@/src/lib/formulaCalculator";

function RemplirFormulaireContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { token, user } = useAuth();
    const { showToast, toasts, removeToast } = useToast();
    const formulaireRecuId = searchParams.get('id');
    
    const [formulaireRecu, setFormulaireRecu] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [reponses, setReponses] = useState<Record<string, any>>({});
    const [patientIdentifier, setPatientIdentifier] = useState<string>('');
    const [champsMap, setChampsMap] = useState<Map<string, string>>(new Map());

    // Rediriger si pas médecin
    useEffect(() => {
        if (user && user.role !== 'medecin') {
            router.push('/dashboard-chercheur');
        }
    }, [user, router]);

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

                // Marquer comme lu
                marquerCommeLu(token, parseInt(formulaireRecuId)).catch(err => {
                    if (config.features.enableDebug) {
                        console.error('🔴 Erreur marquage lu:', err);
                    }
                });
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
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
                reponses: reponses
            });

            showToast('Formulaire enregistré avec succès pour le patient ' + patientIdentifier, 'success');
            setTimeout(() => {
                router.push('/dashboard-medecin');
            }, 1500);
        } catch (error) {
            const formattedError = handleError(error, 'SubmitReponses');
            showToast(formattedError.userMessage, 'error');
        } finally {
            setIsSending(false);
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
                    <div className="text-red-600 text-xl mb-4">❌</div>
                    <p className="text-gray-900 font-semibold mb-2">Erreur</p>
                    <p className="text-gray-600">{error || 'Formulaire non trouvé'}</p>
                    <button
                        onClick={() => router.push('/dashboard-medecin')}
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
            {/* Header */}
            <div className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-4xl mx-auto px-6 py-4">
                    <button
                        onClick={() => router.push('/dashboard-medecin')}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
                    >
                        <ArrowLeftIcon className="w-5 h-5" />
                        <span>Retour au dashboard</span>
                    </button>
                    
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">
                            {formulaireRecu.formulaire.titre}
                        </h1>
                        {formulaireRecu.formulaire.description && (
                            <p className="text-gray-600">{formulaireRecu.formulaire.description}</p>
                        )}
                        <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                                <BookOpenIcon className="w-4 h-4" />
                                {formulaireRecu.formulaire.etude?.titre || 'N/A'}
                            </span>
                            <span className="flex items-center gap-1">
                                <UserIcon className="w-4 h-4" />
                                Envoyé par {formulaireRecu.formulaire.chercheur?.nom || 'N/A'}
                            </span>
                            <span className="flex items-center gap-1">
                                <CalendarDaysIcon className="w-4 h-4" />
                                {new Date(formulaireRecu.formulaire.dateCreation).toLocaleDateString('fr-FR')}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Formulaire */}
            <div className="max-w-4xl mx-auto px-6 py-8">
                <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    {/* Champ Identifiant Patient */}
                    <div className="mb-8 pb-6 border-b-2 border-blue-100 bg-blue-50/30 -m-6 p-6 rounded-t-lg">
                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                            🏥 Identifiant Patient <span className="text-red-600">*</span>
                        </label>
                        <input
                            type="text"
                            value={patientIdentifier}
                            onChange={(e) => setPatientIdentifier(e.target.value)}
                            placeholder="Ex: P-2024-001, Dossier-12345, Patient-A..."
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                        />
                        <p className="mt-2 text-sm text-gray-600">
                            Saisissez un identifiant unique pour ce patient. Vous pourrez remplir ce formulaire plusieurs fois avec des identifiants différents.
                        </p>
                    </div>

                    <div className="space-y-6 mt-6">
                        {formulaireRecu.formulaire.champs && formulaireRecu.formulaire.champs.length > 0 ? (
                            formulaireRecu.formulaire.champs.map((champ: any, index: number) => (
                                <div key={champ.idChamp} className="border-b border-gray-100 pb-6 last:border-0">
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
                                                                                    placeholder="Votre réponse (max 500 caractères)"
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
                                                                                    placeholder="Votre réponse"
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
                                                                        
                                                                        {champ.type?.toUpperCase() === 'DATE' && (
                                                                            <input
                                                                                type="date"
                                                                                required={champ.obligatoire}
                                                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                                                onChange={(e) => handleReponseChange(champ.idChamp, e.target.value)}
                                                                            />
                                                                        )}
                                                                        
                                        {champ.type?.toUpperCase() === 'CHOIX_MULTIPLE' && (
                                            <div className="space-y-2 mt-2">
                                                {champ.listeValeur?.options?.map((option: any, index: number) => (
                                                    <label key={`${champ.idChamp}-${index}`} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                                                        <input
                                                            type="radio"
                                                            name={`champ_${champ.idChamp}`}
                                                            value={option.libelle}
                                                            required={champ.obligatoire}
                                                            onChange={(e) => handleReponseChange(champ.idChamp, e.target.value)}
                                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                                        />
                                                        <span className="text-gray-800">{option.libelle}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        )}                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500 text-center py-8">Aucune question dans ce formulaire</p>
                        )}
                    </div>

                    <div className="mt-8 flex justify-end gap-4">
                        <button
                            type="button"
                            onClick={() => router.push('/dashboard-medecin')}
                            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={isSending}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSending ? 'Envoi en cours...' : 'Envoyer les réponses'}
                        </button>
                    </div>
                </form>
            </div>
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
