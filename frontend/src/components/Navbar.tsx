import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useEffect, useState } from "react";
import api from "../api/axiosConfig";
import UserMenu from "./UserMenu";


export default function Navbar() {
    const { user } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();

    const [unreadCount, setUnreadCount] = useState(0);
    const location = useLocation();

    useEffect(() => {
        if (!user) {
            setUnreadCount(0);
            return;
        }
        api.get<{ count: number }>("/messages/unread-count")
            .then(res => setUnreadCount(res.data.count))
            .catch(() => { /* silent: badge keeps previous value */ });
    }, [user, location.pathname]);

    return (
        <nav className="navbar">
            <a className="navbar-home">
                <button className="borderless-button" onClick={() => navigate("/")}>Home</button>
            </a>

            <div className="navbar-search">
                <button className="borderless-button" onClick={() => navigate("/events")}>&#128269;</button>

                {user ? (
                    <UserMenu unreadCount={unreadCount} />
                ) : (
                    <>
                        <button className="borderless-button" onClick={() => navigate("/login")}>Login</button>
                        <button className="borderless-button" onClick={() => navigate("/register")}>Sign up</button>
                    </>
                )}

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