"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { PlusIcon, MagnifyingGlassIcon, PencilIcon, TrashIcon, EyeIcon, ClipboardDocumentListIcon, UserGroupIcon, CalendarDaysIcon, CheckCircleIcon, ClockIcon, DocumentIcon, ExclamationCircleIcon, UserIcon } from "@heroicons/react/24/outline";
import { TYPES_ETUDES } from "@/src/constants/etudes";

interface Formulaire {
    id: number;
    nom: string;
    etude: string;
    statut: string;
    dateCreation: string;
    nombreChamps: number;
    createurNom: string;
}

export default function Formulaire() {
    const router = useRouter();
    const [search, setSearch] = useState("");
    const [typeFilter, setTypeFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("");

    // Données d'exemple
    const [formulaires, setFormulaires] = useState<Formulaire[]>([
        {
            id: 1,
            nom: "Protocole Évaluation Cardiovasculaire",
            etude: "Cardio-Vasculaire",
            statut: "validé",
            dateCreation: "2025-10-15",
            nombreChamps: 12,
            createurNom: "Dr. Marie Dubois"
        },
        {
            id: 2,
            nom: "Suivi Post-Opératoire Standard",
            etude: "Chirurgie",
            statut: "En attente",
            dateCreation: "2025-10-14",
            nombreChamps: 8,
            createurNom: "Dr. Pierre Martin"
        },
        {
            id: 3,
            nom: "Questionnaire Suivi Diabète",
            etude: "Endocrinologie",
            statut: "Brouillon",
            dateCreation: "2025-10-13",
            nombreChamps: 15,
            createurNom: "Dr. Sophie Leroy"
        },
        {
            id: 4,
            nom: "Protocole Urgence Cardiaque",
            etude: "Urgences",
            statut: "validé",
            dateCreation: "2025-10-12",
            nombreChamps: 20,
            createurNom: "Dr. Jean Moreau"
        }
    ]);

    // Filtrage des formulaires
    const filteredFormulaires = formulaires.filter((formulaire) => {
        const matchesSearch = search === "" ||
            formulaire.nom.toLowerCase().includes(search.toLowerCase()) ||
            formulaire.etude.toLowerCase().includes(search.toLowerCase());
        const matchesType = typeFilter === "" || formulaire.etude === typeFilter;
        const matchesStatus = statusFilter === "" || formulaire.statut === statusFilter;
        return matchesSearch && matchesType && matchesStatus;
    });

    // Fonctions d'action
    const handleView = (id: number) => {
        router.push(`/formulaire/apercu?id=${id}`);
    };

    const handleEdit = (id: number) => {
        alert(`Modifier le formulaire ${id}`);
    };

    const handleDelete = (id: number) => {
        if (confirm("Êtes-vous sûr de vouloir supprimer ce formulaire ?")) {
            setFormulaires(formulaires.filter(f => f.id !== id));
        }
    };

    const getStatutColor = (statut: string) => {
        switch (statut) {
            case "validé":
                return "bg-emerald-50 text-emerald-700 border border-emerald-200";
            case "En attente":
                return "bg-amber-50 text-amber-700 border border-amber-200";
            case "Brouillon":
                return "bg-slate-50 text-slate-700 border border-slate-200";
            default:
                return "bg-blue-50 text-blue-700 border border-blue-200";
        }
    };

    const getEtudeColor = (etude: string) => {
        switch (etude) {
            case "Cardio-Vasculaire":
                return "bg-rose-50 text-rose-700 border border-rose-200";
            case "Chirurgie":
                return "bg-indigo-50 text-indigo-700 border border-indigo-200";
            case "Endocrinologie":
                return "bg-cyan-50 text-cyan-700 border border-cyan-200";
            case "Urgences":
                return "bg-orange-50 text-orange-700 border border-orange-200";
            default:
                return "bg-gray-50 text-gray-700 border border-gray-200";
        }
    };

    const getStatutIcon = (statut: string) => {
        switch (statut) {
            case "validé":
                return <CheckCircleIcon className="w-5 h-5 text-emerald-600" />;
            case "En attente":
                return <ClockIcon className="w-5 h-5 text-amber-600" />;
            case "Brouillon":
                return <DocumentIcon className="w-5 h-5 text-slate-600" />;
            default:
                return <ExclamationCircleIcon className="w-5 h-5 text-blue-600" />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Header professionnel */}
            <div className="bg-gray-200 shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-6 py-8">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <ClipboardDocumentListIcon className="w-6 h-6 text-blue-600" />
                                </div>
                                <h1 className="text-2xl font-bold text-gray-900">Mes Formulaires</h1>
                            </div>
                            <p className="text-sm text-gray-600 max-w-2xl">
                                Gérez vos protocoles et formulaires d'évaluation médicale. Créez, modifiez et suivez l'état de vos documents cliniques.
                            </p>
                        </div>
                        {/* Stats rapides */}
                        <div className="flex gap-4">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-gray-900">{formulaires.length}</div>
                                <div className="text-xs text-gray-500">Total</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-emerald-600">
                                    {formulaires.filter(f => f.statut === "validé").length}
                                </div>
                                <div className="text-xs text-gray-500">Validés</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-amber-600">
                                    {formulaires.filter(f => f.statut === "En attente").length}
                                </div>
                                <div className="text-xs text-gray-500">En attente</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Barre d'outils */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
                    <div className="flex flex-col lg:flex-row gap-4">
                        <div className="relative flex-1">
                            <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Rechercher par nom ou étude..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                            />
                        </div>
                        <select
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 min-w-[200px]"
                        >
                            <option value="">Toutes les études</option>
                            {TYPES_ETUDES.map(etude => (
                                <option key={etude.value} value={etude.value}>
                                    {etude.label}
                                </option>
                            ))}
                        </select>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 min-w-[160px]"
                        >
                            <option value="">Tous les statuts</option>
                            <option value="validé">Validé</option>
                            <option value="En attente">En attente</option>
                            <option value="Brouillon">Brouillon</option>
                        </select>
                        <button
                            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium shadow-sm hover:shadow-md"
                            onClick={() => router.push('/formulaire/nouveau')}
                            title="Créer un nouveau formulaire"
                        >
                            <PlusIcon className="w-5 h-5" />
                            Nouveau formulaire
                        </button>
                    </div>
                </div>

                {/* Liste des formulaires */}
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredFormulaires.map((formulaire) => (
                        <div
                            key={formulaire.id}
                            className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 overflow-hidden"
                        >
                            {/* Header de la carte */}
                            <div className="p-6 border-b border-gray-100">
                                <div className="flex items-start justify-between mb-3">
                                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                                        {formulaire.nom}
                                    </h3>
                                    <span className="text-lg">{getStatutIcon(formulaire.statut)}</span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    <span className={`px-3 py-1 rounded-lg text-xs font-medium ${getEtudeColor(formulaire.etude)}`}>
                                        {formulaire.etude}
                                    </span>
                                    <span className={`px-3 py-1 rounded-lg text-xs font-medium ${getStatutColor(formulaire.statut)}`}>
                                        {formulaire.statut}
                                    </span>
                                </div>
                            </div>

                            {/* Corps de la carte */}
                            <div className="p-6">
                                <div className="space-y-3 mb-6">
                                    <div className="flex items-center gap-3 text-sm text-gray-600">
                                        <UserIcon className="w-4 h-4" />
                                        <span>Créé par {formulaire.createurNom}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-gray-600">
                                        <CalendarDaysIcon className="w-4 h-4" />
                                        <span>Créé le {new Date(formulaire.dateCreation).toLocaleDateString('fr-FR')}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-gray-600">
                                        <UserGroupIcon className="w-4 h-4" />
                                        <span>{formulaire.nombreChamps} champs de données</span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleView(formulaire.id)}
                                        className="flex-1 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 hover:scale-105 hover:shadow-sm active:scale-95 transition-all duration-200 text-sm font-medium flex items-center justify-center gap-1 cursor-pointer"
                                        title="Aperçu du formulaire"
                                    >
                                        <EyeIcon className="w-4 h-4" />
                                        Aperçu
                                    </button>
                                    <button
                                        onClick={() => handleEdit(formulaire.id)}
                                        className="flex-1 px-3 py-2 bg-amber-50 text-amber-700 rounded-lg hover:bg-amber-100 hover:scale-105 hover:shadow-sm active:scale-95 transition-all duration-200 text-sm font-medium flex items-center justify-center gap-1 cursor-pointer"
                                        title="Modifier le formulaire"
                                    >
                                        <PencilIcon className="w-4 h-4" />
                                        Modifier
                                    </button>
                                    <button
                                        onClick={() => handleDelete(formulaire.id)}
                                        className="px-3 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 hover:scale-105 hover:shadow-sm active:scale-95 transition-all duration-200 cursor-pointer"
                                        title="Supprimer le formulaire"
                                    >
                                        <TrashIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* État vide */}
                {filteredFormulaires.length === 0 && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <ClipboardDocumentListIcon className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun formulaire trouvé</h3>
                        <p className="text-gray-600 mb-6 max-w-sm mx-auto">
                            {formulaires.length === 0
                                ? 'Commencez par créer votre premier formulaire médical en utilisant le bouton "Nouveau formulaire" ci-dessus.'
                                : 'Aucun formulaire ne correspond à vos critères de recherche. Essayez de modifier vos filtres.'
                            }
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}