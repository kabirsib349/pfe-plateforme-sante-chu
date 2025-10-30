import { useCallback } from 'react';

export const useStatsRefresh = () => {
  const triggerStatsRefresh = useCallback(() => {
    // Déclencher un événement personnalisé pour rafraîchir les stats
    window.dispatchEvent(new CustomEvent('refreshStats'));
  }, []);

  return { triggerStatsRefresh };
};