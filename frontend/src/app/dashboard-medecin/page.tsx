"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/hooks/useAuth";
import { useFormulairesRecus } from "@/src/hooks/useFormulairesRecus";
import { useUnreadMessages } from "@/src/hooks/useUnreadMessages";
import { useToast } from "@/src/hooks/useToast";
import { TabButton } from "@/src/components/dashboard/TabButton";
import { MessagesTab } from "@/src/components/MessagesTab";
import { FormulairesRecusTab } from "./components/FormulairesRecusTab";

export default function DashboardMedecin() {
    const router = useRouter();
    const { isAuthenticated, user, isLoading, token } = useAuth();
    const { formulairesRecus, isLoading: isLoadingFormulaires, error: errorFormulaires, refreshFormulairesRecus } = useFormulairesRecus();
    const { unreadCount, refetch: refetchUnread } = useUnreadMessages({
        userId: user?.id,
        userRole: user?.role as 'chercheur' | 'medecin',
        isAuthenticated
    });
    const { showToast } = useToast();
    const [activeTab, setActiveTab] = useState("formulaires");

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push("/login");
        }
    }, [isAuthenticated, isLoading, user, router]);

    // Affichage pendant le chargement
    if (isLoading) return <div className="flex items-center justify-center min-h-screen">Chargement...</div>;

    // Protection de la route : si l'utilisateur n'est pas authentifié ou n'est pas un médecin, ne rien afficher (la redirection se fera via useEffect)
    if (!isAuthenticated) return null;
    if (user?.role !== 'medecin') return null;

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50/50 via-blue-50/30 to-indigo-50/50">
            <main className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Tabs */}
                <div className="border-b border-gray-200 mb-6">
                    <nav className="flex space-x-6">
                        <TabButton id="formulaires" activeTab={activeTab} setActiveTab={setActiveTab}>Formulaires Reçus</TabButton>
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
                    {activeTab === 'formulaires' && (
                        <FormulairesRecusTab
                            formulairesRecus={formulairesRecus}
                            isLoading={isLoadingFormulaires}
                            error={errorFormulaires}
                            token={token}
                            showToast={showToast}
                            refreshFormulairesRecus={refreshFormulairesRecus}
                        />
                    )}
                    {activeTab === 'messages' && (
                        <MessagesTab onMessagesRead={refetchUnread} userType="medecin" />
                    )}

                </div>
            </main>
        </div>
    );
}