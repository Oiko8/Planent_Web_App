type NavbarProps = {
    onNavigate: (page: string) => void;
};

export default function Navbar({ onNavigate }: NavbarProps) {
    return (
        <nav className="navbar">
            <button onClick={() => onNavigate("welcome")}>Home</button>
            <button onClick={() => onNavigate("events")}>Browse Events</button>
            <button onClick={() => onNavigate("login")}>Login</button>
            <button onClick={() => onNavigate("register")}>Sign up</button>
        </nav>
    )
};