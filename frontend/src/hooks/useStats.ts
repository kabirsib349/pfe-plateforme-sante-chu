import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { getStats } from '@/src/lib/api';
import { handleError } from '@/src/lib/errorHandler';
import type { Stats } from '@/src/types';

export const useStats = () => {
  const { token } = useAuth();
  const [stats, setStats] = useState<Stats>({
    totalFormulaires: 0,
    brouillons: 0,
    envoyes: 0,
    activiteRecente: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const statsData = await getStats(token);
      
      setStats({
        totalFormulaires: statsData.totalFormulaires || 0,
        brouillons: statsData.brouillons || 0,
        envoyes: statsData.envoyes || 0,
        activiteRecente: statsData.activiteRecente || []
      });
    } catch (err) {
      const formattedError = handleError(err, 'useStats');
      setError(formattedError.userMessage);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Écouter l'événement de rafraîchissement
  useEffect(() => {
    const handleRefresh = () => {
      setTimeout(() => {
        fetchStats();
      }, 500);
    };

    window.addEventListener('refreshStats', handleRefresh);
    return () => window.removeEventListener('refreshStats', handleRefresh);
  }, [fetchStats]);

  const refreshStats = useCallback(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    isLoading,
    error,
    refreshStats
  };
};
