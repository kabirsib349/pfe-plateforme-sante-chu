import { User } from "@/src/types";
import { getInitials } from "@/src/utils/messaging";
import {
    ChatBubbleLeftRightIcon,
    MagnifyingGlassIcon,
    UserCircleIcon
} from "@heroicons/react/24/outline";

interface ContactListProps {
    contacts: User[];
    selectedContact: User | null;
    unreadCounts: Record<number, number>;
    searchTerm: string;
    onSearchChange: (term: string) => void;
    onSelectContact: (contact: User) => void;
    contactLabel: string;
}

export const ContactList = ({
    contacts,
    selectedContact,
    unreadCounts,
    searchTerm,
    onSearchChange,
    onSelectContact,
    contactLabel
}: ContactListProps) => {

    const filteredContacts = contacts.filter((contact) => {
        if (!searchTerm.trim()) return true;
        const search = searchTerm.toLowerCase();
        return (
            contact.nom?.toLowerCase().includes(search) ||
            contact.email?.toLowerCase().includes(search)
        );
    });

    return (
        <div className="w-1/3 bg-gradient-to-b from-gray-50 to-white border-r border-gray-200 flex flex-col">
            <div className="p-4 bg-white border-b border-gray-200">
                <div className="flex items-center gap-2 mb-3">
                    <ChatBubbleLeftRightIcon className="w-5 h-5 text-blue-600" />
                    <h3 className="font-semibold text-gray-800">{contactLabel}</h3>
                    <span className="ml-auto text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                        {filteredContacts.length}/{contacts.length}
                    </span>
                </div>
                <div className="relative">
                    <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Rechercher..."
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto">
                {contacts.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400 p-6">
                        <UserCircleIcon className="w-16 h-16 mb-3" />
                        <p className="text-sm text-center">Aucun contact disponible</p>
                    </div>
                )}

                {filteredContacts.length === 0 && contacts.length > 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400 p-6">
                        <MagnifyingGlassIcon className="w-16 h-16 mb-3" />
                        <p className="text-sm text-center">Aucun contact trouvé</p>
                    </div>
                )}

                {filteredContacts.map((contact) => (
                    <div
                        key={contact.id}
                        onClick={() => onSelectContact(contact)}
                        className={`relative p-4 cursor-pointer border-b border-gray-100 transition-all duration-200 ${selectedContact?.id === contact.id
                            ? "bg-blue-50 border-l-4 border-l-blue-600"
                            : "hover:bg-gray-50"
                            }`}
                    >
                        <div className="flex items-center gap-3">
                            <div className={`w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold shadow-md ${selectedContact?.id === contact.id
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
    );
};
