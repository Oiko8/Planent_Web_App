// react context, any component can read something from here directly 
import { createContext, useContext, useState, ReactNode, useEffect, useCallback, useMemo } from "react";
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

    const restoreUser = useCallback(async () => {
        const token = localStorage.getItem("token");

        // no valid token → skip
        if (!token || token === "null" || token === "undefined") {
            setUser(null);
            setAuthLoading(false);
            return;
        }

        try {
            const response = await api.get("/users/me");
            setUser(response.data);
        } catch {
            // token expired or invalid → clean up
            localStorage.removeItem("token");
            setUser(null);
        } finally {
            setAuthLoading(false);
        }
    }, []);

    // on app load — check if token exists and restore user
    useEffect(() => {
        restoreUser();
    }, [restoreUser]);

    // storage listener if multiple tabs are open to refresh auth context (re-restore user)
    useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === "token") {
                setAuthLoading(true);
                restoreUser();
            }
        };

        window.addEventListener("storage", handleStorageChange);
        return () => window.removeEventListener("storage", handleStorageChange);
    }, [restoreUser]);


    function login(user: User) {
        setUser(user);
    }

    function logout() {
        setUser(null);
        localStorage.removeItem("token");
    }

    const contextValue = useMemo(() => ({
        user,
        authLoading,
        login,
        logout
    }), [user, authLoading]); // Re-evaluate only when these change

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used inside AuthProvider");
    return context;
}