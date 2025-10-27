"use client";

import { useEffect, useState, FC, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/hooks/useAuth";
import { StatCard } from "@/src/components/dashboard/StatCard";
import { TabButton } from "@/src/components/dashboard/TabButton";
import { Badge } from "@/src/components/Badge";
import { Card } from "@/src/components/Card";

export default function Dashboard() {
    const router = useRouter();
    const { isAuthenticated, user, logout, isLoading } = useAuth();
    const [activeTab, setActiveTab] = useState("overview");
    
    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push("/login");
        }
        // Vérifier que l'utilisateur est bien un chercheur
        if (!isLoading && isAuthenticated && user?.role !== 'chercheur') {
            router.push("/dashboard-medecin");
        }
    }, [isAuthenticated, isLoading, user, router]);

    if (isLoading) return <div className="flex items-center justify-center min-h-screen">Chargement...</div>; // Affichage pendant le chargement
    if (!isAuthenticated) return null; // évite un rendu avant redirection
    if (user?.role !== 'chercheur') return null; // évite un rendu si mauvais rôle

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50/50 via-blue-50/30 to-indigo-50/50">
            {/* Navigation */}
            <nav className="glass shadow-eco-lg sticky top-0 z-50 border-b border-white/20">
                <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-3">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-blue-500 rounded-xl flex items-center justify-center">
                                <span className="text-lg">🌱⚕️</span>
                            </div>
                            <div className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
                                MedDataCollect
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                                Investigateur Coordinateur
                            </span>
                            <span className="text-gray-900 font-medium">{user?.nom ?? "Dr. Emmanuel KWEGUENG"}</span>
                            <button
                                onClick={logout}
                                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors text-sm"
                            >
                                Se déconnecter
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-eco">
                        <span className="text-2xl">🔬</span>
                    </div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-700 to-blue-700 bg-clip-text text-transparent">
                        Tableau de Bord - Investigateur Coordinateur
                    </h1>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
                    <StatCard label="Études actives" value="5" />
                    <StatCard label="Formulaires créés" value="12" />
                    <StatCard label="Patients inclus" value="248" />
                    <StatCard label="Investigateurs actifs" value="18" />
                    <StatCard label="Données collectées" value="3,842" />
                    <StatCard label="Feedback en attente" value="7" valueColor="text-yellow-500" />
                </div>

                {/* Tabs */}
                <div className="border-b border-gray-200 mb-6">
                    <nav className="flex space-x-6 overflow-x-auto">
                        <TabButton id="overview" activeTab={activeTab} setActiveTab={setActiveTab}>Vue d'ensemble</TabButton>
                        <TabButton id="forms" activeTab={activeTab} setActiveTab={setActiveTab}>Gestion des Formulaires</TabButton>
                        <TabButton id="data" activeTab={activeTab} setActiveTab={setActiveTab}>Données Collectées</TabButton>
                        <TabButton id="investigators" activeTab={activeTab} setActiveTab={setActiveTab}>Investigateurs</TabButton>
                        <TabButton id="feedback" activeTab={activeTab} setActiveTab={setActiveTab}>Feedback</TabButton>
                        <TabButton id="dictionary" activeTab={activeTab} setActiveTab={setActiveTab}>Dictionnaire de Données</TabButton>
                    </nav>
                </div>

                {/* Tab Content */}
                <div>
                    {activeTab === 'overview' && <OverviewTab />}
                    {activeTab === 'forms' && <FormsTab />}
                    {activeTab === 'data' && <DataTab />}
                    {activeTab === 'investigators' && <InvestigatorsTab />}
                    {activeTab === 'feedback' && <FeedbackTab />}
                    {activeTab === 'dictionary' && <DictionaryTab />}
                </div>
            </main>
        </div>
    );
}

// --- Composants réutilisables ---



const ChartPlaceholder: FC<{ text: string }> = ({ text }) => (
    <div className="h-72 bg-white rounded-lg p-6 shadow">
        <div className="h-full flex items-center justify-center bg-gray-50 rounded-md text-gray-500">
            {text}
        </div>
    </div>
);

const Table: FC<{ headers: string[]; children: ReactNode }> = ({ headers, children }) => (
    <div className="overflow-x-auto">
        <table className="min-w-full">
            <thead className="bg-gray-50">
                <tr>
                    {headers.map((header, index) => (
                        <th key={index} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{header}</th>
                    ))}
                </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
                {children}
            </tbody>
        </table>
    </div>
);

// --- Composants d'onglets ---

