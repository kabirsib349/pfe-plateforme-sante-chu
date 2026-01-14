import React from 'react';
import { CheckCircleIcon } from '@heroicons/react/24/outline';

interface Option {
    libelle: string;
    valeur?: string;
}

interface ChampChoixUniqueProps {
    champId: string | number;
    options: Option[];
    value: any;
    onChange?: (value: string) => void;
    readOnly?: boolean;
    required?: boolean;
}

/**
 * Single choice (radio) field renderer component.
 */
export const ChampChoixUnique: React.FC<ChampChoixUniqueProps> = ({
    champId,
    options,
    value,
    onChange,
    readOnly = false,
    required = false
}) => {
    if (readOnly) {
        return (
            <div className="space-y-2">
                {options?.map((option, optIndex) => {
                    const isSelected = value === option.libelle;
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
        );
    }

    return (
        <div className="space-y-1 mt-2">
            {options?.map((option, index) => (
                <label
                    key={`${champId}-${index}`}
                    className="flex items-center gap-3 py-2 px-2 rounded hover:bg-gray-100 transition-colors cursor-pointer group"
                >
                    <div className="relative flex items-center">
                        <input
                            type="radio"
                            name={`champ_${champId}`}
                            value={option.libelle}
                            checked={value === option.libelle}
                            required={required}
                            onChange={(e) => onChange?.(e.target.value)}
                            className="h-5 w-5 text-blue-600 border-gray-300 focus:ring-blue-500"
                        />
                    </div>
                    <span className="text-gray-700 group-hover:text-gray-900">{option.libelle}</span>
                </label>
            ))}
        </div>
    );
};
