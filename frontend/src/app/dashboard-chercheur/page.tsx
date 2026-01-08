"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/src/hooks/useAuth";
import { useStats } from "@/src/hooks/useStats";
import { useFormulaires } from "@/src/hooks/useFormulaires";
import { useUnreadMessages } from "@/src/hooks/useUnreadMessages";
import { StatCard } from "@/src/components/dashboard/StatCard";
import { TabButton } from "@/src/components/dashboard/TabButton";
import { Badge } from "@/src/components/Badge";
import { Card } from "@/src/components/Card";
import { MessagesTab } from "@/src/components/MessagesTab";
import { DataTab } from "./components/DataTab";
import {
    ClipboardDocumentListIcon,
    PencilSquareIcon,
    CheckCircleIcon,
    BookOpenIcon,
    CalendarDaysIcon,
    SparklesIcon,
    ExclamationCircleIcon
} from "@heroicons/react/24/outline";
import { FormulaireRemplirButton } from "@/src/components/formulaires/FormulaireRemplirButton";

export default function Dashboard() {
    const router = useRouter();
    const { isAuthenticated, user, isLoading } = useAuth();
    const { stats, isLoading: statsLoading, error: statsError } = useStats();
    const { unreadCount, refetch: refetchUnread } = useUnreadMessages({
        userId: user?.id,
        userRole: user?.role as 'chercheur' | 'medecin',
        isAuthenticated
    });
    const searchParams = useSearchParams();
    const [activeTab, setActiveTab] = useState(() => {
        try {
            const tab = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('tab') : null;
            return tab || 'allforms';
        } catch (e) {
            return 'allforms';
        }
    });


    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push("/login");
        }
        if (!isLoading && isAuthenticated && user?.role !== 'chercheur') {
            router.push("/dashboard-medecin");
        }
        try {
            const tab = searchParams.get('tab');
            if (tab) setActiveTab(tab);
        } catch (e) {
            // ignore
        }
    }, [isAuthenticated, isLoading, user, router, searchParams]);

    if (isLoading) return <div className="flex items-center justify-center min-h-screen">Chargement...</div>;
    if (!isAuthenticated) return null;
    if (user?.role !== 'chercheur') return null;

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50/50 via-blue-50/30 to-indigo-50/50">
            <main className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                    <StatCard
                        label="Formulaires créés"
                        value={stats.totalFormulaires}
                        isLoading={statsLoading}
                        error={!!statsError}
                        icon={<ClipboardDocumentListIcon className="w-6 h-6" />}
                    />
                    <StatCard
                        label="Brouillons"
                        value={stats.brouillons}
                        valueColor="text-amber-600"
                        isLoading={statsLoading}
                        error={!!statsError}
                        icon={<PencilSquareIcon className="w-6 h-6" />}
                    />
                    <StatCard
                        label="Formulaires envoyés"
                        value={stats.envoyes}
                        valueColor="text-emerald-600"
                        isLoading={statsLoading}
                        error={!!statsError}
                        icon={<CheckCircleIcon className="w-6 h-6" />}
                    />

                </div>

                {/* Tabs */}
                <div className="border-b border-gray-200 mb-6">
                    <nav className="flex space-x-6 overflow-x-auto">
                        <TabButton id="allforms" activeTab={activeTab} setActiveTab={setActiveTab}>Gestion des Formulaires</TabButton>
                        <TabButton id="data" activeTab={activeTab} setActiveTab={setActiveTab}>Données Collectées</TabButton>
                        <TabButton id="messages" activeTab={activeTab} setActiveTab={setActiveTab}>
                            <span className="flex items-center gap-2">
                                Messagerie
                                {unreadCount > 0 && (
                                    <span className="bg-gradient-to-r from-red-500 to-red-600 text-white rounded-full px-2.5 py-0.5 text-xs font-bold shadow-md animate-pulse">
                                        {unreadCount}
                                    </span>
                                )}
                            </span>
                        </TabButton>

                    </nav>
                </div>

                {/* Tab Content */}
                <div>
                    {activeTab === 'allforms' && <AllFormsTab />}
                    {activeTab === 'data' && <DataTab />}
                    {activeTab === 'messages' && <MessagesTab onMessagesRead={refetchUnread} userType="chercheur" />}

                </div>
            </main>
        </div>
    );
}

// --- Composants d'onglets ---

// Aperçu interactif d'un formulaire (preview)
const FormPreview: React.FC<{ champs: any[] }> = ({ champs }) => {
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
                                        <div>
                                            <input
                                                type="number"
                                                min={champ.valeurMin ?? undefined}
                                                max={champ.valeurMax ?? undefined}
                                                step="any"
                                                placeholder="Réponse numérique"
                                                className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2"
                                            />
                                            {((champ.valeurMin !== null && champ.valeurMin !== undefined) || (champ.valeurMax !== null && champ.valeurMax !== undefined) || champ.unite) && (
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {champ.valeurMin !== null && champ.valeurMin !== undefined && champ.valeurMax !== null && champ.valeurMax !== undefined
                                                        ? `Entre ${champ.valeurMin} et ${champ.valeurMax}`
                                                        : champ.valeurMin !== null && champ.valeurMin !== undefined
                                                            ? `Min: ${champ.valeurMin}`
                                                            : champ.valeurMax !== null && champ.valeurMax !== undefined
                                                                ? `Max: ${champ.valeurMax}`
                                                                : ''}
                                                    {champ.unite && ` (${champ.unite})`}
                                                </p>
                                            )}
                                        </div>
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
    const { user } = useAuth();

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

    return (
        <div className="space-y-6">
            <Card
                title="Tous mes formulaires"
                subtitle={`${formulaires.length} formulaire${formulaires.length !== 1 ? 's' : ''} au total`}
                action={
                    <button
                        onClick={() => router.push('/formulaire/nouveau')}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 font-medium"
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
                        <div className="text-red-600 flex items-center gap-2">
                            <ExclamationCircleIcon className="w-5 h-5" />
                            Erreur: {error}
                        </div>
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
                            <SparklesIcon className="w-10 h-10 text-blue-600" />
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
                                    onClick={(e: React.MouseEvent) => {
                                        // Si le clic provient d'un bouton ou d'un lien à l'intérieur, on ignore
                                        const target = e.target as HTMLElement;
                                        if (target.closest('button') || target.closest('a')) return;
                                        setExpandedForm(expandedForm === formulaire.idFormulaire ? null : formulaire.idFormulaire);
                                    }}
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
                                                <span className="flex items-center gap-1">
                                                    <BookOpenIcon className="w-4 h-4" />
                                                    {formulaire.etude?.titre || 'N/A'}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <CalendarDaysIcon className="w-4 h-4" />
                                                    {new Date(formulaire.dateCreation).toLocaleDateString('fr-FR')}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <ClipboardDocumentListIcon className="w-4 h-4" />
                                                    {formulaire.champs?.length || 0} question{(formulaire.champs?.length || 0) !== 1 ? 's' : ''}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {/* Bouton Remplir visible uniquement pour le chercheur */}
                                            {user?.role === 'chercheur' && (
                                                <FormulaireRemplirButton formulaireId={formulaire.idFormulaire} />
                                            )}

                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    router.push(`/formulaire/modifier/${formulaire.idFormulaire}`);
                                                }}
                                                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1"
                                            >
                                                <PencilSquareIcon className="w-4 h-4" />
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
