// react context, any component can read something from here directly 
import { createContext, useContext, useState, ReactNode } from "react";
import { User } from "../types/user"

type AuthContextType = {
    user: User | null;
    login:  (user: User) => void;
    logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider( { children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);

    function login(user: User){
        setUser(user);
    }

    function logout(){
        setUser(null);
        localStorage.removeItem("token");
    }


    // the authContext.Provider is wrapper
    // children is a special prop tha represent that you can put several things in this wrapper.
    return (
        <AuthContext.Provider value={{ user, login, logout}}>
            {children}
        </AuthContext.Provider>
    );
}

// custom function so any component can read the context in one line
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used inside AuthProvider");

    return context;
}
