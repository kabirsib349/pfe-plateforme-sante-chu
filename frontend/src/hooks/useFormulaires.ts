import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';

export const useFormulaires = () => {
  const { token } = useAuth();
  const [formulaires, setFormulaires] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFormulaires = useCallback(async () => {
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      console.log('🔍 Fetching formulaires...');
      const response = await fetch('http://localhost:8080/api/formulaires', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('📡 Response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('📋 Formulaires loaded:', data.length, 'formulaires');
        console.log('📋 Data:', data);
        setFormulaires(data);
      } else {
        const errorText = await response.text();
        console.error('❌ API Error:', response.status, errorText);
        setError(`Erreur ${response.status}: ${errorText}`);
      }
    } catch (err) {
      console.error('❌ Network Error:', err);
      setError(err instanceof Error ? err.message : 'Erreur réseau');
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchFormulaires();
  }, [fetchFormulaires]);

  // Écouter l'événement de rafraîchissement
  useEffect(() => {
    const handleRefresh = () => {
      setTimeout(() => {
        fetchFormulaires();
      }, 500);
    };

    window.addEventListener('refreshStats', handleRefresh);
    return () => window.removeEventListener('refreshStats', handleRefresh);
  }, [fetchFormulaires]);

  return {
    formulaires,
    isLoading,
    error,
    refreshFormulaires: fetchFormulaires
  };
};