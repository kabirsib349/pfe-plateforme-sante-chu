import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';

interface DashboardStats {
  totalFormulaires: number;
  brouillons: number;
  envoyes: number;

  activiteRecente: ActivityItem[];
}

interface ActivityItem {
  idActivite: number;
  action: string;
  ressourceType: string;
  ressourceId: number;
  details: string;
  dateCreation: string;
  utilisateur: {
    nom: string;
  };
}

export const useStats = () => {
  const { token } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
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

      // Récupérer les statistiques
      const statsResponse = await fetch('http://localhost:8080/api/formulaires/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!statsResponse.ok) {
        throw new Error('Erreur lors de la récupération des statistiques');
      }

      const statsData = await statsResponse.json();

      // Récupérer l'activité récente
      const activityResponse = await fetch('http://localhost:8080/api/dashboard/activity?limit=5', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      let activityData = [];
      if (activityResponse.ok) {
        activityData = await activityResponse.json();
      }

      setStats({
        totalFormulaires: statsData.totalFormulaires || 0,
        brouillons: statsData.brouillons || 0,
        envoyes: statsData.envoyes || 0,

        activiteRecente: activityData
      });

    } catch (err) {
      console.error('Erreur lors du chargement des statistiques:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
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