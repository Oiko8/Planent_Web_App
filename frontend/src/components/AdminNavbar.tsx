import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AdminNavbar() {
    const { logout } = useAuth();
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
            </div>
        </nav>
    );
}