"use client";

import { useEffect, FC } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/hooks/useAuth";
import { useFormulairesRecus } from "@/src/hooks/useFormulairesRecus";
import { useToast } from "@/src/hooks/useToast";
import { ToastContainer } from "@/src/components/ToastContainer";
import { StatCard } from "@/src/components/dashboard/StatCard";
import { Badge } from "@/src/components/Badge";
import { Card } from "@/src/components/Card";
import { 
    UserCircleIcon, BeakerIcon, ChartBarIcon, InboxIcon, CheckCircleIcon,
    BookOpenIcon, PencilSquareIcon, EyeIcon, TrashIcon, ExclamationCircleIcon,
    CalendarDaysIcon, ClipboardDocumentListIcon, UserIcon
} from "@heroicons/react/24/outline";

export default function DashboardMedecin() {
    const router = useRouter();
    const { isAuthenticated, user, isLoading, token } = useAuth();
    const { formulairesRecus, isLoading: isLoadingFormulaires, error: errorFormulaires, refreshFormulairesRecus } = useFormulairesRecus();
    const { showToast, toasts, removeToast } = useToast();


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
            {/* Navigation */}
            <nav className="glass shadow-eco-lg sticky top-0 z-50 border-b border-white/20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-3">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-blue-500 rounded-xl flex items-center justify-center">
                                <BeakerIcon className="w-6 h-6 text-white" />
                            </div>
                            <div className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
                                MedDataCollect
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                                Investigateur d'étude
                            </span>
                            <span className="text-gray-900 font-medium">{user?.nom ?? 'Dr. Martin'}</span>
                             <button
                                   onClick={() => router.push('/parametres')}
                                    className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-600"
                                    title="Profil"
                                      >
                                    <UserCircleIcon className="w-6 h-6" />
                             </button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-eco">
                        <ChartBarIcon className="w-7 h-7 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-700 to-blue-700 bg-clip-text text-transparent">
                        Tableau de Bord - Investigateur d'étude
                    </h1>
                </div>

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
                <div>
                    <FormulairesRecusTab formulairesRecus={formulairesRecus} isLoading={isLoadingFormulaires} error={errorFormulaires} token={token} showToast={showToast} refreshFormulairesRecus={refreshFormulairesRecus} />
                </div>
            </main>
            <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
        </div>
    );
}

// --- Composants réutilisables ---



// --- Composants d'onglets ---

const FormulairesRecusTab: FC<{
    formulairesRecus: any[];
    isLoading: boolean;
    error?: string | null;
    token?: string | null;
    showToast: (message: string, type: 'success' | 'error' | 'info') => void;
    refreshFormulairesRecus: () => void;
}> = ({ formulairesRecus, isLoading, error, token, showToast, refreshFormulairesRecus }) => {
    const router = useRouter();

    if (isLoading) {
        return (
            <Card title="Formulaires reçus">
                <div className="text-center py-12">
                    <div className="animate-pulse">Chargement des formulaires...</div>
                </div>
            </Card>
        );
    }

    if (error) {
        return (
            <Card title="Formulaires reçus">
                <div className="text-center py-12">
                    <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <ExclamationCircleIcon className="w-10 h-10 text-red-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Erreur de chargement</h3>
                    <p className="text-red-600">{error}</p>
                </div>
            </Card>
        );
    }

    if (formulairesRecus.length === 0) {
        return (
            <Card title="Formulaires reçus">
                <div className="text-center py-12">
                    <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <InboxIcon className="w-10 h-10 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun formulaire reçu</h3>
                    <p className="text-gray-600">Les formulaires qui vous seront envoyés par les chercheurs apparaîtront ici.</p>
                </div>
            </Card>
        );
    }

    return (
        <Card
            title="Formulaires reçus"
            subtitle={`${formulairesRecus.length} formulaire${formulairesRecus.length !== 1 ? 's' : ''} à consulter`}
        >
            <div className="space-y-4">
                {formulairesRecus.map((formulaireRecu) => (
                    <div 
                        key={formulaireRecu.id} 
                        className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:bg-blue-50/30 transition-all"
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        {formulaireRecu.formulaire.titre}
                                    </h3>
                                    {!formulaireRecu.lu && <Badge color="blue">Nouveau</Badge>}
                                    {formulaireRecu.complete && <Badge color="green">Complété</Badge>}
                                </div>
                                
                                {formulaireRecu.formulaire.description && (
                                    <p className="text-sm text-gray-600 mb-3">
                                        {formulaireRecu.formulaire.description}
                                    </p>
                                )}

                                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                                    <span className="flex items-center gap-1">
                                        <BookOpenIcon className="w-4 h-4" />
                                        <span>{formulaireRecu.formulaire.etude?.titre || 'N/A'}</span>
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <UserIcon className="w-4 h-4" />
                                        <span>Envoyé par {formulaireRecu.chercheur.nom}</span>
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <CalendarDaysIcon className="w-4 h-4" />
                                        <span>Reçu le {new Date(formulaireRecu.dateEnvoi).toLocaleDateString('fr-FR')}</span>
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <ClipboardDocumentListIcon className="w-4 h-4" />
                                        <span>{formulaireRecu.formulaire.champs?.length || 0} question{(formulaireRecu.formulaire.champs?.length || 0) !== 1 ? 's' : ''}</span>
                                    </span>
                                </div>
                            </div>

                            <div className="flex flex-col gap-2 ml-4">
                                <button
                                    onClick={() => router.push(`/formulaire/remplir?id=${formulaireRecu.id}`)}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-2"
                                >
                                    <PencilSquareIcon className="w-5 h-5" />
                                    <span>Remplir le formulaire</span>
                                </button>
                                <button
                                    onClick={() => router.push(`/formulaire/apercu?id=${formulaireRecu.formulaire.idFormulaire}`)}
                                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-2"
                                >
                                    <EyeIcon className="w-5 h-5" />
                                    <span>Aperçu</span>
                                </button>
                                <button
                                    onClick={async () => {
                                        if (confirm('Voulez-vous supprimer ce formulaire de votre liste ?')) {
                                            try {
                                                const response = await fetch(`http://localhost:8080/api/formulaires/recus/${formulaireRecu.id}`, {
                                                    method: 'DELETE',
                                                    headers: {
                                                        'Authorization': `Bearer ${token}`,
                                                    },
                                                });
                                                if (response.ok) {
                                                    showToast('Formulaire supprimé de votre liste', 'success');
                                                    refreshFormulairesRecus();
                                                } else {
                                                    showToast('Erreur lors de la suppression', 'error');
                                                }
                                            } catch (error) {
                                                showToast('Erreur réseau', 'error');
                                            }
                                        }
                                    }}
                                    className="bg-red-50 hover:bg-red-100 text-red-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-2"
                                >
                                    <TrashIcon className="w-5 h-5" />
                                    <span>Supprimer</span>
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    );
};

