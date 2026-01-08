'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/src/hooks/useAuth';
import { handleError } from '@/src/lib/errorHandler';
import { config } from '@/src/lib/config';

// Définition des types pour correspondre aux modèles du backend
interface QuestionTheme {
  id: number;
  label: string;
  type: string;
  nomVariable: string;
  obligatoire: boolean;
  estSupprimable: boolean;
}

interface Theme {
  id: number;
  nom: string;
  description: string;
  questions: QuestionTheme[];
}

export default function ManageThemesPage() {
  const { token } = useAuth();
  const [themes, setThemes] = useState<Theme[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      const fetchThemes = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const response = await fetch(`${config.api.baseUrl}/api/themes`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
          }

          const data: Theme[] = await response.json();
          setThemes(data);

        } catch (err: any) {
          const formattedError = handleError(err, 'FetchThemes');
          setError(formattedError.userMessage);
        } finally {
          setIsLoading(false);
        }
      };

      fetchThemes();
    }
  }, [token]);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Gestion des Thèmes</h1>
          <p className="text-sm text-gray-600">
            Créez et gérez les thèmes de questions réutilisables pour vos formulaires.
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6">
            {isLoading && <p className="text-center text-gray-500">Chargement des thèmes...</p>}
            {error && <p className="text-center text-red-500">Erreur: {error}</p>}
            
            {!isLoading && !error && (
              <ul className="space-y-4">
                {themes.length > 0 ? (
                  themes.map(theme => (
                    <li key={theme.id} className="border border-gray-200 rounded-lg p-4">
                      <h2 className="font-semibold text-lg text-gray-800">{theme.nom}</h2>
                      <p className="text-sm text-gray-500">{theme.description}</p>
                      <p className="text-xs text-gray-400 mt-2">{theme.questions.length} question(s)</p>
                    </li>
                  ))
                ) : (
                  <p className="text-center text-gray-500">Aucun thème trouvé. Commencez par en créer un.</p>
                )}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
