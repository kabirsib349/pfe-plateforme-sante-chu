"use client";

import { FC, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/src/components/Card";
import { Badge } from "@/src/components/Badge";
import { EmptyState, LoadingState, ErrorState } from "@/src/components/ui";
import { ConfirmationModal } from "@/src/components/ui/ConfirmationModal";
import {
    InboxIcon, PencilSquareIcon, EyeIcon, TrashIcon,
    CalendarDaysIcon, ClipboardDocumentListIcon, UserIcon, BookOpenIcon
} from "@heroicons/react/24/outline";
import { deleteFormulaireRecu } from "@/src/lib/api";
import { handleError } from "@/src/lib/errorHandler";
import type { FormulaireRecuResponse } from "@/src/types";

interface FormulairesRecusTabProps {
    formulairesRecus: FormulaireRecuResponse[];
    isLoading: boolean;
    error?: string | null;
    token?: string | null;
    showToast: (message: string, type: 'success' | 'error' | 'info') => void;
    refreshFormulairesRecus: () => void;
}

export const FormulairesRecusTab: FC<FormulairesRecusTabProps> = ({
    formulairesRecus,
    isLoading,
    error,
    token,
    showToast,
    refreshFormulairesRecus
}) => {
    const router = useRouter();
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [formToDelete, setFormToDelete] = useState<number | null>(null);

    const handleDeleteClick = (id: number) => {
        setFormToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (formToDelete === null) return;

        try {
            await deleteFormulaireRecu(token!, formToDelete);
            showToast('Formulaire supprimé de votre liste', 'success');
            refreshFormulairesRecus();
        } catch (error) {
            const formattedError = handleError(error, 'DeleteFormulaireRecu');
            showToast(formattedError.userMessage, 'error');
        } finally {
            setFormToDelete(null);
            setIsDeleteModalOpen(false);
        }
    };

    if (isLoading) {
        return (
            <Card title="Formulaires reçus">
                <LoadingState message="Chargement des formulaires..." />
            </Card>
        );
    }

    if (error) {
        return (
            <Card title="Formulaires reçus">
                <ErrorState message={error} />
            </Card>
        );
    }

    if (formulairesRecus.length === 0) {
        return (
            <Card title="Formulaires reçus">
                <EmptyState
                    icon={<InboxIcon className="w-10 h-10" />}
                    title="Aucun formulaire reçu"
                    description="Les formulaires qui vous seront envoyés par les chercheurs apparaîtront ici."
                />
            </Card>
        );
    }

    return (
        <>
            <Card
                title="Formulaires reçus"
                subtitle={`${formulairesRecus.length} formulaire${formulairesRecus.length !== 1 ? 's' : ''} à consulter`}
            >
                <div className="space-y-4">
                    {formulairesRecus.map((formulaireRecu) => (
                        <div
                            key={formulaireRecu.id}
                            className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:bg-blue-50/30 transition-all"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-lg font-semibold text-gray-900">
                                            {formulaireRecu.formulaire.titre}
                                        </h3>
                                        {!formulaireRecu.lu && <Badge color="blue">Nouveau</Badge>}
                                        {formulaireRecu.complete && <Badge color="green">Complété</Badge>}
                                    </div>

                                    {formulaireRecu.formulaire.description && (
                                        <p className="text-sm text-gray-600 mb-3">
                                            {formulaireRecu.formulaire.description}
                                        </p>
                                    )}

                                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                                        <span className="flex items-center gap-1">
                                            <BookOpenIcon className="w-4 h-4" />
                                            <span>{formulaireRecu.formulaire.etude?.titre || 'N/A'}</span>
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <UserIcon className="w-4 h-4" />
                                            <span>Envoyé par {formulaireRecu.chercheur.nom}</span>
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <CalendarDaysIcon className="w-4 h-4" />
                                            <span>Reçu le {new Date(formulaireRecu.dateEnvoi).toLocaleDateString('fr-FR')}</span>
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <ClipboardDocumentListIcon className="w-4 h-4" />
                                            <span>{formulaireRecu.formulaire.champs?.length || 0} question{(formulaireRecu.formulaire.champs?.length || 0) !== 1 ? 's' : ''}</span>
                                        </span>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2 ml-4">
                                    <button
                                        onClick={() => router.push(`/formulaire/remplir?id=${formulaireRecu.id}`)}
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-2"
                                    >
                                        <PencilSquareIcon className="w-5 h-5" />
                                        <span>Remplir le formulaire</span>
                                    </button>
                                    <button
                                        onClick={() => router.push(`/formulaire/apercu?id=${formulaireRecu.formulaire.idFormulaire}`)}
                                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-2"
                                    >
                                        <EyeIcon className="w-5 h-5" />
                                        <span>Aperçu</span>
                                    </button>
                                    <button
                                        onClick={() => handleDeleteClick(formulaireRecu.id)}
                                        className="bg-red-50 hover:bg-red-100 text-red-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-2"
                                    >
                                        <TrashIcon className="w-5 h-5" />
                                        <span>Supprimer</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>

            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Supprimer le formulaire ?"
                message="Êtes-vous sûr de vouloir supprimer ce formulaire de votre liste ? Cette action est irréversible."
                confirmText="Supprimer"
                variant="danger"
            />
        </>
    );
};
