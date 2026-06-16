import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function GuestRoute() {
    const { user } = useAuth();

    // login/register as a signed in user -> redirect to home page
    if (user) {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
}