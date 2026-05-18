import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

type UserMenuProps = {
    unreadCount: number;
};

export default function UserMenu({ unreadCount }: UserMenuProps) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Close on outside click
    useEffect(() => {
        if (!open) return;
        function handleClick(e: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, [open]);

    // Close on Escape
    useEffect(() => {
        if (!open) return;
        function handleKey(e: KeyboardEvent) {
            if (e.key === "Escape") setOpen(false);
        }
        document.addEventListener("keydown", handleKey);
        return () => document.removeEventListener("keydown", handleKey);
    }, [open]);

    function go(path: string) {
        setOpen(false);
        navigate(path);
    }

    function handleLogout() {
        setOpen(false);
        logout();
        navigate("/");
    }

    if (!user) return null;

    const badgeLabel = unreadCount > 9 ? "9+" : unreadCount;

    return (
        <div className="user-menu" ref={menuRef}>
            <button
                className="user-menu-trigger"
                onClick={() => setOpen(prev => !prev)}
                aria-haspopup="menu"
                aria-expanded={open}
            >
                {user.username}
                {unreadCount > 0 && <span className="admin-badge">{badgeLabel}</span>}
                <span className={`user-menu-caret ${open ? "user-menu-caret-open" : ""}`}>▾</span>
            </button>

            {open && (
                <div className="user-menu-dropdown" role="menu">
                    <div className="user-menu-header">
                        <p className="user-menu-name">{user.firstName} {user.lastName}</p>
                        <p className="user-menu-email">{user.email}</p>
                    </div>

                    <button className="user-menu-item" onClick={() => go("/my-events")}>
                        My Events
                    </button>
                    <button className="user-menu-item" onClick={() => go("/my-bookings")}>
                        My Bookings
                    </button>
                    <button className="user-menu-item" onClick={() => go("/messages")}>
                        My Messages
                        {unreadCount > 0 && <span className="admin-badge">{badgeLabel}</span>}
                    </button>
                    <button className="user-menu-item" onClick={() => go("/profile")}>
                        My Profile
                    </button>

                    <div className="user-menu-divider" />

                    <button
                        className="user-menu-item user-menu-item-danger"
                        onClick={handleLogout}
                    >
                        Logout
                    </button>
                </div>
            )}
        </div>
    );
}