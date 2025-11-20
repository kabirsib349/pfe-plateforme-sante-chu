"use client";

import React from "react";
import { ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import { useAuth } from "@/src/hooks/useAuth";

type ExportCsvButtonProps = {
    formulaireMedecinId: string | number;
    variant?: "full" | "icon";
};

/**
 * @brief Bouton permettant de télécharger en CSV les réponses d'un formulaire médecin.
 * @date 20/11/2025
 */
const ExportCsvButton: React.FC<ExportCsvButtonProps> = ({
                                                             formulaireMedecinId,
                                                             variant = "full",
                                                         }) => {
    const { token } = useAuth();
    const [loading, setLoading] = React.useState(false);

    const handleClick = async () => {
        if (!token) {
            alert("Authentification requise pour exporter les données.");
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(
                `http://localhost:8080/api/export/formulaires-medecins/${formulaireMedecinId}/csv`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) {
                throw new Error("Erreur lors de l'export CSV");
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `formulaire_medecin_${formulaireMedecinId}.csv`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        } catch (e) {
            console.error(e);
            alert("L'export CSV a échoué.");
        } finally {
            setLoading(false);
        }
    };

    if (variant === "icon") {
        return (
            <button
                onClick={handleClick}
                disabled={loading}
                title="Exporter en CSV"
                className="inline-flex items-center justify-center rounded-full p-2 bg-white border border-gray-200 shadow-sm hover:shadow-md hover:bg-gray-50 disabled:opacity-60"
            >
                <ArrowDownTrayIcon className="w-5 h-5" />
            </button>
        );
    }

    // Variante complète (texte + icône)
    return (
        <button
            onClick={handleClick}
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-60"
        >
            <ArrowDownTrayIcon className="w-5 h-5" />
            <span>{loading ? "Export..." : "Exporter CSV"}</span>
        </button>
    );
};

export default ExportCsvButton;
