'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/src/hooks/useAuth';
import { useAggregatedFormulaires } from '@/src/hooks/useAggregatedFormulaires';
import { usePagination } from '@/src/hooks/usePagination';
import { Card } from '@/src/components/Card';
import { Badge } from '@/src/components/Badge';
import { ChartBarIcon, TrashIcon } from '@heroicons/react/24/outline';
import { EmptyState, LoadingState } from '@/src/components/ui';
import { deleteAllReponses, deleteFormulaireMedecin, getFormulairesEnvoyes } from '@/src/lib/api';
import { handleError } from '@/src/lib/errorHandler';
import { ConfirmationModal } from '@/src/components/ui/ConfirmationModal';
import { useToast } from '@/src/hooks/useToast';
import { ToastContainer } from '@/src/components/ToastContainer';
import type { AggregatedFormulaire } from '@/src/hooks/useAggregatedFormulaires';

const ITEMS_PER_PAGE = 5;

/**
 * DataTab component for displaying collected form data.
 * Refactored to use useAggregatedFormulaires and usePagination hooks.
 */
export const DataTab: React.FC = React.memo(() => {
  const router = useRouter();
  const { token } = useAuth();
  const { showToast, toasts, removeToast } = useToast();

  // Use the new aggregation hook
  const {
    aggregated,
    formulairesEnvoyes,
    isLoading,
    completedCount,
    refresh
  } = useAggregatedFormulaires({ token });

  // Use the new pagination hook
  const {
    page,
    setPage,
    totalPages,
    paginatedItems,
    search,
    setSearch,
    prevPage,
    nextPage,
    hasPrevPage,
    hasNextPage
  } = usePagination<AggregatedFormulaire>({
    items: aggregated,
    itemsPerPage: ITEMS_PER_PAGE,
    filterFn: (item, query) => {
      const q = query.toLowerCase();
      const titre = (item.formulaire?.titre || "").toLowerCase();
      const etudeTitre = (item.formulaire?.etude?.titre || "").toLowerCase();
      return titre.includes(q) || etudeTitre.includes(q);
    }
  });

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [formulaireToDelete, setFormulaireToDelete] = useState<AggregatedFormulaire | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteType, setDeleteType] = useState<'responses' | 'formulaire'>('responses');

  const handleDelete = async () => {
    if (!token || !formulaireToDelete) return;

    setIsDeleting(true);
    try {
      // Find all FormulaireMedecin IDs for this formulaire
      const formulaireMedecinIds = formulairesEnvoyes
        .filter(fe => fe.formulaire.idFormulaire === formulaireToDelete.formulaire.idFormulaire)
        .map(fe => fe.id);

      if (deleteType === 'formulaire') {
        // Delete complete FormulaireMedecin entries
        await Promise.all(
          formulaireMedecinIds.map(id => deleteFormulaireMedecin(token, id))
        );
        showToast('Formulaire supprimé avec succès', 'success');
      } else {
        // Delete only responses
        await Promise.all(
          formulaireMedecinIds.map(id => deleteAllReponses(token, id))
        );
        showToast('Toutes les réponses ont été supprimées', 'success');
      }

      // Refresh data
      await refresh();

    } catch (error) {
      const err = handleError(error, 'DeleteReponses');
      showToast(err.userMessage, 'error');
    } finally {
      setIsDeleting(false);
      setDeleteModalOpen(false);
      setFormulaireToDelete(null);
    }
  };

  const openDeleteModal = (item: AggregatedFormulaire, type: 'responses' | 'formulaire') => {
    setFormulaireToDelete(item);
    setDeleteType(type);
    setDeleteModalOpen(true);
  };

  return (
    <>
      <Card
        title="Formulaires complétés"
        subtitle={`${completedCount} formulaire${completedCount !== 1 ? 's' : ''} rempli${completedCount !== 1 ? 's' : ''}`}
      >
        {isLoading ? (
          <LoadingState />
        ) : (
          <>
            {/* Search bar */}
            <div className="mb-4">
              <input
                type="text"
                placeholder="Rechercher un formulaire, une étude ou un médecin..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>

            {paginatedItems.length === 0 ? (
              <EmptyState
                icon={<ChartBarIcon className="w-10 h-10 text-gray-400" />}
                title="Aucun résultat"
                description="Aucun formulaire trouvé pour cette recherche."
              />
            ) : (
              <>
                <div className="space-y-4">
                  {paginatedItems.map((item) => (
                    <div
                      key={item.formulaire.idFormulaire}
                      className="border border-gray-200 rounded-lg p-4 hover:border-green-300 hover:bg-green-50/30 transition-all"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {item.formulaire.titre}
                            </h3>
                            <Badge color="green">Complété</Badge>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => router.push(`/formulaire/reponses?formulaireId=${item.formulaire.idFormulaire}`)}
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-2"
                          >
                            <ChartBarIcon className="w-5 h-5" />
                            Voir les réponses
                          </button>

                          <div className="relative group">
                            <button
                              onClick={() => openDeleteModal(item, 'responses')}
                              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-2"
                            >
                              <TrashIcon className="w-5 h-5" />
                              Supprimer
                            </button>

                            {/* Dropdown menu */}
                            <div className="absolute right-0 mt-1 w-56 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                              <button
                                onClick={() => openDeleteModal(item, 'responses')}
                                className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-gray-700 rounded-t-lg"
                              >
                                Supprimer les réponses
                              </button>
                              <button
                                onClick={() => openDeleteModal(item, 'formulaire')}
                                className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-red-600 font-medium rounded-b-lg border-t"
                              >
                                Supprimer le formulaire complet
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                <div className="flex justify-center items-center gap-4 mt-6">
                  <button
                    disabled={!hasPrevPage}
                    onClick={prevPage}
                    className="px-3 py-1 border rounded disabled:opacity-50"
                  >
                    Précédent
                  </button>

                  <span>
                    Page {page} / {totalPages}
                  </span>

                  <button
                    disabled={!hasNextPage}
                    onClick={nextPage}
                    className="px-3 py-1 border rounded disabled:opacity-50"
                  >
                    Suivant
                  </button>
                </div>
              </>
            )}
          </>
        )}
      </Card>

      <ConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setFormulaireToDelete(null);
        }}
        onConfirm={handleDelete}
        title={deleteType === 'formulaire' ? 'Supprimer le formulaire' : 'Supprimer les réponses'}
        message={
          deleteType === 'formulaire'
            ? `Êtes-vous sûr de vouloir supprimer le formulaire "${formulaireToDelete?.formulaire?.titre}" et toutes ses réponses ? Cette action est irréversible.`
            : `Êtes-vous sûr de vouloir supprimer toutes les réponses du formulaire "${formulaireToDelete?.formulaire?.titre}" ? Cette action est irréversible.`
        }
        confirmText={isDeleting ? "Suppression..." : "Supprimer"}
        variant="danger"
      />

      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
    </>
  );
});

DataTab.displayName = 'DataTab';
