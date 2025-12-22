import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/src/hooks/useAuth';
import { Card } from '@/src/components/Card';
import { Badge } from '@/src/components/Badge';
import { ChartBarIcon, BookOpenIcon, UserIcon, CalendarDaysIcon } from '@heroicons/react/24/outline';
import { EmptyState, LoadingState } from '@/src/components/ui';
import { getFormulairesEnvoyes, getPatientIdentifiers, getReponses } from '@/src/lib/api';
import { handleError } from '@/src/lib/errorHandler';

const ITEMS_PER_PAGE = 5;

export const DataTab: React.FC = React.memo(() => {
  const router = useRouter();
  const { token } = useAuth();
  const [formulairesEnvoyes, setFormulairesEnvoyes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [aggregated, setAggregated] = useState<any[]>([]); // aggregated per formulaire

  useEffect(() => {
    const fetchFormulairesEnvoyes = async () => {
      if (!token) return;

      try {
        const data = await getFormulairesEnvoyes(token);
        setFormulairesEnvoyes(data);

        // Aggregate by formulaire.idFormulaire, tracking latest timestamp per formulaire
        const map = new Map<number, { formulaire: any; patientIds: Set<string>; totalResponses: number; latestTimestamp: number }>();
        for (const fe of data) {
          const fid = fe.formulaire.idFormulaire;
          const ts = fe.dateCompletion ? new Date(fe.dateCompletion).getTime() : (fe.dateEnvoi ? new Date(fe.dateEnvoi).getTime() : 0);
          if (!map.has(fid)) {
            map.set(fid, { formulaire: fe.formulaire, patientIds: new Set(), totalResponses: 0, latestTimestamp: ts });
          } else {
            const curr = map.get(fid)!;
            if (ts > (curr.latestTimestamp || 0)) curr.latestTimestamp = ts;
          }
        }

        // For each FormulaireMedecin entry, try to fetch patient identifiers; if not available, fetch full responses and derive identifiers
        await Promise.all(data.map(async (fe: any) => {
          try {
            const entry = map.get(fe.formulaire.idFormulaire);
            if (!entry) return;

            let ids: string[] = [];
            try {
              ids = await getPatientIdentifiers(token, fe.id);
            } catch (e) {
              // endpoint may not exist or fail — we'll fallback to fetching responses
            }

            if (!ids || ids.length === 0) {
              // fallback: fetch responses and extract patientIdentifier from multiple possible keys
              try {
                const reps = await getReponses(token, fe.id);
                // helper to pick patient id from a response object
                const extractPatientId = (r: any): string | null => {
                  if (!r) return null;
                  const candidates = [
                    r.patientIdentifier,
                    r.patientId,
                    r.patient?.id,
                    r.patient?.identifier,
                    r.patient?.identifierValue,
                    r.patient_identifier,
                    r.patient_identifier_value,
                    r.identifier,
                    r.patientIdentifierValue,
                  ];
                  for (const c of candidates) {
                    if (c !== undefined && c !== null && String(c).trim() !== '') return String(c);
                  }
                  // try if response has a champ named IDENTIFIANT or similar
                  if (r.champ && r.champ.nomVariable) {
                    const v = r.valeur;
                    if (v !== undefined && v !== null && String(v).trim() !== '') return String(v);
                  }
                  return null;
                };

                const extractedSet = new Set<string>();
                reps.forEach((r: any) => {
                  const pid = extractPatientId(r);
                  if (pid) extractedSet.add(pid);
                });

                if (extractedSet.size > 0) {
                  extractedSet.forEach(id => entry.patientIds.add(id));
                } else {
                  // No patient identifiers found inside responses: count this FormulaireMedecin as one patient
                  entry.patientIds.add(`fm-${fe.id}`);
                }

                entry.totalResponses += reps.length;
              } catch (err) {
                // if even this fails, as a last resort count the envoi as one patient
                entry.patientIds.add(`fm-${fe.id}`);
              }
            } else {
              ids.forEach((id) => entry.patientIds.add(id));
              entry.totalResponses += ids.length;
            }

            const ts = fe.dateCompletion ? new Date(fe.dateCompletion).getTime() : (fe.dateEnvoi ? new Date(fe.dateEnvoi).getTime() : 0);
            if (ts > (entry.latestTimestamp || 0)) entry.latestTimestamp = ts;
          } catch (e) {
            // ignore individual failures
          }
        }));

        const agg = Array.from(map.values()).map(v => ({
          formulaire: v.formulaire,
          patientsCount: v.patientIds.size,
          totalResponses: v.totalResponses,
          latestTimestamp: v.latestTimestamp || 0
        }));

        // Sort by latestTimestamp descending (most recent first)
        agg.sort((a, b) => (b.latestTimestamp || 0) - (a.latestTimestamp || 0));

        setAggregated(agg);

      } catch (error) {
        handleError(error, 'FetchFormulairesEnvoyes');
      } finally {
        setIsLoading(false);
      }
    };

    fetchFormulairesEnvoyes();
  }, [token]);

  const formulairesCompletes = formulairesEnvoyes.filter((f) => f.complete);

  // Filter aggregated by formulaire titre / etude
  const filtered = aggregated.filter((a) => {
    const q = search.toLowerCase();
    const titre = (a.formulaire?.titre || "").toLowerCase();
    const etudeTitre = (a.formulaire?.etude?.titre || "").toLowerCase();
    return titre.includes(q) || etudeTitre.includes(q);
  });

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginatedItems = filtered.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  return (
    <Card
      title="Formulaires complétés"
      subtitle={`${formulairesCompletes.length} formulaire${formulairesCompletes.length !== 1 ? 's' : ''} rempli${formulairesCompletes.length !== 1 ? 's' : ''}`}
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

                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <BookOpenIcon className="w-4 h-4" />
                            <span>{item.formulaire.etude?.titre || 'N/A'}</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <UserIcon className="w-4 h-4" />
                            <span>Patients: {item.patientsCount}</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <CalendarDaysIcon className="w-4 h-4" />
                            <span>Réponses totales: {item.totalResponses}</span>
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => router.push(`/formulaire/reponses?formulaireId=${item.formulaire.idFormulaire}`)}
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
