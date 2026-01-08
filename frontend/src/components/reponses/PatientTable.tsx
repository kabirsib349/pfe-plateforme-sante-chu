import React from 'react';
import { UserIcon, CalendarDaysIcon, EyeIcon, MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface Patient {
    id: string;
    dateSaisie: string;
}

interface PatientTableProps {
    patients: Patient[];
    searchTerm: string;
    onSearchChange: (value: string) => void;
    onPatientSelect: (patientId: string) => void;
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    patientsPerPage: number;
}

/**
 * Table component for displaying patient responses with search and pagination
 */
export const PatientTable: React.FC<PatientTableProps> = ({
    patients,
    searchTerm,
    onSearchChange,
    onPatientSelect,
    currentPage,
    totalPages,
    onPageChange,
    patientsPerPage
}) => {
    const startIndex = (currentPage - 1) * patientsPerPage;
    const endIndex = startIndex + patientsPerPage;
    const patientsToDisplay = patients.slice(startIndex, endIndex);

    if (patients.length === 0) {
        return (
            <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <MagnifyingGlassIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">Aucun patient ne correspond à votre recherche</p>
                <button
                    onClick={() => onSearchChange('')}
                    className="mt-3 text-green-600 hover:text-green-700 font-medium"
                >
                    Réinitialiser la recherche
                </button>
            </div>
        );
    }

    return (
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
                        {patientsToDisplay.map((patient) => (
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
                                        onClick={() => onPatientSelect(patient.id)}
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

            {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4">
                    <div className="text-sm text-gray-700">
                        Affichage de {startIndex + 1} à {Math.min(endIndex, patients.length)} sur {patients.length} patient{patients.length > 1 ? 's' : ''}
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1}
                            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Précédent
                        </button>
                        <span className="text-sm text-gray-700">
                            Page {currentPage} sur {totalPages}
                        </span>
                        <button
                            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                            disabled={currentPage === totalPages}
                            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Suivant
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};
