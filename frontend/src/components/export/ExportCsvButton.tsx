"use client";

import { ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import { useAuth } from "@/src/hooks/useAuth";

interface ExportCsvButtonProps {
    formulaireMedecinId: number;
    variant?: "button" | "icon";
}

export default function ExportCsvButton({
                                            formulaireMedecinId,
                                            variant = "button",
                                        }: ExportCsvButtonProps) {
    const { token } = useAuth();

    const handleExport = async () => {
        if (!token) {
            alert("Vous devez être connecté pour exporter.");
            return;
        }

        try {
            const response = await fetch(
                `http://localhost:8080/api/reponses/export/${formulaireMedecinId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );


            if (!response.ok) {
                const txt = await response.text();
                console.error("Réponse backend : ", txt);
                throw new Error("Erreur lors de l’export");
            }

            // Récupération du blob
            const blob = await response.blob();

            // Création du lien de téléchargement
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");

            a.href = url;
            a.download = `formulaire_${formulaireMedecinId}.csv`;
            document.body.appendChild(a);
            a.click();

            // Nettoyage
            a.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error(error);
            alert("Erreur lors de l’export CSV.");
        }
    };

    if (variant === "button") {
        return (
            <button
                onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
                <ArrowDownTrayIcon className="w-5 h-5 text-white" />
                Exporter
            </button>
        );
    }

    return (
        <button
            onClick={handleExport}
            className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 text-gray-600"
        >
            <ArrowDownTrayIcon className="w-5 h-5" />
        </button>
    );
}
