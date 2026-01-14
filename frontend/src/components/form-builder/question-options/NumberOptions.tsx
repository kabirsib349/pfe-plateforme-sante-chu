import React from 'react';

interface NumberOptionsProps {
    valeurMin?: number;
    valeurMax?: number;
    unite?: string;
    onValeurMinChange: (value: number | undefined) => void;
    onValeurMaxChange: (value: number | undefined) => void;
    onUniteChange: (value: string) => void;
}

/**
 * Options component for number fields.
 * Extracted from Question.tsx.
 */
export const NumberOptions: React.FC<NumberOptionsProps> = ({
    valeurMin,
    valeurMax,
    unite,
    onValeurMinChange,
    onValeurMaxChange,
    onUniteChange
}) => {
    return (
        <div className="mt-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-800 mb-1">Valeur Min</label>
                    <input
                        type="number"
                        value={valeurMin ?? ''}
                        onChange={(e) => onValeurMinChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                        placeholder="Min (optionnel)"
                        step="any"
                        className="w-full bg-gray-50 px-3 py-2 border border-gray-200 rounded-lg text-sm"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-800 mb-1">Valeur Max</label>
                    <input
                        type="number"
                        value={valeurMax ?? ''}
                        onChange={(e) => onValeurMaxChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                        placeholder="Max (optionnel)"
                        step="any"
                        className="w-full bg-gray-50 px-3 py-2 border border-gray-200 rounded-lg text-sm"
                    />
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-800 mb-1">Unité de mesure</label>
                <input
                    type="text"
                    value={unite || ''}
                    onChange={(e) => onUniteChange(e.target.value)}
                    placeholder="Ex: kg, cm, années, mmHg, °C"
                    className="w-full bg-gray-50 px-3 py-2 border border-gray-200 rounded-lg text-sm"
                />
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm text-blue-800 flex items-start gap-2">
                <svg className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" />
                </svg>
                <div>
                    <strong>Conseil :</strong> Définissez des valeurs min/max pour éviter les erreurs de saisie.
                    Par exemple, pour l&apos;âge : min=0, max=120 ; pour une échelle de douleur : min=0, max=10.
                </div>
            </div>
        </div>
    );
};
