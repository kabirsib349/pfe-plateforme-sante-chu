'use client';

import React, { useEffect, useRef } from 'react';

type OtpInputProps = {
    /** Nombre de chiffres du code */
    length: number;
    /** Valeur contrôlée */
    value?: string;
    /** Callback appelé à chaque changement */
    onChange: (value: string) => void;
    /** Message d'erreur optionnel */
    error?: string;
};

/**
 * Composant de saisie de code OTP avec navigation automatique.
 */
export default function OtpInput({ length, value = '', onChange, error }: OtpInputProps) {
    const inputsRef = useRef<HTMLInputElement[]>([]);

    // Représentation interne du code
    const valueArray = Array.from({ length }, (_, i) => (value[i] ?? ''));

    useEffect(() => {
        // Focus sur le premier champ vide au montage
        const firstEmpty = inputsRef.current.find((el) => el && el.value === '');
        if (firstEmpty) firstEmpty.focus();
    }, []);

    const updateAndNotify = (arr: string[]) => {
        const joined = arr.join('');
        onChange(joined);
    };

    const handleChange = (idx: number, raw: string) => {
        // Ne garder que les chiffres
        const digit = raw.replace(/\D/g, '').slice(0, 1);
        const next = [...valueArray];
        next[idx] = digit;
        updateAndNotify(next);

        // Passer au champ suivant si un chiffre est saisi
        if (digit && idx < length - 1) {
            inputsRef.current[idx + 1]?.focus();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, idx: number) => {
        // Revenir au champ précédent avec Backspace si le champ actuel est vide
        if (e.key === 'Backspace' && !inputsRef.current[idx]?.value && idx > 0) {
            const prev = inputsRef.current[idx - 1];
            prev?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        // Extraire uniquement les chiffres du texte collé
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
        if (!pasted) return;

        const newArr = Array.from({ length }, (_, i) => pasted[i] ?? '');
        updateAndNotify(newArr);

        // Focus sur le dernier chiffre collé
        const lastIdx = Math.min(pasted.length, length) - 1;
        if (lastIdx >= 0) {
            inputsRef.current[lastIdx]?.focus();
        }
    };

    return (
        <div>
            <div className="flex justify-center gap-3">
                {Array.from({ length }).map((_, i) => (
                    <input
                        key={i}
                        aria-label={`Code chiffre ${i + 1}`}
                        ref={(el) => {
                            if (el) inputsRef.current[i] = el;
                        }}
                        value={valueArray[i]}
                        onChange={(e) => handleChange(i, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, i)}
                        onPaste={handlePaste}
                        inputMode="numeric"
                        pattern="\d*"
                        maxLength={1}
                        className="w-12 h-14 text-center text-2xl font-bold border border-gray-300 rounded-xl bg-white/80 backdrop-blur-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 hover:border-emerald-300"
                    />
                ))}
            </div>
            {error && (
                <p className="mt-3 text-sm text-red-600 text-center" role="alert">
                    {error}
                </p>
            )}
        </div>
    );
}
