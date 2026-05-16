import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type Theme = "dark" | "light";

type ThemeContextType = {
    theme: Theme;
    toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType | null>(null);

// Read the saved theme synchronously so the first render is correct.
// Falls back to the OS preference, then to dark.
function getInitialTheme(): Theme {
    const saved = localStorage.getItem("theme");
    if (saved === "dark" || saved === "light") return saved;
    if (window.matchMedia?.("(prefers-color-scheme: light)").matches) return "light";
    return "dark";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setTheme] = useState<Theme>(getInitialTheme);

    // Apply theme to <html> whenever it changes
    useEffect(() => {
        document.documentElement.setAttribute("data-theme", theme);
        localStorage.setItem("theme", theme);
    }, [theme]);

    function toggleTheme() {
        setTheme(prev => (prev === "dark" ? "light" : "dark"));
    }

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) throw new Error("useTheme must be used inside ThemeProvider");
    return context;
}