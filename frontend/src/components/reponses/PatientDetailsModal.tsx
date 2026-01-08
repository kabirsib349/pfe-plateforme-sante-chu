import React from 'react';
import { UserIcon, XMarkIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { ReponseFormulaire, Champ } from '@/src/types';

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
}

/**
 * Modal component for displaying detailed patient responses
 */
export const PatientDetailsModal: React.FC<PatientDetailsModalProps> = ({
    isOpen,
    onClose,
    patientId,
    patientData,
    formulaireChamps
}) => {
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
                        <button
                            onClick={onClose}
                            className="text-white hover:text-gray-200 transition-colors"
                        >
                            <XMarkIcon className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="px-6 py-6 max-h-[70vh] overflow-y-auto">
                        <div className="space-y-6">
                            {formulaireChamps.map((champ: Champ, index: number) => {
                                const reponseValue = champ.idChamp ? reponsesMap[champ.idChamp] : undefined;
                                const champType = (champ.type as string)?.toUpperCase();

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
                                                {champ.listeValeur?.options?.map((option, optIndex) => {
                                                    const isSelected = reponseValue === option.libelle;
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
                                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
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
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3">
                        <button
                            onClick={onClose}
                            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                            Fermer
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
