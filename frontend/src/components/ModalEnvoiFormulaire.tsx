'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from "@/src/hooks/useAuth";
import { useToast } from "@/src/hooks/useToast";
import { XMarkIcon, UserIcon } from "@heroicons/react/24/outline";
import { getMedecins, sendFormulaireToMedecin } from "@/src/lib/api";

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
    const [medecinSelectionne, setMedecinSelectionne] = useState<string>('');
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
                    console.error(error);
                    showToast('Erreur lors du chargement des médecins', 'error');
                } finally {
                    setIsChargementMedecins(false);
                }
            };
            chargerMedecins();
        }
    }, [isOpen, token, showToast]);

    const handleEnvoyer = async () => {
        if (!medecinSelectionne) {
            showToast('Veuillez sélectionner un médecin', 'error');
            return;
        }
        if (!token) {
            showToast("Vous n'êtes pas authentifié", 'error');
            return;
        }

        setIsLoading(true);
        try {
            await sendFormulaireToMedecin(token, formulaireId, medecinSelectionne);
            showToast('Formulaire envoyé avec succès', 'success');
            onSuccess(); // <-- APPEL DE LA FONCTION DE RAPPEL
            onClose();
            setMedecinSelectionne('');
        } catch (error: any) {
            console.error('Erreur réseau:', error);
            showToast(error.message || 'Erreur lors de l\'envoi du formulaire', 'error');
        } finally {
            setIsLoading(false);
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
                <div className="p-6 space-y-6">
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">{formulaireTitre}</h3>
                        <p className="text-sm text-gray-600">Sélectionnez un médecin à qui envoyer ce formulaire.</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Médecin destinataire
                        </label>
                        <div className="relative">
                            <select
                                value={medecinSelectionne}
                                onChange={(e) => setMedecinSelectionne(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all appearance-none bg-white"
                                disabled={isChargementMedecins}
                            >
                                <option value="">Sélectionnez un médecin</option>
                                {medecins.map((medecin) => (
                                    <option key={medecin.email} value={medecin.email}>
                                        {medecin.nom}
                                    </option>
                                ))}
                            </select>
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <UserIcon className="w-5 h-5 text-gray-400" />
                            </div>
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                <svg className="w-5 h-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </div>
                        </div>
                        {isChargementMedecins && (
                            <p className="text-sm text-gray-500 mt-2">Chargement des médecins...</p>
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
                        disabled={isLoading || !medecinSelectionne}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Envoi en cours...' : 'Envoyer'}
                    </button>
                </div>
            </div>
        </div>
    );
}