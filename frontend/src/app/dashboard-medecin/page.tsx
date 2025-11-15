"use client";

import { useEffect, useState, FC, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { StatCard } from "@/src/components/dashboard/StatCard";
import { TabButton } from "@/src/components/dashboard/TabButton";
import { Badge } from "@/src/components/Badge";
import { Card } from "@/src/components/Card";

export default function DashboardMedecin() {
    const router = useRouter();
    const { isAuthenticated, user, logout, isLoading } = useAuth();
    const [activeTab, setActiveTab] = useState("patients");
    const [nbNonLus, setNbNonLus] = useState(0);

    const fetchUnread = async () => {
        if (!user?.id) return;

        try {
            const res = await fetch(
                `http://localhost:8080/api/messages/non-lus/medecin/${user.id}`
            );

            if (!res.ok) return;

            const data = await res.json();
            setNbNonLus(data);
        } catch (e) {
            console.error("Erreur récupération nb messages non lus", e);
        }
    };

    useEffect(() => {
        if (!isLoading && isAuthenticated && user?.role === "medecin") {
            fetchUnread();
        }
    }, [isLoading, isAuthenticated, user?.id, user?.role]);

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
                    <StatCard label="Patients assignés" value="24" />
                    <StatCard label="Formulaires à remplir" value="8" />
                    <StatCard label="En retard" value="3" valueColor="text-red-500" />
                    <StatCard label="Feedback envoyés" value="5" />
                </div>

                {/* Tabs */}
                <div className="border-b border-gray-200 mb-6">
                    <nav className="flex space-x-6">
                        <TabButton id="patients" activeTab={activeTab} setActiveTab={setActiveTab}>Mes Patients</TabButton>
                        <TabButton id="forms" activeTab={activeTab} setActiveTab={setActiveTab}>Formulaires à Remplir</TabButton>
                        <TabButton id="feedback" activeTab={activeTab} setActiveTab={setActiveTab}>Feedback</TabButton>
                        <TabButton id="messages" activeTab={activeTab} setActiveTab={setActiveTab}>
                            Messagerie
                            {nbNonLus > 0 && (
                                <span className="ml-2 bg-blue-600 text-white rounded-full px-2 py-0.5 text-xs">
                                    {nbNonLus}
                                </span>
                            )}
                        </TabButton>

                    </nav>
                </div>

                {/* Tab Content */}
                <div>
                    {activeTab === 'patients' && <PatientsTab />}
                    {activeTab === 'forms' && <FormsTab />}
                    {activeTab === 'feedback' && <FeedbackTab />}
                    {activeTab === 'messages' && (
                        <MessagesTabMedecin onMessagesRead={fetchUnread} />
                    )}

                </div>
            </main>
        </div>
    );
}







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

