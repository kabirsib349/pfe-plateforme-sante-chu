'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Formulaire } from '@/src/types';
import { Badge } from '@/src/components/Badge';
import { FormulaireRemplirButton } from '@/src/components/formulaire/FormulaireRemplirButton';
import {
    getStatutBadgeColor,
    getStatutLabel,
    getStatutIcon
} from '@/src/utils/statutUtils';
import { formatShortDateFR } from '@/src/utils/dateUtils';
import {
    ClipboardDocumentListIcon,
    CalendarDaysIcon,
    PencilSquareIcon,
    TrashIcon,
    EyeIcon,
    UserIcon
} from '@heroicons/react/24/outline';

/**
 * Props for FormulaireCard component.
 */
export interface FormulaireCardProps {
    /** The formulaire to display */
    formulaire: Formulaire;
    /** Handler for viewing the formulaire */
    onView?: (id: number) => void;
    /** Handler for editing the formulaire */
    onEdit?: (id: number) => void;
    /** Handler for deleting the formulaire */
    onDelete?: (id: number) => void;
    /** Handler for sending the formulaire */
    onSend?: (formulaire: Formulaire) => void;
    /** Whether to show the "Remplir" button (for chercheurs) */
    showRemplirButton?: boolean;
    /** Current user role */
    userRole?: 'chercheur' | 'medecin';
    /** Card variant */
    variant?: 'compact' | 'full';
}

/**
 * Reusable card component for displaying a formulaire.
 * Extracted from dashboard-chercheur/page.tsx and formulaire/page.tsx.
 */
export const FormulaireCard: React.FC<FormulaireCardProps> = ({
    formulaire,
    onView,
    onEdit,
    onDelete,
    onSend,
    showRemplirButton = false,
    userRole,
    variant = 'full'
}) => {
    const router = useRouter();

    const handleView = () => {
        if (onView) {
            onView(formulaire.idFormulaire);
        } else {
            router.push(`/formulaire/apercu?id=${formulaire.idFormulaire}`);
        }
    };

    const handleEdit = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (onEdit) {
            onEdit(formulaire.idFormulaire);
        } else {
            router.push(`/formulaire/modifier/${formulaire.idFormulaire}`);
        }
    };

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        onDelete?.(formulaire.idFormulaire);
    };

    const handleSend = (e: React.MouseEvent) => {
        e.stopPropagation();
        onSend?.(formulaire);
    };

    if (variant === 'compact') {
        return (
            <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="p-4 bg-white">
                    <div className="flex items-center justify-between">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-lg font-semibold text-gray-900">{formulaire.titre}</h3>
                                <Badge color={getStatutBadgeColor(formulaire.statut)}>
                                    {getStatutLabel(formulaire.statut)}
                                </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                                <span className="flex items-center gap-1">
                                    <CalendarDaysIcon className="w-4 h-4" />
                                    {formatShortDateFR(formulaire.dateCreation)}
                                </span>
                                <span className="flex items-center gap-1">
                                    <ClipboardDocumentListIcon className="w-4 h-4" />
                                    {formulaire.champs?.length || 0} question{(formulaire.champs?.length || 0) !== 1 ? 's' : ''}
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {showRemplirButton && userRole === 'chercheur' && (
                                <FormulaireRemplirButton formulaireId={formulaire.idFormulaire} />
                            )}
                            <button
                                onClick={handleEdit}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1"
                            >
                                <PencilSquareIcon className="w-4 h-4" />
                                Modifier
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Full variant
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
                <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                        {formulaire.titre}
                    </h3>
                    <span className="text-lg">{getStatutIcon(formulaire.statut)}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                    <span className={`px-3 py-1 rounded-lg text-xs font-medium ${formulaire.statut.toLowerCase() === 'publie' || formulaire.statut.toLowerCase() === 'envoye'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : formulaire.statut.toLowerCase() === 'brouillon'
                                ? 'bg-slate-50 text-slate-700 border border-slate-200'
                                : 'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}>
                        {formulaire.statut.toLowerCase()}
                    </span>
                </div>
            </div>

            <div className="p-6">
                <div className="space-y-3 mb-6">
                    {formulaire.chercheur?.nom && (
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                            <UserIcon className="w-4 h-4" />
                            <span>Créé par {formulaire.chercheur.nom}</span>
                        </div>
                    )}
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                        <CalendarDaysIcon className="w-4 h-4" />
                        <span>Créé le {formatShortDateFR(formulaire.dateCreation)}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                        <ClipboardDocumentListIcon className="w-4 h-4" />
                        <span>{formulaire.champs?.length || 0} champs de données</span>
                    </div>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={handleView}
                        className="flex-1 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center gap-2"
                        title="Aperçu du formulaire"
                    >
                        <EyeIcon className="w-4 h-4" />
                        Aperçu
                    </button>
                    <button
                        onClick={handleEdit}
                        className="flex-1 px-3 py-2 bg-amber-50 text-amber-700 rounded-lg hover:bg-amber-100 transition-colors flex items-center justify-center gap-2"
                        title="Modifier le formulaire"
                    >
                        <PencilSquareIcon className="w-4 h-4" />
                        Modifier
                    </button>
                    {onSend && (
                        <button
                            onClick={handleSend}
                            className="flex-1 px-3 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors flex items-center justify-center gap-2"
                            title="Envoyer à un médecin"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                            Envoyer
                        </button>
                    )}
                    {onDelete && (
                        <button
                            onClick={handleDelete}
                            className="px-3 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors"
                            title="Supprimer le formulaire"
                        >
                            <TrashIcon className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
