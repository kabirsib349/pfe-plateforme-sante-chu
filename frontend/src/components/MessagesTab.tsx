"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/src/hooks/useAuth";
import { getMedecins, getChercheurs, getConversation, sendMessage, marquerMessagesLusChercheur, marquerMessagesLusMedecin, countMessagesNonLus } from "@/src/lib/api";
import { 
    PaperAirplaneIcon, 
    UserCircleIcon, 
    ChatBubbleLeftRightIcon,
    MagnifyingGlassIcon 
} from "@heroicons/react/24/outline";

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
                    // L'API countMessagesNonLus attend (destinataireId, emetteurId)
                    // On compte les messages que le contact a envoyés à l'utilisateur actuel
                    const count = await countMessagesNonLus(token, user.id, contact.id);
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
        <div className="flex h-[75vh] bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
            {/* LISTE DES CONTACTS */}
            <div className="w-1/3 bg-gradient-to-b from-gray-50 to-white border-r border-gray-200 flex flex-col">
                {/* Header contacts */}
                <div className="p-4 bg-white border-b border-gray-200">
                    <div className="flex items-center gap-2 mb-3">
                        <ChatBubbleLeftRightIcon className="w-5 h-5 text-blue-600" />
                        <h3 className="font-semibold text-gray-800">{contactLabel}</h3>
                        <span className="ml-auto text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                            {contacts.length}
                        </span>
                    </div>
                    {/* Search bar */}
                    <div className="relative">
                        <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Rechercher..."
                            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                </div>

                {/* Liste des contacts */}
                <div className="flex-1 overflow-y-auto">
                    {contacts.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400 p-6">
                            <UserCircleIcon className="w-16 h-16 mb-3" />
                            <p className="text-sm text-center">Aucun contact disponible</p>
                        </div>
                    )}

                    {contacts.map((contact) => (
                        <div
                            key={contact.id}
                            onClick={() => setSelectedContact(contact)}
                            className={`relative p-4 cursor-pointer border-b border-gray-100 transition-all duration-200 ${
                                selectedContact?.id === contact.id 
                                    ? "bg-blue-50 border-l-4 border-l-blue-600" 
                                    : "hover:bg-gray-50"
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold shadow-md ${
                                    selectedContact?.id === contact.id
                                        ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white"
                                        : "bg-gradient-to-br from-gray-400 to-gray-500 text-white"
                                }`}>
                                    {getInitials(contact.nom)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-gray-800 truncate">{contact.nom}</p>
                                    <p className="text-xs text-gray-500">{contact.email}</p>
                                </div>
                            </div>

                            {unreadCounts[contact.id] > 0 && (
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs px-2.5 py-1 rounded-full font-bold shadow-md animate-pulse">
                                    {unreadCounts[contact.id]}
                                </span>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* DISCUSSION */}
            <div className="flex-1 flex flex-col bg-gradient-to-b from-blue-50/30 to-gray-50">
                {!selectedContact ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                        <ChatBubbleLeftRightIcon className="w-20 h-20 mb-4 text-gray-300" />
                        <p className="text-lg font-medium">Sélectionnez un contact</p>
                        <p className="text-sm mt-1">pour commencer une conversation</p>
                    </div>
                ) : (
                    <>
                        {/* Header conversation */}
                        <div className="p-4 bg-white border-b border-gray-200 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center text-sm font-bold shadow-md">
                                    {getInitials(selectedContact.nom)}
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-800">{selectedContact.nom}</p>
                                    <p className="text-xs text-gray-500">{selectedContact.email}</p>
                                </div>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-4">
                            {messages.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                    <ChatBubbleLeftRightIcon className="w-16 h-16 mb-3 text-gray-300" />
                                    <p className="text-sm">Aucun message pour le moment</p>
                                    <p className="text-xs mt-1">Envoyez le premier message !</p>
                                </div>
                            ) : (
                                grouped.map((group) => (
                                    <div key={group.dateKey} className="space-y-3">
                                        {/* Séparateur de date */}
                                        <div className="flex items-center gap-3 my-4">
                                            <div className="flex-1 h-px bg-gray-200"></div>
                                            <span className="text-xs font-medium text-gray-500 bg-white px-3 py-1 rounded-full border border-gray-200">
                                                {group.label}
                                            </span>
                                            <div className="flex-1 h-px bg-gray-200"></div>
                                        </div>

                                        {group.items.map((msg) => {
                                            const isMe = msg.emetteur.id === user.id;
                                            return (
                                                <div
                                                    key={msg.id}
                                                    className={`flex ${isMe ? "justify-end" : "justify-start"} animate-fadeIn`}
                                                >
                                                    <div
                                                        className={`max-w-[75%] px-4 py-3 rounded-2xl shadow-sm ${
                                                            isMe
                                                                ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-br-sm"
                                                                : "bg-white border border-gray-200 rounded-bl-sm"
                                                        }`}
                                                    >
                                                        <p className="text-sm leading-relaxed">{msg.contenu}</p>
                                                        <p
                                                            className={`text-xs mt-1.5 ${
                                                                isMe ? "text-blue-100" : "text-gray-400"
                                                            }`}
                                                        >
                                                            {formatTime(msg.dateEnvoi)}
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Input message */}
                        <div className="p-4 bg-white border-t border-gray-200 shadow-lg">
                            <div className="flex gap-3">
                                <input
                                    type="text"
                                    placeholder="Écrivez votre message..."
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
                                    className="flex-1 border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    disabled={loading}
                                />
                                <button
                                    onClick={handleSendMessage}
                                    disabled={loading || !newMessage.trim()}
                                    className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg flex items-center gap-2 font-medium"
                                >
                                    <PaperAirplaneIcon className="w-5 h-5" />
                                    <span>Envoyer</span>
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};
