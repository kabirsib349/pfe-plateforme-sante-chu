import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { getFormulairesRecus } from '@/src/lib/api';
import { handleError } from '@/src/lib/errorHandler';
import { config } from '@/src/lib/config';
import type { FormulaireRecuResponse } from '@/src/types';

export const useFormulairesRecus = () => {
  const { token } = useAuth();
  const [formulairesRecus, setFormulairesRecus] = useState<FormulaireRecuResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFormulairesRecus = useCallback(async () => {
    if (!token) {
      if (config.features.enableDebug) {
        console.log('[useFormulairesRecus] No token');
      }
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      if (config.features.enableDebug) {
        console.log('[useFormulairesRecus] Fetching formulaires reçus...');
      }

      const data = await getFormulairesRecus(token);

      if (config.features.enableDebug) {
        console.log('[useFormulairesRecus] Formulaires reçus:', data.length, 'formulaires');
      }

      setFormulairesRecus(data);
    } catch (err) {
      const formattedError = handleError(err, 'useFormulairesRecus');
      setError(formattedError.userMessage);
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
