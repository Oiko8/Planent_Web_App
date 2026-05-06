// react context, any component can read something from here directly 
import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { User } from "../types/user";
import api from "../api/axiosConfig";

type AuthContextType = {
    user: User | null;
    authLoading: boolean;
    login: (user: User) => void;
    logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [authLoading, setAuthLoading] = useState(true);

    // on app load — check if token exists and restore user
    useEffect(() => {
        async function restoreUser() {
            const token = localStorage.getItem("token");

            // no valid token → skip
            if (!token || token === "null" || token === "undefined") {
                setAuthLoading(false);
                return;
            }

            try {
                const response = await api.get("/users/me");
                setUser(response.data);
            } catch {
                // token expired or invalid → clean up
                localStorage.removeItem("token");
            } finally {
                setAuthLoading(false);
            }
        }

        restoreUser();
    }, []);

    function login(user: User) {
        setUser(user);
    }

    function logout() {
        setUser(null);
        localStorage.removeItem("token");
    }

    return (
        <AuthContext.Provider value={{ user, authLoading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used inside AuthProvider");
    return context;
}