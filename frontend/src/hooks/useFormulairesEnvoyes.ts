import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';

interface FormulaireEnvoye {
  id: number;
  formulaire: {
    idFormulaire: number;
    titre: string;
    etude: {
      titre: string;
    };
  };
  medecin: {
    nom: string;
    email: string;
  };
  dateEnvoi: string;
  lu: boolean;
  complete: boolean;
  dateCompletion?: string;
}

export const useFormulairesEnvoyes = () => {
  const { token } = useAuth();
  const [formulairesEnvoyes, setFormulairesEnvoyes] = useState<FormulaireEnvoye[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFormulairesEnvoyes = useCallback(async () => {
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      // TODO: Créer l'endpoint backend pour récupérer les formulaires envoyés par le chercheur
      const response = await fetch('http://localhost:8080/api/formulaires/envoyes', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setFormulairesEnvoyes(data);
      } else {
        const errorText = await response.text();
        setError(`Erreur ${response.status}: ${errorText}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur réseau');
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchFormulairesEnvoyes();
  }, [fetchFormulairesEnvoyes]);

  return {
    formulairesEnvoyes,
    isLoading,
    error,
    refreshFormulairesEnvoyes: fetchFormulairesEnvoyes
  };
};
