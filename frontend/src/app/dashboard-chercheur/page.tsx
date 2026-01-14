"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/src/hooks/useAuth";
import { useStats } from "@/src/hooks/useStats";
import { useUnreadMessages } from "@/src/hooks/useUnreadMessages";
import { StatCard } from "@/src/components/dashboard/StatCard";
import { TabButton } from "@/src/components/dashboard/TabButton";
import { MessagesTab } from "@/src/components/MessagesTab";
import { DataTab } from "./components/DataTab";
import { AllFormsTab } from "./components/AllFormsTab";
import {
    ClipboardDocumentListIcon,
    PencilSquareIcon,
    CheckCircleIcon,
} from "@heroicons/react/24/outline";

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