const OverviewTab = () => (
    <div>
        <Card
            title="Activité récente"
            action={<button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm">Exporter le rapport</button>}
        >
            <ChartPlaceholder text="Graphique d'activité - Données collectées par jour" />
            <div className="mt-6">
                <Table headers={["Date", "Événement", "Utilisateur", "Détails"]}>
                    <tr className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm">18/10/2025 14:30</td>
                        <td className="px-4 py-3 text-sm">Nouvelle saisie</td>
                        <td className="px-4 py-3 text-sm">Dr. Martin</td>
                        <td className="px-4 py-3 text-sm">Patient P-2025-0012 - Formulaire J+15</td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm">18/10/2025 11:15</td>
                        <td className="px-4 py-3 text-sm">Formulaire validé</td>
                        <td className="px-4 py-3 text-sm">Vous</td>
                        <td className="px-4 py-3 text-sm">Étude Neurologique Phase II</td>
                    </tr>
                </Table>
            </div>
        </Card>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartPlaceholder text="Graphique circulaire - Statut des formulaires" />
            <ChartPlaceholder text="Graphique à barres - Patients par étude" />
        </div>
    </div>
);

const FormsTab = () => {
    const router = useRouter();

    return (
        <div>
            <Card
                title="Mes formulaires"
                action={
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span>📊</span>
                        <span>{2} formulaires actifs</span>
                    </div>
                }
            >
                <Table headers={["Nom du formulaire", "Étude", "Date création", "Statut", "Actions"]}>
                    {/* Table rows */}
                    <tr className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium">Étude Cardio-Vasculaire 2025</td>
                        <td className="px-4 py-3 text-sm">Cardio-Vasculaire</td>
                        <td className="px-4 py-3 text-sm">15/10/2025</td>
                        <td className="px-4 py-3"><Badge color="green">Validé</Badge></td>
                        <td className="px-4 py-3 text-sm space-x-2">
                            <button className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-xs">Modifier</button>
                            <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs">Voir données</button>
                        </td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium">Suivi Post-opératoire</td>
                        <td className="px-4 py-3 text-sm">Chirurgie</td>
                        <td className="px-4 py-3 text-sm">12/10/2025</td>
                        <td className="px-4 py-3"><Badge color="yellow">En attente</Badge></td>
                        <td className="px-4 py-3 text-sm space-x-2">
                            <button className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-xs">Modifier</button>
                            <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs">Soumettre</button>
                        </td>
                    </tr>
                </Table>
            </Card>

            {/* Actions principales - Une seule section claire */}
            <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <span>⚡</span>
                    Actions rapides
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div 
                        onClick={() => router.push('/formulaire')}
                        className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 hover:border-blue-300 cursor-pointer transition-all hover:shadow-md group"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                                <span className="text-2xl">📋</span>
                            </div>
                            <div>
                                <h3 className="font-semibold text-blue-900 mb-1">Interface complète</h3>
                                <p className="text-sm text-blue-700">Gérer, filtrer et organiser tous vos formulaires</p>
                            </div>
                        </div>
                    </div>

                    <div 
                        onClick={() => router.push('/formulaire/nouveau')}
                        className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200 hover:border-green-300 cursor-pointer transition-all hover:shadow-md group"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center group-hover:bg-green-200 transition-colors">
                                <span className="text-2xl">✨</span>
                            </div>
                            <div>
                                <h3 className="font-semibold text-green-900 mb-1">Créer un formulaire</h3>
                                <p className="text-sm text-green-700">Assistant de création guidée avec thèmes médicaux</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const DataTab = () => (
    <Card
        title="Données agrégées et anonymisées"
        action={<button className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm">Exporter toutes les données</button>}
    >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {['📊 Export CSV', '📈 Export Excel', '📋 Rapport statistique', '🔒 Export sécurisé'].map(opt => (
                <div key={opt} className="border border-gray-200 rounded-lg p-4 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors">
                    <h4 className="font-medium">{opt}</h4>
                </div>
            ))}
        </div>
        <ChartPlaceholder text="Visualisation des données - Répartition par critères" />
        <div className="mt-6">
            <Table headers={["ID Anonymisé", "Âge", "Sexe", "Groupe", "Date inclusion", "Score initial"]}>
                <tr className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">PT-0012</td>
                    <td className="px-4 py-3 text-sm">45</td>
                    <td className="px-4 py-3 text-sm">M</td>
                    <td className="px-4 py-3 text-sm">A</td>
                    <td className="px-4 py-3 text-sm">10/10/2025</td>
                    <td className="px-4 py-3 text-sm">24</td>
                </tr>
                <tr className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">PT-0015</td>
                    <td className="px-4 py-3 text-sm">52</td>
                    <td className="px-4 py-3 text-sm">F</td>
                    <td className="px-4 py-3 text-sm">B</td>
                    <td className="px-4 py-3 text-sm">12/10/2025</td>
                    <td className="px-4 py-3 text-sm">30</td>
                </tr>
            </Table>
        </div>
    </Card>
);

const InvestigatorsTab = () => (
    <div>
        <Card
            title="Investigateurs d'étude"
            action={<button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm">Assigner un investigateur</button>}
        >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium">Dr. Martin</h4>
                        <Badge color="green">Actif</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">Cardiologie - Hôpital Central</p>
                    <div className="flex justify-around text-center mt-4">
                        <div><div className="font-bold text-blue-600">12</div><div className="text-xs text-gray-500">Patients</div></div>
                        <div><div className="font-bold text-blue-600">42</div><div className="text-xs text-gray-500">Saisies</div></div>
                        <div><div className="font-bold text-red-600">2</div><div className="text-xs text-gray-500">Retards</div></div>
                    </div>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium">Dr. Lefebvre</h4>
                        <Badge color="green">Actif</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">Chirurgie - Hôpital Nord</p>
                    <div className="flex justify-around text-center mt-4">
                        <div><div className="font-bold text-blue-600">8</div><div className="text-xs text-gray-500">Patients</div></div>
                        <div><div className="font-bold text-blue-600">28</div><div className="text-xs text-gray-500">Saisies</div></div>
                        <div><div className="font-bold text-green-600">0</div><div className="text-xs text-gray-500">Retards</div></div>
                    </div>
                </div>
            </div>
        </Card>
        <Card title="Performance par étude">
            <Table headers={["Étude", "Investigateur", "Patients inclus", "Taux complétion", "Actions"]}>
                <tr className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">Cardio-Vasculaire</td>
                    <td className="px-4 py-3 text-sm">Dr. Martin</td>
                    <td className="px-4 py-3 text-sm">12</td>
                    <td className="px-4 py-3 text-sm">92%</td>
                    <td className="px-4 py-3"><button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs">Envoyer rappel</button></td>
                </tr>
            </Table>
        </Card>
    </div>
);

const FeedbackTab = () => (
    <Card
        title="Feedback des investigateurs"
        action={<Badge color="yellow">7 non traités</Badge>}
    >
        <Table headers={["Date", "Investigateur", "Formulaire", "Priorité", "Statut", "Actions"]}>
            <tr className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm">18/10/2025</td>
                <td className="px-4 py-3 text-sm">Dr. Martin</td>
                <td className="px-4 py-3 text-sm">Étude Cardio-Vasculaire</td>
                <td className="px-4 py-3"><Badge color="yellow">Moyenne</Badge></td>
                <td className="px-4 py-3"><Badge color="blue">Nouveau</Badge></td>
                <td className="px-4 py-3"><button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs">Traiter</button></td>
            </tr>
            <tr className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm">15/10/2025</td>
                <td className="px-4 py-3 text-sm">Dr. Bernard</td>
                <td className="px-4 py-3 text-sm">Étude Neurologique</td>
                <td className="px-4 py-3"><Badge color="yellow">Moyenne</Badge></td>
                <td className="px-4 py-3"><Badge color="green">Traité</Badge></td>
                <td className="px-4 py-3"><button className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-xs">Voir</button></td>
            </tr>
        </Table>
    </Card>
);

const DictionaryTab = () => (
    <Card
        title="Dictionnaire de données"
        action={<button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm">Ajouter une variable</button>}
    >
        <Table headers={["Variable", "Type", "Description", "Contraintes", "Actions"]}>
            <tr className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium">age</td>
                <td className="px-4 py-3 text-sm">Nombre entier</td>
                <td className="px-4 py-3 text-sm">Âge du patient en années</td>
                <td className="px-4 py-3 text-sm">18-120</td>
                <td className="px-4 py-3"><button className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-xs">Modifier</button></td>
            </tr>
            <tr className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium">sexe</td>
                <td className="px-4 py-3 text-sm">Liste déroulante</td>
                <td className="px-4 py-3 text-sm">Sexe du patient</td>
                <td className="px-4 py-3 text-sm">M, F, Autre</td>
                <td className="px-4 py-3"><button className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-xs">Modifier</button></td>
            </tr>
        </Table>
    </Card>
);
