import { useAuth } from "../context/AuthContext";

type NavbarProps = {
    onNavigate: (page: string) => void;
};

export default function Navbar({ onNavigate }: NavbarProps) {
    const { user, logout } = useAuth();

    function handleLogout() {
        logout();
        onNavigate("welcome");
    }
    
    return (
        <nav className="navbar">
            <a className="navbar-home">
                <button className="borderless-button" onClick={() => onNavigate("welcome")}>Home</button>
            </a>

            <a className="navbar-search">
                <button className="borderless-button" onClick={() => onNavigate("events")}>&#128269;</button>

                { user ? (
                    // logged in --> show only logout option
                    <button className="borderless-button" onClick={handleLogout}>Logout</button>
                ) : (
                    // logged out --> show login and sign up normal
                    <>
                        <button className="borderless-button" onClick={() => onNavigate("login")}>Login</button>
                        <button className="borderless-button" onClick={() => onNavigate("register")}>Sign up</button>
                    </>
                )}
            </a>
        </nav>

    )
};