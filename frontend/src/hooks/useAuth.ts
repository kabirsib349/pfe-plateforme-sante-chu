import { useAuthContext } from "../context/AuthContext";

export const useAuth = () => {
    const { user, token, login, logout, isAuthenticated, isLoading } = useAuthContext();
    return { user, token, login, logout, isAuthenticated, isLoading };
};
