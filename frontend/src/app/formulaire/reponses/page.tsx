"use client";

import React, { Suspense, useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/src/hooks/useAuth";
import { useToast } from "@/src/hooks/useToast";
import { ToastContainer } from "@/src/components/ToastContainer";
import { ArrowLeftIcon, UserIcon, CalendarDaysIcon, CheckCircleIcon, BookOpenIcon, ArrowDownTrayIcon, ClipboardDocumentListIcon, EyeIcon, MagnifyingGlassIcon, XMarkIcon, ExclamationCircleIcon, DocumentTextIcon, UserGroupIcon } from "@heroicons/react/24/outline";
import { getFormulairesEnvoyes, getFormulaireById, getReponses, deletePatientReponses } from "@/src/lib/api";
import { handleError } from "@/src/lib/errorHandler";
import { config } from "@/src/lib/config";
import ExportCsvButton from "@/src/components/export/ExportCsvButton";
import { PatientTable } from "@/src/components/reponses/PatientTable";
import { PatientDetailsModal } from "@/src/components/reponses/PatientDetailsModal";

const PATIENTS_PER_PAGE = 3;

function ReponsesFormulaireContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { token, user } = useAuth();
    const formulaireMedecinId = searchParams.get('id');
    const formulaireIdParam = searchParams.get('formulaireId');
    const { showToast, toasts, removeToast } = useToast();

    const [formulaireData, setFormulaireData] = useState<any>(null);
    const [reponses, setReponses] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [selectedPatient, setSelectedPatient] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [selectedFormulaireMedecinId, setSelectedFormulaireMedecinId] = useState<number | null>(null);
    const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

    /**
     * Redirect non-researcher users to medecin dashboard
     */
    useEffect(() => {
        if (user && user.role !== 'chercheur') {
            router.push('/dashboard-medecin');
        }
    }, [user, router]);

    useEffect(() => {
        const fetchReponses = async () => {
            setIsLoading(true);
            setError(null);

            if (!token) {
                setError('Non authentifié');
                setIsLoading(false);
                return;
            }

            try {
                const formulaires = await getFormulairesEnvoyes(token);

                if (formulaireMedecinId) {
                    // existing behaviour: treat id as FormulaireMedecin id
                    const formulaireEnvoye = formulaires.find((f: any) => f.id === parseInt(formulaireMedecinId));
                    if (formulaireEnvoye) {
                        try {
                            if (formulaireEnvoye.formulaire?.idFormulaire) {
                                const formulaireComplet = await getFormulaireById(token, formulaireEnvoye.formulaire.idFormulaire);
                                setFormulaireData({ ...formulaireEnvoye, formulaire: formulaireComplet });
                            } else {
                                setFormulaireData(formulaireEnvoye);
                            }
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
                    const allResponsesArrays = await Promise.all(related.map((r: any) =>
                        getReponses(token, r.id)
                            .then(res => res.map((item: any) => ({ ...item, formulaireMedecinId: r.id })))
                            .catch(() => [])
                    ));
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

    }, [formulaireMedecinId, formulaireIdParam, token, refreshTrigger]);

    /**
     * Group responses by patient identifier with submission date
     * Uses useMemo to avoid unnecessary recalculations
     */
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

    const handleDeletePatient = async (patientId: string) => {
        if (!token) return;

        try {
            const formulaireMedecinIdToUse = formulaireMedecinId ? parseInt(formulaireMedecinId) : selectedFormulaireMedecinId;

            if (!formulaireMedecinIdToUse) return;

            await deletePatientReponses(token, formulaireMedecinIdToUse, patientId);

            const data = await getReponses(token, formulaireMedecinIdToUse);
            setReponses(data);
            setIsModalOpen(false);
        } catch (error) {
            const err = handleError(error, 'DeletePatient');
            setError(err.userMessage);
        }
    };

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
                    <ExclamationCircleIcon className="w-12 h-12 text-red-600 mx-auto mb-4" />
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
                                <DocumentTextIcon className="w-8 h-8 text-blue-600" />
                            </div>
                            <p className="text-gray-600">Aucune question dans ce formulaire</p>
                        </div>
                    ) : patientsData.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <ExclamationCircleIcon className="w-8 h-8 text-gray-400" />
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
                                                <UserGroupIcon className="w-5 h-5" /> {patientsData.length} patient{patientsData.length > 1 ? 's' : ''}
                                            </p>
                                        </div>
                                        <div className="bg-gradient-to-r from-blue-50 to-sky-50 border-l-4 border-blue-500 px-4 py-2 rounded-r-lg">
                                            <p className="text-blue-900 font-semibold text-sm">
                                                <ClipboardDocumentListIcon className="w-5 h-5" /> {reponses.length} réponse{reponses.length > 1 ? 's' : ''}
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

                            <PatientTable
                                patients={filteredPatients}
                                searchTerm={searchTerm}
                                onSearchChange={setSearchTerm}
                                onPatientSelect={(patientId) => {
                                    setSelectedPatient(patientId);
                                    setIsModalOpen(true);
                                }}
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={setCurrentPage}
                                patientsPerPage={PATIENTS_PER_PAGE}
                            />
                        </div>
                    )}
                </div>

                <PatientDetailsModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    patientId={selectedPatient!}
                    patientData={selectedPatientData!}
                    formulaireChamps={formulaireData.formulaire.champs}
                    onDeletePatient={handleDeletePatient}
                    token={token || undefined}
                    formulaireMedecinId={
                        // Use explicitly known ID (single view) OR derive from patient's first response (aggregated view)
                        formulaireMedecinId
                            ? parseInt(formulaireMedecinId)
                            : (selectedPatientData && selectedPatientData.reponses.length > 0)
                                ? (selectedPatientData.reponses[0] as any).formulaireMedecinId
                                : selectedFormulaireMedecinId
                    }
                    onUpdate={() => {
                        // Refresh data
                        setIsModalOpen(false); // Close modal on success? Or keep open? User might want to verify.
                        // Ideally we keep it open and just refresh data, but re-fetching all might close it if state resets.
                        // The simplest is to close and refresh.
                        // To refresh, we can toggle a reload flag or just re-call fetchReponses if we extracted it.
                        // Since fetchReponses is in useEffect, we can trigger it?
                        // Actually, we can just reload the page or navigate similarly.
                        // For now, let's close the modal and trigger a reload by updating a dummy state or just calling fetch logic if extracted.
                        // Easier: just reload window for full refresh or let the user click refresh. 
                        // But better: call `fetchReponses` logic again.
                        // I'll make fetchReponses depend on a 'refreshTrigger' state.
                        setRefreshTrigger(prev => prev + 1);
                    }}
                    showToast={showToast}
                />

                {/* Actions */}
                <div className="mt-6 flex justify-between items-center">
                    <button
                        onClick={() => router.push('/dashboard-chercheur?tab=data')}
                        className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Retour
                    </button>
                    {formulaireMedecinId ? (
                        <ExportCsvButton
                            formulaireMedecinId={Number(formulaireMedecinId)}
                            variant="button"
                        />
                    ) : formulaireIdParam ? (
                        <ExportCsvButton
                            formulaireId={Number(formulaireIdParam)}
                            variant="button"
                        />
                    ) : null}
                </div>
            </div>
            <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
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
