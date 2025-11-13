import { useAuthContext } from '../context/AuthContext';

/**
 * Hook simplifié pour accéder à l'authentification
 * Réexporte toutes les propriétés du contexte
 */
export const useAuth = () => {
    return useAuthContext();
};
