import { Message } from "@/src/types";

export const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
};

export const getInitials = (nom?: string) => {
    const n = (nom || "").trim();
    if (!n) return "?";
    const parts = n.split(" ");
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return n.substring(0, 2).toUpperCase();
};

export const getDateKey = (d: Date) => d.toISOString().slice(0, 10);

export const getDayLabel = (d: Date) => {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    const sameDay = (a: Date, b: Date) =>
        a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate();
    if (sameDay(d, today)) return "Aujourd'hui";
    if (sameDay(d, yesterday)) return "Hier";
    return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "long" });
};

export const groupMessagesByDay = (msgs: Message[]) => {
    const groups: { dateKey: string; label: string; items: Message[] }[] = [];
    msgs.forEach((msg) => {
        const d = new Date(msg.dateEnvoi);
        const key = getDateKey(d);
        let group = groups.find((g) => g.dateKey === key);
        if (!group) {
            group = { dateKey: key, label: getDayLabel(d), items: [] };
            groups.push(group);
        }
        group.items.push(msg);
    });
    return groups;
};
