import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFormulaires } from '@/src/hooks/useFormulaires';
import { Card } from '@/src/components/Card';
import { Badge } from '@/src/components/Badge';
import { BookOpenIcon, CalendarDaysIcon, ClipboardDocumentListIcon } from '@heroicons/react/24/outline';
import { EmptyState, LoadingState } from '@/src/components/ui';

export const AllFormsTab: React.FC = React.memo(() => {
  const router = useRouter();
  const { formulaires, isLoading, error } = useFormulaires();
  const [expandedForm, setExpandedForm] = useState<number | null>(null);

  const getStatutColor = (statut: string) => {
    switch (statut.toLowerCase()) {
      case 'publie':
      case 'publié':
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
      case 'publié':
        return 'Envoyé';
      case 'brouillon':
        return 'Brouillon';
      default:
        return statut;
    }
  };

  if (isLoading) {
    return <LoadingState message="Chargement des formulaires..." />;
  }

  if (error) {
    return (
      <Card title="Tous mes formulaires">
        <div className="text-center py-12 text-red-600">❌ Erreur: {error}</div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card
        title="Tous mes formulaires"
        subtitle={`${formulaires.length} formulaire${formulaires.length !== 1 ? 's' : ''} au total`}
        action={
          <button
            onClick={() => router.push('/formulaire/nouveau')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2"
          >
            <span>+</span>
            Nouveau formulaire
          </button>
        }
      >
        {formulaires.length === 0 ? (
          <EmptyState
            icon={<span className="text-3xl">✨</span>}
            title="Aucun formulaire créé"
            description="Commencez par créer votre premier formulaire"
            action={
              <button
                onClick={() => router.push('/formulaire/nouveau')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium"
              >
                Créer un formulaire
              </button>
            }
          />
        ) : (
          <div className="space-y-4">
            {formulaires.map((formulaire: any) => (
              <div
                key={formulaire.idFormulaire}
                className="border border-gray-200 rounded-lg overflow-hidden"
              >
                <div
                  className="p-4 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() =>
                    setExpandedForm(
                      expandedForm === formulaire.idFormulaire ? null : formulaire.idFormulaire
                    )
                  }
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{formulaire.titre}</h3>
                        <Badge color={getStatutColor(formulaire.statut)}>
                          {getStatutLabel(formulaire.statut)}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <BookOpenIcon className="w-4 h-4" />
                          {formulaire.etude?.titre || 'N/A'}
                        </span>
                        <span className="flex items-center gap-1">
                          <CalendarDaysIcon className="w-4 h-4" />
                          {new Date(formulaire.dateCreation).toLocaleDateString('fr-FR')}
                        </span>
                        <span className="flex items-center gap-1">
                          <ClipboardDocumentListIcon className="w-4 h-4" />
                          {formulaire.champs?.length || 0} question
                          {(formulaire.champs?.length || 0) !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push('/formulaire');
                        }}
                        className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-xs"
                      >
                        Modifier
                      </button>
                      <span className="text-gray-400">
                        {expandedForm === formulaire.idFormulaire ? '▼' : '▶'}
                      </span>
                    </div>
                  </div>
                </div>

                {expandedForm === formulaire.idFormulaire && (
                  <div className="p-4 bg-white border-t border-gray-200">
                    {formulaire.description && (
                      <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-800">{formulaire.description}</p>
                      </div>
                    )}
                    <h4 className="font-semibold text-gray-900 mb-3">Questions du formulaire :</h4>
                    <div className="space-y-2">
                      {formulaire.champs?.map((champ: any, idx: number) => (
                        <div key={champ.idChamp} className="text-sm text-gray-700">
                          {idx + 1}. {champ.label} ({champ.type})
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
});

AllFormsTab.displayName = 'AllFormsTab';
