"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "../../lib/api";
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
    const [code2FA,setCode2FA] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        const passwordError = validatePassword(password);
        if(passwordError){
            setError(passwordError);
            return;
        }

        try {
            const response: LoginResponse = await login({ email, password });
            login(response.token);
            router.push("/dashboard");
        } catch (err: any) {
            console.error(err);
            setError("Identifiants invalides ou code incorrect.");
        }

    };

    return (
        <main className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
            <div className="bg-white shadow-lg rounded-xl p-8 w-full max-w-md">
                <h1 className="text-2xl font-semibold text-center text-blue-700 mb-6">
                    Connexion à MedDataCollect
                </h1>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Champ email */}
                    <div>
                        <label className="block text-sm font-medium mb-1">Email</label>
                        <input
                            type="email"
                            placeholder="votre.email@gmail.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Utilisez <code>etude@chu.fr</code> ou <code>admin@chu.fr</code> pour les autres vues.
                        </p>
                    </div>

                    {/* Mot de passe */}
                    <div>
                        <label className="block text-sm font-medium mb-1">Mot de passe</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
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
                    {error && <p className="text-red-500 text-sm">{error}</p>}

                    {/* Bouton */}
                    <button
                        type="submit"
                        aria-label="Se connecter en tant que médecin"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition"
                    >
                        Se connecter
                    </button>


                    <div className="text-right mt-2">
                        <a href="#" className="text-sm text-blue-600 hover:underline">
                            Mot de passe oublié ?
                        </a>
                    </div>
                </form>
            </div>
        </main>
    );
}
