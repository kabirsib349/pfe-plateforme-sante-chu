"use client";

import { useEffect, useState, FC, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/hooks/useAuth";
import { useStats } from "@/src/hooks/useStats";
import { useFormulaires } from "@/src/hooks/useFormulaires";
import { StatCard } from "@/src/components/dashboard/StatCard";
import { TabButton } from "@/src/components/dashboard/TabButton";
import { Badge } from "@/src/components/Badge";
import { Card } from "@/src/components/Card";
// note: using `useRouter` from next/navigation; no default router import

export default function Dashboard() {
    const router = useRouter();
    const { isAuthenticated, user, logout, isLoading } = useAuth();
    const { stats, isLoading: statsLoading, error: statsError } = useStats();
    const [activeTab, setActiveTab] = useState("forms");
    const [nbNonLus, setNbNonLus] = useState(0);
// Fonction pour récupérer le nombre de messages non lus
    const fetchUnread = async () => {
        if (!user?.id) return;
        try {
            const res = await fetch(
                `http://localhost:8080/api/messages/non-lus/chercheur/${user.id}`
            );
            if (!res.ok) return;
            const data = await res.json(); // data = nombre
            setNbNonLus(data);
        } catch (e) {
            console.error("Erreur récupération nb messages non lus", e);
        }
    };
// Rafraîchir le nombre de messages non lus lorsque l'authentification ou l'utilisateur change
    useEffect(() => {
        if (!isLoading && isAuthenticated && user?.role === 'chercheur') {
            fetchUnread();
        }
    }, [isLoading, isAuthenticated, user?.id, user?.role]);


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
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                    <StatCard 
                        label="Formulaires créés" 
                        value={stats.totalFormulaires} 
                        isLoading={statsLoading}
                        error={!!statsError}
                        icon="📋"
                    />
                    <StatCard 
                        label="Brouillons" 
                        value={stats.brouillons} 
                        valueColor="text-amber-600"
                        isLoading={statsLoading}
                        error={!!statsError}
                        icon="📝"
                    />
                    <StatCard 
                        label="Formulaires envoyés" 
                        value={stats.envoyes} 
                        valueColor="text-emerald-600"
                        isLoading={statsLoading}
                        error={!!statsError}
                        icon="✅"
                    />

                </div>

                {/* Tabs */}
                <div className="border-b border-gray-200 mb-6">
                    <nav className="flex space-x-6 overflow-x-auto">
                        <TabButton id="forms" activeTab={activeTab} setActiveTab={setActiveTab}>Mes Formulaires</TabButton>
                        <TabButton id="allforms" activeTab={activeTab} setActiveTab={setActiveTab}>Gestion des Formulaires</TabButton>
                        <TabButton id="data" activeTab={activeTab} setActiveTab={setActiveTab}>Données Collectées</TabButton>
                        <TabButton id="dictionary" activeTab={activeTab} setActiveTab={setActiveTab}>Dictionnaire de Données</TabButton>
                        <TabButton id="messages" activeTab={activeTab} setActiveTab={setActiveTab}>
                            Messagerie
                            {nbNonLus > 0 && (
                                <span className="ml-2 bg-blue-600 text-white rounded-full px-2 py-0.5 text-xs">
                                    {nbNonLus}
                                 </span>
                            )}
                        </TabButton>

                    </nav>
                </div>

                {/* Tab Content */}
                <div>
                    {activeTab === 'forms' && <FormsTab />}
                    {activeTab === 'allforms' && <AllFormsTab />}
                    {activeTab === 'data' && <DataTab />}
                    {activeTab === 'dictionary' && <DictionaryTab />}
                    {activeTab === 'messages' && <MessagesTab onMessagesRead={fetchUnread} />}

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

const OverviewTab = () => {
    const router = useRouter();
    const { stats, isLoading: statsLoading } = useStats();
    
    return (
        <div>
            <Card
                title="Activité récente"
                action={<button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm">Exporter le rapport</button>}
            >
                <ChartPlaceholder text="Graphique d'activité - Données collectées par jour" />
                <div className="mt-6">
                    <Table headers={["Date", "Événement", "Utilisateur", "Détails"]}>
                        {statsLoading ? (
                            <tr>
                                <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                                    <div className="animate-pulse">Chargement de l'activité...</div>
                                </td>
                            </tr>
                        ) : stats.activiteRecente.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-4 py-12 text-center">
                                    <div className="flex flex-col items-center gap-4">
                                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                                            <span className="text-2xl">📋</span>
                                        </div>
                                        <div>
                                            <p className="text-gray-600 mb-2">Aucune activité récente</p>
                                            <button 
                                                onClick={() => router.push('/formulaire/nouveau')}
                                                className="text-blue-600 hover:text-blue-800 font-medium"
                                            >
                                                Créez votre premier formulaire →
                                            </button>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            stats.activiteRecente.map((activity) => (
                                <tr key={activity.idActivite} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 text-sm">
                                        {new Date(activity.dateCreation).toLocaleDateString('fr-FR', {
                                            day: '2-digit',
                                            month: '2-digit',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </td>
                                    <td className="px-4 py-3 text-sm">{activity.action}</td>
                                    <td className="px-4 py-3 text-sm">{activity.utilisateur.nom}</td>
                                    <td className="px-4 py-3 text-sm">{activity.details}</td>
                                </tr>
                            ))
                        )}
                    </Table>
                </div>
            </Card>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChartPlaceholder text="Graphique circulaire - Statut des formulaires" />
                <ChartPlaceholder text="Graphique à barres - Patients par étude" />
            </div>
        </div>
    );
};

const FormsTab = () => {
    const router = useRouter();
    const { formulaires, isLoading: isLoadingForms } = useFormulaires();

    const getStatutColor = (statut: string) => {
        switch (statut.toLowerCase()) {
            case "publie":
                return "green";
            case "brouillon":
                return "yellow";
            default:
                return "blue";
        }
    };

    const getStatutLabel = (statut: string) => {
        switch (statut.toLowerCase()) {
            case "publie":
                return "Publié";
            case "brouillon":
                return "Brouillon";
            default:
                return statut;
        }
    };

    return (
        <div>
            <Card
                title="Formulaires crées"
                action={
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span>📊</span>
                        <span>{formulaires.length} formulaire{formulaires.length !== 1 ? 's' : ''}</span>
                    </div>
                }
            >
                <Table headers={["Nom du formulaire", "Étude", "Date création", "Statut"]}>
                    {isLoadingForms ? (
                        <tr>
                            <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                                <div className="animate-pulse">Chargement des formulaires...</div>
                            </td>
                        </tr>
                    ) : formulaires.length === 0 ? (
                        <tr>
                            <td colSpan={4} className="px-4 py-12 text-center">
                                <div className="flex flex-col items-center gap-4">
                                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                                        <span className="text-2xl">✨</span>
                                    </div>
                                    <div>
                                        <p className="text-gray-600 mb-2">Aucun formulaire créé</p>
                                        <button 
                                            onClick={() => router.push('/formulaire/nouveau')}
                                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                                        >
                                            Créer un formulaire
                                        </button>
                                    </div>
                                </div>
                            </td>
                        </tr>
                    ) : (
                        formulaires.slice(0, 5).map((formulaire: any) => (
                            <tr key={formulaire.idFormulaire} className="hover:bg-gray-50">
                                <td className="px-4 py-3 text-sm font-medium">{formulaire.titre}</td>
                                <td className="px-4 py-3 text-sm">{formulaire.etude?.titre || 'N/A'}</td>
                                <td className="px-4 py-3 text-sm">
                                    {new Date(formulaire.dateCreation).toLocaleDateString('fr-FR')}
                                </td>
                                <td className="px-4 py-3">
                                    <Badge color={getStatutColor(formulaire.statut)}>
                                        {getStatutLabel(formulaire.statut)}
                                    </Badge>
                                </td>
                                    {/* Colonne 'Actions' supprimée — gestion ailleurs */}
                            </tr>
                        ))
                    )}
                </Table>
                {formulaires.length > 5 && (
                    <div className="mt-4 text-center">
                        <button 
                            onClick={() => router.push('/formulaire')}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                            Voir tous les formulaires ({formulaires.length})
                        </button>
                    </div>
                )}
            </Card>


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


// Aperçu interactif d'un formulaire (preview)
const FormPreview: FC<{ champs: any[] }> = ({ champs }) => {
    if (!champs || champs.length === 0) return <p className="text-gray-500">Aucune question dans ce formulaire</p>;

    return (
        <form className="space-y-4">
            {champs.map((champ: any, idx: number) => (
                <div key={champ.idChamp ?? idx} className="p-3 border border-gray-200 rounded-lg">
                    <label className="block text-sm font-medium text-gray-800">
                        {idx + 1}. {champ.label}
                        {champ.obligatoire && <span className="text-red-600 ml-1">*</span>}
                    </label>

                    <div className="mt-2">
                        {(() => {
                            const type = (champ.type || '').toLowerCase();
                            switch (type) {
                                case 'texte':
                                    return (
                                        <input
                                            type="text"
                                            placeholder="Réponse"
                                            className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2"
                                        />
                                    );
                                case 'nombre':
                                    return (
                                        <input
                                            type="number"
                                            min={champ.valeurMin ?? undefined}
                                            max={champ.valeurMax ?? undefined}
                                            placeholder="Réponse numérique"
                                            className="mt-1 w-40 border border-gray-300 rounded-md px-3 py-2"
                                        />
                                    );
                                case 'date':
                                    return <input type="date" className="mt-1 border border-gray-300 rounded-md px-3 py-2" />;
                                case 'choix_multiple':
                                case 'choix_multiple_simple':
                                case 'choix':
                                    return (
                                        <div className="space-y-2">
                                            {((champ.listeValeur && champ.listeValeur.options) || champ.options || []).map((opt: any, oi: number) => (
                                                <label key={oi} className="flex items-center gap-2 text-sm">
                                                    <input type="checkbox" className="w-4 h-4" />
                                                    <span>{opt.libelle ?? opt.valeur ?? `Option ${oi + 1}`}</span>
                                                </label>
                                            ))}
                                        </div>
                                    );
                                case 'choix_unique':
                                case 'radio':
                                    return (
                                        <div className="space-y-2">
                                            {((champ.listeValeur && champ.listeValeur.options) || champ.options || []).map((opt: any, oi: number) => (
                                                <label key={oi} className="flex items-center gap-2 text-sm">
                                                    <input type="radio" name={`q_${champ.idChamp ?? idx}`} className="w-4 h-4" />
                                                    <span>{opt.libelle ?? opt.valeur ?? `Option ${oi + 1}`}</span>
                                                </label>
                                            ))}
                                        </div>
                                    );
                                default:
                                    return <div className="text-sm text-gray-600">Type: {champ.type ?? 'inconnu'}</div>;
                            }
                        })()}
                    </div>
                </div>
            ))}
        </form>
    );
};



const AllFormsTab = () => {
    const router = useRouter();
    const { formulaires, isLoading: isLoadingForms, error } = useFormulaires();
    const [expandedForm, setExpandedForm] = useState<number | null>(null);

    const getStatutColor = (statut: string) => {
        switch (statut.toLowerCase()) {
            case "publie":
            case "publié":
                return "green";
            case "brouillon":
                return "yellow";
            default:
                return "blue";
        }
    };

    const getStatutLabel = (statut: string) => {
        switch (statut.toLowerCase()) {
            case "publie":
            case "publié":
                return "Envoyé";
            case "brouillon":
                return "Brouillon";
            default:
                return statut;
        }
    };

    const getTypeChampLabel = (type: string) => {
        switch (type.toLowerCase()) {
            case "texte":
                return "📝 Texte";
            case "nombre":
                return "🔢 Nombre";
            case "date":
                return "📅 Date";
            case "choix_multiple":
                return "☑️ Choix Multiple";
            default:
                return type;
        }
    };

    return (
        <div className="space-y-6">
            <Card
                title="Tous mes formulaires"
                subtitle={`${formulaires.length} formulaire${formulaires.length !== 1 ? 's' : ''} au total`}
                action={
                    <button 
                        onClick={() => router.push('/formulaire/nouveau')}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2"
                    >
                        <span>+</span>
                        Nouveau formulaire
                    </button>
                }
            >
                {isLoadingForms ? (
                    <div className="text-center py-12">
                        <div className="animate-pulse">Chargement des formulaires...</div>
                    </div>
                ) : error ? (
                    <div className="text-center py-12">
                        <div className="text-red-600">❌ Erreur: {error}</div>
                        <button 
                            onClick={() => window.location.reload()}
                            className="mt-2 text-blue-600 hover:text-blue-800"
                        >
                            Recharger la page
                        </button>
                    </div>
                ) : formulaires.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-3xl">✨</span>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun formulaire créé</h3>
                        <p className="text-gray-600 mb-4">Commencez par créer votre premier formulaire</p>
                        <button 
                            onClick={() => router.push('/formulaire/nouveau')}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium"
                        >
                            Créer un formulaire
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {formulaires.map((formulaire: any) => (
                            <div key={formulaire.idFormulaire} className="border border-gray-200 rounded-lg overflow-hidden">
                                {/* En-tête du formulaire */}
                                <div 
                                    className="p-4 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                                    onClick={() => setExpandedForm(expandedForm === formulaire.idFormulaire ? null : formulaire.idFormulaire)}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-lg font-semibold text-gray-900">{formulaire.titre}</h3>
                                                <Badge color={getStatutColor(formulaire.statut)}>
                                                    {getStatutLabel(formulaire.statut)}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center gap-4 text-sm text-gray-600">
                                                <span>📚 {formulaire.etude?.titre || 'N/A'}</span>
                                                <span>📅 {new Date(formulaire.dateCreation).toLocaleDateString('fr-FR')}</span>
                                                <span>❓ {formulaire.champs?.length || 0} question{(formulaire.champs?.length || 0) !== 1 ? 's' : ''}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    router.push('/formulaire');
                                                }}
                                                className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-xs"
                                            >
                                                Modifier
                                            </button>
                                            <span className="text-gray-400">
                                                {expandedForm === formulaire.idFormulaire ? '▼' : '▶'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Contenu détaillé (questions) */}
                                {expandedForm === formulaire.idFormulaire && (
                                    <div className="p-4 bg-white border-t border-gray-200">
                                        {formulaire.description && (
                                            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                                                <p className="text-sm text-blue-800">{formulaire.description}</p>
                                            </div>
                                        )}
                                        
                                        <h4 className="font-semibold text-gray-900 mb-3">Questions du formulaire :</h4>

                                        {/* Rendu d'aperçu interactif des champs */}
                                        <div className="space-y-3">
                                            <FormPreview champs={formulaire.champs} />
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </Card>
        </div>
    );
};

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

const MessagesTab = ({ onMessagesRead }: { onMessagesRead?: () => void }) => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);

    const [medecins, setMedecins] = useState<any[]>([]);
    const [selectedMedecin, setSelectedMedecin] = useState<any | null>(null);

    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState("");

    const [unreadCounts, setUnreadCounts] = useState<Record<number, number>>({});

    // --- Helpers UI ---

    const formatTime = (dateStr: string) => {
        const d = new Date(dateStr);
        return d.toLocaleTimeString("fr-FR", {
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    const getInitials = (nom?: string, prenom?: string) => {
        const n = (nom || "").trim();
        const p = (prenom || "").trim();
        if (!n && !p) return "?";

        const first = p ? p[0] : "";
        const last = n ? n[0] : "";
        return (first + last).toUpperCase();
    };

    const getDateKey = (d: Date) =>
        d.toISOString().slice(0, 10); // yyyy-mm-dd

    const getDayLabel = (d: Date) => {
        const today = new Date();
        const yesterday = new Date();
        yesterday.setDate(today.getDate() - 1);

        const sameDay = (a: Date, b: Date) =>
            a.getFullYear() === b.getFullYear() &&
            a.getMonth() === b.getMonth() &&
            a.getDate() === b.getDate();

        if (sameDay(d, today)) return "Aujourd’hui";
        if (sameDay(d, yesterday)) return "Hier";

        return d.toLocaleDateString("fr-FR", {
            day: "2-digit",
            month: "long"
        });
    };

    const groupMessagesByDay = (msgs: any[]) => {
        const groups: { dateKey: string; label: string; items: any[] }[] = [];

        msgs.forEach((msg) => {
            const d = new Date(msg.dateEnvoi);
            const key = getDateKey(d);
            let group = groups.find((g) => g.dateKey === key);

            if (!group) {
                group = {
                    dateKey: key,
                    label: getDayLabel(d),
                    items: []
                };
                groups.push(group);
            }
            group.items.push(msg);
        });

        return groups;
    };

    if (!user) {
        return (
            <div className="flex items-center justify-center h-40 text-gray-500">
                Chargement de l'utilisateur…
            </div>
        );
    }

    // Charger les médecins
    useEffect(() => {
        const loadMedecins = async () => {
            try {
                const res = await fetch("http://localhost:8080/api/users/medecins");
                const data = await res.json();
                setMedecins(data);
            } catch (err) {
                console.error("Erreur lors du chargement des médecins", err);
            }
        };
        loadMedecins();
    }, []);

    // Charger le nombre de messages non lus pour chaque médecin
    useEffect(() => {
        if (!user || medecins.length === 0) return;

        const loadUnreadCounts = async () => {
            const counts: Record<number, number> = {};

            for (const m of medecins) {
                try {
                    const res = await fetch(
                        `http://localhost:8080/api/messages/nonlus/${user.id}/${m.id}`
                    );
                    if (!res.ok) continue;
                    counts[m.id] = await res.json();
                } catch (e) {
                    console.error("Erreur récupération non lus pour le médecin", m.id, e);
                }
            }

            setUnreadCounts(counts);
        };

        loadUnreadCounts();
    }, [medecins, user]);

    // Charger la conversation quand un médecin est sélectionné et marquer les messages comme lus
    useEffect(() => {
        if (!selectedMedecin || !user) return;

        const loadMessages = async () => {
            try {
                // charger la conversation
                const res = await fetch(
                    `http://localhost:8080/api/messages/conversation/${user.id}/${selectedMedecin.id}`
                );
                const data = await res.json();
                setMessages(data);

                // marquer comme lus côté backend (les messages destinés au chercheur)
                await fetch(
                    `http://localhost:8080/api/messages/conversation/lire/chercheur/${user.id}/${selectedMedecin.id}`,
                    { method: "PUT" }
                );

                // mettre le compteur de cette conversation à 0 côté front
                setUnreadCounts((prev) => ({
                    ...prev,
                    [selectedMedecin.id]: 0
                }));

                // rafraîchir le badge global dans l’onglet Messagerie
                if (onMessagesRead) {
                    onMessagesRead();
                }
            } catch (err) {
                console.error("Erreur chargement conversation", err);
            }
        };

        loadMessages();
    }, [selectedMedecin, user?.id, onMessagesRead]);

    // Envoyer un message
    const sendMessage = async () => {
        if (!newMessage.trim() || !user || !selectedMedecin) return;
        setLoading(true);

        try {
            await fetch("http://localhost:8080/api/messages/envoyer", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    emetteurId: user.id,
                    destinataireId: selectedMedecin.id,
                    contenu: newMessage
                })
            });

            setNewMessage("");

            // recharge la conversation
            const updated = await fetch(
                `http://localhost:8080/api/messages/conversation/${user.id}/${selectedMedecin.id}`
            );
            setMessages(await updated.json());
        } catch (err) {
            console.error("Erreur envoi message", err);
        }
        setLoading(false);
    };

    const grouped = groupMessagesByDay(messages);

    return (
        <div className="flex h-[70vh] border border-gray-200 rounded-lg overflow-hidden">
            {/* LISTE DES MÉDECINS */}
            <div className="w-1/3 bg-white border-r overflow-y-auto">
                <h3 className="p-4 font-semibold text-gray-700 border-b">Médecins</h3>

                {medecins.length === 0 && (
                    <p className="p-4 text-gray-500">Aucun médecin trouvé.</p>
                )}

                {medecins.map((m) => (
                    <div
                        key={m.id}
                        onClick={() => setSelectedMedecin(m)}
                        className={`relative p-4 cursor-pointer border-b hover:bg-blue-50 ${
                            selectedMedecin?.id === m.id ? "bg-blue-100" : ""
                        }`}
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-semibold">
                                {getInitials(m.nom, m.prenom)}
                            </div>
                            <div>
                                <p className="font-medium">
                                    {m.nom} {m.prenom}
                                </p>
                            </div>
                        </div>

                        {/* Badge NON LU */}
                        {unreadCounts[m.id] > 0 && (
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 bg-green-600 text-white text-xs px-2 py-1 rounded-full">
                                {unreadCounts[m.id]}
                            </span>
                        )}
                    </div>
                ))}
            </div>

            {/* DISCUSSION */}
            <div className="flex-1 flex flex-col bg-gray-50">
                {!selectedMedecin ? (
                    <div className="flex items-center justify-center h-full text-gray-500">
                        Sélectionnez un médecin
                    </div>
                ) : (
                    <>
                        {/* En-tête discussion */}
                        <div className="p-4 border-b bg-white flex items-center gap-3 font-semibold">
                            <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-semibold">
                                {getInitials(selectedMedecin.nom, selectedMedecin.prenom)}
                            </div>
                            <span>Discussion avec {selectedMedecin.nom}</span>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {grouped.map((group) => (
                                <div key={group.dateKey} className="space-y-2">
                                    {/* Séparateur de jour */}
                                    <div className="flex justify-center my-1">
                                        <span className="text-[11px] px-3 py-1 rounded-full bg-gray-200 text-gray-600">
                                            {group.label}
                                        </span>
                                    </div>

                                    {group.items.map((msg) => (
                                        <div
                                            key={msg.id}
                                            className={`flex flex-col max-w-xs ${
                                                msg.emetteur.id === user.id
                                                    ? "ml-auto items-end"
                                                    : "items-start"
                                            }`}
                                        >
                                            <div
                                                className={`p-3 rounded-lg ${
                                                    msg.emetteur.id === user.id
                                                        ? "bg-blue-600 text-white"
                                                        : "bg-white text-gray-800"
                                                }`}
                                            >
                                                {msg.contenu}
                                            </div>

                                            <span className="flex items-center gap-1 text-[11px] text-gray-500 mt-1">
                                                {formatTime(msg.dateEnvoi)}
                                                {/* coche "vu" seulement pour les messages envoyés par l'utilisateur */}
                                                {msg.emetteur.id === user.id && msg.lu && (
                                                    <span className="text-blue-500 text-xs">
                                                        ✓✓
                                                    </span>
                                                )}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>

                        {/* Zone de saisie */}
                        <div className="p-4 border-t bg-white flex gap-2">
                            <input
                                className="flex-1 border rounded-lg px-3 py-2"
                                placeholder="Votre message…"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                            />

                            <button
                                onClick={sendMessage}
                                disabled={loading}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-60"
                            >
                                Envoyer
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

