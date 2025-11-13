"use client";

import { useEffect, useState, FC, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/hooks/useAuth";
import { useFormulairesRecus } from "@/src/hooks/useFormulairesRecus";
import { StatCard } from "@/src/components/dashboard/StatCard";
import { TabButton } from "@/src/components/dashboard/TabButton";
import { Badge } from "@/src/components/Badge";
import { Card } from "@/src/components/Card";
import {UserCircleIcon} from "@heroicons/react/24/outline";

export default function DashboardMedecin() {
    const router = useRouter();
    const { isAuthenticated, user, logout, isLoading } = useAuth();
    const { formulairesRecus, isLoading: isLoadingFormulaires, error: errorFormulaires } = useFormulairesRecus();
    const [activeTab, setActiveTab] = useState("formulaires-recus");

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
                                <span className="text-lg">🌱⚕️</span>
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
                        <span className="text-2xl">📊</span>
                    </div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-700 to-blue-700 bg-clip-text text-transparent">
                        Tableau de Bord - Investigateur d'étude
                    </h1>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatCard 
                        label="Formulaires reçus" 
                        value={formulairesRecus.length} 
                        isLoading={isLoadingFormulaires}
                        icon="📬"
                    />
                    <StatCard 
                        label="Non lus" 
                        value={formulairesRecus.filter(f => !f.lu).length}
                        valueColor="text-blue-600"
                        isLoading={isLoadingFormulaires}
                        icon="🆕"
                    />
                    <StatCard label="Patients assignés" value="24" icon="👥" />
                    <StatCard label="Feedback envoyés" value="5" icon="💬" />
                </div>

                {/* Tabs */}
                <div className="border-b border-gray-200 mb-6">
                    <nav className="flex space-x-6 overflow-x-auto">
                        <TabButton id="formulaires-recus" activeTab={activeTab} setActiveTab={setActiveTab}>
                            <span className="flex items-center gap-2">
                                📬 Formulaires Reçus
                                {formulairesRecus.filter(f => !f.lu).length > 0 && (
                                    <span className="bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                                        {formulairesRecus.filter(f => !f.lu).length}
                                    </span>
                                )}
                            </span>
                        </TabButton>
                        <TabButton id="patients" activeTab={activeTab} setActiveTab={setActiveTab}>Mes Patients</TabButton>
                        <TabButton id="forms" activeTab={activeTab} setActiveTab={setActiveTab}>Formulaires à Remplir</TabButton>
                        <TabButton id="feedback" activeTab={activeTab} setActiveTab={setActiveTab}>Feedback</TabButton>
                    </nav>
                </div>

                {/* Tab Content */}
                <div>
                    {activeTab === 'formulaires-recus' && <FormulairesRecusTab formulairesRecus={formulairesRecus} isLoading={isLoadingFormulaires} error={errorFormulaires} />}
                    {activeTab === 'patients' && <PatientsTab />}
                    {activeTab === 'forms' && <FormsTab />}
                    {activeTab === 'feedback' && <FeedbackTab />}
                </div>
            </main>
        </div>
    );
}

// --- Composants réutilisables ---



// --- Composants d'onglets ---

const FormulairesRecusTab: FC<{ formulairesRecus: any[]; isLoading: boolean; error?: string | null }> = ({ formulairesRecus, isLoading, error }) => {
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
                        <span className="text-3xl">⚠️</span>
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
                        <span className="text-3xl">📬</span>
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
                                        <span>📚</span>
                                        <span>{formulaireRecu.formulaire.etude?.titre || 'N/A'}</span>
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <span>👤</span>
                                        <span>Envoyé par {formulaireRecu.chercheur.nom}</span>
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <span>📅</span>
                                        <span>Reçu le {new Date(formulaireRecu.dateEnvoi).toLocaleDateString('fr-FR')}</span>
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <span>❓</span>
                                        <span>{formulaireRecu.formulaire.champs?.length || 0} question{(formulaireRecu.formulaire.champs?.length || 0) !== 1 ? 's' : ''}</span>
                                    </span>
                                </div>
                            </div>

                            <div className="flex flex-col gap-2 ml-4">
                                <button
                                    onClick={() => router.push(`/formulaire/remplir?id=${formulaireRecu.id}`)}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-2"
                                >
                                    <span>✏️</span>
                                    <span>Remplir le formulaire</span>
                                </button>
                                <button
                                    onClick={() => router.push(`/formulaire/apercu?id=${formulaireRecu.formulaire.idFormulaire}`)}
                                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-2"
                                >
                                    <span>👁️</span>
                                    <span>Aperçu</span>
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    );
};

