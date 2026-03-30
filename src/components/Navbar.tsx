type NavbarProps = {
    onNavigate: (page: string) => void;
};

export default function Navbar({ onNavigate }: NavbarProps) {
    return (
        <nav className="navbar">
            <a className="navbar-home">
                <button className="borderless-button" onClick={() => onNavigate("welcome")}>Home</button>
            </a>

            <a className="navbar-search">
                <button className="borderless-button" onClick={() => onNavigate("events")}>&#128269;</button>
                <button className="borderless-button" onClick={() => onNavigate("login")}>Login</button>
                <button className="borderless-button" onClick={() => onNavigate("register")}>Sign up</button>
            </a>
        </nav>

    )
};