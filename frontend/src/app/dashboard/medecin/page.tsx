"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/hooks/useAuth";

export default function DashboardMedecinPage() {
    const router = useRouter();
    const { isAuthenticated, user, logout } = useAuth();

    useEffect(() => {
        if (!isAuthenticated) {
            router.push("/login-medecin");
        }
    }, [isAuthenticated, router]);

    if (!isAuthenticated) return null; // évite un rendu avant redirection

    return (
        <main className="min-h-screen bg-gray-50 p-8">
            <div className="bg-white rounded-xl shadow-md p-6">
                <h1 className="text-2xl font-semibold text-blue-700 mb-4">
                    Tableau de Bord - Médecin
                </h1>
                <p className="text-gray-700 mb-6">Bienvenue, <span className="font-medium">{user}</span> 👨‍⚕️</p>

                <div className="grid grid-cols-2 gap-6">
                    <div className="p-4 border rounded-lg shadow-sm">
                        <h2 className="text-lg font-semibold text-blue-600 mb-2">Études actives</h2>
                        <p>5</p>
                    </div>

                    <div className="p-4 border rounded-lg shadow-sm">
                        <h2 className="text-lg font-semibold text-blue-600 mb-2">Patients suivis</h2>
                        <p>248</p>
                    </div>
                </div>

                <button
                    onClick={logout}
                    className="mt-6 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition"
                >
                    Se déconnecter
                </button>
            </div>
        </main>
    );
}
