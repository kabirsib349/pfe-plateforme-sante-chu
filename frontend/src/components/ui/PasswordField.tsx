'use client';

import React, { useId, useMemo, useState } from 'react';

type PasswordFieldProps = {
    /** Label visible au-dessus du champ */
    label: string;
    /** Valeur contrôlée */
    value: string;
    /** Callback contrôlé */
    onChange: (value: string) => void;
    /** Identifiant optionnel */
    id?: string;
    /** Placeholder optionnel */
    placeholder?: string;
    /** Champ requis */
    required?: boolean;
    /** Texte d'erreur externe */
    error?: string | null;
    /** Aide sous le champ */
    hint?: string;
    /** Longueur minimale */
    minLength?: number;
    /** Désactiver le champ */
    disabled?: boolean;
    /** Afficher l'indicateur de robustesse */
    showStrength?: boolean;
    /** Autocomplete */
    autoComplete?: string;
    /** Callback sur Entrée */
    onEnter?: () => void;
};

/**
 * Calcule un score de robustesse de 0 à 4.
 */
function strengthScore(pwd: string): { score: number; label: string; color: string } {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;

    const labels = ['Très faible', 'Faible', 'Moyen', 'Bon', 'Très bon'];
    const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-lime-500', 'bg-emerald-500'];

    return {
        score,
        label: labels[score] || 'Très faible',
        color: colors[score] || 'bg-red-500'
    };
}

/**
 * Champ mot de passe réutilisable avec toggle afficher/masquer
 */
export default function PasswordField({
    label,
    value,
    onChange,
    id,
    placeholder = '••••••••',
    required = false,
    error = null,
    hint,
    minLength = 8,
    disabled = false,
    showStrength = false,
    autoComplete = 'new-password',
    onEnter,
}: PasswordFieldProps) {
    const autoId = useId();
    const inputId = id ?? `pwd-${autoId}`;

    const [visible, setVisible] = useState(false);
    const [touched, setTouched] = useState(false);

    const describedById = `${inputId}-desc`;
    const errorId = `${inputId}-err`;

    // Validation légère côté client
    const internalError = useMemo(() => {
        if (!touched) return null;
        if (required && value.trim().length === 0) return 'Ce champ est obligatoire.';
        if (value.length > 0 && value.length < minLength) return `Au moins ${minLength} caractères.`;
        return null;
    }, [touched, required, value, minLength]);

    const finalError = error || internalError;
    const strength = useMemo(() => strengthScore(value), [value]);

    const borderClass = finalError
        ? 'border-red-300 focus:ring-red-200'
        : 'border-gray-300 focus:ring-emerald-500';

    return (
        <div>
            <label htmlFor={inputId} className="block text-sm font-semibold text-gray-900 mb-2">
                {label}{required ? ' *' : ''}
            </label>

            <div className="flex gap-2">
                <input
                    id={inputId}
                    type={visible ? 'text' : 'password'}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onBlur={() => setTouched(true)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && onEnter) onEnter();
                    }}
                    placeholder={placeholder}
                    required={required}
                    disabled={disabled}
                    autoComplete={autoComplete}
                    minLength={minLength}
                    aria-invalid={finalError ? 'true' : 'false'}
                    aria-describedby={`${describedById} ${finalError ? errorId : ''}`.trim()}
                    className={`w-full border rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 bg-white/80 backdrop-blur-sm focus:ring-2 focus:border-transparent transition-all duration-300 hover:border-emerald-300 ${disabled ? 'opacity-60 cursor-not-allowed' : ''} ${borderClass}`}
                />

                <button
                    type="button"
                    onClick={() => setVisible((v) => !v)}
                    disabled={disabled}
                    aria-label={visible ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                    className="px-4 py-2 text-sm font-medium text-gray-600 bg-white/50 border border-gray-200 rounded-xl hover:bg-white hover:text-emerald-600 transition-colors disabled:opacity-60"
                >
                    {visible ? 'Masquer' : 'Afficher'}
                </button>
            </div>

            {/* Hint */}
            <p id={describedById} className="mt-2 text-xs text-gray-500">
                {hint ?? `Minimum ${minLength} caractères.`}
            </p>

            {/* Strength indicator */}
            {showStrength && value.length > 0 && (
                <div className="mt-3">
                    <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                        <span>Robustesse</span>
                        <span className="font-medium">{strength.label}</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-gray-200 overflow-hidden">
                        <div
                            className={`h-2 rounded-full transition-all duration-300 ${strength.color}`}
                            style={{ width: `${(strength.score / 4) * 100}%` }}
                        />
                    </div>
                </div>
            )}

            {/* Error message */}
            {finalError && (
                <p id={errorId} className="mt-2 text-sm text-red-600">
                    {finalError}
                </p>
            )}
        </div>
    );
}
