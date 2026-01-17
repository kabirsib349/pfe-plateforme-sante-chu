'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiUrl } from '@/src/lib/config';

/**
 * Page de demande de réinitialisation de mot de passe.
 * L'utilisateur saisit son email pour recevoir un code de vérification.
 */
export default function ForgotPasswordPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setMessage(null);

        const cleanEmail = email.trim();

        if (!cleanEmail || !/^\S+@\S+\.\S+$/.test(cleanEmail)) {
            setError('Veuillez saisir une adresse e-mail valide.');
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(apiUrl('/api/auth/forgot-password'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: cleanEmail }),
            });

            const text = await res.text();
            const data = text ? JSON.parse(text) : null;

            if (!res.ok) {
                setError(data?.message || "Impossible d'envoyer le code. Veuillez réessayer.");
                return;
            }

            // Message volontairement neutre (évite l'énumération des emails)
            setMessage("Si un compte existe avec cette adresse, un code de vérification a été envoyé.");

            // Redirection vers la page de vérification avec l'email en query param
            router.push(`/forgot-password/verify?email=${encodeURIComponent(cleanEmail)}`);
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
                            Mot de passe oublié
                        </h1>
                        <p className="text-gray-600">
                            Saisissez votre adresse e-mail pour recevoir un code de vérification
                        </p>
                    </div>

                    {message && (
                        <div className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                            {message}
                        </div>
                    )}
                    {error && (
                        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                            {error}
                        </div>
                    )}

                    <form onSubmit={submit} className="space-y-6">
                        <div>
                            <label htmlFor="email" className="block text-sm font-semibold text-gray-900 mb-2">
                                Adresse e-mail
                            </label>
                            <input
                                id="email"
                                type="email"
                                autoComplete="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="votre.email@chu.fr"
                                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 bg-white/80 backdrop-blur-sm focus-eco transition-all duration-300 hover:border-emerald-300"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-eco w-full bg-gradient-to-r from-emerald-600 via-blue-600 to-indigo-600 hover:from-emerald-700 hover:via-blue-700 hover:to-indigo-700 text-white font-semibold py-4 rounded-2xl transition-all duration-300 shadow-eco-lg hover:shadow-xl focus-eco disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <span className="flex items-center justify-center gap-2">
                                {loading ? 'Envoi en cours...' : 'Recevoir le code'}
                            </span>
                        </button>

                        <div className="text-center mt-6 pt-4 border-t border-gray-200">
                            <p className="text-sm text-gray-600">
                                Vous vous souvenez de votre mot de passe ?{' '}
                                <a href="/login" className="text-blue-600 hover:text-blue-700 font-medium transition-colors">
                                    Se connecter
                                </a>
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </main>
    );
}
