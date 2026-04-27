import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";


export default function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate()

    function handleLogout() {
        logout();
        navigate("/");
    }
    
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
                        <button className="borderless-button" onClick={() => navigate("/create-event")}>Create Event</button>
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