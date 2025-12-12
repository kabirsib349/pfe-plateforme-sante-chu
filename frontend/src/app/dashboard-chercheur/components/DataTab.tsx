import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/src/hooks/useAuth';
import { Card } from '@/src/components/Card';
import { Badge } from '@/src/components/Badge';
import { ChartBarIcon, BookOpenIcon, UserIcon, CalendarDaysIcon } from '@heroicons/react/24/outline';
import { EmptyState, LoadingState } from '@/src/components/ui';
import { getFormulairesEnvoyes } from '@/src/lib/api';
import { handleError } from '@/src/lib/errorHandler';

const ITEMS_PER_PAGE = 5;

export const DataTab: React.FC = React.memo(() => {
  const router = useRouter();
  const { token } = useAuth();
  const [formulairesEnvoyes, setFormulairesEnvoyes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchFormulairesEnvoyes = async () => {
      if (!token) return;

      try {
        const data = await getFormulairesEnvoyes(token);
        setFormulairesEnvoyes(data);
      } catch (error) {
        handleError(error, 'FetchFormulairesEnvoyes');
      } finally {
        setIsLoading(false);
      }
    };

    fetchFormulairesEnvoyes();
  }, [token]);

  const formulairesCompletes = formulairesEnvoyes.filter((f) => f.complete);

  // --- Recherche ---
  const filtered = formulairesCompletes.filter((f) => {
    const q = search.toLowerCase();
    return (
      f.formulaire.titre.toLowerCase().includes(q) ||
      f.medecin.nom.toLowerCase().includes(q) ||
      (f.formulaire.etude?.titre || "").toLowerCase().includes(q)
    );
  });

  // --- Pagination ---
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginatedItems = filtered.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  return (
    <Card
      title="Formulaires complétés par les médecins"
      subtitle={`${formulairesCompletes.length} formulaire${
        formulairesCompletes.length !== 1 ? 's' : ''
      } rempli${formulairesCompletes.length !== 1 ? 's' : ''}`}
    >
      {isLoading ? (
        <LoadingState />
      ) : (
        <>
          {/* --- Barre de recherche --- */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="Rechercher un formulaire, une étude ou un médecin..."
              value={search}
              onChange={(e) => {
                setPage(1);
                setSearch(e.target.value);
              }}
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
                {paginatedItems.map((formulaireEnvoye) => (
                  <div
                    key={formulaireEnvoye.id}
                    className="border border-gray-200 rounded-lg p-4 hover:border-green-300 hover:bg-green-50/30 transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {formulaireEnvoye.formulaire.titre}
                          </h3>
                          <Badge color="green">Complété</Badge>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <BookOpenIcon className="w-4 h-4" />
                            <span>{formulaireEnvoye.formulaire.etude?.titre || 'N/A'}</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <UserIcon className="w-4 h-4" />
                            <span>Rempli par Dr. {formulaireEnvoye.medecin.nom}</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <CalendarDaysIcon className="w-4 h-4" />
                            <span>
                              Complété le{' '}
                              {new Date(formulaireEnvoye.dateCompletion).toLocaleDateString('fr-FR')}
                            </span>
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => router.push(`/formulaire/reponses?id=${formulaireEnvoye.id}`)}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ml-4 flex items-center gap-2"
                      >
                        <ChartBarIcon className="w-5 h-5" />
                        Voir les réponses
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* --- Pagination --- */}
              <div className="flex justify-center items-center gap-4 mt-6">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                  className="px-3 py-1 border rounded disabled:opacity-50"
                >
                  Précédent
                </button>

                <span>
                  Page {page} / {totalPages}
                </span>

                <button
                  disabled={page === totalPages}
                  onClick={() => setPage(page + 1)}
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
  );
});

DataTab.displayName = 'DataTab';
