import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { getUserInfo } from "../lib/api";

interface User{
    nom: string;
    email: string;
    role: string;
}
interface AuthContextType {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (token: string) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const savedToken = localStorage.getItem("token");
        if (savedToken){
            setToken(savedToken);
            fetchUserInfo(savedToken);
        } else {
            setIsLoading(false);
        }
    }, []);

    const fetchUserInfo = async (token: string) => {
        if (!token) {
            setIsLoading(false);
            return;
        }
        try{
            const userInfo = await getUserInfo(token);
            setUser(userInfo);
            setIsAuthenticated(true);
        }catch (error){
            console.error(error);
            logout();
        } finally {
            setIsLoading(false);
        }
    }

    const login = (token: string) => {
        setToken(token);
        localStorage.setItem("token", token);
        fetchUserInfo(token);
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem("token");
        setIsAuthenticated(false);
    };

    return (
        <AuthContext.Provider value={{ user, token, isAuthenticated, isLoading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

// Hook de lecture du contexte
export const useAuthContext = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuthContext doit être utilisé à l'intérieur d'un AuthProvider");
    }
    return context;
};
