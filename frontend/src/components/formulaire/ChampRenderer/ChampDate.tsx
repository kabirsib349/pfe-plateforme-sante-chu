import React from 'react';
import { formatDateFR } from '@/src/utils/dateUtils';

interface ChampDateProps {
    value: any;
    onChange?: (value: string) => void;
    readOnly?: boolean;
    required?: boolean;
    dateMin?: string;
    dateMax?: string;
}

/**
 * Date field renderer component.
 */
export const ChampDate: React.FC<ChampDateProps> = ({
    value,
    onChange,
    readOnly = false,
    required = false,
    dateMin,
    dateMax
}) => {
    if (readOnly) {
        return (
            <div className="bg-white border-2 border-green-500 rounded-lg px-4 py-3">
                <p className="text-gray-900 font-medium">
                    {value
                        ? formatDateFR(value)
                        : <span className="text-gray-400 italic">Non rempli</span>
                    }
                </p>
            </div>
        );
    }

    return (
        <input
            type="date"
            required={required}
            min={dateMin}
            max={dateMax}
            value={value || ''}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            onChange={(e) => onChange?.(e.target.value)}
        />
    );
};
