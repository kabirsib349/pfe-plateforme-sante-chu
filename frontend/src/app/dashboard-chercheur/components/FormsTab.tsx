import React from 'react';
import { useRouter } from 'next/navigation';
import { useFormulaires } from '@/src/hooks/useFormulaires';
import { Card } from '@/src/components/Card';
import { Badge } from '@/src/components/Badge';
import { DocumentTextIcon } from '@heroicons/react/24/outline';
import { EmptyState, LoadingState } from '@/src/components/ui';

export const FormsTab: React.FC = React.memo(() => {
  const router = useRouter();
  const { formulaires, isLoading } = useFormulaires();

  const getStatutColor = (statut: string) => {
    switch (statut.toLowerCase()) {
      case 'publie':
        return 'green';
      case 'brouillon':
        return 'yellow';
      default:
        return 'blue';
    }
  };

  const getStatutLabel = (statut: string) => {
    switch (statut.toLowerCase()) {
      case 'publie':
        return 'Publié';
      case 'brouillon':
        return 'Brouillon';
      default:
        return statut;
    }
  };

  return (
    <div className="space-y-6">
      <Card
        title="Formulaires créés"
        action={
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <DocumentTextIcon className="w-5 h-5" />
            <span>{formulaires.length} formulaire{formulaires.length !== 1 ? 's' : ''}</span>
          </div>
        }
      >
        {isLoading ? (
          <LoadingState message="Chargement des formulaires..." />
        ) : formulaires.length === 0 ? (
          <EmptyState
            icon={<span className="text-3xl">✨</span>}
            title="Aucun formulaire créé"
            action={
              <button
                onClick={() => router.push('/formulaire/nouveau')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Créer un formulaire
              </button>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nom du formulaire
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Étude
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date création
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {formulaires.slice(0, 5).map((formulaire: any) => (
                  <tr key={formulaire.idFormulaire} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium">{formulaire.titre}</td>
                    <td className="px-4 py-3 text-sm">{formulaire.etude?.titre || 'N/A'}</td>
                    <td className="px-4 py-3 text-sm">
                      {new Date(formulaire.dateCreation).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-4 py-3">
                      <Badge color={getStatutColor(formulaire.statut)}>
                        {getStatutLabel(formulaire.statut)}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {formulaires.length > 5 && (
          <div className="mt-4 text-center">
            <button
              onClick={() => router.push('/formulaire')}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              Voir tous les formulaires ({formulaires.length})
            </button>
          </div>
        )}
      </Card>
    </div>
  );
});

FormsTab.displayName = 'FormsTab';
