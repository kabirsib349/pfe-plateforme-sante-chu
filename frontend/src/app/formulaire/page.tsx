'use client';

import React, { useState, useEffect, Fragment } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/hooks/useAuth";
import { useToast } from "@/src/hooks/useToast";
import { useStatsRefresh } from "@/src/hooks/useStatsRefresh";
import { Menu, Transition } from '@headlessui/react';
import { PlusIcon, MagnifyingGlassIcon, PencilIcon, TrashIcon, EyeIcon, ClipboardDocumentListIcon, UserGroupIcon, CalendarDaysIcon, CheckCircleIcon, ClockIcon, DocumentIcon, ExclamationCircleIcon, UserIcon, XMarkIcon, SparklesIcon, EllipsisVerticalIcon, PaperAirplaneIcon } from "@heroicons/react/24/outline";
import { MESSAGES } from "@/src/constants/messages";
import { ToastContainer } from "@/src/components/ToastContainer";
import ModalEnvoiFormulaire from '@/src/components/ModalEnvoiFormulaire';
import { getFormulaires, deleteFormulaire } from "@/src/lib/api";
import { handleError } from "@/src/lib/errorHandler";
import type { Formulaire } from "@/src/types";

export default function Formulaire() {
    const router = useRouter();
    const { token, user, isLoading: isAuthLoading } = useAuth();
    const { showToast, toasts, removeToast } = useToast();

    // Rediriger les médecins vers leur dashboard
    useEffect(() => {
        if (!isAuthLoading && user?.role === 'medecin') {
            router.push('/dashboard-medecin');
        }
    }, [user, isAuthLoading, router]);

    const { triggerStatsRefresh } = useStatsRefresh();
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [formulaires, setFormulaires] = useState<Formulaire[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [formulaireToDelete, setFormulaireToDelete] = useState<number | null>(null);
    const [modalEnvoiOpen, setModalEnvoiOpen] = useState(false);
    const [formulaireSelectionne, setFormulaireSelectionne] = useState<{ id: number, titre: string } | null>(null);

    const fetchFormulaires = async () => {
        if (!token) {
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        try {
            const data = await getFormulaires(token);
            setFormulaires(data);
        } catch (error) {
            const formattedError = handleError(error, 'FetchFormulaires');
            showToast(formattedError.userMessage, "error");
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenModalEnvoi = (formulaire: Formulaire) => {
        setFormulaireSelectionne({ id: formulaire.idFormulaire, titre: formulaire.titre });
        setModalEnvoiOpen(true);
    };

    const handleCloseModalEnvoi = () => {
        setModalEnvoiOpen(false);
        setFormulaireSelectionne(null);
    };

    const handleEnvoiSuccess = () => {
        fetchFormulaires();
        triggerStatsRefresh();
    };

    useEffect(() => {
        fetchFormulaires();
    }, [token]);

    // Filtrage des formulaires
    const filteredFormulaires = formulaires.filter((formulaire) => {
        const statutNormalized = formulaire.statut.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const matchesSearch = search === "" ||
            formulaire.titre.toLowerCase().includes(search.toLowerCase()) ||
            formulaire.etude.titre.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === "" || statutNormalized === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const handleView = (id: number) => {
        router.push(`/formulaire/apercu?id=${id}`);
    };

    const handleEdit = (id: number) => {
        router.push(`/formulaire/modifier/${id}`);
    };

    const openDeleteModal = (id: number) => {
        setFormulaireToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        setFormulaireToDelete(null);
        setIsDeleteModalOpen(false);
    };

    const confirmDelete = async () => {
        if (formulaireToDelete === null) return;

        if (!token) {
            showToast("Authentification requise.", "error");
            closeDeleteModal();
            return;
        }
        try {
            await deleteFormulaire(token!, formulaireToDelete);
            setFormulaires(formulaires.filter(f => f.idFormulaire !== formulaireToDelete));
            showToast(MESSAGES.success.formulaireSupprime, "success");
            triggerStatsRefresh();
        } catch (error) {
            const formattedError = handleError(error, 'DeleteFormulaire');
            showToast(formattedError.userMessage, "error");
        } finally {
            closeDeleteModal();
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
        if (!etudeTitre) return "bg-gray-100 text-gray-700";
        const t = etudeTitre.toLowerCase();
        if (t.includes('cardio')) return "bg-rose-100 text-rose-700";
        if (t.includes('chirurg')) return "bg-indigo-100 text-indigo-700";
        if (t.includes('endocrin')) return "bg-cyan-100 text-cyan-700";
        if (t.includes('urgence')) return "bg-orange-100 text-orange-700";
        return "bg-purple-100 text-purple-700";
    };

    const getStatutIcon = (statut: string) => {
        switch (statut.toLowerCase()) {
            case "envoye":
            case "envoyé":
            case "publie":
            case "publié":
                return <CheckCircleIcon className="w-4 h-4" />;
            case "en_attente":
                return <ClockIcon className="w-4 h-4" />;
            case "brouillon":
                return <DocumentIcon className="w-4 h-4" />;
            default:
                return <ExclamationCircleIcon className="w-4 h-4" />;
        }
    };

    if (isLoading) {
        return <div className="text-center p-12">Chargement des formulaires...</div>;
    }

    return (
        <>
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
                {/* Modal de confirmation de suppression */}
                {isDeleteModalOpen && (
                    <div className="fixed top-5 left-1/2 -translate-x-1/2 w-full max-w-md z-50">
                        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <ExclamationCircleIcon className="h-6 w-6 text-red-500 flex-shrink-0" />
                                    <p className="text-sm font-medium text-gray-800">Êtes-vous sûr de vouloir supprimer ce formulaire ?</p>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                                    <button
                                        onClick={confirmDelete}
                                        className="px-3 py-1.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors"
                                    >
                                        Supprimer
                                    </button>
                                    <button
                                        onClick={closeDeleteModal}
                                        className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-md transition-colors"
                                    >
                                        <XMarkIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="max-w-7xl mx-auto px-6 py-8">
                    {/* Barre de recherche et filtres */}
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
                        {filteredFormulaires.length > 0 && (
                            <p className="text-sm text-gray-500 mt-4">
                                {filteredFormulaires.length} formulaire{filteredFormulaires.length > 1 ? 's' : ''} trouvé{filteredFormulaires.length > 1 ? 's' : ''}
                            </p>
                        )}
                    </div>

                    {/* Grille de cartes */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                        {filteredFormulaires.map((formulaire) => (
                            <div
                                key={formulaire.idFormulaire}
                                className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-200 overflow-hidden group"
                            >
                                {/* En-tête de la carte */}
                                <div className="p-6 border-b border-gray-100">
                                    <div className="flex items-start justify-between mb-3">
                                        <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 flex-1 pr-2">
                                            {formulaire.titre}
                                        </h3>

                                        {/* Menu dropdown */}
                                        <Menu as="div" className="relative">
                                            <Menu.Button className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                                                <EllipsisVerticalIcon className="w-5 h-5 text-gray-500" />
                                            </Menu.Button>
                                            <Transition
                                                as={Fragment}
                                                enter="transition ease-out duration-100"
                                                enterFrom="transform opacity-0 scale-95"
                                                enterTo="transform opacity-100 scale-100"
                                                leave="transition ease-in duration-75"
                                                leaveFrom="transform opacity-100 scale-100"
                                                leaveTo="transform opacity-0 scale-95"
                                            >
                                                <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                                                    <div className="py-1">
                                                        <Menu.Item>
                                                            {({ active }) => (
                                                                <button
                                                                    onClick={() => handleView(formulaire.idFormulaire)}
                                                                    className={`${active ? 'bg-gray-50' : ''} flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700`}
                                                                >
                                                                    <EyeIcon className="w-4 h-4" />
                                                                    Aperçu
                                                                </button>
                                                            )}
                                                        </Menu.Item>
                                                        <Menu.Item>
                                                            {({ active }) => (
                                                                <button
                                                                    onClick={() => handleEdit(formulaire.idFormulaire)}
                                                                    className={`${active ? 'bg-gray-50' : ''} flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700`}
                                                                >
                                                                    <PencilIcon className="w-4 h-4" />
                                                                    Modifier
                                                                </button>
                                                            )}
                                                        </Menu.Item>
                                                        <div className="border-t border-gray-100"></div>
                                                        <Menu.Item>
                                                            {({ active }) => (
                                                                <button
                                                                    onClick={() => openDeleteModal(formulaire.idFormulaire)}
                                                                    className={`${active ? 'bg-red-50' : ''} flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600`}
                                                                >
                                                                    <TrashIcon className="w-4 h-4" />
                                                                    Supprimer
                                                                </button>
                                                            )}
                                                        </Menu.Item>
                                                    </div>
                                                </Menu.Items>
                                            </Transition>
                                        </Menu>
                                    </div>

                                    {/* Description de l'étude */}
                                    {formulaire.description && (
                                        <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                                            {formulaire.description}
                                        </p>
                                    )}

                                    {/* Badges */}
                                    <div className="flex flex-wrap gap-2">
                                        <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${getEtudeColor(formulaire.etude.titre)}`}>
                                            {formulaire.etude.titre}
                                        </span>
                                        <span className={`px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1 ${getStatutColor(formulaire.statut)}`}>
                                            {getStatutIcon(formulaire.statut)}
                                            {formulaire.statut}
                                        </span>
                                    </div>
                                </div>

                                {/* Corps de la carte */}
                                <div className="p-6">
                                    {/* Métadonnées */}
                                    <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                                        <div className="flex items-center gap-1.5">
                                            <CalendarDaysIcon className="w-3.5 h-3.5" />
                                            <span>{new Date(formulaire.dateCreation).toLocaleDateString('fr-FR')}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <ClipboardDocumentListIcon className="w-3.5 h-3.5" />
                                            <span>{formulaire.champs.length} champs</span>
                                        </div>
                                    </div>

                                    {/* Bouton d'action principal */}
                                    <button
                                        onClick={() => handleOpenModalEnvoi(formulaire)}
                                        className="w-full px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all flex items-center justify-center gap-2 font-medium shadow-sm hover:shadow-md"
                                    >
                                        <PaperAirplaneIcon className="w-4 h-4" />
                                        Envoyer à un médecin
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* État vide */}
                    {!isLoading && filteredFormulaires.length === 0 && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                            <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                {formulaires.length === 0 ? (
                                    <SparklesIcon className="w-10 h-10 text-blue-600" />
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

            {/* Modal d'envoi */}
            {formulaireSelectionne && (
                <ModalEnvoiFormulaire
                    isOpen={modalEnvoiOpen}
                    onClose={handleCloseModalEnvoi}
                    formulaireId={formulaireSelectionne.id}
                    formulaireTitre={formulaireSelectionne.titre}
                    onSuccess={handleEnvoiSuccess}
                    showToast={showToast}
                />
            )}
        </>
    );
}
