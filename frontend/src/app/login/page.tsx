"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login as apiLogin, getUserInfo } from "../../lib/api";
import { useAuth } from "../../hooks/useAuth";
import { validatePassword } from "@/src/lib/validation";

interface LoginResponse {
    token: string;
}
export default function Login() {
    const router = useRouter();
    const { login } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        try {
            const response: LoginResponse = await apiLogin({ email, password });
            login(response.token);
            const userInfo = await getUserInfo(response.token);
            if(userInfo.role === 'medecin'){
                router.push("/dashboard-medecin")
            }else{
                router.push("/dashboard-chercheur");
            }
        } catch (err: any) {
            console.error(err);
            if (err.message.includes('401') || err.message.includes('Unauthorized')) {
                setError("Email ou mot de passe incorrect.");
            } else if (err.message.includes('Network') || err.message.includes('fetch')) {
                setError("Erreur de connexion au serveur. Vérifiez que le backend est démarré.");
            } else {
                setError(err.message || "Une erreur est survenue lors de la connexion.");
            }
        }

    };

    return (
        <main className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-4">
            <div className="bg-white shadow-2xl rounded-2xl p-8 w-full max-w-md border border-gray-100">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Connexion
                    </h1>
                    <p className="text-gray-600">Accédez à MedDataCollect</p>
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
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                        <p className="text-xs text-gray-600 mt-2 bg-gray-50 p-2 rounded">
                            💡 Comptes de test : <code className="bg-white px-1 rounded">etude@chu.fr</code> ou <code className="bg-white px-1 rounded">admin@chu.fr</code>
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
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                    </div>

                    {/* 2FA */}
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Code d’authentification à deux facteurs
                        </label>
                        <input
                            type="text"
                            placeholder="Code à 6 chiffres"
                            maxLength={6}
                            onChange={(e) => setCode2FA(e.target.value)}
                            className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                    </div>

                    {/* Message d’erreur */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                            <p className="text-red-700 text-sm font-medium">{error}</p>
                        </div>
                    )}

                    {/* Bouton */}
                    <button
                        type="submit"
                        aria-label="Se connecter"
                        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                    >
                        Se connecter
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
        </main>
    );
}
