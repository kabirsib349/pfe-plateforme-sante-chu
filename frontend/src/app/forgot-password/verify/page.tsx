'use client';

import React, { useEffect, useMemo, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import OtpInput from '../../../components/ui/OtpInput';
import { apiUrl } from '@/src/lib/config';

/**
 * Récupère la durée d'expiration de l'OTP depuis les variables d'environnement.
 */
function getExpiryMinutes() {
    const v = Number(process.env.NEXT_PUBLIC_OTP_EXPIRY_MINUTES);
    return Number.isFinite(v) && v > 0 ? v : 10;
}

/**
 * Contenu de la page de vérification du code OTP.
 */
function VerifyPageContent() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const email = (searchParams.get('email') || '').trim();
    const expiryMinutes = getExpiryMinutes();

    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Countdown timer
    const [secondsLeft, setSecondsLeft] = useState(expiryMinutes * 60);

    useEffect(() => {
        setSecondsLeft(expiryMinutes * 60);
    }, [expiryMinutes]);

    useEffect(() => {
        const t = setInterval(() => {
            setSecondsLeft((s) => (s > 0 ? s - 1 : 0));
        }, 1000);
        return () => clearInterval(t);
    }, []);

    const timeLabel = useMemo(() => {
        const mm = Math.floor(secondsLeft / 60);
        const ss = secondsLeft % 60;
        return `${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;
    }, [secondsLeft]);

    const submit = async (e?: React.FormEvent) => {
        e?.preventDefault();
        setError(null);

        if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
            setError("Adresse e-mail manquante ou invalide. Revenez à l'étape précédente.");
            return;
        }
        if (!/^\d{6}$/.test(code)) {
            setError('Veuillez saisir le code de vérification à 6 chiffres.');
            return;
        }
        if (secondsLeft === 0) {
            setError('Le code a expiré. Veuillez demander un nouveau code.');
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(apiUrl('/api/auth/verify-reset-code'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, code }),
            });

            const text = await res.text();
            const data = text ? JSON.parse(text) : null;

            if (!res.ok) {
                setError(data?.message || 'Code incorrect ou expiré. Veuillez réessayer.');
                return;
            }

            const resetToken = data?.resetToken;
            if (!resetToken) {
                setError("Réponse inattendue du serveur. Veuillez recommencer la procédure.");
                return;
            }

            router.push(`/forgot-password/reset?token=${encodeURIComponent(resetToken)}`);
        } catch {
            setError('Erreur réseau. Veuillez réessayer.');
        } finally {
            setLoading(false);
        }
    };

    const resend = async () => {
        setError(null);

        if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
            setError("Adresse e-mail manquante ou invalide. Revenez à l'étape précédente.");
            return;
        }

        setResending(true);
        try {
            const res = await fetch(apiUrl('/api/auth/forgot-password'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const text = await res.text();
            const data = text ? JSON.parse(text) : null;

            if (!res.ok) {
                setError(data?.message || "Impossible de renvoyer un code. Veuillez réessayer.");
                return;
            }

            setCode('');
            setSecondsLeft(expiryMinutes * 60);
        } catch {
            setError('Erreur réseau. Veuillez réessayer.');
        } finally {
            setResending(false);
        }
    };

    return (
        <main className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-indigo-100 p-4 relative overflow-hidden">
            {/* Éléments décoratifs animés */}
            <div className="absolute top-20 left-10 w-32 h-32 bg-emerald-200 rounded-full opacity-20 animate-float"></div>
            <div className="absolute bottom-20 right-10 w-24 h-24 bg-blue-200 rounded-full opacity-30 animate-pulse-soft"></div>
            <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-indigo-200 rounded-full opacity-25 animate-bounce"></div>

            <div className="flex flex-col items-center justify-center min-h-screen relative z-10">
                <div className="glass rounded-3xl p-8 w-full max-w-md shadow-eco-lg border border-white/20 animate-fade-in-up">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent mb-2">
                            Vérification
                        </h1>
                        <p className="text-gray-600">
                            Saisissez le code à 6 chiffres envoyé à{' '}
                            <span className="font-medium text-emerald-700">{email || 'votre adresse e-mail'}</span>
                        </p>
                    </div>

                    {/* Timer */}
                    <div className="text-center mb-6 bg-white/50 rounded-xl p-3 border border-white/50 backdrop-blur-sm">
                        <p className="text-sm text-gray-600 mb-1">Temps restant</p>
                        <p className={`text-2xl font-mono font-bold ${secondsLeft < 60 ? 'text-red-500 animate-pulse' : 'text-emerald-600'}`}>
                            {timeLabel}
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                            {error}
                        </div>
                    )}

                    <form onSubmit={submit} className="space-y-6">
                        <OtpInput length={6} value={code} onChange={setCode} />

                        <button
                            type="submit"
                            disabled={loading || secondsLeft === 0}
                            className="btn-eco w-full bg-gradient-to-r from-emerald-600 via-blue-600 to-indigo-600 hover:from-emerald-700 hover:via-blue-700 hover:to-indigo-700 text-white font-semibold py-4 rounded-2xl transition-all duration-300 shadow-eco-lg hover:shadow-xl focus-eco disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <span className="flex items-center justify-center gap-2">
                                {loading ? 'Vérification...' : 'Valider le code'}
                            </span>
                        </button>
                    </form>

                    <div className="text-center mt-6 pt-4 border-t border-gray-200 space-y-3">
                        <p className="text-sm text-gray-600">
                            Vous n&apos;avez rien reçu ?{' '}
                            <button
                                type="button"
                                onClick={resend}
                                disabled={resending}
                                className="font-medium text-blue-600 hover:text-blue-700 hover:underline disabled:opacity-50 transition-colors"
                            >
                                {resending ? 'Renvoi en cours...' : 'Renvoyer un code'}
                            </button>
                        </p>

                        <div>
                            <a href="/forgot-password" className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
                                Modifier l&apos;adresse e-mail
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}

/**
 * Page de vérification du code OTP avec Suspense pour useSearchParams.
 */
export default function VerifyPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-indigo-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Chargement...</p>
                </div>
            </div>
        }>
            <VerifyPageContent />
        </Suspense>
    );
}
