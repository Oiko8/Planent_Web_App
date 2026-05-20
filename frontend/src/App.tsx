import './styles/index.css'
import { Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import AdminNavbar from "./components/AdminNavbar";
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
import ProfilePage from './pages/users/ProfilePage';

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
            </Routes>
        </>
    );
}