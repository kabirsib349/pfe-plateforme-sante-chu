import { useAuthContext } from "../context/AuthContext";

export const useAuth = () => {
    const { user, token, login, logout } = useAuthContext();
    const isAuthenticated = !!token;
    return { user, token, login, logout, isAuthenticated };
};
