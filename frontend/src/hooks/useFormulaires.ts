import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { getFormulaires } from '@/src/lib/api';
import { handleError } from '@/src/lib/errorHandler';
import { config } from '@/src/lib/config';

export const useFormulaires = () => {
  const { token } = useAuth();
  const [formulaires, setFormulaires] = useState<any[]>([]);
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

      if (config.features.enableDebug) {
        console.log('[useFormulaires] Fetching formulaires...');
      }

      const data = await getFormulaires(token);

      if (config.features.enableDebug) {
        console.log('[useFormulaires] Formulaires loaded:', data.length, 'formulaires');
      }

      setFormulaires(data);
    } catch (err) {
      const formattedError = handleError(err, 'useFormulaires');
      setError(formattedError.userMessage);
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