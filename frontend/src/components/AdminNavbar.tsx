import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

export default function AdminNavbar() {
    const { logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();

    function handleLogout() {
        logout();
        navigate("/login");
    }

    return (
        <nav className="navbar">
            <a className="navbar-home">
                <button className="borderless-button" onClick={() => navigate("/admin")}>
                    Admin Panel
                </button>
            </a>
            <div className="navbar-search">
                <button className="borderless-button" onClick={handleLogout}>
                    Logout
                </button>
                <button
                    className="theme-toggle"
                    onClick={toggleTheme}
                    title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
                    aria-label="Toggle color theme"
                >
                    {theme === "dark" ? "☀️" : "🌙"}
                </button>
            </div>
        </nav>
    );
}