import React from 'react';

interface CalculatedOptionsProps {
    formuleCalcul?: string;
    champsRequis?: string[];
    onFormuleChange: (value: string) => void;
    onChampsRequisChange: (value: string[]) => void;
}

/**
 * Options component for calculated fields.
 * Extracted from Question.tsx.
 */
export const CalculatedOptions: React.FC<CalculatedOptionsProps> = ({
    formuleCalcul,
    champsRequis,
    onFormuleChange,
    onChampsRequisChange
}) => {
    const handleChampsRequisChange = (value: string) => {
        const variables = value
            .split(',')
            .map(v => v.trim().toUpperCase())
            .filter(v => v);
        onChampsRequisChange(variables);
    };

    return (
        <div className="mt-4 space-y-3">
            <div>
                <label className="block text-sm font-medium text-gray-800 mb-1">Formule de calcul</label>
                <input
                    type="text"
                    value={formuleCalcul || ''}
                    onChange={(e) => onFormuleChange(e.target.value)}
                    placeholder="Ex: POIDS/((TAILLE/100)^2) pour l'IMC (taille en cm)"
                    className="w-full bg-gray-50 px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-800 mb-1">
                    Variables requises (séparées par des virgules)
                </label>
                <input
                    type="text"
                    value={champsRequis?.join(', ') || ''}
                    onChange={(e) => handleChampsRequisChange(e.target.value)}
                    placeholder="Ex: POIDS, TAILLE"
                    className="w-full bg-gray-50 px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono"
                />
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded p-3 text-sm text-yellow-800">
                <strong>Information :</strong> Ce champ sera calculé automatiquement lors du remplissage du formulaire.
                Il sera en lecture seule pour les utilisateurs.
            </div>
        </div>
    );
};
