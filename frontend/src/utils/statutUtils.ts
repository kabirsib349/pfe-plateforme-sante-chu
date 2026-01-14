import React from 'react';
import { CheckCircleIcon, ClockIcon, DocumentIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';

/**
 * Utilities for handling form and study status styling and labels.
 * Centralizes logic previously duplicated across dashboard-chercheur/page.tsx and formulaire/page.tsx
 */

/**
 * Returns the Tailwind CSS classes for a status badge.
 * @param statut - The status string (e.g., "publie", "brouillon", "envoye")
 * @returns Tailwind CSS class string
 */
export const getStatutColor = (statut: string): string => {
    const normalized = statut.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    
    switch (normalized) {
        case "envoye":
        case "publie":
            return "bg-emerald-50 text-emerald-700 border border-emerald-200";
        case "en_attente":
            return "bg-amber-50 text-amber-700 border border-amber-200";
        case "brouillon":
            return "bg-slate-50 text-slate-700 border border-slate-200";
        default:
            return "bg-blue-50 text-blue-700 border border-blue-200";
    }
};

/**
 * Returns a simple color name for Badge component.
 * @param statut - The status string
 * @returns Color name string ("green", "yellow", "blue")
 */
export const getStatutBadgeColor = (statut: string): "green" | "yellow" | "blue" => {
    const normalized = statut.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    
    switch (normalized) {
        case "publie":
        case "envoye":
            return "green";
        case "brouillon":
            return "yellow";
        default:
            return "blue";
    }
};

/**
 * Returns a user-friendly label for a status.
 * @param statut - The status string
 * @returns Human-readable label
 */
export const getStatutLabel = (statut: string): string => {
    const normalized = statut.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    
    switch (normalized) {
        case "publie":
        case "envoye":
            return "Envoyé";
        case "brouillon":
            return "Brouillon";
        case "en_attente":
            return "En attente";
        default:
            return statut;
    }
};

/**
 * Returns the appropriate icon component for a status.
 * @param statut - The status string
 * @returns React element (icon component)
 */
export const getStatutIcon = (statut: string): React.ReactElement => {
    const normalized = statut.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    
    switch (normalized) {
        case "envoye":
        case "publie":
            return React.createElement(CheckCircleIcon, { className: "w-5 h-5 text-emerald-600" });
        case "en_attente":
            return React.createElement(ClockIcon, { className: "w-5 h-5 text-amber-600" });
        case "brouillon":
            return React.createElement(DocumentIcon, { className: "w-5 h-5 text-slate-600" });
        default:
            return React.createElement(ExclamationCircleIcon, { className: "w-5 h-5 text-blue-600" });
    }
};

/**
 * Returns color classes based on study title keywords.
 * @param etudeTitre - The study title
 * @returns Tailwind CSS class string
 */
export const getEtudeColor = (etudeTitre: string): string => {
    if (!etudeTitre) return "bg-gray-50 text-gray-700 border border-gray-200";
    
    const t = etudeTitre.toLowerCase();
    
    if (t.includes('cardio')) return "bg-rose-50 text-rose-700 border border-rose-200";
    if (t.includes('chirurg')) return "bg-indigo-50 text-indigo-700 border border-indigo-200";
    if (t.includes('endocrin')) return "bg-cyan-50 text-cyan-700 border border-cyan-200";
    if (t.includes('urgence')) return "bg-orange-50 text-orange-700 border border-orange-200";
    
    return "bg-gray-50 text-gray-700 border border-gray-200";
};
