import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';

interface FormulaireRecu {
  id: number;
  formulaire: {
    idFormulaire: number;
    titre: string;
    description: string;
    dateCreation: string;
    statut: string;
    champs: any[];
    etude: {
      titre: string;
    };
  };
  chercheur: {
    nom: string;
    email: string;
  };
  dateEnvoi: string;
  statut: string;
  lu: boolean;
  complete: boolean;
}

export const useFormulairesRecus = () => {
  const { token } = useAuth();
  const [formulairesRecus, setFormulairesRecus] = useState<FormulaireRecu[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFormulairesRecus = useCallback(async () => {
    if (!token) {
      console.log('❌ useFormulairesRecus: Pas de token');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      console.log('🔍 useFormulairesRecus: Fetching formulaires reçus...');
      const response = await fetch('http://localhost:8080/api/formulaires/recus', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('📡 useFormulairesRecus: Response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('✅ useFormulairesRecus: Formulaires reçus:', data.length, 'formulaires');
        console.log('📋 useFormulairesRecus: Data:', data);
        setFormulairesRecus(data);
      } else {
        const contentType = response.headers.get("content-type");
        let errorMessage = `Erreur ${response.status}`;
        
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } else {
          const errorText = await response.text();
          errorMessage = errorText || errorMessage;
        }
        
        console.error('❌ useFormulairesRecus: API Error:', response.status, errorMessage);
        setError(errorMessage);
      }
    } catch (err) {
      console.error('❌ useFormulairesRecus: Network Error:', err);
      setError(err instanceof Error ? err.message : 'Erreur réseau');
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchFormulairesRecus();
  }, [fetchFormulairesRecus]);

  return {
    formulairesRecus,
    isLoading,
    error,
    refreshFormulairesRecus: fetchFormulairesRecus
  };
};
