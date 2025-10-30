'use client';

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/hooks/useAuth";
import { useToast } from "@/src/hooks/useToast";
import { useStatsRefresh } from "@/src/hooks/useStatsRefresh";
import { PlusIcon, MagnifyingGlassIcon, PencilIcon, TrashIcon, EyeIcon, ClipboardDocumentListIcon, UserGroupIcon, CalendarDaysIcon, CheckCircleIcon, ClockIcon, DocumentIcon, ExclamationCircleIcon, UserIcon } from "@heroicons/react/24/outline";
import { TYPES_ETUDES } from "@/src/constants/etudes";
import { MESSAGES } from "@/src/constants/messages";
import { ToastContainer } from "@/src/components/ToastContainer";

// Type mis à jour pour correspondre à la réponse de l'API backend
interface FormulaireAPI {
    idFormulaire: number;
    titre: string;
    etude: {
        titre: string;
    };
    statut: string;
    dateCreation: string;
    champs: any[];
    chercheur: {
        nom: string;
    };
}

export default function Formulaire() {
    const router = useRouter();
    const { token } = useAuth();
    const { showToast, toasts, removeToast } = useToast();
    const { triggerStatsRefresh } = useStatsRefresh();
    const [search, setSearch] = useState("");
    const [typeFilter, setTypeFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [formulaires, setFormulaires] = useState<FormulaireAPI[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchFormulaires = async () => {
            if (!token) {
                setIsLoading(false);
                return;
            }

            try {
                const response = await fetch('http://localhost:8080/api/formulaires', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    setFormulaires(data);
                } else {
                    showToast(MESSAGES.error.chargement, "error");
                }
            } catch (error) {
                console.error("Erreur réseau:", error);
                showToast(MESSAGES.error.reseau, "error");
            } finally {
                setIsLoading(false);
            }
        };

        fetchFormulaires();
    }, [token]);


    // Filtrage des formulaires
    const filteredFormulaires = formulaires.filter((formulaire) => {
        const statutNormalized = formulaire.statut.toLowerCase();
        const matchesSearch = search === "" ||
            formulaire.titre.toLowerCase().includes(search.toLowerCase()) ||
            formulaire.etude.titre.toLowerCase().includes(search.toLowerCase());
        const matchesType = typeFilter === "" || formulaire.etude.titre === typeFilter;
        const matchesStatus = statusFilter === "" || statutNormalized === statusFilter;
        return matchesSearch && matchesType && matchesStatus;
    });

    // Fonctions d'action
    const handleView = (id: number) => {
        router.push(`/formulaire/apercu?id=${id}`);
    };

    const handleEdit = (id: number) => {
        router.push(`/formulaire/modifier/${id}`);
    };

    const handleDelete = async (id: number) => {
        if (confirm(MESSAGES.confirmation.supprimerFormulaire)) {
            if (!token) {
                showToast("Authentification requise.", "error");
                return;
            }
            try {
                const response = await fetch(`http://localhost:8080/api/formulaires/${id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (response.ok) {
                    setFormulaires(formulaires.filter(f => f.idFormulaire !== id));
                    showToast(MESSAGES.success.formulaireSupprime, "success");
                    triggerStatsRefresh(); // Rafraîchir les stats
                } else {
                    showToast(MESSAGES.error.suppression, "error");
                }
            } catch (error) {
                console.error("Erreur réseau:", error);
                showToast(MESSAGES.error.reseau, "error");
            }
        }
    };

    const getStatutColor = (statut: string) => {
        switch (statut.toLowerCase()) {
            case "envoye":
            case "envoyé":
            case "publie":
            case "publié":
                return "bg-emerald-50 text-emerald-700 border border-emerald-200";
            case "en_attente":
                return "bg-amber-50 text-amber-700 border border-amber-200";
            case "brouillon":
                return "bg-slate-50 text-slate-700 border border-slate-200";
            default:
                return "bg-blue-50 text-blue-700 border border-blue-200";
        }
    };

    const getEtudeColor = (etudeTitre: string) => {
        const foundEtude = TYPES_ETUDES.find(e => e.value === etudeTitre);
        if (foundEtude) {
             switch (foundEtude.value) {
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
        }
        return "bg-gray-50 text-gray-700 border border-gray-200";
    };

    const getStatutIcon = (statut: string) => {
        switch (statut.toLowerCase()) {
            case "envoye":
            case "envoyé":
            case "publie":
            case "publié":
                return <CheckCircleIcon className="w-5 h-5 text-emerald-600" />;
            case "en_attente":
                return <ClockIcon className="w-5 h-5 text-amber-600" />;
            case "brouillon":
                return <DocumentIcon className="w-5 h-5 text-slate-600" />;
            default:
                return <ExclamationCircleIcon className="w-5 h-5 text-blue-600" />;
        }
    };

    if (isLoading) {
        return <div className="text-center p-12">Chargement des formulaires...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="bg-white shadow-sm border-b border-gray-200">
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
                        <div className="flex gap-4">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-gray-900">{formulaires.length}</div>
                                <div className="text-xs text-gray-500">Total</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-emerald-600">
                                    {formulaires.filter(f => {
                                        const statut = f.statut.toLowerCase();
                                        return statut === "envoye" || statut === "envoyé" || statut === "publie" || statut === "publié";
                                    }).length}
                                </div>
                                <div className="text-xs text-gray-500">Envoyés</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-slate-600">
                                    {formulaires.filter(f => f.statut.toLowerCase() === "brouillon").length}
                                </div>
                                <div className="text-xs text-gray-500">Brouillons</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8">
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
                            <option value="publie">Publié</option>
                            <option value="brouillon">Brouillon</option>
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

                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredFormulaires.map((formulaire) => (
                        <div
                            key={formulaire.idFormulaire}
                            className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 overflow-hidden"
                        >
                            <div className="p-6 border-b border-gray-100">
                                <div className="flex items-start justify-between mb-3">
                                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                                        {formulaire.titre}
                                    </h3>
                                    <span className="text-lg">{getStatutIcon(formulaire.statut)}</span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    <span className={`px-3 py-1 rounded-lg text-xs font-medium ${getEtudeColor(formulaire.etude.titre)}`}>
                                        {formulaire.etude.titre}
                                    </span>
                                    <span className={`px-3 py-1 rounded-lg text-xs font-medium ${getStatutColor(formulaire.statut)}`}>
                                        {formulaire.statut.toLowerCase()}
                                    </span>
                                </div>
                            </div>

                            <div className="p-6">
                                <div className="space-y-3 mb-6">
                                    <div className="flex items-center gap-3 text-sm text-gray-600">
                                        <UserIcon className="w-4 h-4" />
                                        <span>Créé par {formulaire.chercheur.nom}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-gray-600">
                                        <CalendarDaysIcon className="w-4 h-4" />
                                        <span>Créé le {new Date(formulaire.dateCreation).toLocaleDateString('fr-FR')}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-gray-600">
                                        <UserGroupIcon className="w-4 h-4" />
                                        <span>{formulaire.champs.length} champs de données</span>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleView(formulaire.idFormulaire)}
                                        className="flex-1 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 ..."
                                        title="Aperçu du formulaire"
                                    >
                                        <EyeIcon className="w-4 h-4" />
                                        Aperçu
                                    </button>
                                    <button
                                        onClick={() => handleEdit(formulaire.idFormulaire)}
                                        className="flex-1 px-3 py-2 bg-amber-50 text-amber-700 rounded-lg hover:bg-amber-100 ..."
                                        title="Modifier le formulaire"
                                    >
                                        <PencilIcon className="w-4 h-4" />
                                        Modifier
                                    </button>
                                    <button
                                        onClick={() => handleDelete(formulaire.idFormulaire)}
                                        className="px-3 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 ..."
                                        title="Supprimer le formulaire"
                                    >
                                        <TrashIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                { !isLoading && filteredFormulaires.length === 0 && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                        <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            {formulaires.length === 0 ? (
                                <span className="text-3xl">✨</span>
                            ) : (
                                <ClipboardDocumentListIcon className="w-10 h-10 text-blue-600" />
                            )}
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-3">
                            {formulaires.length === 0 ? 'Créez votre premier formulaire' : 'Aucun formulaire trouvé'}
                        </h3>
                        <p className="text-gray-600 mb-8 max-w-md mx-auto">
                            {formulaires.length === 0
                                ? 'Commencez par créer votre premier formulaire médical. C\'est simple et rapide !'
                                : 'Aucun formulaire ne correspond à vos critères de recherche. Essayez de modifier vos filtres.'
                            }
                        </p>
                        {formulaires.length === 0 && (
                            <button
                                onClick={() => router.push('/formulaire/nouveau')}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors inline-flex items-center gap-2"
                            >
                                <PlusIcon className="w-5 h-5" />
                                Créer un formulaire
                            </button>
                        )}
                    </div>
                )}
            </div>
            <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
        </div>
    );
}
