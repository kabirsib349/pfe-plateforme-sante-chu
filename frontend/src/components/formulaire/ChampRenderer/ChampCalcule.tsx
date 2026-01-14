import React from 'react';

interface ChampCalculeProps {
    value: any;
    formula?: string;
    champsRequis?: string[];
    allFieldsFilled?: boolean;
}

/**
 * Calculated field renderer component.
 * Always read-only as the value is computed from other fields.
 */
export const ChampCalcule: React.FC<ChampCalculeProps> = ({
    value,
    formula,
    champsRequis = [],
    allFieldsFilled = false
}) => {
    // If we have a value, display it
    if (value !== null && value !== undefined && value !== '') {
        return (
            <div className="bg-blue-50 border-2 border-blue-400 rounded-lg px-4 py-3">
                <p className="text-sm text-blue-800 mb-2 font-semibold">
                    Champ calculé automatiquement
                </p>
                <div className="bg-white border border-blue-300 rounded px-3 py-2">
                    <p className="text-2xl font-bold text-blue-900">
                        {value}
                    </p>
                </div>
                {formula && (
                    <p className="text-xs text-blue-600 mt-2 flex items-center gap-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        Formule: {formula}
                    </p>
                )}
            </div>
        );
    }

    // No value yet - show instructions
    return (
        <div className="bg-blue-50 border-2 border-blue-300 rounded-lg px-4 py-3">
            <p className="text-sm text-blue-800 mb-2 font-semibold">
                Champ calculé automatiquement
            </p>
            <div className="relative">
                <input
                    type="text"
                    value=""
                    readOnly
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 font-semibold"
                    placeholder="Calculé automatiquement"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                </div>
            </div>
            {champsRequis.length > 0 && (
                <p className="text-xs text-blue-600 mt-2">
                    Remplissez les champs requis : {champsRequis.join(', ')}
                </p>
            )}
        </div>
    );
};
