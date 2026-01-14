import React from 'react';
import { CheckCircleIcon } from '@heroicons/react/24/outline';

interface Option {
    libelle: string;
    valeur?: string;
}

interface ChampChoixMultipleProps {
    champId: string | number;
    options: Option[];
    value: any;
    onChange?: (value: string[]) => void;
    readOnly?: boolean;
    required?: boolean;
}

/**
 * Parse the value which could be JSON array or comma-separated string.
 */
const parseSelectedValues = (value: any): string[] => {
    if (!value) return [];
    if (Array.isArray(value)) return value;

    try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [parsed];
    } catch {
        // If not JSON, split by comma
        return value.split(',').map((v: string) => v.trim());
    }
};

/**
 * Multiple choice (checkbox) field renderer component.
 */
export const ChampChoixMultiple: React.FC<ChampChoixMultipleProps> = ({
    champId,
    options,
    value,
    onChange,
    readOnly = false,
    required = false
}) => {
    const selectedValues = parseSelectedValues(value);

    if (readOnly) {
        return (
            <div className="space-y-2">
                {options?.map((option, optIndex) => {
                    const isSelected = selectedValues.includes(option.libelle);
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
        );
    }

    const handleChange = (optionLibelle: string, checked: boolean) => {
        const newValues = checked
            ? [...selectedValues, optionLibelle]
            : selectedValues.filter((v) => v !== optionLibelle);
        onChange?.(newValues);
    };

    return (
        <div className="space-y-1 mt-2">
            {options?.map((option, index) => {
                const isChecked = selectedValues.includes(option.libelle);
                return (
                    <label
                        key={`${champId}-${index}`}
                        className="flex items-center gap-3 py-2 px-2 rounded hover:bg-gray-100 transition-colors cursor-pointer group"
                    >
                        <div className="relative flex items-center">
                            <input
                                type="checkbox"
                                name={`champ_${champId}`}
                                value={option.libelle}
                                checked={isChecked}
                                onChange={(e) => handleChange(option.libelle, e.target.checked)}
                                className="h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                            />
                        </div>
                        <span className="text-gray-700 group-hover:text-gray-900">{option.libelle}</span>
                    </label>
                );
            })}
        </div>
    );
};
