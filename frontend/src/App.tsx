import './styles/index.css'
import { useState, useEffect } from "react";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import api from "./api/axiosConfig";
import Navbar from "./components/Navbar";
import AdminNavbar from "./components/AdminNavbar";
import SplashScreen from './components/SplashScreen';
import WelcomePage from "./pages/WelcomePage";
import EventsPage from "./pages/events/EventsPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import PendingApprovalPage from "./pages/PendingApprovalPage";
import CreateEventPage from "./pages/events/CreateEventPage";
import MyEventsPage from "./pages/events/MyEventsPage";
import AdminPage from "./pages/admin/AdminPage";
import EditEventPage from './pages/events/EditEventPage';
import EventDetailPage from './pages/events/EventDetailPage';
import MyBookingsPage from './pages/bookings/MyBookingPage';
import BookingPage from './pages/bookings/BookingPage';
import MessagePage from './pages/messages/MessagePage';
import ComposeMessagePage from './pages/messages/ComposeMessagePage';
import EventBookingsPage from './pages/events/EventBookingsPage';
import NewMessagePage from './pages/messages/NewMessagePage';
import BroadcastMessagePage from './pages/messages/BroadcastMessagePage';
import MessageDetailPage from './pages/messages/MessageDetailPage';
import ProfilePage from './pages/users/ProfilePage';

export default function App() {
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    );
}

function AppContent() {
    const { user, authLoading, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const isAdminRoute = location.pathname === "/admin";

    const [showSplash, setShowSplash] = useState(() => location.pathname === "/");

    // Global interceptor for unauthorized/forbidden responses (prompt to login)
    useEffect(() => {
        const interceptor = api.interceptors.response.use(
            (response) => response, // successful response
            (error) => { // unsuccessful
                // 401 or 403
                if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                    logout();
                    navigate("/login", { replace: true });
                }
                return Promise.reject(error);
            }
        );

        return () => api.interceptors.response.eject(interceptor);
    }, [navigate, logout]);

    // interceptor for admin page
    useEffect(() => {
        // not logged in and going to /admin -> /login page
        if (!authLoading && !user && isAdminRoute) {
            navigate("/login", { replace: true });
            return;
        }

        // logged in but not admin and going to /admin -> /events page
        if (!authLoading && user && !user.isAdmin && isAdminRoute) {
            navigate("/events", { replace: true });
            return;
        }

        // logged in and admin but not in /admin -> force in /admin page
        if (!authLoading && user?.isAdmin && !isAdminRoute) {
            navigate("/admin", { replace: true });
        }
    }, [user, authLoading, isAdminRoute, location.pathname, navigate]);

    if (authLoading) return null;

    return (
        <>
            {showSplash && <SplashScreen onDismiss={() => setShowSplash(false)} />}

            {isAdminRoute ? <AdminNavbar /> : <Navbar />}
            <Routes>
                <Route path="/" element={<WelcomePage />} />

                <Route path="/admin" element={<AdminPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/pending-approval" element={<PendingApprovalPage />} />

                <Route path="/profile" element={<ProfilePage />} />

                <Route path="/events" element={<EventsPage />} />
                <Route path="/events/:eventId" element={<EventDetailPage />} />
                <Route path="/create-event" element={<CreateEventPage />} />
                <Route path="/edit-event/:eventId" element={<EditEventPage />} />

                <Route path="/my-events" element={<MyEventsPage />} />
                <Route path="/my-events/:eventId/bookings" element={<EventBookingsPage />} />
                <Route path="/my-events/:eventId/broadcast" element={<BroadcastMessagePage />} />

                <Route path="/my-bookings" element={<MyBookingsPage />} />
                <Route path="/book/:eventId" element={<BookingPage />} />

                <Route path="/messages" element={<MessagePage />} />
                <Route path="/messages/new" element={<NewMessagePage />} />
                <Route path="/messages/compose" element={<ComposeMessagePage />} />
                <Route path="/messages/:messageId" element={<MessageDetailPage />} />
            </Routes>
        </>
    );
}