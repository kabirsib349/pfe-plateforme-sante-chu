"use client";

import React, { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/src/hooks/useAuth";
import { useToast } from "@/src/hooks/useToast";
import { ToastContainer } from "@/src/components/ToastContainer";
import { ArrowLeftIcon, BookOpenIcon, UserIcon, CalendarDaysIcon } from "@heroicons/react/24/outline";
import { getFormulaireRecu, submitReponses, marquerCommeLu } from "@/src/lib/api";
import { handleError } from "@/src/lib/errorHandler";

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

                // Marquer comme lu
                marquerCommeLu(token, parseInt(formulaireRecuId)).catch(err => 
                    console.error('Erreur marquage lu:', err)
                );
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
        setReponses(prev => ({ ...prev, [champId]: valeur }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!token || !formulaireRecuId) {
            showToast('Erreur: Authentification ou ID manquant', 'error');
            return;
        }

        setIsSending(true);
        try {
            await submitReponses(token, {
                formulaireMedecinId: parseInt(formulaireRecuId),
                reponses: reponses
            });

            showToast('✅ Formulaire envoyé avec succès au chercheur !', 'success');
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
                    <div className="space-y-6">
                        {formulaireRecu.formulaire.champs && formulaireRecu.formulaire.champs.length > 0 ? (
                            formulaireRecu.formulaire.champs.map((champ: any, index: number) => (
                                <div key={champ.idChamp} className="border-b border-gray-100 pb-6 last:border-0">
                                    <label className="block text-sm font-medium text-gray-900 mb-2">
                                        {index + 1}. {champ.label}
                                        {champ.obligatoire && <span className="text-red-600 ml-1">*</span>}
                                    </label>
                                    
                                                                        {champ.type?.toUpperCase() === 'TEXTE' && (
                                                                            <input
                                                                                type="text"
                                                                                required={champ.obligatoire}
                                                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                                                placeholder="Votre réponse"
                                                                                onChange={(e) => handleReponseChange(champ.idChamp, e.target.value)}
                                                                            />
                                                                        )}
                                                                        
                                                                        {champ.type?.toUpperCase() === 'NOMBRE' && (
                                                                            <input
                                                                                type="number"
                                                                                required={champ.obligatoire}
                                                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                                                placeholder="Votre réponse"
                                                                                onChange={(e) => handleReponseChange(champ.idChamp, e.target.value)}
                                                                            />
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
