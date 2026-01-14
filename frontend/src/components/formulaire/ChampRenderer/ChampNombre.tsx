import React from 'react';

interface ChampNombreProps {
    value: any;
    onChange?: (value: string) => void;
    readOnly?: boolean;
    required?: boolean;
    valeurMin?: number | null;
    valeurMax?: number | null;
    unite?: string;
}

/**
 * Number field renderer component.
 */
export const ChampNombre: React.FC<ChampNombreProps> = ({
    value,
    onChange,
    readOnly = false,
    required = false,
    valeurMin,
    valeurMax,
    unite
}) => {
    if (readOnly) {
        return (
            <div className="bg-white border-2 border-green-500 rounded-lg px-4 py-3">
                <p className="text-gray-900 font-medium">
                    {value || <span className="text-gray-400 italic">Non rempli</span>}
                    {unite && value && <span className="text-gray-600 ml-2">{unite}</span>}
                </p>
            </div>
        );
    }

    const getHelpText = () => {
        const hasMin = valeurMin !== null && valeurMin !== undefined;
        const hasMax = valeurMax !== null && valeurMax !== undefined;

        if (hasMin && hasMax) {
            return `Valeur entre ${valeurMin} et ${valeurMax}${unite ? ` ${unite}` : ''}`;
        } else if (hasMin) {
            return `Valeur minimum: ${valeurMin}${unite ? ` ${unite}` : ''}`;
        } else if (hasMax) {
            return `Valeur maximum: ${valeurMax}${unite ? ` ${unite}` : ''}`;
        } else if (unite) {
            return `Unité: ${unite}`;
        }
        return null;
    };

    const helpText = getHelpText();

    return (
        <div>
            <input
                type="number"
                required={required}
                min={valeurMin ?? undefined}
                max={valeurMax ?? undefined}
                step="any"
                value={value || ''}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Votre réponse"
                onChange={(e) => onChange?.(e.target.value)}
            />
            {helpText && (
                <p className="text-xs text-gray-500 mt-1">{helpText}</p>
            )}
        </div>
    );
};
