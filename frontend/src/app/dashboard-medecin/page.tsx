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
import { BrouillonsTab } from "./components/BrouillonsTab";

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
                {/* Statistiques personnelles */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    {/* Total reçus */}
                    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-blue-100 rounded-lg">
                                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Formulaires reçus</p>
                                <p className="text-2xl font-bold text-gray-900">{formulairesRecus.length}</p>
                            </div>
                        </div>
                    </div>

                    {/* Complétés */}
                    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-green-100 rounded-lg">
                                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Complétés</p>
                                <p className="text-2xl font-bold text-green-600">{formulairesRecus.filter(f => f.complete).length}</p>
                            </div>
                        </div>
                    </div>

                    {/* En cours / Brouillons */}
                    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-yellow-100 rounded-lg">
                                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">En cours</p>
                                <p className="text-2xl font-bold text-yellow-600">{formulairesRecus.filter(f => !f.complete).length}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="border-b border-gray-200 mb-6">
                    <nav className="flex space-x-6">
                        <TabButton id="formulaires" activeTab={activeTab} setActiveTab={setActiveTab}>Formulaires Reçus</TabButton>
                        <TabButton id="brouillons" activeTab={activeTab} setActiveTab={setActiveTab}>Brouillons en cours</TabButton>
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
                    {activeTab === 'brouillons' && (
                        <BrouillonsTab
                            formulairesRecus={formulairesRecus}
                            token={token}
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