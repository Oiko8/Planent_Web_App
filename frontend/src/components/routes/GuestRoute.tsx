import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function GuestRoute() {
    const { user } = useAuth();

    // login/register as a signed in user -> redirect to events page
    if (user) {
        return <Navigate to="/events" replace />;
    }

    return <Outlet />;
}