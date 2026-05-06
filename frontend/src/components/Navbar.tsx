import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import api from "../api/axiosConfig";


export default function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate()

    function handleLogout() {
        logout();
        navigate("/");
    }

    const [unreadCount, setUnreadCount] = useState(0);

    const location = useLocation();

    useEffect(() => {
        if (!user) return;
        api.get("/messages/inbox")
            .then(res => {
                const unread = res.data.content.filter((m: any) => !m.isRead).length;
                setUnreadCount(unread);
            })
            .catch(() => {});
    }, [user, location.pathname]);
    
    return (
        <nav className="navbar">
            <a className="navbar-home">
                <button className="borderless-button" onClick={() => navigate("/")}>Home</button>
            </a>

            <a className="navbar-search">
                <button className="borderless-button" onClick={() => navigate("/events")}>&#128269;</button>
                {/* <button className="borderless-button" onClick={() => navigate("/create-event")}>Create Event</button> */}
                
                { user ? (
                    // logged in --> show only logout option
                    <>
                        <button className="borderless-button" onClick={() => navigate("/my-events")}>My Events</button>
                        <button className="borderless-button" onClick={() => navigate("/my-bookings")}>My Bookings</button>
                        <button className="borderless-button" onClick={() => navigate("/messages")}>
                            Messages
                            {unreadCount > 0 && <span className="admin-badge" style={{ marginLeft: "0.4rem" }}>{unreadCount}</span>}
                        </button>
                        <button className="borderless-button" onClick={handleLogout}>Logout</button>
                    </>
                ) : (
                    // logged out --> show login and sign up normal
                    <>
                        <button className="borderless-button" onClick={() => navigate("/login")}>Login</button>
                        <button className="borderless-button" onClick={() => navigate("/register")}>Sign up</button>
                    </>
                )}
            </a>
        </nav>

    )
};