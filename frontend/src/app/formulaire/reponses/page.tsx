"use client";

import React, { Suspense, useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/src/hooks/useAuth";
import { ArrowLeftIcon, UserIcon, CalendarDaysIcon, CheckCircleIcon, BookOpenIcon, PrinterIcon, ArrowDownTrayIcon, ClipboardDocumentListIcon, EyeIcon, MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { getFormulairesEnvoyes, getFormulaireById, getReponses } from "@/src/lib/api";
import { handleError } from "@/src/lib/errorHandler";
import { config } from "@/src/lib/config";
import ExportCsvButton from "@/src/components/export/ExportCsvButton";

const PATIENTS_PER_PAGE = 3;

function ReponsesFormulaireContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { token, user } = useAuth();
    const formulaireMedecinId = searchParams.get('id');
    const formulaireIdParam = searchParams.get('formulaireId');

    const [formulaireData, setFormulaireData] = useState<any>(null);
    const [reponses, setReponses] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [selectedPatient, setSelectedPatient] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

    // Rediriger si pas chercheur
    useEffect(() => {
        if (user && user.role !== 'chercheur') {
            router.push('/dashboard-medecin');
        }
    }, [user, router]);

    useEffect(() => {
        const fetchReponses = async () => {
            setIsLoading(true);
            setError(null);

            try {
                const formulaires = await getFormulairesEnvoyes(token);

                if (formulaireMedecinId) {
                    // existing behaviour: treat id as FormulaireMedecin id
                    const formulaireEnvoye = formulaires.find((f: any) => f.id === parseInt(formulaireMedecinId));
                    if (formulaireEnvoye) {
                        try {
                            const formulaireComplet = await getFormulaireById(token, formulaireEnvoye.formulaire.idFormulaire);
                            setFormulaireData({ ...formulaireEnvoye, formulaire: formulaireComplet });
                        } catch {
                            setFormulaireData(formulaireEnvoye);
                        }
                    } else {
                        setError('Formulaire non trouvé');
                    }

                    const reponsesData = await getReponses(token, parseInt(formulaireMedecinId));
                    setReponses(reponsesData);
                } else if (formulaireIdParam) {
                    // new behaviour: treat formulaireIdParam as the base formulaire id and aggregate across all envoyes
                    const baseFormId = parseInt(formulaireIdParam);
                    // find all FormulaireMedecin entries for this formulaire
                    const related = formulaires.filter((f: any) => f.formulaire?.idFormulaire === baseFormId);
                    if (related.length === 0) {
                        setError('Aucun envoi trouvé pour ce formulaire');
                        setIsLoading(false);
                        return;
                    }

                    // Use the first one as formulaireData base and fetch full formulaire
                    const first = related[0];
                    try {
                        const formulaireComplet = await getFormulaireById(token, baseFormId);
                        setFormulaireData({ ...first, formulaire: formulaireComplet });
                    } catch {
                        setFormulaireData(first);
                    }

                    // fetch all responses for each FormulaireMedecin and merge
                    const allResponsesArrays = await Promise.all(related.map((r: any) => getReponses(token, r.id).catch(() => [])));
                    const merged = ([] as any[]).concat(...allResponsesArrays);
                    setReponses(merged);
                } else {
                    setError('ID manquant');
                }
            } catch (err) {
                const formattedError = handleError(err, 'ReponsesFormulaire');
                setError(formattedError.userMessage);
            } finally {
                setIsLoading(false);
            }
        };

        fetchReponses();

     }, [formulaireMedecinId, formulaireIdParam, token]);

    // Grouper les réponses par patient avec date de saisie (useMemo pour éviter recalculs)
    const reponsesParPatient = useMemo(() => {
        return reponses.reduce((acc: any, reponse: any) => {
            const patientId = reponse.patientIdentifier || 'Non spécifié';
            if (!acc[patientId]) {
                acc[patientId] = {
                    reponses: [],
                    dateSaisie: reponse.dateSaisie || new Date().toISOString()
                };
            }
            acc[patientId].reponses.push(reponse);
            // Garder la date la plus ancienne (première saisie)
            const currentDate = new Date(reponse.dateSaisie || new Date());
            const storedDate = new Date(acc[patientId].dateSaisie);
            if (currentDate < storedDate) {
                acc[patientId].dateSaisie = reponse.dateSaisie || new Date().toISOString();
            }
            return acc;
        }, {});
    }, [reponses]);

    // Créer un tableau de patients avec leurs infos (useMemo pour éviter recalculs)
    const patientsData = useMemo(() => {
        return Object.keys(reponsesParPatient).map(patientId => ({
            id: patientId,
            dateSaisie: reponsesParPatient[patientId].dateSaisie,
            reponses: reponsesParPatient[patientId].reponses
        }));
    }, [reponsesParPatient]);

    // Filtrer les patients selon le terme de recherche (useMemo)
    const filteredPatients = useMemo(() => {
        if (!searchTerm || searchTerm.trim() === '') {
            return patientsData;
        }

        const searchValue = searchTerm.trim();

        return patientsData.filter(patient => {
            // Recherche PARTIELLE par ID patient (contient le terme recherché)
            // Fonctionne avec des lettres, chiffres, ou mélanges
            return patient.id.toLowerCase().includes(searchValue.toLowerCase());
        });
    }, [patientsData, searchTerm]);

    // Trier par date (plus récent en premier) - useMemo
    const sortedPatients = useMemo(() => {
        return [...filteredPatients].sort((a, b) =>
            new Date(b.dateSaisie).getTime() - new Date(a.dateSaisie).getTime()
        );
    }, [filteredPatients]);

    // Pagination (useMemo)
    const { totalPages, startIndex, endIndex, patientsToDisplay } = useMemo(() => {
        const total = Math.ceil(sortedPatients.length / PATIENTS_PER_PAGE);
        const start = (currentPage - 1) * PATIENTS_PER_PAGE;
        const end = start + PATIENTS_PER_PAGE;
        const display = sortedPatients.slice(start, end);
        return {
            totalPages: total,
            startIndex: start,
            endIndex: end,
            patientsToDisplay: display
        };
    }, [sortedPatients, currentPage]);

    // Réinitialiser la page si le filtre change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    // Obtenir les réponses du patient sélectionné
    const selectedPatientData = selectedPatient ? reponsesParPatient[selectedPatient] : null;


    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Chargement des réponses...</p>
                </div>
            </div>
        );
    }

    if (error || (!formulaireData && !isLoading)) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-red-600 text-xl mb-4">❌</div>
                    <p className="text-gray-900 font-semibold mb-2">Erreur</p>
                    <p className="text-gray-600">{error || 'Données non trouvées'}</p>
                    <button
                        onClick={() => router.push('/dashboard-chercheur')}
                        className="mt-4 text-blue-600 hover:text-blue-800"
                    >
                        Retour au dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-4xl mx-auto px-6 py-4">
                    <button
                        onClick={() => router.push('/dashboard-chercheur?tab=data')}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
                    >
                        <ArrowLeftIcon className="w-5 h-5" />
                        <span>Retour au dashboard</span>
                    </button>
                    
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-2xl font-bold text-gray-900">
                                {formulaireData.formulaire.titre}
                            </h1>
                            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                                <CheckCircleIcon className="w-4 h-4" />
                                Complété
                            </span>
                        </div>
                        <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                                <BookOpenIcon className="w-4 h-4" />
                                <span>{formulaireData.formulaire.etude?.titre || 'N/A'}</span>
                            </span>
                            <span className="flex items-center gap-1">
                                <UserIcon className="w-4 h-4" />
                                <span>
                                    {formulaireData.medecin?.nom
                                        ? `Rempli par Dr. ${formulaireData.medecin.nom}`
                                        : 'Rempli par Chercheur'}
                                </span>
                            </span>
                            <span className="flex items-center gap-1">
                                <CalendarDaysIcon className="w-4 h-4" />
                                <span>Le {new Date(formulaireData.dateCompletion).toLocaleDateString('fr-FR', {
                                    day: '2-digit',
                                    month: 'long',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}</span>
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Formulaire avec réponses */}
            <div className="max-w-4xl mx-auto px-6 py-8">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                        <ClipboardDocumentListIcon className="w-6 h-6 text-emerald-600" />
                        <span>Réponses des patients</span>
                    </h2>

                    {formulaireData.formulaire.description && (
                        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <p className="text-sm text-blue-800">{formulaireData.formulaire.description}</p>
                        </div>
                    )}

                    {!formulaireData.formulaire.champs || formulaireData.formulaire.champs.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl">📝</span>
                            </div>
                            <p className="text-gray-600">Aucune question dans ce formulaire</p>
                        </div>
                    ) : patientsData.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl">❌</span>
                            </div>
                            <p className="text-gray-600">Aucune réponse enregistrée</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* En-tête avec titre, statistiques et recherche sur la même ligne */}
                            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2">
                                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 px-4 py-2 rounded-r-lg">
                                            <p className="text-green-900 font-semibold text-sm">
                                                📊 {patientsData.length} patient{patientsData.length > 1 ? 's' : ''}
                                            </p>
                                        </div>
                                        <div className="bg-gradient-to-r from-blue-50 to-sky-50 border-l-4 border-blue-500 px-4 py-2 rounded-r-lg">
                                            <p className="text-blue-900 font-semibold text-sm">
                                                📝 {reponses.length} réponse{reponses.length > 1 ? 's' : ''}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Barre de recherche allongée */}
                                <div className="relative w-full lg:w-96">
                                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Rechercher par ID patient..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    />
                                    {searchTerm && (
                                        <button
                                            onClick={() => setSearchTerm('')}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            <XMarkIcon className="w-5 h-5" />
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Tableau des patients */}
                            {filteredPatients.length === 0 ? (
                                <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                                    <MagnifyingGlassIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                    <p className="text-gray-600">Aucun patient ne correspond à votre recherche</p>
                                    <button
                                        onClick={() => setSearchTerm('')}
                                        className="mt-3 text-green-600 hover:text-green-700 font-medium"
                                    >
                                        Réinitialiser la recherche
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <div className="overflow-x-auto border border-gray-200 rounded-lg">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Identifiant Patient
                                                    </th>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Date de remplissage
                                                    </th>
                                                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Action
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {patientsToDisplay.map((patient, index) => (
                                                    <tr key={patient.id} className="hover:bg-gray-50 transition-colors">
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="flex items-center">
                                                                <div className="flex-shrink-0 h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                                                                    <UserIcon className="h-5 w-5 text-green-600" />
                                                                </div>
                                                                <div className="ml-4">
                                                                    <div className="text-sm font-medium text-gray-900">
                                                                        {patient.id}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="text-sm text-gray-900">
                                                                {new Date(patient.dateSaisie).toLocaleDateString('fr-FR', {
                                                                    day: '2-digit',
                                                                    month: 'long',
                                                                    year: 'numeric'
                                                                })}
                                                            </div>
                                                            <div className="text-sm text-gray-500">
                                                                {new Date(patient.dateSaisie).toLocaleTimeString('fr-FR', {
                                                                    hour: '2-digit',
                                                                    minute: '2-digit'
                                                                })}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                                            <button
                                                                onClick={() => {
                                                                    setSelectedPatient(patient.id);
                                                                    setIsModalOpen(true);
                                                                }}
                                                                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                                            >
                                                                <EyeIcon className="w-5 h-5" />
                                                                Voir les réponses
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Pagination */}
                                    {totalPages > 1 && (
                                        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4">
                                            <div className="text-sm text-gray-700">
                                                Affichage de {startIndex + 1} à {Math.min(endIndex, sortedPatients.length)} sur {sortedPatients.length} patient{sortedPatients.length > 1 ? 's' : ''}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                                    disabled={currentPage === 1}
                                                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                >
                                                    Précédent
                                                </button>
                                                <span className="text-sm text-gray-700">
                                                    Page {currentPage} sur {totalPages}
                                                </span>
                                                <button
                                                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                                    disabled={currentPage === totalPages}
                                                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                >
                                                    Suivant
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    )}
                </div>

                {/* Modal des détails du patient */}
                {isModalOpen && selectedPatient && selectedPatientData && (
                    <div className="fixed inset-0 z-[9999] overflow-y-auto bg-gray-100" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                        <div className="max-w-4xl mx-auto">
                            {/* Contenu du modal */}
                            <div className="bg-white rounded-lg shadow-xl">
                                {/* En-tête du modal */}
                                <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-white rounded-full p-2">
                                            <UserIcon className="w-6 h-6 text-green-600" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-white">
                                                Patient : {selectedPatient}
                                            </h3>
                                            <p className="text-green-100 text-sm">
                                                Rempli le {new Date(selectedPatientData.dateSaisie).toLocaleDateString('fr-FR', {
                                                    day: '2-digit',
                                                    month: 'long',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setIsModalOpen(false)}
                                        className="text-white hover:text-gray-200 transition-colors"
                                    >
                                        <XMarkIcon className="w-6 h-6" />
                                    </button>
                                </div>

                                {/* Corps du modal */}
                                <div className="px-6 py-6 max-h-[70vh] overflow-y-auto">
                                    <div className="space-y-6">
                                        {formulaireData.formulaire.champs.map((champ: any, index: number) => {
                                            const reponsesMap = selectedPatientData.reponses.reduce((acc: any, reponse: any) => {
                                                acc[reponse.champ.idChamp] = reponse.valeur;
                                                return acc;
                                            }, {});
                                            const reponseValue = reponsesMap[champ.idChamp];
                                            const champType = champ.type?.toUpperCase();

                                            return (
                                                <div key={champ.idChamp} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                                                    <label className="block text-sm font-medium text-gray-900 mb-3">
                                                        {index + 1}. {champ.label}
                                                        {champ.obligatoire && <span className="text-red-600 ml-1">*</span>}
                                                    </label>

                                                    {champType === 'TEXTE' && (
                                                        <div className="bg-white border-2 border-green-500 rounded-lg px-4 py-3">
                                                            <p className="text-gray-900 font-medium">
                                                                {reponseValue || <span className="text-gray-400 italic">Non rempli</span>}
                                                            </p>
                                                        </div>
                                                    )}

                                                    {champType === 'NOMBRE' && (
                                                        <div className="bg-white border-2 border-green-500 rounded-lg px-4 py-3">
                                                            <p className="text-gray-900 font-medium">
                                                                {reponseValue || <span className="text-gray-400 italic">Non rempli</span>}
                                                                {champ.unite && reponseValue && <span className="text-gray-600 ml-2">{champ.unite}</span>}
                                                            </p>
                                                        </div>
                                                    )}

                                                    {champType === 'DATE' && (
                                                        <div className="bg-white border-2 border-green-500 rounded-lg px-4 py-3">
                                                            <p className="text-gray-900 font-medium">
                                                                {reponseValue ? new Date(reponseValue).toLocaleDateString('fr-FR', {
                                                                    day: '2-digit',
                                                                    month: 'long',
                                                                    year: 'numeric'
                                                                }) : <span className="text-gray-400 italic">Non rempli</span>}
                                                            </p>
                                                        </div>
                                                    )}

                                                    {champType === 'CHOIX_MULTIPLE' && (
                                                        <div className="space-y-2">
                                                            {champ.listeValeur?.options?.map((option: any, optIndex: number) => {
                                                                const isSelected = reponseValue === option.libelle;
                                                                return (
                                                                    <div
                                                                        key={optIndex}
                                                                        className={`flex items-center gap-3 p-3 border-2 rounded-lg ${
                                                                            isSelected
                                                                                ? 'bg-green-50 border-green-500'
                                                                                : 'bg-white border-gray-200'
                                                                        }`}
                                                                    >
                                                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                                                            isSelected
                                                                                ? 'border-green-600 bg-green-600'
                                                                                : 'border-gray-300'
                                                                        }`}>
                                                                            {isSelected && (
                                                                                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                                                </svg>
                                                                            )}
                                                                        </div>
                                                                        <span className={`${isSelected ? 'text-gray-900 font-semibold' : 'text-gray-600'}`}>
                                                                            {option.libelle}
                                                                        </span>
                                                                        {isSelected && (
                                                                            <span className="ml-auto text-green-600 text-sm font-medium">✓ Sélectionné</span>
                                                                        )}
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Pied du modal */}
                                <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3">
                                    <button
                                        onClick={() => setIsModalOpen(false)}
                                        className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                                    >
                                        Fermer
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="mt-6 flex justify-between items-center">
                    <button
                        onClick={() => router.push('/dashboard-chercheur?tab=data')}
                        className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Retour
                    </button>
                    <div className="flex gap-3">
                        <button
                            onClick={() => window.print()}
                            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
                        >
                            <PrinterIcon className="w-5 h-5" />
                            Imprimer
                        </button>
                        {formulaireMedecinId && (
                            <ExportCsvButton
                                formulaireMedecinId={Number(formulaireMedecinId)}
                                variant="button"
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}


export default function ReponsesFormulaire() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Chargement...</div>}>
            <ReponsesFormulaireContent />
        </Suspense>
    );
}
