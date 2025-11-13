import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { getFormulairesEnvoyes } from '@/src/lib/api';
import { handleError } from '@/src/lib/errorHandler';
import { config } from '@/src/lib/config';
import type { FormulaireEnvoyeResponse } from '@/src/types';

export const useFormulairesEnvoyes = () => {
  const { token } = useAuth();
  const [formulairesEnvoyes, setFormulairesEnvoyes] = useState<FormulaireEnvoyeResponse[]>([]);
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
      
      const data = await getFormulairesEnvoyes(token);
      
      if (config.features.enableDebug) {
        console.log('✅ useFormulairesEnvoyes:', data.length, 'formulaires');
      }
      
      setFormulairesEnvoyes(data);
    } catch (err) {
      const formattedError = handleError(err, 'useFormulairesEnvoyes');
      setError(formattedError.userMessage);
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
