import React from 'react';

interface VariableNameInputProps {
    value: string;
    onChange: (value: string) => void;
    validationError?: string | null;
    placeholder?: string;
}

/**
 * Input component for variable names with validation feedback.
 * Extracted from Question.tsx.
 */
export const VariableNameInput: React.FC<VariableNameInputProps> = ({
    value,
    onChange,
    validationError,
    placeholder = 'EX: POIDS_PATIENT'
}) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Auto convert to uppercase
        const upperValue = e.target.value.toUpperCase();
        onChange(upperValue);
    };

    return (
        <div className="mt-4">
            <label className="block text-sm font-medium text-gray-800 mb-1">
                Nom de la variable (unique, majuscules)
            </label>
            <div className="relative">
                <input
                    type="text"
                    value={value}
                    onChange={handleChange}
                    placeholder={placeholder}
                    className={`w-full bg-gray-50 px-3 py-2 border rounded-lg focus:ring-1 text-sm font-mono ${validationError
                            ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                            : 'border-gray-200 focus:ring-blue-500 focus:border-blue-500'
                        }`}
                    maxLength={25}
                />
                {validationError && (
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                        <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                )}
            </div>
            {validationError && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    {validationError}
                </p>
            )}
        </div>
    );
};