const PatientsTab = () => (
    <Card
        title="Liste de mes patients"
        action={<input type="text" placeholder="Rechercher un patient..." className="px-3 py-1.5 border border-gray-300 rounded-md w-64" />}
    >
        <div className="divide-y divide-gray-200">
            <PatientItem
                id="P-2025-0012"
                inclusionDate="10/10/2025"
                lastFollowUp="15/10/2025"
                nextFollowUp="25/10/2025 (J+15) - EN RETARD"
                isUrgent={true}
            />
            <PatientItem
                id="P-2025-0015"
                inclusionDate="12/10/2025"
                lastFollowUp="17/10/2025"
                nextFollowUp="27/10/2025 (J+15)"
            />
            <PatientItem
                id="P-2025-0020"
                inclusionDate="18/10/2025"
                lastFollowUp="-"
                nextFollowUp="19/10/2025 (J+1)"
            />
            <PatientItem
                id="P-2025-0008"
                inclusionDate="05/10/2025"
                lastFollowUp="20/10/2025"
                status={<Badge color="green">Étude terminée</Badge>}
                isFinished={true}
            />
        </div>
    </Card>
);

const PatientItem: FC<{ id: string; inclusionDate: string; lastFollowUp: string; nextFollowUp?: string; status?: ReactNode; isUrgent?: boolean; isFinished?: boolean }> = ({ id, inclusionDate, lastFollowUp, nextFollowUp, status, isUrgent, isFinished }) => (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-4">
        <div>
            <h4 className="font-semibold text-gray-800">{id}</h4>
            <p className="text-sm text-gray-500 mt-1">Inclusion: {inclusionDate} • Dernier suivi: {lastFollowUp}</p>
            {nextFollowUp && <p className={`text-sm mt-1 ${isUrgent ? 'text-red-600 font-semibold' : 'text-gray-700'}`}>Prochain suivi: {nextFollowUp}</p>}
            {status && <div className="mt-1">{status}</div>}
        </div>
        <div className="flex space-x-2 mt-3 sm:mt-0">
            <button className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors">Voir historique</button>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors">
                {isFinished ? 'Rapport final' : 'Saisir données'}
            </button>
        </div>
    </div>
);

