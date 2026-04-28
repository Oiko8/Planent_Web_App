import './styles/index.css'
import Navbar from "./components/Navbar";
import EventsPage from "./pages/EventsPage"
import WelcomePage from "./pages/WelcomePage"
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import PendingApprovalPage from "./pages/PendingApprovalPage";
import CreateEventPage from "./pages/CreateEventPage";
import MyEventsPage from "./pages/MyEventsPage";
import AdminPage from "./pages/AdminPage";
import { AuthProvider } from "./context/AuthContext";
import { Routes, Route, useLocation } from "react-router-dom";
import AdminNavbar from "./components/AdminNavbar";

export default function App() {
    const location = useLocation();
    const isAdminRoute = location.pathname.startsWith("/admin");

    return (
        <AuthProvider>
            {isAdminRoute ? <AdminNavbar /> : <Navbar />}
            <Routes>
                <Route path="/" element={<WelcomePage />} />

                <Route path="/admin" element={<AdminPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/pending-approval" element={<PendingApprovalPage />} />
                
                <Route path="/events" element={<EventsPage />} />
                <Route path="/create-event" element={<CreateEventPage />} />
                <Route path="/my-events" element={<MyEventsPage />} />
            
            </Routes>
        </AuthProvider>
    );
}