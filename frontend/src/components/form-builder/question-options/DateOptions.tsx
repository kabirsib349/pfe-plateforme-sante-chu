import React from 'react';

interface DateOptionsProps {
    dateMin?: string;
    dateMax?: string;
    onDateMinChange: (value: string) => void;
    onDateMaxChange: (value: string) => void;
}

/**
 * Options component for date fields.
 * Extracted from Question.tsx.
 */
export const DateOptions: React.FC<DateOptionsProps> = ({
    dateMin,
    dateMax,
    onDateMinChange,
    onDateMaxChange
}) => {
    return (
        <div className="mt-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-800 mb-1">Date Min</label>
                    <input
                        type="date"
                        value={dateMin || ''}
                        onChange={(e) => onDateMinChange(e.target.value)}
                        className="w-full bg-gray-50 px-3 py-2 border border-gray-200 rounded-lg text-sm"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-800 mb-1">Date Max</label>
                    <input
                        type="date"
                        value={dateMax || ''}
                        onChange={(e) => onDateMaxChange(e.target.value)}
                        className="w-full bg-gray-50 px-3 py-2 border border-gray-200 rounded-lg text-sm"
                    />
                </div>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm text-blue-800">
                <strong>Information :</strong> Vous pouvez définir une plage de dates acceptables.
            </div>
        </div>
    );
};
