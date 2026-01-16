import React from 'react';
import { UserIcon, XMarkIcon, CheckCircleIcon, PencilIcon } from '@heroicons/react/24/outline';
import { ReponseFormulaire, Champ } from '@/src/types';
import { submitReponses } from '@/src/lib/api';
import { handleError } from '@/src/lib/errorHandler';
// Note: We'll assume toast/alert handling is done via window.alert or console for simplicity if toast context isn't available, 
// but since this is a modal, we might want to pass a toast handler or just use alert.


interface PatientData {
    reponses: ReponseFormulaire[];
    dateSaisie: string;
}

interface PatientDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    patientId: string;
    patientData: PatientData;
    formulaireChamps: Champ[];
    onDeletePatient?: (patientId: string) => void;
    token?: string;
    formulaireMedecinId?: number;
    onUpdate?: () => void;
    showToast?: (message: string, type: 'success' | 'error' | 'info') => void;
}

/**
 * Modal component for displaying detailed patient responses
 */
export const PatientDetailsModal: React.FC<PatientDetailsModalProps> = ({
    isOpen,
    onClose,
    patientId,
    patientData,
    formulaireChamps,
    onDeletePatient,
    token,
    formulaireMedecinId,
    onUpdate,
    showToast
}) => {
    const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);

    const [isEditing, setIsEditing] = React.useState(false);
    const [editedReponses, setEditedReponses] = React.useState<Record<string, string>>({});
    const [isSaving, setIsSaving] = React.useState(false);

    // Initialize editedReponses when opening or entering edit mode
    React.useEffect(() => {
        if (isOpen && patientData) {
            const initialReponses: Record<string, string> = {};
            patientData.reponses.forEach(r => {
                if (r.champ && r.champ.idChamp) {
                    initialReponses[r.champ.idChamp.toString()] = r.valeur;
                }
            });
            setEditedReponses(initialReponses);
        }
    }, [isOpen, patientData]);

    const handleSave = async () => {
        if (!token || !formulaireMedecinId) {
            if (showToast) showToast("Erreur: Impossible d'enregistrer (Token ou ID manquant)", 'error');
            else alert("Erreur: Impossible d'enregistrer (Token ou ID manquant)");
            return;
        }

        setIsSaving(true);
        try {
            await submitReponses(token, {
                formulaireMedecinId: formulaireMedecinId,
                patientIdentifier: patientId,
                reponses: editedReponses
            }); // not draft

            if (showToast) showToast("Réponses mises à jour avec succès", 'success');

            setIsEditing(false);
            if (onUpdate) onUpdate();
        } catch (error) {
            const err = handleError(error, 'SaveReponses');
            if (showToast) showToast(err.userMessage, 'error');
            else alert(err.userMessage);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = () => {
        if (onDeletePatient) {
            onDeletePatient(patientId);
            setShowDeleteConfirm(false);
            onClose();
        }
    };
    if (!isOpen) return null;

    const reponsesMap = patientData.reponses.reduce((acc: Record<number, string>, reponse: ReponseFormulaire) => {
        // Le backend renvoie parfois l'objet champ complet
        if (reponse.champ && reponse.champ.idChamp) {
            acc[reponse.champ.idChamp] = reponse.valeur;
        }
        return acc;
    }, {});

    return (
        <div className="fixed inset-0 z-[9999] overflow-y-auto bg-gray-100" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-lg shadow-xl">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="bg-white rounded-full p-2">
                                <UserIcon className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white">
                                    Patient : {patientId}
                                </h3>
                                <p className="text-green-100 text-sm">
                                    Rempli le {new Date(patientData.dateSaisie).toLocaleDateString('fr-FR', {
                                        day: '2-digit',
                                        month: 'long',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            {!isEditing && token && formulaireMedecinId && (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="text-white hover:text-green-100 transition-colors p-1"
                                    title="Modifier les réponses"
                                >
                                    <PencilIcon className="w-5 h-5" />
                                </button>
                            )}
                            <button
                                onClick={onClose}
                                className="text-white hover:text-gray-200 transition-colors"
                            >
                                <XMarkIcon className="w-6 h-6" />
                            </button>
                        </div>
                    </div>

                    {/* Body */}
                    <div className="px-6 py-6 max-h-[70vh] overflow-y-auto">
                        <div className="space-y-6">
                            {formulaireChamps.map((champ: Champ, index: number) => {
                                const reponseValue = champ.idChamp ? reponsesMap[champ.idChamp] : undefined;
                                const champType = (champ.type as string)?.toUpperCase();

                                // Edit Mode Rendering
                                if (isEditing) {
                                    const currentVal = champ.idChamp ? editedReponses[champ.idChamp.toString()] || '' : '';

                                    return (
                                        <div key={champ.idChamp} className="p-4 border border-blue-200 rounded-lg bg-blue-50">
                                            <label className="block text-sm font-medium text-blue-900 mb-2">
                                                {index + 1}. {champ.label}
                                            </label>

                                            {champType === 'TEXTE' && (
                                                <textarea
                                                    className="w-full px-3 py-2 border border-blue-300 rounded-md focus:ring-2 focus:ring-blue-500"
                                                    value={currentVal}
                                                    onChange={(e) => champ.idChamp && setEditedReponses({ ...editedReponses, [champ.idChamp.toString()]: e.target.value })}
                                                />
                                            )}

                                            {champType === 'NOMBRE' && (
                                                <input
                                                    type="number"
                                                    className="w-full px-3 py-2 border border-blue-300 rounded-md"
                                                    value={currentVal}
                                                    onChange={(e) => champ.idChamp && setEditedReponses({ ...editedReponses, [champ.idChamp.toString()]: e.target.value })}
                                                />
                                            )}

                                            {champType === 'DATE' && (
                                                <input
                                                    type="date"
                                                    className="w-full px-3 py-2 border border-blue-300 rounded-md"
                                                    value={currentVal}
                                                    onChange={(e) => champ.idChamp && setEditedReponses({ ...editedReponses, [champ.idChamp.toString()]: e.target.value })}
                                                />
                                            )}

                                            {champType === 'CHOIX_UNIQUE' && (
                                                <select
                                                    className="w-full px-3 py-2 border border-blue-300 rounded-md"
                                                    value={currentVal}
                                                    onChange={(e) => champ.idChamp && setEditedReponses({ ...editedReponses, [champ.idChamp.toString()]: e.target.value })}
                                                >
                                                    <option value="">Sélectionner...</option>
                                                    {champ.listeValeur?.options?.map((opt, i) => (
                                                        <option key={i} value={opt.valeur || opt.libelle}>{opt.libelle}</option>
                                                    ))}
                                                </select>
                                            )}

                                            {/* Fallback for other types or calculated fields (read-only in edit mode for now) */}
                                            {['TEXTE', 'NOMBRE', 'DATE', 'CHOIX_UNIQUE'].indexOf(champType) === -1 && (
                                                <div className="text-sm text-gray-500 italic">
                                                    Modification non disponible pour ce type de champ ({champType})
                                                </div>
                                            )}
                                        </div>
                                    );
                                }

                                // View Mode Rendering (existing code)
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

                                        {champType === 'CALCULE' && (() => {
                                            // For calculated fields, the value should be calculated from other fields
                                            // For now, if there's a stored value, display it
                                            if (reponseValue) {
                                                return (
                                                    <div className="bg-blue-50 border-2 border-blue-400 rounded-lg px-4 py-3">
                                                        <p className="text-sm text-blue-800 mb-2 font-semibold">
                                                            Champ calculé
                                                        </p>
                                                        <div className="bg-white border border-blue-300 rounded px-3 py-2">
                                                            <p className="text-2xl font-bold text-blue-900">
                                                                {reponseValue}
                                                            </p>
                                                        </div>
                                                    </div>
                                                );
                                            }
                                            return (
                                                <div className="bg-blue-50 border-2 border-blue-300 rounded-lg px-4 py-3">
                                                    <p className="text-sm text-blue-800 mb-1">
                                                        <span className="font-semibold">Champ calculé</span>
                                                    </p>
                                                    <p className="text-xs text-blue-600">
                                                        Valeur non calculée
                                                    </p>
                                                </div>
                                            );
                                        })()}

                                        {champType === 'CHOIX_UNIQUE' && (
                                            <div className="space-y-2">
                                                {champ.listeValeur?.options?.map((option, optIndex) => {
                                                    const isSelected = reponseValue === (option.valeur || option.libelle);
                                                    return (
                                                        <div
                                                            key={optIndex}
                                                            className={`flex items-center gap-3 p-3 border-2 rounded-lg ${isSelected
                                                                ? 'bg-green-50 border-green-500'
                                                                : 'bg-white border-gray-200'
                                                                }`}
                                                        >
                                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSelected
                                                                ? 'border-green-600 bg-green-600'
                                                                : 'border-gray-300'
                                                                }`}>
                                                                {isSelected && (
                                                                    <div className="w-2 h-2 bg-white rounded-full"></div>
                                                                )}
                                                            </div>
                                                            <span className={`${isSelected ? 'text-gray-900 font-semibold' : 'text-gray-600'}`}>
                                                                {option.libelle}
                                                            </span>
                                                            {isSelected && (
                                                                <div className="ml-auto flex items-center gap-1 text-green-600">
                                                                    <CheckCircleIcon className="w-4 h-4" />
                                                                    <span className="text-sm font-medium">Sélectionné</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}

                                        {champType === 'CHOIX_MULTIPLE' && (() => {
                                            // Debug logging
                                            console.log('CHOIX_MULTIPLE Debug:', {
                                                champLabel: champ.label,
                                                reponseValue,
                                                options: champ.listeValeur?.options
                                            });

                                            return (
                                                <div className="space-y-2">
                                                    {champ.listeValeur?.options?.map((option, optIndex) => {
                                                        // Handle array values for multiple choice
                                                        let selectedValues: string[] = [];

                                                        if (reponseValue) {
                                                            // Try to parse as JSON array first
                                                            try {
                                                                const parsed = JSON.parse(reponseValue);
                                                                selectedValues = Array.isArray(parsed) ? parsed : [parsed];
                                                            } catch {
                                                                // If not JSON, split by comma (format: "PTG, PUC")
                                                                selectedValues = reponseValue.split(',').map(v => v.trim());
                                                            }
                                                        }

                                                        console.log('Option check:', {
                                                            option: option.libelle,
                                                            reponseValue,
                                                            selectedValues,
                                                            isSelected: selectedValues.includes(option.libelle)
                                                        });

                                                        const isSelected = selectedValues.includes(option.valeur || option.libelle);
                                                        return (
                                                            <div
                                                                key={optIndex}
                                                                className={`flex items-center gap-3 p-3 border-2 rounded-lg ${isSelected
                                                                    ? 'bg-green-50 border-green-500'
                                                                    : 'bg-white border-gray-200'
                                                                    }`}
                                                            >
                                                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSelected
                                                                    ? 'border-green-600 bg-green-600'
                                                                    : 'border-gray-300'
                                                                    }`}>
                                                                    {isSelected && (
                                                                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                                        </svg>
                                                                    )}
                                                                </div>
                                                                <span className={`${isSelected ? 'text-gray-900 font-semibold' : 'text-gray-600'}`}>
                                                                    {option.libelle}
                                                                </span>
                                                                {isSelected && (
                                                                    <div className="ml-auto flex items-center gap-1 text-green-600">
                                                                        <CheckCircleIcon className="w-4 h-4" />
                                                                        <span className="text-sm font-medium">Sélectionné</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            );
                                        })()}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="bg-gray-50 px-6 py-4 flex justify-between items-center">

                        <div className="flex gap-3">
                            {isEditing ? (
                                <>
                                    <button
                                        onClick={() => setIsEditing(false)}
                                        className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                                        disabled={isSaving}
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                                        disabled={isSaving}
                                    >
                                        {isSaving ? 'Enregistrement...' : 'Enregistrer'}
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={onClose}
                                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                                >
                                    Fermer
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>


        </div>
    );
};
