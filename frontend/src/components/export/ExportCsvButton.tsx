"use client";

import { ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import { useAuth } from "@/src/hooks/useAuth";
import { useToast } from "@/src/hooks/useToast";
import { ToastContainer } from "@/src/components/ToastContainer";

interface ExportCsvButtonProps {
    formulaireMedecinId?: number;
    formulaireId?: number;
    variant?: "button" | "icon";
}

export default function ExportCsvButton({
    formulaireMedecinId,
    formulaireId,
    variant = "button",
}: ExportCsvButtonProps) {
    const { token } = useAuth();
    const { toasts, showToast, removeToast } = useToast();

    const handleExport = async () => {
        if (!token) {
            showToast("Vous devez être connecté pour exporter.", "error");
            return;
        }

        // Determine which endpoint to use
        let url: string;
        let filename: string;

        if (formulaireId) {
            // Use the new endpoint that aggregates all FormulaireMedecin for this formulaire
            url = `http://localhost:8080/api/reponses/export/formulaire/${formulaireId}`;
            filename = `formulaire_${formulaireId}_all.csv`;
        } else if (formulaireMedecinId) {
            // Use the existing endpoint for a specific FormulaireMedecin
            url = `http://localhost:8080/api/reponses/export/${formulaireMedecinId}`;
            filename = `formulaire_${formulaireMedecinId}.csv`;
        } else {
            showToast("ID manquant pour l'export.", "error");
            return;
        }

        try {
            const response = await fetch(url, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!response.ok) {
                const txt = await response.text();
                console.error("Réponse backend : ", txt);
                throw new Error("Erreur lors de l'export");
            }

            // Récupération du blob
            const blob = await response.blob();

            // Création du lien de téléchargement
            const blobUrl = window.URL.createObjectURL(blob);
            const a = document.createElement("a");

            a.href = blobUrl;
            a.download = filename;
            document.body.appendChild(a);
            a.click();

            // Nettoyage
            a.remove();
            window.URL.revokeObjectURL(blobUrl);

            showToast("Export réussi !", "success");
        } catch (error) {
            console.error(error);
            showToast("Erreur lors de l'export CSV.", "error");
        }
    };

    return (
        <>
            {variant === "button" ? (
                <button
                    onClick={handleExport}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                    <ArrowDownTrayIcon className="w-5 h-5 text-white" />
                    Exporter
                </button>
            ) : (
                <button
                    onClick={handleExport}
                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 text-gray-600"
                >
                    <ArrowDownTrayIcon className="w-5 h-5" />
                </button>
            )}
            <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
        </>
    );
}
