import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function ProtectedRoute() {
    const { user } = useAuth();

    // not logged in -> prompt to login
    if (!user) {
        return <Navigate to="/login" replace />;
    }


    return <Outlet />;
}