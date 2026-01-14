import { useRef, useEffect, useState } from "react";
import { User, Message } from "@/src/types";
import { getInitials, groupMessagesByDay, formatTime } from "@/src/utils/messaging";
import {
    PaperAirplaneIcon,
    ChatBubbleLeftRightIcon,
    TrashIcon
} from "@heroicons/react/24/outline";

interface ChatWindowProps {
    selectedContact: User | null;
    messages: Message[];
    currentUser: User | null;
    loading: boolean;
    newMessage: string;
    onNewMessageChange: (val: string) => void;
    onSendMessage: () => void;
    onDeleteMessage?: (messageId: number) => Promise<void>;
}

export const ChatWindow = ({
    selectedContact,
    messages,
    currentUser,
    loading,
    newMessage,
    onNewMessageChange,
    onSendMessage,
    onDeleteMessage
}: ChatWindowProps) => {

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    if (!selectedContact) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center h-full text-gray-400 bg-gradient-to-b from-blue-50/30 to-gray-50">
                <ChatBubbleLeftRightIcon className="w-20 h-20 mb-4 text-gray-300" />
                <p className="text-lg font-medium">Sélectionnez un contact</p>
                <p className="text-sm mt-1">pour commencer une conversation</p>
            </div>
        );
    }

    const grouped = groupMessagesByDay(messages);

    return (
        <div className="flex-1 flex flex-col bg-gradient-to-b from-blue-50/30 to-gray-50">
            {/* Header */}
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
                            <div className="flex items-center gap-3 my-4">
                                <div className="flex-1 h-px bg-gray-200"></div>
                                <span className="text-xs font-medium text-gray-500 bg-white px-3 py-1 rounded-full border border-gray-200">
                                    {group.label}
                                </span>
                                <div className="flex-1 h-px bg-gray-200"></div>
                            </div>
                            {group.items.map((msg) => {
                                const isMe = msg.emetteur.id === currentUser?.id;
                                const isDeleting = deletingId === msg.id;

                                const handleDelete = async () => {
                                    if (!onDeleteMessage) return;

                                    setDeletingId(msg.id);
                                    try {
                                        await onDeleteMessage(msg.id);
                                    } finally {
                                        setDeletingId(null);
                                    }
                                };

                                return (
                                    <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"} animate-fadeIn group`}>
                                        <div className={`relative max-w-[75%] px-4 py-3 rounded-2xl shadow-sm ${isMe
                                            ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-br-sm"
                                            : "bg-white border border-gray-200 rounded-bl-sm"
                                            } ${isDeleting ? "opacity-50" : ""}`}>
                                            <p className="text-sm leading-relaxed">{msg.contenu}</p>
                                            <p className={`text-xs mt-1.5 ${isMe ? "text-blue-100" : "text-gray-400"}`}>{formatTime(msg.dateEnvoi)}</p>

                                            {/* Bouton supprimer */}
                                            {isMe && onDeleteMessage && (
                                                <button
                                                    onClick={handleDelete}
                                                    disabled={isDeleting}
                                                    className="absolute -top-2 -right-2 p-1.5 rounded-full bg-white shadow-md border border-gray-200 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 disabled:cursor-not-allowed"
                                                    title="Supprimer ce message"
                                                >
                                                    <TrashIcon className={`w-4 h-4 ${isDeleting ? "text-gray-300" : "text-red-500"}`} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 bg-white border-t border-gray-200 shadow-lg">
                <div className="flex gap-3">
                    <input
                        type="text"
                        placeholder="Écrivez votre message..."
                        value={newMessage}
                        onChange={(e) => onNewMessageChange(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && onSendMessage()}
                        className="flex-1 border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        disabled={loading}
                    />
                    <button
                        onClick={onSendMessage}
                        disabled={loading || !newMessage.trim()}
                        className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg flex items-center gap-2 font-medium"
                    >
                        <PaperAirplaneIcon className="w-5 h-5" />
                        <span>Envoyer</span>
                    </button>
                </div>
            </div>
        </div>
    );
};
