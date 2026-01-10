"use client";

import { useEffect, useState, Suspense } from "react";
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
import { FormulaireRemplirButton } from "@/src/components/formulaire/FormulaireRemplirButton";
import { Formulaire, Champ } from "@/src/types";

export default function DashboardPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Chargement du tableau de bord...</div>}>
            <DashboardContent />
        </Suspense>
    );
}

function DashboardContent() {
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





const AllFormsTab = () => {
    const router = useRouter();
    const { formulaires, isLoading: isLoadingForms, error } = useFormulaires();
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
                        {formulaires.map((formulaire: Formulaire) => (
                            <div key={formulaire.idFormulaire} className="border border-gray-200 rounded-lg overflow-hidden">
                                {/* En-tête du formulaire */}
                                <div className="p-4 bg-white">
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
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Card>
        </div>
    );
};
