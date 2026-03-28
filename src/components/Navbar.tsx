type NavbarProps = {
    onNavigate: (page: string) => void;
};

export default function Navbar({ onNavigate }: NavbarProps) {
    return (
        <nav>
            <button onClick={() => onNavigate("welcome")}>Home</button>
            <button onClick={() => onNavigate("events")}>Browse Events</button>
            <button onClick={() => onNavigate("login")}>Login</button>
        </nav>
    )
};