const FormsTab = () => (
    <div className="space-y-8">
        <Card
            title="Formulaires en attente"
            action={
                <select className="px-3 py-1.5 border border-gray-300 rounded-md">
                    <option>Tous les formulaires</option>
                    <option>En retard</option>
                    <option>À venir</option>
                </select>
            }
        >
            <div className="overflow-x-auto">
                <table className="min-w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Formulaire</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Échéance</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        <tr>
                            <td className="px-4 py-3 text-sm">P-2025-0012</td>
                            <td className="px-4 py-3 text-sm">Questionnaire J+15</td>
                            <td className="px-4 py-3 text-sm text-red-600 font-semibold">25/10/2025</td>
                            <td className="px-4 py-3"><Badge color="red">En retard</Badge></td>
                            <td className="px-4 py-3"><button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm">Remplir</button></td>
                        </tr>
                        <tr>
                            <td className="px-4 py-3 text-sm">P-2025-0020</td>
                            <td className="px-4 py-3 text-sm">Questionnaire initial</td>
                            <td className="px-4 py-3 text-sm">19/10/2025</td>
                            <td className="px-4 py-3"><Badge color="yellow">À faire</Badge></td>
                            <td className="px-4 py-3"><button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm">Remplir</button></td>
                        </tr>
                        <tr>
                            <td className="px-4 py-3 text-sm">P-2025-0015</td>
                            <td className="px-4 py-3 text-sm">Questionnaire J+15</td>
                            <td className="px-4 py-3 text-sm">27/10/2025</td>
                            <td className="px-4 py-3"><Badge color="blue">Planifié</Badge></td>
                            <td className="px-4 py-3"><button className="bg-gray-300 text-gray-500 px-3 py-1 rounded-md text-sm cursor-not-allowed" disabled>Remplir</button></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </Card>

        <Card title="Formulaires validés disponibles">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-semibold">Étude Cardio-Vasculaire 2025</h4>
                    <p className="text-sm text-gray-500 mt-1">Version: 2.1 • Validé le: 15/10/2025</p>
                    <button className="mt-3 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md text-sm">Voir le formulaire</button>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-semibold">Suivi Post-opératoire</h4>
                    <p className="text-sm text-gray-500 mt-1">Version: 1.0 • Validé le: 10/10/2025</p>
                    <button className="mt-3 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md text-sm">Voir le formulaire</button>
                </div>
            </div>
        </Card>
    </div>
);

const FeedbackTab = () => (
    <div className="space-y-8">
        <Card title="Nouveau feedback">
            <form className="space-y-4">
                <div>
                    <label htmlFor="feedback-form" className="block text-sm font-medium text-gray-700 mb-1">Formulaire concerné</label>
                    <select id="feedback-form" className="w-full px-3 py-2 border border-gray-300 rounded-md">
                        <option>Sélectionner un formulaire</option>
                        <option>Étude Cardio-Vasculaire 2025</option>
                        <option>Suivi Post-opératoire</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="feedback-type" className="block text-sm font-medium text-gray-700 mb-1">Type de problème</label>
                    <select id="feedback-type" className="w-full px-3 py-2 border border-gray-300 rounded-md">
                        <option>Sélectionner un type</option>
                        <option>Question manquante</option>
                        <option>Incohérence dans les questions</option>
                        <option>Problème de validation</option>
                        <option>Autre</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="feedback-message" className="block text-sm font-medium text-gray-700 mb-1">Description détaillée</label>
                    <textarea id="feedback-message" rows={4} placeholder="Décrivez précisément le problème rencontré..." className="w-full px-3 py-2 border border-gray-300 rounded-md"></textarea>
                </div>
                <div className="text-right">
                    <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium">Envoyer le feedback</button>
                </div>
            </form>
        </Card>

        <Card title="Historique des feedbacks">
            <div className="overflow-x-auto">
                <table className="min-w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Formulaire</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Réponse</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        <tr>
                            <td className="px-4 py-3 text-sm">17/10/2025</td>
                            <td className="px-4 py-3 text-sm">Étude Cardio-Vasculaire</td>
                            <td className="px-4 py-3 text-sm">Question manquante</td>
                            <td className="px-4 py-3"><Badge color="green">Traité</Badge></td>
                            <td className="px-4 py-3 text-sm">Question ajoutée dans v2.1</td>
                        </tr>
                        <tr>
                            <td className="px-4 py-3 text-sm">15/10/2025</td>
                            <td className="px-4 py-3 text-sm">Suivi Post-opératoire</td>
                            <td className="px-4 py-3 text-sm">Incohérence</td>
                            <td className="px-4 py-3"><Badge color="yellow">En cours</Badge></td>
                            <td className="px-4 py-3 text-sm">-</td>
                        </tr>
                        <tr>
                            <td className="px-4 py-3 text-sm">10/10/2025</td>
                            <td className="px-4 py-3 text-sm">Étude Cardio-Vasculaire</td>
                            <td className="px-4 py-3 text-sm">Problème de validation</td>
                            <td className="px-4 py-3"><Badge color="green">Traité</Badge></td>
                            <td className="px-4 py-3 text-sm">Corrigé dans v2.0</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </Card>
    </div>
);