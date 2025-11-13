"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/hooks/useAuth";
import { useStats } from "@/src/hooks/useStats";
import { DashboardLayout } from "@/src/components/layout/DashboardLayout";
import { StatCard } from "@/src/components/dashboard/StatCard";
import { TabButton } from "@/src/components/dashboard/TabButton";
import { ChartBarIcon, DocumentTextIcon, PencilSquareIcon, PaperAirplaneIcon } from "@heroicons/react/24/outline";
import { FormsTab, DataTab, AllFormsTab } from "./components";
import { ErrorBoundary } from "@/src/components/ErrorBoundary";

export default function DashboardChercheur() {
    const router = useRouter();
    const { isAuthenticated, user, isLoading } = useAuth();
    const { stats, isLoading: statsLoading, error: statsError } = useStats();
    const [activeTab, setActiveTab] = useState("forms");
    
    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push("/login");
        }
        if (!isLoading && isAuthenticated && user?.role !== 'chercheur') {
            router.push("/dashboard-medecin");
        }
    }, [isAuthenticated, isLoading, user, router]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                Chargement...
            </div>
        );
    }
    
    if (!isAuthenticated || user?.role !== 'chercheur') {
        return null;
    }

    return (
        <ErrorBoundary>
            <DashboardLayout
                title="Tableau de Bord - Investigateur Coordinateur"
                roleLabel="Investigateur Coordinateur"
                icon={<ChartBarIcon className="w-7 h-7 text-white" />}
            >
                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-8">
                    <StatCard
                        label="Formulaires créés"
                        value={stats.totalFormulaires}
                        isLoading={statsLoading}
                        error={!!statsError}
                        icon={<DocumentTextIcon className="w-6 h-6" />}
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
                        icon={<PaperAirplaneIcon className="w-6 h-6" />}
                    />
                </div>

                {/* Tabs */}
                <div className="border-b border-gray-200 mb-6">
                    <nav className="flex space-x-6 overflow-x-auto">
                        <TabButton id="forms" activeTab={activeTab} setActiveTab={setActiveTab}>
                            Mes Formulaires
                        </TabButton>
                        <TabButton id="allforms" activeTab={activeTab} setActiveTab={setActiveTab}>
                            Gestion des Formulaires
                        </TabButton>
                        <TabButton id="data" activeTab={activeTab} setActiveTab={setActiveTab}>
                            Données Collectées
                        </TabButton>
                    </nav>
                </div>

                {/* Tab Content */}
                <div>
                    {activeTab === 'forms' && <FormsTab />}
                    {activeTab === 'allforms' && <AllFormsTab />}
                    {activeTab === 'data' && <DataTab />}
                </div>
            </DashboardLayout>
        </ErrorBoundary>
    );
}
