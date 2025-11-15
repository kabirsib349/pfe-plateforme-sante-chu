"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/src/hooks/useAuth";
import { getMedecins, getChercheurs, getConversation, sendMessage, marquerMessagesLusChercheur, marquerMessagesLusMedecin, countMessagesNonLus } from "@/src/lib/api";

interface MessagesTabProps {
    onMessagesRead?: () => void;
    userType: "chercheur" | "medecin";
}

export const MessagesTab = ({ onMessagesRead, userType }: MessagesTabProps) => {
    const { user, token } = useAuth();
    const [loading, setLoading] = useState(false);
    const [contacts, setContacts] = useState<any[]>([]);
    const [selectedContact, setSelectedContact] = useState<any | null>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [unreadCounts, setUnreadCounts] = useState<Record<number, number>>({});

    const formatTime = (dateStr: string) => {
        const d = new Date(dateStr);
        return d.toLocaleTimeString("fr-FR", {
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    const getInitials = (nom?: string) => {
        const n = (nom || "").trim();
        if (!n) return "?";
        
        const parts = n.split(" ");
        if (parts.length >= 2) {
            return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        }
        return n.substring(0, 2).toUpperCase();
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

        if (sameDay(d, today)) return "Aujourd'hui";
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

    if (!user || !token || !user.id) {
        return (
            <div className="flex items-center justify-center h-40 text-gray-500">
                Chargement...
            </div>
        );
    }

    // Charger les contacts (médecins ou chercheurs selon le type d'utilisateur)
    useEffect(() => {
        const loadContacts = async () => {
            if (!token) return;
            try {
                const data = userType === "chercheur" 
                    ? await getMedecins(token)
                    : await getChercheurs(token);
                setContacts(data);
            } catch (err) {
                console.error("Erreur lors du chargement des contacts", err);
            }
        };
        loadContacts();
    }, [token, userType]);

    // Charger le nombre de messages non lus pour chaque contact
    useEffect(() => {
        if (!user || !token || contacts.length === 0) return;

        const loadUnreadCounts = async () => {
            const counts: Record<number, number> = {};

            for (const contact of contacts) {
                try {
                    const count = userType === "chercheur"
                        ? await countMessagesNonLus(token, user.id, contact.id)
                        : await countMessagesNonLus(token, contact.id, user.id);
                    counts[contact.id] = count;
                } catch (e) {
                    console.error("Erreur récupération non lus", contact.id, e);
                }
            }

            setUnreadCounts(counts);
        };

        loadUnreadCounts();
    }, [contacts, user, token, userType]);

    // Charger la conversation
    useEffect(() => {
        if (!selectedContact || !user || !token) return;

        const loadMessages = async () => {
            try {
                const data = userType === "chercheur"
                    ? await getConversation(token, user.id, selectedContact.id)
                    : await getConversation(token, selectedContact.id, user.id);
                setMessages(data);

                // Marquer comme lus
                if (userType === "chercheur") {
                    await marquerMessagesLusChercheur(token, user.id, selectedContact.id);
                } else {
                    await marquerMessagesLusMedecin(token, selectedContact.id, user.id);
                }

                setUnreadCounts((prev) => ({
                    ...prev,
                    [selectedContact.id]: 0
                }));

                if (onMessagesRead) {
                    onMessagesRead();
                }
            } catch (err) {
                console.error("Erreur chargement conversation", err);
            }
        };

        loadMessages();
    }, [selectedContact, user?.id, token, userType, onMessagesRead]);

    // Envoyer un message
    const handleSendMessage = async () => {
        if (!newMessage.trim() || !user || !selectedContact || !token) return;
        setLoading(true);

        try {
            await sendMessage(token, {
                emetteurId: user.id.toString(),
                destinataireId: selectedContact.id.toString(),
                contenu: newMessage
            });

            setNewMessage("");

            // Recharger la conversation
            const data = userType === "chercheur"
                ? await getConversation(token, user.id, selectedContact.id)
                : await getConversation(token, selectedContact.id, user.id);
            setMessages(data);
        } catch (err) {
            console.error("Erreur envoi message", err);
        }
        setLoading(false);
    };

    const grouped = groupMessagesByDay(messages);
    const contactLabel = userType === "chercheur" ? "Médecins" : "Chercheurs";

    return (
        <div className="flex h-[70vh] border border-gray-200 rounded-lg overflow-hidden">
            {/* LISTE DES CONTACTS */}
            <div className="w-1/3 bg-white border-r overflow-y-auto">
                <h3 className="p-4 font-semibold text-gray-700 border-b">{contactLabel}</h3>

                {contacts.length === 0 && (
                    <p className="p-4 text-gray-500">Aucun contact trouvé.</p>
                )}

                {contacts.map((contact) => (
                    <div
                        key={contact.id}
                        onClick={() => setSelectedContact(contact)}
                        className={`relative p-4 cursor-pointer border-b hover:bg-blue-50 ${
                            selectedContact?.id === contact.id ? "bg-blue-100" : ""
                        }`}
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-semibold">
                                {getInitials(contact.nom)}
                            </div>
                            <div>
                                <p className="font-medium">{contact.nom}</p>
                            </div>
                        </div>

                        {unreadCounts[contact.id] > 0 && (
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 bg-green-600 text-white text-xs px-2 py-1 rounded-full">
                                {unreadCounts[contact.id]}
                            </span>
                        )}
                    </div>
                ))}
            </div>

            {/* DISCUSSION */}
            <div className="flex-1 flex flex-col bg-gray-50">
                {!selectedContact ? (
                    <div className="flex items-center justify-center h-full text-gray-500">
                        Sélectionnez un contact
                    </div>
                ) : (
                    <>
                        <div className="p-4 border-b bg-white flex items-center gap-3 font-semibold">
                            <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-semibold">
                                {getInitials(selectedContact.nom)}
                            </div>
                            <span>Discussion avec {selectedContact.nom}</span>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {grouped.map((group) => (
                                <div key={group.dateKey} className="space-y-2">
                                    <div className="text-center text-xs text-gray-500 my-2">
                                        {group.label}
                                    </div>

                                    {group.items.map((msg) => {
                                        const isMe = msg.emetteur.id === user.id;
                                        return (
                                            <div
                                                key={msg.id}
                                                className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                                            >
                                                <div
                                                    className={`max-w-[70%] px-4 py-2 rounded-lg ${
                                                        isMe
                                                            ? "bg-blue-600 text-white"
                                                            : "bg-white border border-gray-200"
                                                    }`}
                                                >
                                                    <p className="text-sm">{msg.contenu}</p>
                                                    <p
                                                        className={`text-xs mt-1 ${
                                                            isMe ? "text-blue-100" : "text-gray-500"
                                                        }`}
                                                    >
                                                        {formatTime(msg.dateEnvoi)}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ))}
                        </div>

                        <div className="p-4 bg-white border-t">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Écrivez votre message..."
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                                    className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    disabled={loading}
                                />
                                <button
                                    onClick={handleSendMessage}
                                    disabled={loading || !newMessage.trim()}
                                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Envoyer
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};
