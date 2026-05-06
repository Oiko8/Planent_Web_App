import './styles/index.css'
import { Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import AdminNavbar from "./components/AdminNavbar";
import WelcomePage from "./pages/WelcomePage";
import EventsPage from "./pages/EventsPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import PendingApprovalPage from "./pages/PendingApprovalPage";
import CreateEventPage from "./pages/CreateEventPage";
import MyEventsPage from "./pages/MyEventsPage";
import AdminPage from "./pages/AdminPage";
import EditEventPage from './pages/EditEventPage';
import EventDetailPage from './pages/EventDetailPage';
import MyBookingsPage from './pages/MyBookingPage';
import BookingPage from './pages/BookingPage';

export default function App() {
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    );
}

function AppContent() {
    const { authLoading } = useAuth();
    const location = useLocation();
    const isAdminRoute = location.pathname.startsWith("/admin");

    // wait for auth to restore before rendering anything
    if (authLoading) return null;

    return (
        <>
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
                <Route path="/edit-event/:eventId" element={<EditEventPage />} />
                <Route path="/events/:eventId" element={<EventDetailPage />} />

                <Route path="/my-bookings" element={<MyBookingsPage />} />
                <Route path="/book/:eventId" element={<BookingPage />} />

            </Routes>
        </>
    );
}