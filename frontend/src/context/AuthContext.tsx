import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { getUserInfo, ApiException } from '../lib/api';
import { config } from '../lib/config';
import type { User } from '@/src/types';

interface AuthContextType {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
    login: (token: string) => Promise<void>;
    logout: () => void;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    /**
     * Récupère les informations de l'utilisateur depuis l'API
     */
    const fetchUserInfo = useCallback(async (authToken: string): Promise<void> => {
        if (!authToken) {
            setIsLoading(false);
            return;
        }

        try {
            setError(null);
            const userInfo = await getUserInfo(authToken);
            setUser(userInfo);
            setIsAuthenticated(true);
        } catch (err) {
            console.error('Erreur lors de la récupération des infos utilisateur:', err);
            
            if (err instanceof ApiException) {
                setError(err.message);
                
                // Si le token est invalide, on déconnecte l'utilisateur
                if (err.status === 401 || err.status === 403) {
                    logout();
                }
            } else {
                setError('Une erreur inattendue est survenue');
            }
        } finally {
            setIsLoading(false);
        }
    }, []);

    /**
     * Initialisation : vérifie si un token existe dans le localStorage
     */
    useEffect(() => {
        const savedToken = localStorage.getItem(config.storage.tokenKey);
        
        if (savedToken) {
            setToken(savedToken);
            fetchUserInfo(savedToken);
        } else {
            setIsLoading(false);
        }
    }, [fetchUserInfo]);

    /**
     * Connexion de l'utilisateur
     */
    const login = useCallback(async (authToken: string): Promise<void> => {
        setToken(authToken);
        localStorage.setItem(config.storage.tokenKey, authToken);
        await fetchUserInfo(authToken);
    }, [fetchUserInfo]);

    /**
     * Déconnexion de l'utilisateur
     */
    const logout = useCallback(() => {
        setToken(null);
        setUser(null);
        setIsAuthenticated(false);
        setError(null);
        localStorage.removeItem(config.storage.tokenKey);
    }, []);

    /**
     * Rafraîchir les informations de l'utilisateur
     */
    const refreshUser = useCallback(async (): Promise<void> => {
        if (token) {
            await fetchUserInfo(token);
        }
    }, [token, fetchUserInfo]);

    const value: AuthContextType = {
        user,
        token,
        isAuthenticated,
        isLoading,
        error,
        login,
        logout,
        refreshUser,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

/**
 * Hook pour accéder au contexte d'authentification
 */
export const useAuthContext = (): AuthContextType => {
    const context = useContext(AuthContext);
    
    if (!context) {
        throw new Error('useAuthContext doit être utilisé à l\'intérieur d\'un AuthProvider');
    }
    
    return context;
};