const MessagesTabMedecin = ({ onMessagesRead }: { onMessagesRead?: () => void }) => {
    type Chercheur = {
        id: number;
        nom: string;
        prenom: string;
        email: string;
        role: string;
    };

    const { user } = useAuth();

    const [chercheurs, setChercheurs] = useState<Chercheur[]>([]);
    const [selectedChercheur, setSelectedChercheur] = useState<Chercheur | null>(null);

    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState("");

    const [unreadCounts, setUnreadCounts] = useState<Record<number, number>>({});

    // --- Helpers UI ---

    const formatTime = (dateStr: string) => {
        const d = new Date(dateStr);
        return d.toLocaleTimeString("fr-FR", {
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    const getInitials = (nom?: string, prenom?: string) => {
        const n = (nom || "").trim();
        const p = (prenom || "").trim();
        if (!n && !p) return "?";

        const first = p ? p[0] : "";
        const last = n ? n[0] : "";
        return (first + last).toUpperCase();
    };

    const getDateKey = (d: Date) => d.toISOString().slice(0, 10);

    const getDayLabel = (d: Date) => {
        const today = new Date();
        const yesterday = new Date();
        yesterday.setDate(today.getDate() - 1);

        const sameDay = (a: Date, b: Date) =>
            a.getFullYear() === b.getFullYear() &&
            a.getMonth() === b.getMonth() &&
            a.getDate() === b.getDate();

        if (sameDay(d, today)) return "Aujourd’hui";
        if (sameDay(d, yesterday)) return "Hier";

        return d.toLocaleDateString("fr-FR", {
            day: "2-digit",
            month: "long"
        });
    };

    const groupMessagesByDay = (msgs: any[]) => {
        const groups: { dateKey: string; label: string; items: any[] }[] = [];

        msgs.forEach((msg) => {
            const d = new Date(msg.dateEnvoi);
            const key = getDateKey(d);
            let group = groups.find((g) => g.dateKey === key);

            if (!group) {
                group = {
                    dateKey: key,
                    label: getDayLabel(d),
                    items: []
                };
                groups.push(group);
            }
            group.items.push(msg);
        });

        return groups;
    };

    if (!user) return null;

    // Charger la liste des chercheurs
    useEffect(() => {
        const loadChercheurs = async () => {
            const res = await fetch("http://localhost:8080/api/users/chercheurs");
            if (!res.ok) return;
            setChercheurs(await res.json());
        };
        loadChercheurs();
    }, []);

    // Charger les non-lus pour chaque chercheur
    useEffect(() => {
        if (!user || chercheurs.length === 0) return;

        const loadUnread = async () => {
            const counts: Record<number, number> = {};

            for (const c of chercheurs) {
                const res = await fetch(
                    `http://localhost:8080/api/messages/nonlus/${user.id}/${c.id}`
                );
                counts[c.id] = await res.json();
            }

            setUnreadCounts(counts);
        };

        loadUnread();
    }, [chercheurs, user]);

    // Charger la conversation avec un chercheur & marquer comme lus
    useEffect(() => {
        if (!selectedChercheur || !user) return;

        const loadMessages = async () => {
            const res = await fetch(
                `http://localhost:8080/api/messages/conversation/${selectedChercheur.id}/${user.id}`
            );
            const data = await res.json();
            setMessages(data);

            // Marquer comme lus côté backend (messages destinés au médecin)
            await fetch(
                `http://localhost:8080/api/messages/conversation/lire/medecin/${selectedChercheur.id}/${user.id}`,
                { method: "PUT" }
            );

            // Reset badge pour ce chercheur
            setUnreadCounts((prev) => ({
                ...prev,
                [selectedChercheur.id]: 0
            }));

            // Rafraîchir le badge bleu dans l’onglet Messagerie
            if (onMessagesRead) onMessagesRead();
        };

        loadMessages();
    }, [selectedChercheur, user, user?.id]);

    // Envoyer un message
    const sendMessage = async () => {
        if (!newMessage.trim() || !selectedChercheur) return;

        await fetch("http://localhost:8080/api/messages/envoyer", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                emetteurId: user.id,
                destinataireId: selectedChercheur.id,
                contenu: newMessage
            })
        });

        setNewMessage("");

        // Recharger la conversation
        const res = await fetch(
            `http://localhost:8080/api/messages/conversation/${selectedChercheur.id}/${user.id}`
        );
        setMessages(await res.json());
    };

    const grouped = groupMessagesByDay(messages);

    return (
        <div className="flex h-[70vh] border border-gray-200 rounded-lg overflow-hidden">
            {/* Liste des Chercheurs */}
            <div className="w-1/3 bg-white border-r overflow-y-auto">
                <h3 className="p-4 font-semibold border-b text-gray-700">
                    Chercheurs
                </h3>

                {chercheurs.map((c) => (
                    <div
                        key={c.id}
                        onClick={() => setSelectedChercheur(c)}
                        className={`relative p-4 cursor-pointer border-b hover:bg-blue-50 ${
                            selectedChercheur?.id === c.id ? "bg-blue-100" : ""
                        }`}
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-semibold">
                                {getInitials(c.nom, c.prenom)}
                            </div>
                            <div>
                                <p className="font-medium">
                                    {c.nom} {c.prenom}
                                </p>
                            </div>
                        </div>

                        {/* Badge non-lu */}
                        {unreadCounts[c.id] > 0 && (
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 bg-green-600 text-white text-xs px-2 py-1 rounded-full">
                                {unreadCounts[c.id]}
                            </span>
                        )}
                    </div>
                ))}
            </div>

            {/* Discussion */}
            <div className="flex-1 flex flex-col bg-gray-50">
                {!selectedChercheur ? (
                    <div className="flex items-center justify-center h-full text-gray-500">
                        Sélectionnez un chercheur
                    </div>
                ) : (
                    <>
                        {/* En-tête */}
                        <div className="p-4 border-b bg-white flex items-center gap-3 font-semibold">
                            <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-semibold">
                                {getInitials(selectedChercheur.nom, selectedChercheur.prenom)}
                            </div>
                            <span>Discussion avec {selectedChercheur.nom}</span>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {grouped.map((group) => (
                                <div key={group.dateKey} className="space-y-2">
                                    {/* Séparateur de jour */}
                                    <div className="flex justify-center my-1">
                                        <span className="text-[11px] px-3 py-1 rounded-full bg-gray-200 text-gray-600">
                                            {group.label}
                                        </span>
                                    </div>

                                    {group.items.map((msg) => (
                                        <div
                                            key={msg.id}
                                            className={`flex flex-col max-w-xs ${
                                                msg.emetteur.id === user.id
                                                    ? "ml-auto items-end"
                                                    : "items-start"
                                            }`}
                                        >
                                            <div
                                                className={`p-3 rounded-lg ${
                                                    msg.emetteur.id === user.id
                                                        ? "bg-blue-600 text-white"
                                                        : "bg-white text-gray-800"
                                                }`}
                                            >
                                                {msg.contenu}
                                            </div>

                                            <span className="flex items-center gap-1 text-[11px] text-gray-500 mt-1">
                                                {formatTime(msg.dateEnvoi)}
                                                {/* double coche "vu" pour les messages envoyés par le médecin */}
                                                {msg.emetteur.id === user.id && msg.lu && (
                                                    <span className="text-blue-500 text-xs">
                                                        ✓✓
                                                    </span>
                                                )}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>

                        <div className="p-4 border-t bg-white flex gap-2">
                            <input
                                className="flex-1 border rounded-lg px-3 py-2"
                                placeholder="Votre message…"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                            />
                            <button
                                onClick={sendMessage}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                            >
                                Envoyer
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};


