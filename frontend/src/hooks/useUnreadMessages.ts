import { useState, useEffect } from 'react';
import { apiUrl } from '@/src/lib/config';

interface UseUnreadMessagesProps {
  userId: number | undefined;
  userRole: 'chercheur' | 'medecin' | undefined;
  isAuthenticated: boolean;
}

export const useUnreadMessages = ({ userId, userRole, isAuthenticated }: UseUnreadMessagesProps) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUnreadCount = async () => {
    if (!userId || !userRole || !isAuthenticated) {
      setUnreadCount(0);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setUnreadCount(0);
        return;
      }

      const response = await fetch(
        apiUrl(`/api/messages/non-lus/${userRole}/${userId}`),
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        // Si 401/403, l'utilisateur n'est pas authentifié, on ignore silencieusement
        if (response.status === 401 || response.status === 403) {
          setUnreadCount(0);
          return;
        }
        throw new Error('Erreur lors de la récupération des messages non lus');
      }

      const count = await response.json();
      setUnreadCount(count);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(errorMessage);
      // Ne pas logger en production
      if (process.env.NODE_ENV === 'development') {
        console.error('Erreur récupération messages non lus:', err);
      }
      setUnreadCount(0);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
  }, [userId, userRole, isAuthenticated]);

  return {
    unreadCount,
    isLoading,
    error,
    refetch: fetchUnreadCount,
  };
};
