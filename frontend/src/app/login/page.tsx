"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login as apiLogin, getUserInfo } from "../../lib/api";
import { useAuth } from "../../hooks/useAuth";
import { handleError } from "../../lib/errorHandler";
import { Role } from "@/src/types";
import { BeakerIcon } from "@heroicons/react/24/outline";

export default function Login() {
    const router = useRouter();
    const { login } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            const response = await apiLogin({ email, password });
            await login(response.token);

            // Récupérer les infos utilisateur après le login
            const userInfo = await getUserInfo(response.token);

            // Redirection basée sur le rôle
            if (userInfo.role === Role.MEDECIN) {
                router.push("/dashboard-medecin");
            } else {
                router.push("/dashboard-chercheur");
            }
        } catch (err) {
            const formattedError = handleError(err, 'Login');
            setError(formattedError.userMessage);
        } finally {
            setIsLoading(false);
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
                        {/* Logo eco-friendly */}
                        <div className="mx-auto w-16 h-16 bg-gradient-to-br from-emerald-500 to-blue-500 rounded-2xl flex items-center justify-center mb-4 shadow-eco">
                            <BeakerIcon className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent mb-2">
                            Connexion
                        </h1>
                        <p className="text-gray-600">Accédez à votre espace MedDataCollect</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Champ email */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-900 mb-2" htmlFor="email">Adresse email</label>
                            <input
                                id="email"
                                type="email"
                                placeholder="votre.email@chu.fr"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 bg-white/80 backdrop-blur-sm focus-eco transition-all duration-300 hover:border-emerald-300"
                            />
                            <p className="text-xs text-gray-600 mt-2 bg-gray-50 p-2 rounded flex items-start gap-2">
                                <svg className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" />
                                </svg>
                                <span>Comptes de test : <code className="bg-white px-1 rounded">etude@chu.fr</code> ou <code className="bg-white px-1 rounded">admin@chu.fr</code></span>
                            </p>
                        </div>

                        {/* Mot de passe */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-900 mb-2" htmlFor="password">Mot de passe</label>
                            <input
                                id="password"
                                type="password"
                                placeholder="Entrez votre mot de passe"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 bg-white/80 backdrop-blur-sm focus-eco transition-all duration-300 hover:border-emerald-300"
                            />
                        </div>

                        {/* Message d'erreur */}
                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                <p className="text-red-700 text-sm font-medium">{error}</p>
                            </div>
                        )}

                        {/* Bouton amélioré */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            aria-label="Se connecter"
                            className="btn-eco w-full bg-gradient-to-r from-emerald-600 via-blue-600 to-indigo-600 hover:from-emerald-700 hover:via-blue-700 hover:to-indigo-700 text-white font-semibold py-4 rounded-2xl transition-all duration-300 shadow-eco-lg hover:shadow-xl focus-eco disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <span className="flex items-center justify-center gap-2">
                                {isLoading ? 'Connexion en cours...' : 'Se connecter'}
                            </span>
                        </button>

                        <div className="text-center mt-6 pt-4 border-t border-gray-200">
                            <p className="text-sm text-gray-600 mb-3">
                                Pas encore de compte ?{' '}
                                <a href="/register" className="text-blue-600 hover:text-blue-700 font-medium transition-colors">
                                    S'inscrire
                                </a>
                            </p>
                            <a href="#" className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
                                Mot de passe oublié ?
                            </a>
                        </div>
                    </form>
                </div>
            </div>
        </main>
    );
}