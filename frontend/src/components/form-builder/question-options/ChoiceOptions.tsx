import React from 'react';
import { TrashIcon } from '@heroicons/react/24/outline';

interface Option {
    libelle: string;
    valeur: string;
}

interface ChoiceOptionsProps {
    options: Option[];
    onOptionsChange: (options: Option[]) => void;
    label?: string;
}

/**
 * Options component for choice fields (single/multiple).
 * Extracted from Question.tsx.
 */
export const ChoiceOptions: React.FC<ChoiceOptionsProps> = ({
    options,
    onOptionsChange,
    label = 'Options de réponse'
}) => {
    const handleOptionChange = (optionIndex: number, field: 'libelle' | 'valeur', value: string) => {
        const newOptions = options.map((option, i) => {
            if (i === optionIndex) {
                return { ...option, [field]: value };
            }
            return option;
        });
        onOptionsChange(newOptions);
    };

    const addOption = () => {
        const newOptions = [...options, {
            libelle: `Option ${options.length + 1}`,
            valeur: `${options.length + 1}`
        }];
        onOptionsChange(newOptions);
    };

    const removeOption = (optionIndex: number) => {
        const newOptions = options.filter((_, i) => i !== optionIndex);
        onOptionsChange(newOptions);
    };

    return (
        <div className="mt-4">
            <label className="block text-sm font-medium text-gray-800 mb-2">{label}</label>
            <div className="space-y-2">
                <div className="grid grid-cols-10 gap-2 text-xs text-gray-800 font-medium">
                    <div className="col-span-5">Libellé (vu par l&apos;utilisateur)</div>
                    <div className="col-span-4">Valeur (stockée)</div>
                </div>
                {options.map((option, i) => (
                    <div key={i} className="grid grid-cols-10 items-center gap-2">
                        <input
                            type="text"
                            value={option.libelle}
                            onChange={(e) => handleOptionChange(i, 'libelle', e.target.value)}
                            className="col-span-5 bg-gray-50 px-3 py-2 border border-gray-200 rounded-lg text-sm"
                            placeholder="Libellé"
                        />
                        <input
                            type="text"
                            value={option.valeur}
                            onChange={(e) => handleOptionChange(i, 'valeur', e.target.value)}
                            className="col-span-4 bg-gray-50 px-3 py-2 border border-gray-200 rounded-lg text-sm"
                            placeholder="Valeur"
                        />
                        <button
                            onClick={() => removeOption(i)}
                            className="col-span-1 p-1 text-gray-400 hover:text-red-500 justify-self-center"
                            title="Supprimer l'option"
                        >
                            <TrashIcon className="w-4 h-4" />
                        </button>
                    </div>
                ))}
                <button
                    onClick={addOption}
                    className="text-sm text-blue-600 hover:text-blue-800 pt-2"
                >
                    Ajouter une option
                </button>
            </div>
        </div>
    );
};
