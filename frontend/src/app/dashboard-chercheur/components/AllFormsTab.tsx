'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/src/hooks/useAuth';
import { useFormulaires } from '@/src/hooks/useFormulaires';
import { Card } from '@/src/components/Card';
import { FormulaireCard } from '@/src/components/formulaire/FormulaireCard';
import { SparklesIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import type { Formulaire } from '@/src/types';

/**
 * Component for displaying all forms in the researcher dashboard.
 * Extracted from dashboard-chercheur/page.tsx for better modularity.
 */
export const AllFormsTab: React.FC = () => {
    const router = useRouter();
    const { formulaires, isLoading: isLoadingForms, error } = useFormulaires();
    const { user } = useAuth();

    return (
        <div className="space-y-6">
            <Card
                title="Tous mes formulaires"
                subtitle={`${formulaires.length} formulaire${formulaires.length !== 1 ? 's' : ''} au total`}
                action={
                    <button
                        onClick={() => router.push('/formulaire/nouveau')}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 font-medium"
                    >
                        <span>+</span>
                        Nouveau formulaire
                    </button>
                }
            >
                {isLoadingForms ? (
                    <div className="text-center py-12">
                        <div className="animate-pulse">Chargement des formulaires...</div>
                    </div>
                ) : error ? (
                    <div className="text-center py-12">
                        <div className="text-red-600 flex items-center justify-center gap-2">
                            <ExclamationCircleIcon className="w-5 h-5" />
                            Erreur: {error}
                        </div>
                        <button
                            onClick={() => window.location.reload()}
                            className="mt-2 text-blue-600 hover:text-blue-800"
                        >
                            Recharger la page
                        </button>
                    </div>
                ) : formulaires.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <SparklesIcon className="w-10 h-10 text-blue-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun formulaire créé</h3>
                        <p className="text-gray-600 mb-4">Commencez par créer votre premier formulaire</p>
                        <button
                            onClick={() => router.push('/formulaire/nouveau')}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium"
                        >
                            Créer un formulaire
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {formulaires.map((formulaire: Formulaire) => (
                            <FormulaireCard
                                key={formulaire.idFormulaire}
                                formulaire={formulaire}
                                variant="compact"
                                showRemplirButton={user?.role === 'chercheur'}
                                userRole={user?.role as 'chercheur' | 'medecin'}
                            />
                        ))}
                    </div>
                )}
            </Card>
        </div>
    );
};
