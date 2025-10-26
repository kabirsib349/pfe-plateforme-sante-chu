"use client";

import { useEffect, useState, FC, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/hooks/useAuth";

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
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
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

const StatCard: FC<{ label: string; value: string; valueColor?: string }> = ({ label, value, valueColor = "text-emerald-600" }) => (
    <div className="glass rounded-2xl shadow-eco p-5 text-center transition-all duration-300 hover:-translate-y-2 hover:shadow-eco-lg border border-white/20">
        <div className="text-gray-600 text-sm font-medium">{label}</div>
        <div className={`text-4xl font-bold mt-3 ${valueColor}`}>{value}</div>
    </div>
);

const TabButton: FC<{ id: string; activeTab: string; setActiveTab: (id: string) => void; children: ReactNode }> = ({ id, activeTab, setActiveTab, children }) => (
    <button
        onClick={() => setActiveTab(id)}
        className={`py-2 px-3 whitespace-nowrap font-medium border-b-2 transition-colors ${activeTab === id
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-blue-600 hover:border-blue-300"
            }`}
    >
        {children}
    </button>
);

const Card: FC<{ title: string; action?: ReactNode; children: ReactNode; className?: string }> = ({ title, action, children, className }) => (
    <div className={`bg-white rounded-lg shadow p-6 mb-6 ${className}`}>
        <div className="flex justify-between items-center pb-4 mb-4 border-b border-gray-200">
            <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
            {action}
        </div>
        <div>{children}</div>
    </div>
);

const Badge: FC<{ color: 'green' | 'yellow' | 'red' | 'blue' | 'gray'; children: ReactNode }> = ({ color, children }) => {
    const colors = {
        green: "bg-green-100 text-green-800",
        yellow: "bg-yellow-100 text-yellow-800",
        red: "bg-red-100 text-red-800",
        blue: "bg-blue-100 text-blue-800",
        gray: "bg-gray-100 text-gray-800",
    };
    return <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${colors[color]}`}>{children}</span>;
};

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
    const [showCreator, setShowCreator] = useState(false);

    return (
        <div>
            <Card
                title="Mes formulaires"
                action={<button onClick={() => setShowCreator(!showCreator)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm">{showCreator ? 'Fermer' : 'Créer un formulaire'}</button>}
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

            {showCreator && (
                <Card
                    title="Création de formulaire"
                    action={
                        <div className="space-x-2">
                            <button className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm">Sauvegarder brouillon</button>
                            <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm">Valider le formulaire</button>
                        </div>
                    }
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div>
                            <label htmlFor="form-name" className="block text-sm font-medium text-gray-700 mb-1">Nom du formulaire</label>
                            <input type="text" id="form-name" placeholder="Ex: Étude Cardio-Vasculaire 2025" className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                        </div>
                        <div>
                            <label htmlFor="form-study" className="block text-sm font-medium text-gray-700 mb-1">Étude associée</label>
                            <select id="form-study" className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white">
                                <option>Sélectionner une étude</option>
                                <option>Cardio-Vasculaire</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex flex-col lg:flex-row gap-6">
                        <div className="lg:w-1/3">
                            <h3 className="font-semibold mb-2">Éléments de formulaire</h3>
                            <div className="space-y-2">
                                {['Texte court', 'Texte long', 'Nombre', 'Date', 'Liste déroulante', 'Boutons radio', 'Cases à cocher'].map(field => (
                                    <div key={field} className="bg-gray-50 p-3 rounded-md border border-gray-200 cursor-move hover:bg-blue-50">
                                        <strong>{field}</strong>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="lg:w-2/3 bg-white p-4 border-2 border-dashed border-gray-300 rounded-lg min-h-[400px]">
                            <h3 className="font-semibold mb-2">Prévisualisation du formulaire</h3>
                            <div className="text-center text-gray-500 mt-16">
                                Glissez-déposez des éléments ici pour construire votre formulaire
                            </div>
                        </div>
                    </div>
                </Card>
            )}
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
