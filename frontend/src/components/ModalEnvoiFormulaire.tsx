'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from "@/src/hooks/useAuth";
import { useToast } from "@/src/hooks/useToast";
import { XMarkIcon, UserIcon } from "@heroicons/react/24/outline";
import { getMedecins, sendFormulaireToMedecin } from "@/src/lib/api";
import { handleError } from "@/src/lib/errorHandler";

interface Utilisateur {
    nom: string;
    email: string;
}

interface ModalEnvoiFormulaireProps {
    isOpen: boolean;
    onClose: () => void;
    formulaireId: number;
    formulaireTitre: string;
    onSuccess: () => void;
    showToast?: (message: string, type: 'success' | 'error' | 'info') => void;
}

export default function ModalEnvoiFormulaire({ isOpen, onClose, formulaireId, formulaireTitre, onSuccess, showToast: showToastProp }: ModalEnvoiFormulaireProps) {
    const { token } = useAuth();
    const { showToast: showToastLocal } = useToast();
    const showToast = showToastProp || showToastLocal;
    const [medecins, setMedecins] = useState<Utilisateur[]>([]);
    const [medecinsSelectionnes, setMedecinsSelectionnes] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isChargementMedecins, setIsChargementMedecins] = useState(false);

    useEffect(() => {
        if (isOpen && token) {
            const chargerMedecins = async () => {
                setIsChargementMedecins(true);
                try {
                    const data = await getMedecins(token);
                    setMedecins(data);
                } catch (error) {
                    const formattedError = handleError(error, 'LoadMedecins');
                    showToast(formattedError.userMessage, 'error');
                } finally {
                    setIsChargementMedecins(false);
                }
            };
            chargerMedecins();
        }
    }, [isOpen, token, showToast]);

    const toggleMedecin = (email: string) => {
        setMedecinsSelectionnes(prev =>
            prev.includes(email)
                ? prev.filter(e => e !== email)
                : [...prev, email]
        );
    };

    const selectAll = () => {
        if (medecinsSelectionnes.length === medecins.length) {
            setMedecinsSelectionnes([]);
        } else {
            setMedecinsSelectionnes(medecins.map(m => m.email));
        }
    };

    const handleEnvoyer = async () => {
        if (medecinsSelectionnes.length === 0) {
            showToast('Veuillez sélectionner au moins un médecin', 'error');
            return;
        }
        if (!token) {
            showToast("Vous n'êtes pas authentifié", 'error');
            return;
        }

        setIsLoading(true);
        let successCount = 0;
        let errorCount = 0;
        const errors: string[] = [];

        for (const emailMedecin of medecinsSelectionnes) {
            try {
                await sendFormulaireToMedecin(token, formulaireId, emailMedecin);
                successCount++;
            } catch (error) {
                errorCount++;
                const formattedError = handleError(error, 'SendFormulaire');
                errors.push(formattedError.userMessage);
            }
        }

        setIsLoading(false);

        if (successCount > 0) {
            showToast(
                `Formulaire envoyé à ${successCount} médecin${successCount > 1 ? 's' : ''}`,
                'success'
            );
            onSuccess();
        }

        if (errorCount > 0) {
            showToast(
                `${errorCount} erreur${errorCount > 1 ? 's' : ''}: ${errors[0]}`,
                'error'
            );
        }

        if (successCount > 0) {
            onClose();
            setMedecinsSelectionnes([]);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md relative">
                {/* En-tête */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900">Envoyer le formulaire</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>

                {/* Corps */}
                <div className="p-6 space-y-4">
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">{formulaireTitre}</h3>
                        <p className="text-sm text-gray-600">Sélectionnez un ou plusieurs médecins destinataires.</p>
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <label className="block text-sm font-medium text-gray-700">
                                Médecins ({medecinsSelectionnes.length} sélectionné{medecinsSelectionnes.length > 1 ? 's' : ''})
                            </label>
                            {medecins.length > 0 && (
                                <button
                                    onClick={selectAll}
                                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                                >
                                    {medecinsSelectionnes.length === medecins.length ? 'Tout désélectionner' : 'Tout sélectionner'}
                                </button>
                            )}
                        </div>

                        {isChargementMedecins ? (
                            <div className="text-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                                <p className="text-sm text-gray-500 mt-2">Chargement des médecins...</p>
                            </div>
                        ) : medecins.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                <UserIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                                <p className="text-sm">Aucun médecin disponible</p>
                            </div>
                        ) : (
                            <div className="border border-gray-200 rounded-lg max-h-64 overflow-y-auto">
                                {medecins.map((medecin) => (
                                    <label
                                        key={medecin.email}
                                        className="flex items-center gap-3 p-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-0 transition-colors"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={medecinsSelectionnes.includes(medecin.email)}
                                            onChange={() => toggleMedecin(medecin.email)}
                                            className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                        />
                                        <div className="flex items-center gap-2 flex-1">
                                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                                                <UserIcon className="w-5 h-5 text-blue-600" />
                                            </div>
                                            <p className="font-medium text-gray-900">{medecin.nom}</p>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Pied de page */}
                <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                        Annuler
                    </button>
                    <button
                        onClick={handleEnvoyer}
                        disabled={isLoading || medecinsSelectionnes.length === 0}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                    >
                        {isLoading
                            ? 'Envoi en cours...'
                            : `Envoyer${medecinsSelectionnes.length > 0 ? ` (${medecinsSelectionnes.length})` : ''}`
                        }
                    </button>
                </div>
            </div>
        </div>
    );
}