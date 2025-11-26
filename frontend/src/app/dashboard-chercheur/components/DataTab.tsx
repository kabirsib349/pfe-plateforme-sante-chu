import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/src/hooks/useAuth';
import { Card } from '@/src/components/Card';
import { Badge } from '@/src/components/Badge';
import { ChartBarIcon, BookOpenIcon, UserIcon, CalendarDaysIcon } from '@heroicons/react/24/outline';
import { EmptyState, LoadingState } from '@/src/components/ui';
import { getFormulairesEnvoyes } from '@/src/lib/api';
import { handleError } from '@/src/lib/errorHandler';
import ExportCsvButton from "@/src/components/export/ExportCsvButton";

export const DataTab: React.FC = React.memo(() => {
  const router = useRouter();
  const { token } = useAuth();
  const [formulairesEnvoyes, setFormulairesEnvoyes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  return (
    <Card
      title="Formulaires complétés par les médecins"
      subtitle={`${formulairesCompletes.length} formulaire${
        formulairesCompletes.length !== 1 ? 's' : ''
      } rempli${formulairesCompletes.length !== 1 ? 's' : ''}`}
    >
      {isLoading ? (
        <LoadingState />
      ) : formulairesCompletes.length === 0 ? (
        <EmptyState
          icon={<ChartBarIcon className="w-10 h-10 text-gray-400" />}
          title="Aucune donnée collectée"
          description="Les formulaires remplis par les médecins apparaîtront ici."
        />
      ) : (
        <div className="space-y-4">
          {formulairesCompletes.map((formulaireEnvoye) => (
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

                  <div className="flex items-center gap-3 ml-4">
                      <button
                          onClick={() => router.push(`/formulaire/reponses?id=${formulaireEnvoye.id}`)}
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-2"
                      >
                          <ChartBarIcon className="w-5 h-5" />
                          Voir les réponses
                      </button>

                      { /* Bouton Export CSV */}
                      <ExportCsvButton
                          formulaireMedecinId={formulaireEnvoye.id}
                          variant="icon"
                      />
                  </div>

              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
});

DataTab.displayName = 'DataTab';
