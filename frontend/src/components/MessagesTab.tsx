"use client";

import { useState, useCallback } from "react";
import { useAuth } from "@/src/hooks/useAuth";
import { useMessages } from "@/src/hooks/useMessages";
import { useToast } from "@/src/hooks/useToast";
import { ContactList } from "./messaging/ContactList";
import { ChatWindow } from "./messaging/ChatWindow";
import { ToastContainer } from "./ToastContainer";

interface MessagesTabProps {
    onMessagesRead?: () => void;
    userType: "chercheur" | "medecin";
}

export const MessagesTab = ({ onMessagesRead, userType }: MessagesTabProps) => {
    const { user } = useAuth();
    const {
        contacts,
        selectedContact,
        messages,
        unreadCounts,
        loading,
        selectContact,
        sendMessage,
        deleteMessage
    } = useMessages(userType, onMessagesRead);

    const { toasts, showToast, removeToast } = useToast();
    const [newMessage, setNewMessage] = useState("");
    const [searchTerm, setSearchTerm] = useState("");

    const handleSendMessage = async () => {
        if (!newMessage.trim()) return;
        try {
            await sendMessage(newMessage);
            setNewMessage("");
        } catch (e) {
            showToast("Erreur lors de l'envoi du message", "error");
        }
    };

    const handleDeleteMessage = useCallback(async (messageId: number) => {
        try {
            await deleteMessage(messageId);
            showToast("Message supprimé", "success");
        } catch (e) {
            showToast("Erreur lors de la suppression", "error");
        }
    }, [deleteMessage, showToast]);

    if (!user) return <div className="p-12 text-center text-gray-500">Chargement...</div>;

    const contactLabel = userType === "chercheur" ? "Médecins" : "Chercheurs";

    return (
        <>
            <div className="flex h-[75vh] bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
                <ContactList
                    contacts={contacts}
                    selectedContact={selectedContact}
                    unreadCounts={unreadCounts}
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    onSelectContact={selectContact}
                    contactLabel={contactLabel}
                />

                <ChatWindow
                    selectedContact={selectedContact}
                    messages={messages}
                    currentUser={user || null}
                    loading={loading}
                    newMessage={newMessage}
                    onNewMessageChange={setNewMessage}
                    onSendMessage={handleSendMessage}
                    onDeleteMessage={handleDeleteMessage}
                />
            </div>
            <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
        </>
    );
};
