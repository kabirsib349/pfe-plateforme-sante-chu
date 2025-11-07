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
import { UserCircleIcon, ArrowLeftIcon, EyeIcon, ClipboardDocumentListIcon, UserGroupIcon, CalendarDaysIcon, CheckCircleIcon, ClockIcon, DocumentIcon, ExclamationCircleIcon, UserIcon, XMarkIcon, PlusIcon, MagnifyingGlassIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline"; // Import de l'icône UserCircleIcon et autres icônes utilisées
// note: using `useRouter` from next/navigation; no default router import

export default function Dashboard() {
    const router = useRouter();
    const { isAuthenticated, user, logout, isLoading } = useAuth();
    const { stats, isLoading: statsLoading, error: statsError } = useStats();
    const [activeTab, setActiveTab] = useState("forms");
    
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
                                onClick={() => router.push('/parametres')}
                                className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-600"
                                title="Profil"
                            >
                                <UserCircleIcon className="w-6 h-6" />
                            </button>
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
                    </nav>
                </div>

                {/* Tab Content */}
                <div>
                    {activeTab === 'forms' && <FormsTab />}
                    {activeTab === 'allforms' && <AllFormsTab />}
                    {activeTab === 'data' && <DataTab />}
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
        <div className="space-y-6">
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
