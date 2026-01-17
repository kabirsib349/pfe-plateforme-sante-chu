'use client';

import React, { useMemo, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { apiUrl } from '@/src/lib/config';

/**
 * Contenu de la page de réinitialisation du mot de passe.
 */
function ResetPasswordContent() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const token = (searchParams.get('token') || '').trim();

    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [show1, setShow1] = useState(false);
    const [show2, setShow2] = useState(false);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const same = useMemo(() => password.length > 0 && password === confirm, [password, confirm]);
    const strongEnough = useMemo(() => password.length >= 8, [password]);

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        if (!token) {
            setError("La demande de réinitialisation est invalide. Veuillez recommencer la procédure.");
            return;
        }
        if (!strongEnough) {
            setError('Le mot de passe doit contenir au moins 8 caractères.');
            return;
        }
        if (!same) {
            setError('Les deux mots de passe ne correspondent pas.');
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(apiUrl('/api/auth/reset-password'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ resetToken: token, newPassword: password }),
            });

            const text = await res.text();
            const data = text ? JSON.parse(text) : null;

            if (!res.ok) {
                setError(data?.message || 'Impossible de réinitialiser le mot de passe. Veuillez réessayer.');
                return;
            }

            setSuccess('Votre mot de passe a été mis à jour. Vous pouvez maintenant vous connecter.');
            setTimeout(() => router.push('/login'), 1500);
        } catch {
            setError('Erreur réseau. Veuillez réessayer.');
        } finally {
            setLoading(false);
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
                            Nouveau mot de passe
                        </h1>
                        <p className="text-gray-600">
                            Choisissez un nouveau mot de passe sécurisé
                        </p>
                    </div>

                    {success && (
                        <div className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                            {success}
                        </div>
                    )}
                    {error && (
                        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                            {error}
                        </div>
                    )}

                    <form onSubmit={submit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-900 mb-2">Nouveau mot de passe</label>
                            <div className="flex gap-2">
                                <input
                                    type={show1 ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    autoComplete="new-password"
                                    placeholder="••••••••"
                                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 bg-white/80 backdrop-blur-sm focus-eco transition-all duration-300 hover:border-emerald-300"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShow1((s) => !s)}
                                    className="px-4 py-2 text-sm font-medium text-gray-600 bg-white/50 border border-gray-200 rounded-xl hover:bg-white hover:text-emerald-600 transition-colors"
                                >
                                    {show1 ? 'Masquer' : 'Afficher'}
                                </button>
                            </div>
                            <p className="mt-2 text-xs text-gray-500 flex items-center gap-1">
                                {strongEnough ? '•' : '•'} Minimum 8 caractères
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-900 mb-2">Confirmer le mot de passe</label>
                            <div className="flex gap-2">
                                <input
                                    type={show2 ? 'text' : 'password'}
                                    value={confirm}
                                    onChange={(e) => setConfirm(e.target.value)}
                                    autoComplete="new-password"
                                    placeholder="••••••••"
                                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 bg-white/80 backdrop-blur-sm focus-eco transition-all duration-300 hover:border-emerald-300"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShow2((s) => !s)}
                                    className="px-4 py-2 text-sm font-medium text-gray-600 bg-white/50 border border-gray-200 rounded-xl hover:bg-white hover:text-emerald-600 transition-colors"
                                >
                                    {show2 ? 'Masquer' : 'Afficher'}
                                </button>
                            </div>

                            {confirm.length > 0 && !same && (
                                <p className="mt-2 text-xs text-red-600">Les deux mots de passe ne correspondent pas.</p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !token || !strongEnough || !same}
                            className="btn-eco w-full bg-gradient-to-r from-emerald-600 via-blue-600 to-indigo-600 hover:from-emerald-700 hover:via-blue-700 hover:to-indigo-700 text-white font-semibold py-4 rounded-2xl transition-all duration-300 shadow-eco-lg hover:shadow-xl focus-eco disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <span className="flex items-center justify-center gap-2">
                                {loading ? 'Enregistrement...' : 'Enregistrer'}
                            </span>
                        </button>
                    </form>

                    <div className="text-center mt-6 pt-4 border-t border-gray-200">
                        <a href="/login" className="text-sm text-gray-500 hover:text-gray-700 transition-colors hover:underline">
                            Retour à la connexion
                        </a>
                    </div>
                </div>
            </div>
        </main>
    );
}

/**
 * Page de réinitialisation du mot de passe avec Suspense pour useSearchParams.
 */
export default function ResetPasswordPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-indigo-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Chargement...</p>
                </div>
            </div>
        }>
            <ResetPasswordContent />
        </Suspense>
    );
}
