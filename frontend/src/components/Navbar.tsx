import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useEffect, useState } from "react";
import api from "../api/axiosConfig";


export default function Navbar() {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();

    function handleLogout() {
        logout();
        navigate("/");
    }

    const [unreadCount, setUnreadCount] = useState(0);
    const location = useLocation();

    // Refetch on login + every route change.
    // The count is a single integer from the DB — no pagination needed.
    useEffect(() => {
        if (!user) {
            setUnreadCount(0);
            return;
        }
        api.get<{ count: number }>("/messages/unread-count")
            .then(res => setUnreadCount(res.data.count))
            .catch(() => { /* silent: badge just stays at previous value */ });
    }, [user, location.pathname]);

    // Cap large counts to "9+" for visual balance (Gmail's pattern)
    const badgeLabel = unreadCount > 9 ? "9+" : unreadCount;

    return (
        <nav className="navbar">
            <a className="navbar-home">
                <button className="borderless-button" onClick={() => navigate("/")}>Home</button>
            </a>

            <a className="navbar-search">
                <button className="borderless-button" onClick={() => navigate("/events")}>&#128269;</button>

                { user ? (
                    <>
                        <button className="borderless-button" onClick={() => navigate("/my-events")}>My Events</button>
                        <button className="borderless-button" onClick={() => navigate("/my-bookings")}>My Bookings</button>
                        <button className="borderless-button" onClick={() => navigate("/messages")}>
                            Messages
                            {unreadCount > 0 && (
                                <span className="admin-badge" style={{ marginLeft: "0.4rem" }}>
                                    {badgeLabel}
                                </span>
                            )}
                        </button>
                        <button className="borderless-button" onClick={handleLogout}>Logout</button>
                    </>
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
            </a>
        </nav>
    );
}