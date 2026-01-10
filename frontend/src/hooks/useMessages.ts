import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/src/hooks/useAuth";
import {
    getMedecins,
    getChercheurs,
    getConversation,
    sendMessage as apiSendMessage,
    marquerMessagesLusChercheur,
    marquerMessagesLusMedecin,
    countMessagesNonLus
} from "@/src/lib/api";
import { User, Message } from "@/src/types";

export interface UseMessagesReturn {
    contacts: User[];
    selectedContact: User | null;
    messages: Message[];
    unreadCounts: Record<number, number>;
    loading: boolean;
    error: string | null;
    /**
     * Sélectionne un contact et charge la conversation.
     * Marque automatiquement les messages comme lus.
     */
    selectContact: (contact: User) => void;
    sendMessage: (content: string) => Promise<void>;
    refreshMessages: () => Promise<void>;
}

/**
 * Hook de gestion de la messagerie instantanée.
 * Centralise la récupération des contacts, des messages, et l'envoi.
 * Gère le polling automatique pour les nouveaux messages.
 * 
 * @param userType Type de l'utilisateur connecté ('chercheur' ou 'medecin')
 * @param onMessagesRead Callback optionnel appelé quand des messages sont marqués comme lus
 */
export const useMessages = (userType: "chercheur" | "medecin", onMessagesRead?: () => void): UseMessagesReturn => {
    const { user, token } = useAuth();
    const [contacts, setContacts] = useState<User[]>([]);
    const [selectedContact, setSelectedContact] = useState<User | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [unreadCounts, setUnreadCounts] = useState<Record<number, number>>({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Charger les contacts
    useEffect(() => {
        const loadContacts = async () => {
            if (!token) return;
            try {
                const data = userType === "chercheur"
                    ? await getMedecins(token)
                    : await getChercheurs(token);
                setContacts(data);
            } catch (err) {
                console.error("Erreur contacts", err);
                setError("Impossible de charger les contacts");
            }
        };
        loadContacts();
    }, [token, userType]);

    // -- POLLING --

    // Compter les non-lus
    useEffect(() => {
        if (!user?.id || !token || contacts.length === 0) return;
        const loadUnreadCounts = async () => {
            const counts: Record<number, number> = {};
            for (const contact of contacts) {
                try {
                    // Note: L'API countMessagesNonLus prend (destinataire, emetteur)
                    // On veut savoir combien de messages non lus ce contact nous a envoyé
                    const count = await countMessagesNonLus(token, user.id!, contact.id);
                    counts[contact.id] = count;
                } catch (e) {
                    console.error("Erreur count", e);
                }
            }
            setUnreadCounts(counts);
        };
        loadUnreadCounts();
    }, [contacts, user, token]);

    // -- API CALLS --

    /**
     * Charge la conversation entre l'utilisateur actuel et le contact sélectionné.
     * Marque les messages de cette conversation comme lus pour l'utilisateur actuel.
     */
    const loadMessages = useCallback(async () => {
        if (!selectedContact || !user?.id || !token) return;

        try {
            setLoading(true);
            const data = userType === "chercheur"
                ? await getConversation(token, user.id, selectedContact.id)
                : await getConversation(token, selectedContact.id, user.id);

            setMessages(data);

            // Marquer comme lu
            if (userType === "chercheur") {
                await marquerMessagesLusChercheur(token, user.id, selectedContact.id);
            } else {
                await marquerMessagesLusMedecin(token, selectedContact.id, user.id);
            }

            // Mise à jour locale du compteur
            setUnreadCounts(prev => ({ ...prev, [selectedContact.id]: 0 }));

            if (onMessagesRead) onMessagesRead();

        } catch (err) {
            console.error("Erreur conversation", err);
            setError("Erreur lors du chargement de la conversation");
        } finally {
            setLoading(false);
        }
    }, [selectedContact, user?.id, token, userType, onMessagesRead]);

    // Recharger quand le contact change
    useEffect(() => {
        if (selectedContact) {
            loadMessages();
        } else {
            setMessages([]);
        }
    }, [selectedContact, loadMessages]);

    const sendMessage = async (content: string) => {
        if (!content.trim() || !user?.id || !selectedContact || !token) return;

        try {
            await apiSendMessage(token, {
                emetteurId: user.id.toString(),
                destinataireId: selectedContact.id.toString(),
                contenu: content
            });
            await loadMessages(); // Recharger pour voir le message
        } catch (err) {
            console.error("Erreur envoi", err);
            throw err;
        }
    };

    return {
        contacts,
        selectedContact,
        messages,
        unreadCounts,
        loading,
        error,
        selectContact: setSelectedContact,
        sendMessage,
        refreshMessages: loadMessages
    };
};
