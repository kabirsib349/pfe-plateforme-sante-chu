"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/hooks/useAuth";
import { useFormulairesRecus } from "@/src/hooks/useFormulairesRecus";
import { useToast } from "@/src/hooks/useToast";
import { ToastContainer } from "@/src/components/ToastContainer";
import { DashboardLayout } from "@/src/components/layout/DashboardLayout";
import { StatCard } from "@/src/components/dashboard/StatCard";
import { FormulairesRecusTab } from "./components/FormulairesRecusTab";
import { InboxIcon, CheckCircleIcon } from "@heroicons/react/24/outline";

export default function DashboardMedecin() {
    const router = useRouter();
    const { isAuthenticated, user, isLoading, token } = useAuth();
    const { formulairesRecus, isLoading: isLoadingFormulaires, error: errorFormulaires, refreshFormulairesRecus } = useFormulairesRecus();
    const { showToast, toasts, removeToast } = useToast();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push("/login");
        }
    }, [isAuthenticated, isLoading, router]);

    if (isLoading) return <div className="flex items-center justify-center min-h-screen">Chargement...</div>;
    if (!isAuthenticated || user?.role !== 'medecin') return null;

    return (
        <DashboardLayout
            title="Tableau de Bord - Investigateur d'étude"
            roleLabel="Investigateur d'étude"
        >
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 mb-8">
                <StatCard 
                    label="Formulaires reçus" 
                    value={formulairesRecus.length} 
                    isLoading={isLoadingFormulaires}
                    icon={<InboxIcon className="w-6 h-6" />}
                />
                <StatCard 
                    label="Formulaires complétés" 
                    value={formulairesRecus.filter(f => f.complete).length}
                    valueColor="text-green-600"
                    isLoading={isLoadingFormulaires}
                    icon={<CheckCircleIcon className="w-6 h-6" />}
                />
            </div>

            {/* Contenu principal */}
            <FormulairesRecusTab 
                formulairesRecus={formulairesRecus} 
                isLoading={isLoadingFormulaires} 
                error={errorFormulaires} 
                token={token} 
                showToast={showToast} 
                refreshFormulairesRecus={refreshFormulairesRecus} 
            />

            <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
        </DashboardLayout>
    );
}
