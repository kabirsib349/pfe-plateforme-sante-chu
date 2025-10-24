"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/hooks/useAuth";

export default function DashboardMedecin() {
    const router = useRouter();
    const { isAuthenticated, user, logout, isLoading } = useAuth();
    const [activeTab, setActiveTab] = useState("overview");

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push("/login");
        }
        // Vérifier que l'utilisateur est bien un médecin
        if (!isLoading && isAuthenticated && user?.role !== 'medecin') {
            router.push("/dashboard-chercheur");
        }
    }, [isAuthenticated, isLoading, user, router]);

    if (isLoading) return <div className="flex items-center justify-center min-h-screen">Chargement...</div>;
    if (!isAuthenticated) return null;
    if (user?.role !== 'medecin') return null;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navigation */}
            <nav className="bg-white shadow-lg sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex justify-between items-center py-4">
                        <div className="text-xl font-bold text-blue-600">
                            MedDataCollect
                        </div>
                        <div className="flex items-center space-x-4">
                            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                                Investigateur Coordinateur
                            </span>
                            <span className="text-gray-900 font-medium">{user?.nom}</span>
                            <button
                                onClick={logout}
                                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
                            >
                                Se déconnecter
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="max-w-7xl mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">
                    Tableau de Bord - Investigateur Coordinateur
                </h1>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow-sm p-6 text-center hover:shadow-md transition-shadow">
                        <div className="text-2xl font-bold text-blue-600 mb-2">5</div>
                        <div className="text-gray-800 text-sm font-medium">Études actives</div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm p-6 text-center hover:shadow-md transition-shadow">
                        <div className="text-2xl font-bold text-blue-600 mb-2">12</div>
                        <div className="text-gray-800 text-sm font-medium">Formulaires créés</div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm p-6 text-center hover:shadow-md transition-shadow">
                        <div className="text-2xl font-bold text-blue-600 mb-2">248</div>
                        <div className="text-gray-800 text-sm font-medium">Patients inclus</div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm p-6 text-center hover:shadow-md transition-shadow">
                        <div className="text-2xl font-bold text-blue-600 mb-2">18</div>
                        <div className="text-gray-800 text-sm font-medium">Investigateurs actifs</div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm p-6 text-center hover:shadow-md transition-shadow">
                        <div className="text-2xl font-bold text-blue-600 mb-2">3,842</div>
                        <div className="text-gray-800 text-sm font-medium">Données collectées</div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm p-6 text-center hover:shadow-md transition-shadow">
                        <div className="text-2xl font-bold text-red-600 mb-2">7</div>
                        <div className="text-gray-800 text-sm font-medium">Feedback en attente</div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="border-b border-gray-200 mb-6">
                    <nav className="flex space-x-8 overflow-x-auto">
                        {[
                            { id: "overview", label: "Vue d'ensemble" },
                            { id: "forms", label: "Gestion des Formulaires" },
                            { id: "data", label: "Données Collectées" },
                            { id: "investigators", label: "Investigateurs" },
                            { id: "feedback", label: "Feedback" },
                            { id: "dictionary", label: "Dictionnaire de Données" }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${activeTab === tab.id
                                    ? "border-blue-500 text-blue-600"
                                    : "border-transparent text-gray-700 hover:text-gray-900 hover:border-gray-300"
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Tab Content */}
                {activeTab === "overview" && (
                    <div className="space-y-6">
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-semibold text-gray-900">Activité récente</h2>
                                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
                                    Exporter le rapport
                                </button>
                            </div>

                            <div className="bg-gray-50 rounded-lg p-6 mb-6">
                                <div className="text-center text-gray-500">
                                    Graphique d'activité - Données collectées par jour
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Événement</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Utilisateur</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Détails</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        <tr className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">18/10/2025 14:30</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Nouvelle saisie</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Dr. Martin</td>
                                            <td className="px-6 py-4 text-sm text-gray-900">Patient P-2025-0012 - Formulaire J+15</td>
                                        </tr>
                                        <tr className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">18/10/2025 11:15</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Formulaire validé</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Vous</td>
                                            <td className="px-6 py-4 text-sm text-gray-900">Étude Neurologique Phase II</td>
                                        </tr>
                                        <tr className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">17/10/2025 16:45</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Feedback reçu</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Dr. Lefebvre</td>
                                            <td className="px-6 py-4 text-sm text-gray-900">Suggestions pour Suivi Post-opératoire</td>
                                        </tr>
                                        <tr className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">17/10/2025 09:20</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Nouveau patient inclus</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Dr. Bernard</td>
                                            <td className="px-6 py-4 text-sm text-gray-900">Patient P-2025-0024</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="bg-white rounded-lg shadow-sm p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Formulaires par statut</h3>
                                <div className="bg-gray-50 rounded-lg p-6 h-64 flex items-center justify-center">
                                    <div className="text-center text-gray-500">
                                        Graphique circulaire - Statut des formulaires
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow-sm p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Progression des études</h3>
                                <div className="bg-gray-50 rounded-lg p-6 h-64 flex items-center justify-center">
                                    <div className="text-center text-gray-500">
                                        Graphique à barres - Patients par étude
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "forms" && (
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-semibold text-gray-900">Mes formulaires</h2>
                            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
                                Créer un formulaire
                            </button>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom du formulaire</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Étude</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date création</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    <tr className="hover:bg-gray-50">
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">Étude Cardio-Vasculaire 2025</td>
                                        <td className="px-6 py-4 text-sm text-gray-900">Cardio-Vasculaire</td>
                                        <td className="px-6 py-4 text-sm text-gray-900">15/10/2025</td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                                Validé
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm space-x-2">
                                            <button className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs transition-colors">
                                                Modifier
                                            </button>
                                            <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs transition-colors">
                                                Voir données
                                            </button>
                                        </td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">Suivi Post-opératoire</td>
                                        <td className="px-6 py-4 text-sm text-gray-900">Chirurgie</td>
                                        <td className="px-6 py-4 text-sm text-gray-900">12/10/2025</td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                                En attente
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm space-x-2">
                                            <button className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs transition-colors">
                                                Modifier
                                            </button>
                                            <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs transition-colors">
                                                Soumettre validation
                                            </button>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === "data" && (
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-semibold text-gray-900">Données agrégées et anonymisées</h2>
                            <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors">
                                Exporter toutes les données
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                            <div className="border border-gray-200 rounded-lg p-4 text-center hover:border-blue-500 hover:bg-blue-50 cursor-pointer transition-colors">
                                <div className="text-2xl mb-2">📊</div>
                                <h4 className="font-medium">Export CSV</h4>
                                <p className="text-sm text-gray-600">Données brutes anonymisées</p>
                            </div>
                            <div className="border border-gray-200 rounded-lg p-4 text-center hover:border-blue-500 hover:bg-blue-50 cursor-pointer transition-colors">
                                <div className="text-2xl mb-2">📈</div>
                                <h4 className="font-medium">Export Excel</h4>
                                <p className="text-sm text-gray-600">Format tableur avec métadonnées</p>
                            </div>
                            <div className="border border-gray-200 rounded-lg p-4 text-center hover:border-blue-500 hover:bg-blue-50 cursor-pointer transition-colors">
                                <div className="text-2xl mb-2">📋</div>
                                <h4 className="font-medium">Rapport statistique</h4>
                                <p className="text-sm text-gray-600">Analyse descriptive des données</p>
                            </div>
                            <div className="border border-gray-200 rounded-lg p-4 text-center hover:border-blue-500 hover:bg-blue-50 cursor-pointer transition-colors">
                                <div className="text-2xl mb-2">🔒</div>
                                <h4 className="font-medium">Export sécurisé</h4>
                                <p className="text-sm text-gray-600">Chiffré pour transfert externe</p>
                            </div>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-6 mb-6">
                            <div className="text-center text-gray-500">
                                Visualisation des données - Répartition par critères
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "investigators" && (
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-semibold text-gray-900">Investigateurs d'étude</h2>
                            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
                                Assigner un investigateur
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div className="border border-gray-200 rounded-lg p-4">
                                <div className="flex justify-between items-center mb-2">
                                    <h4 className="font-medium">Dr. Martin</h4>
                                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                        Actif
                                    </span>
                                </div>
                                <p className="text-sm text-gray-600 mb-3">Cardiologie - Hôpital Central</p>
                                <div className="flex justify-between text-center">
                                    <div>
                                        <div className="text-lg font-semibold text-blue-600">12</div>
                                        <div className="text-xs text-gray-500">Patients</div>
                                    </div>
                                    <div>
                                        <div className="text-lg font-semibold text-blue-600">42</div>
                                        <div className="text-xs text-gray-500">Saisies</div>
                                    </div>
                                    <div>
                                        <div className="text-lg font-semibold text-red-600">2</div>
                                        <div className="text-xs text-gray-500">Retards</div>
                                    </div>
                                </div>
                            </div>

                            <div className="border border-gray-200 rounded-lg p-4">
                                <div className="flex justify-between items-center mb-2">
                                    <h4 className="font-medium">Dr. Lefebvre</h4>
                                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                        Actif
                                    </span>
                                </div>
                                <p className="text-sm text-gray-600 mb-3">Chirurgie - Hôpital Nord</p>
                                <div className="flex justify-between text-center">
                                    <div>
                                        <div className="text-lg font-semibold text-blue-600">8</div>
                                        <div className="text-xs text-gray-500">Patients</div>
                                    </div>
                                    <div>
                                        <div className="text-lg font-semibold text-blue-600">28</div>
                                        <div className="text-xs text-gray-500">Saisies</div>
                                    </div>
                                    <div>
                                        <div className="text-lg font-semibold text-green-600">0</div>
                                        <div className="text-xs text-gray-500">Retards</div>
                                    </div>
                                </div>
                            </div>

                            <div className="border border-gray-200 rounded-lg p-4">
                                <div className="flex justify-between items-center mb-2">
                                    <h4 className="font-medium">Dr. Bernard</h4>
                                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                        Actif
                                    </span>
                                </div>
                                <p className="text-sm text-gray-600 mb-3">Neurologie - Hôpital Est</p>
                                <div className="flex justify-between text-center">
                                    <div>
                                        <div className="text-lg font-semibold text-blue-600">15</div>
                                        <div className="text-xs text-gray-500">Patients</div>
                                    </div>
                                    <div>
                                        <div className="text-lg font-semibold text-blue-600">56</div>
                                        <div className="text-xs text-gray-500">Saisies</div>
                                    </div>
                                    <div>
                                        <div className="text-lg font-semibold text-yellow-600">1</div>
                                        <div className="text-xs text-gray-500">Retards</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "feedback" && (
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-semibold text-gray-900">Feedback des investigateurs</h2>
                            <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                7 non traités
                            </span>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Investigateur</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priorité</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    <tr className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">18/10/2025</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Dr. Martin</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Question manquante</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                                Moyenne
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                                Nouveau
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs transition-colors">
                                                Traiter
                                            </button>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === "dictionary" && (
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-semibold text-gray-900">Dictionnaire de données</h2>
                            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
                                Ajouter une variable
                            </button>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Variable</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contraintes</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    <tr className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">age</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Nombre entier</td>
                                        <td className="px-6 py-4 text-sm text-gray-900">Âge du patient en années</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">18-120</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <button className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs transition-colors">
                                                Modifier
                                            </button>
                                        </td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">sexe</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Liste déroulante</td>
                                        <td className="px-6 py-4 text-sm text-gray-900">Sexe du patient</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">M, F, Autre</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <button className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs transition-colors">
                                                Modifier
                                            </button>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}