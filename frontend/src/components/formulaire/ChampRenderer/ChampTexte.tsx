import React from 'react';

interface ChampTexteProps {
    value: any;
    onChange?: (value: string) => void;
    readOnly?: boolean;
    required?: boolean;
    placeholder?: string;
}

/**
 * Text field renderer component.
 */
export const ChampTexte: React.FC<ChampTexteProps> = ({
    value,
    onChange,
    readOnly = false,
    required = false,
    placeholder = '(max 500 caractères)'
}) => {
    if (readOnly) {
        return (
            <div className="bg-white border-2 border-green-500 rounded-lg px-4 py-3">
                <p className="text-gray-900 font-medium">
                    {value || <span className="text-gray-400 italic">Non rempli</span>}
                </p>
            </div>
        );
    }

    return (
        <textarea
            required={required}
            maxLength={500}
            rows={3}
            value={value || ''}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            placeholder={placeholder}
            onChange={(e) => onChange?.(e.target.value)}
        />
    );
};
