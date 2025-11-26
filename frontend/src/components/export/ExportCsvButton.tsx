"use client";

import { ArrowDownTrayIcon } from "@heroicons/react/24/outline";

// 👉 Définition des types des props
interface ExportCsvButtonProps {
    formulaireMedecinId: number;
    variant?: "button" | "icon";
}

export default function ExportCsvButton({
                                            formulaireMedecinId,
                                            variant = "button",
                                        }: ExportCsvButtonProps) {

    const handleExport = () => {
        window.location.href = `http://localhost:8080/api/export/formulaire-medecin/${formulaireMedecinId}/csv`;
    };

    // 👉 Style RECTANGLE BLEU
    if (variant === "button") {
        return (
            <button
                onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
                <ArrowDownTrayIcon className="w-5 h-5 text-white" />
                Exporter CSV
            </button>
        );
    }

    // 👉 Style icône simple
    return (
        <button
            onClick={handleExport}
            className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 text-gray-600"
        >
            <ArrowDownTrayIcon className="w-5 h-5" />
        </button>
    );
}
