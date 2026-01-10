"use client";

import { FC, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/src/components/Card";
import { EmptyState, LoadingState, ErrorState } from "@/src/components/ui";
import {
    PencilSquareIcon,
    UsersIcon,
    ClockIcon,
    DocumentTextIcon
} from "@heroicons/react/24/outline";
import { getAllDraftsFormulaire } from "@/src/lib/api";
import { handleError } from "@/src/lib/errorHandler";
import type { FormulaireRecuResponse, DraftSummary } from "@/src/types";

interface BrouillonsTabProps {
    formulairesRecus: FormulaireRecuResponse[];
    token: string | null;
}

interface AggregatedDraft {
    formulaireId: number;
    formulaireTitre: string;
    draft: DraftSummary;
}

export const BrouillonsTab: FC<BrouillonsTabProps> = ({
    formulairesRecus,
    token
}) => {
    const router = useRouter();
    const [drafts, setDrafts] = useState<AggregatedDraft[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchAllDrafts = async () => {
            if (!token || formulairesRecus.length === 0) {
                setIsLoading(false);
                return;
            }

            try {
                setIsLoading(true);
                const allDrafts: AggregatedDraft[] = [];

                // Pour chaque formulaire reçu, on récupère ses brouillons
                // Utilisation de Promise.all pour paralléliser
                await Promise.all(
                    formulairesRecus.map(async (formulaireRecu) => {
                        try {
                            const formDrafts = await getAllDraftsFormulaire(token, formulaireRecu.id);

                            // Ajouter chaque brouillon à la liste globale
                            formDrafts.forEach(draft => {
                                allDrafts.push({
                                    formulaireId: formulaireRecu.id,
                                    formulaireTitre: formulaireRecu.formulaire.titre,
                                    draft: draft
                                });
                            });
                        } catch (err) {
                            console.error(`Erreur récupération brouillons pour ${formulaireRecu.id}:`, err);
                            // On continue même si un formulaire échoue
                        }
                    })
                );

                // Trier par date de modification (plus récent en premier)
                allDrafts.sort((a, b) =>
                    new Date(b.draft.derniereModification).getTime() -
                    new Date(a.draft.derniereModification).getTime()
                );

                setDrafts(allDrafts);
            } catch (err) {
                const formattedError = handleError(err, 'FetchAllDrafts');
                setError(formattedError.userMessage);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAllDrafts();
    }, [formulairesRecus, token]);

    if (isLoading) {
        return (
            <Card title="Brouillons en cours">
                <LoadingState message="Recherche des brouillons..." />
            </Card>
        );
    }

    if (error) {
        return (
            <Card title="Brouillons en cours">
                <ErrorState message={error} />
            </Card>
        );
    }

    if (drafts.length === 0) {
        return (
            <Card title="Brouillons en cours">
                <EmptyState
                    icon={<DocumentTextIcon className="w-10 h-10" />}
                    title="Aucun brouillon en cours"
                    description="Les formulaires que vous avez commencés à remplir mais pas encore soumis apparaîtront ici."
                />
            </Card>
        );
    }

    return (
        <Card
            title="Brouillons en cours"
            subtitle={`${drafts.length} brouillon${drafts.length !== 1 ? 's' : ''} enregistré${drafts.length !== 1 ? 's' : ''}`}
        >
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {drafts.map((item, index) => (
                    <div
                        key={`${item.formulaireId}-${item.draft.patientHash}-${index}`}
                        className="border border-yellow-200 bg-yellow-50 rounded-lg p-4 hover:shadow-md transition-all flex flex-col justify-between"
                    >
                        <div>
                            <div className="flex items-start justify-between mb-3">
                                <h3 className="font-semibold text-gray-900 line-clamp-2" title={item.formulaireTitre}>
                                    {item.formulaireTitre}
                                </h3>
                                <div className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full font-medium">
                                    Brouillon
                                </div>
                            </div>

                            <div className="space-y-2 text-sm text-gray-600 mb-4">
                                <div className="flex items-center gap-2">
                                    <UsersIcon className="w-4 h-4 text-gray-500" />
                                    <span className="font-medium text-gray-900">
                                        Patient: {item.draft.patientIdentifier}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <DocumentTextIcon className="w-4 h-4 text-gray-500" />
                                    <span>
                                        {item.draft.nombreReponses} réponse{item.draft.nombreReponses !== 1 ? 's' : ''} squelettée{item.draft.nombreReponses !== 1 ? 's' : ''}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <ClockIcon className="w-4 h-4 text-gray-500" />
                                    <span>
                                        Modifié le {new Date(item.draft.derniereModification).toLocaleDateString('fr-FR')} à {new Date(item.draft.derniereModification).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => router.push(`/formulaire/remplir?id=${item.formulaireId}&patient=${encodeURIComponent(item.draft.patientIdentifier)}`)}
                            className="w-full mt-2 bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                        >
                            <PencilSquareIcon className="w-5 h-5" />
                            Continuer le formulaire
                        </button>
                    </div>
                ))}
            </div>
        </Card>
    );
};
