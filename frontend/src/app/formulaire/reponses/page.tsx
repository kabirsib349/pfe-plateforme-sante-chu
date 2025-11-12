"use client";

import React, { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/src/hooks/useAuth";
import { ArrowLeftIcon, UserIcon, CalendarDaysIcon, CheckCircleIcon } from "@heroicons/react/24/outline";

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
                const formulairesResponse = await fetch('http://localhost:8080/api/formulaires/envoyes', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (formulairesResponse.ok) {
                    const formulaires = await formulairesResponse.json();
                    const formulaire = formulaires.find((f: any) => f.id === parseInt(formulaireMedecinId));
                    
                    if (formulaire) {
                        setFormulaireData(formulaire);
                    }
                }

                // Récupérer les réponses
                const reponsesResponse = await fetch(`http://localhost:8080/api/reponses/${formulaireMedecinId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (reponsesResponse.ok) {
                    const reponsesData = await reponsesResponse.json();
                    setReponses(reponsesData);
                } else {
                    setError('Erreur lors du chargement des réponses');
                }
            } catch (err) {
                setError('Erreur réseau');
                console.error('Erreur:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchReponses();
    }, [formulaireMedecinId, token]);

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
                                <span>📚</span>
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

            {/* Réponses */}
            <div className="max-w-4xl mx-auto px-6 py-8">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                        <span>📋</span>
                        <span>Réponses du médecin</span>
                        <span className="text-sm font-normal text-gray-500">({reponses.length} réponse{reponses.length !== 1 ? 's' : ''})</span>
                    </h2>

                    {reponses.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl">📝</span>
                            </div>
                            <p className="text-gray-600">Aucune réponse enregistrée</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {reponses.map((reponse, index) => (
                                <div key={reponse.idReponse} className="border-b border-gray-100 pb-6 last:border-0">
                                    <div className="flex items-start gap-3">
                                        <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-sm">
                                            {index + 1}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-base font-medium text-gray-900 mb-2">
                                                {reponse.champ.label}
                                            </h3>
                                            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                                <p className="text-gray-900 whitespace-pre-wrap">
                                                    {reponse.valeur || <span className="text-gray-400 italic">Aucune réponse</span>}
                                                </p>
                                            </div>
                                            <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                                                <span>Type: {reponse.champ.type}</span>
                                                {reponse.champ.obligatoire && (
                                                    <span className="text-red-600">Obligatoire</span>
                                                )}
                                                <span>Saisi le {new Date(reponse.dateSaisie).toLocaleDateString('fr-FR')}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
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
                            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                        >
                            🖨️ Imprimer
                        </button>
                        <button
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            📊 Exporter CSV
                        </button>
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
