"use client";

import React, { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/src/hooks/useAuth";
import { ArrowLeftIcon, UserIcon, CalendarDaysIcon, CheckCircleIcon, BookOpenIcon, PrinterIcon, ArrowDownTrayIcon, ClipboardDocumentListIcon } from "@heroicons/react/24/outline";
import { getFormulairesEnvoyes, getFormulaireById, getReponses } from "@/src/lib/api";
import { handleError } from "@/src/lib/errorHandler";
import { config } from "@/src/lib/config";
import ExportCsvButton from "@/src/components/export/ExportCsvButton";

function ReponsesFormulaireContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { token, user } = useAuth();
    const formulaireMedecinId = searchParams.get('id');
    
    const [formulaireData, setFormulaireData] = useState<any>(null);
    const [reponses, setReponses] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Rediriger si pas chercheur
    useEffect(() => {
        if (user && user.role !== 'chercheur') {
            router.push('/dashboard-medecin');
        }
    }, [user, router]);

    useEffect(() => {
        const fetchReponses = async () => {
            if (!formulaireMedecinId || !token) {
                setError('ID manquant ou non authentifié');
                setIsLoading(false);
                return;
            }

            try {
                // Récupérer les infos du formulaire envoyé
                const formulaires = await getFormulairesEnvoyes(token);
                const formulaireEnvoye = formulaires.find((f: any) => f.id === parseInt(formulaireMedecinId));
                
                if (formulaireEnvoye) {
                    // Récupérer le formulaire complet avec tous les champs
                    try {
                        const formulaireComplet = await getFormulaireById(token, formulaireEnvoye.formulaire.idFormulaire);
                        setFormulaireData({
                            ...formulaireEnvoye,
                            formulaire: formulaireComplet
                        });
                    } catch {
                        setFormulaireData(formulaireEnvoye);
                    }
                }

                // Récupérer les réponses
                const reponsesData = await getReponses(token, parseInt(formulaireMedecinId));
                setReponses(reponsesData);
            } catch (err) {
                const formattedError = handleError(err, 'ReponsesFormulaire');
                setError(formattedError.userMessage);
            } finally {
                setIsLoading(false);
            }
        };

        fetchReponses();
    }, [formulaireMedecinId, token]);

    // Créer un map des réponses par champId pour un accès rapide
    const reponsesMap = reponses.reduce((acc: any, reponse: any) => {
        acc[reponse.champ.idChamp] = reponse.valeur;
        return acc;
    }, {});

    // Debug: afficher les réponses dans la console (uniquement en mode debug)
    useEffect(() => {
        if (config.features.enableDebug && reponses.length > 0) {
            console.log('📊 Réponses:', { reponses, reponsesMap, champs: formulaireData?.formulaire?.champs });
        }
    }, [reponses, reponsesMap, formulaireData]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Chargement des réponses...</p>
                </div>
            </div>
        );
    }

    if (error || !formulaireData) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-red-600 text-xl mb-4">❌</div>
                    <p className="text-gray-900 font-semibold mb-2">Erreur</p>
                    <p className="text-gray-600">{error || 'Données non trouvées'}</p>
                    <button
                        onClick={() => router.push('/dashboard-chercheur')}
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
                        onClick={() => router.push('/dashboard-chercheur')}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
                    >
                        <ArrowLeftIcon className="w-5 h-5" />
                        <span>Retour au dashboard</span>
                    </button>
                    
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-2xl font-bold text-gray-900">
                                {formulaireData.formulaire.titre}
                            </h1>
                            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                                <CheckCircleIcon className="w-4 h-4" />
                                Complété
                            </span>
                        </div>
                        <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                                <BookOpenIcon className="w-4 h-4" />
                                <span>{formulaireData.formulaire.etude?.titre || 'N/A'}</span>
                            </span>
                            <span className="flex items-center gap-1">
                                <UserIcon className="w-4 h-4" />
                                <span>Rempli par Dr. {formulaireData.medecin.nom}</span>
                            </span>
                            <span className="flex items-center gap-1">
                                <CalendarDaysIcon className="w-4 h-4" />
                                <span>Le {new Date(formulaireData.dateCompletion).toLocaleDateString('fr-FR', {
                                    day: '2-digit',
                                    month: 'long',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}</span>
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Formulaire avec réponses */}
            <div className="max-w-4xl mx-auto px-6 py-8">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                        <ClipboardDocumentListIcon className="w-6 h-6 text-emerald-600" />
                        <span>Formulaire complété</span>
                    </h2>

                    {formulaireData.formulaire.description && (
                        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <p className="text-sm text-blue-800">{formulaireData.formulaire.description}</p>
                        </div>
                    )}

                    {!formulaireData.formulaire.champs || formulaireData.formulaire.champs.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl">📝</span>
                            </div>
                            <p className="text-gray-600">Aucune question dans ce formulaire</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {formulaireData.formulaire.champs.map((champ: any, index: number) => {
                                const reponseValue = reponsesMap[champ.idChamp];
                                const champType = champ.type?.toUpperCase();
                                
                                return (
                                    <div key={champ.idChamp} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                                        <label className="block text-sm font-medium text-gray-900 mb-3">
                                            {index + 1}. {champ.label}
                                            {champ.obligatoire && <span className="text-red-600 ml-1">*</span>}
                                        </label>

                                        {champType === 'TEXTE' && (
                                            <div className="bg-white border-2 border-green-500 rounded-lg px-4 py-3">
                                                <p className="text-gray-900 font-medium">
                                                    {reponseValue || <span className="text-gray-400 italic">Non rempli</span>}
                                                </p>
                                            </div>
                                        )}

                                        {champType === 'NOMBRE' && (
                                            <div className="bg-white border-2 border-green-500 rounded-lg px-4 py-3">
                                                <p className="text-gray-900 font-medium">
                                                    {reponseValue || <span className="text-gray-400 italic">Non rempli</span>}
                                                    {champ.unite && reponseValue && <span className="text-gray-600 ml-2">{champ.unite}</span>}
                                                </p>
                                            </div>
                                        )}

                                        {champType === 'DATE' && (
                                            <div className="bg-white border-2 border-green-500 rounded-lg px-4 py-3">
                                                <p className="text-gray-900 font-medium">
                                                    {reponseValue ? new Date(reponseValue).toLocaleDateString('fr-FR', {
                                                        day: '2-digit',
                                                        month: 'long',
                                                        year: 'numeric'
                                                    }) : <span className="text-gray-400 italic">Non rempli</span>}
                                                </p>
                                            </div>
                                        )}

                                        {champType === 'CHOIX_MULTIPLE' && (
                                            <div className="space-y-2">
                                                {champ.listeValeur?.options?.map((option: any, optIndex: number) => {
                                                    const isSelected = reponseValue === option.libelle;
                                                    return (
                                                        <div 
                                                            key={optIndex} 
                                                            className={`flex items-center gap-3 p-3 border-2 rounded-lg ${
                                                                isSelected 
                                                                    ? 'bg-green-50 border-green-500' 
                                                                    : 'bg-white border-gray-200'
                                                            }`}
                                                        >
                                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                                                isSelected 
                                                                    ? 'border-green-600 bg-green-600' 
                                                                    : 'border-gray-300'
                                                            }`}>
                                                                {isSelected && (
                                                                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                                    </svg>
                                                                )}
                                                            </div>
                                                            <span className={`${isSelected ? 'text-gray-900 font-semibold' : 'text-gray-600'}`}>
                                                                {option.libelle}
                                                            </span>
                                                            {isSelected && (
                                                                <span className="ml-auto text-green-600 text-sm font-medium">✓ Sélectionné</span>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="mt-6 flex justify-between items-center">
                    <button
                        onClick={() => router.push('/dashboard-chercheur')}
                        className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Retour
                    </button>
                    <div className="flex gap-3">
                        <button
                            onClick={() => window.print()}
                            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
                        >
                            <PrinterIcon className="w-5 h-5" />
                            Imprimer
                        </button>
                        {formulaireMedecinId && (
                            <ExportCsvButton
                                formulaireMedecinId={Number(formulaireMedecinId)}
                                variant="button"
                            />

                        )}

                    </div>
                </div>
            </div>
        </div>
    );
}

export default function ReponsesFormulaire() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Chargement...</div>}>
            <ReponsesFormulaireContent />
        </Suspense>
    );
}
