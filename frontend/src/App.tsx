import './styles/index.css'
import Navbar from "./components/Navbar";
import EventsPage from "./pages/EventsPage"
import WelcomePage from "./pages/WelcomePage"
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import PendingApprovalPage from "./pages/PendingApprovalPage";
import { AuthProvider } from "./context/AuthContext";
import { Routes, Route } from "react-router-dom";
import CreateEventPage from './pages/CreateEventPage';

export default function App() {
    return(
        <AuthProvider>
            <Navbar />
            <Routes>
                <Route path="/" element={<WelcomePage />} />
                <Route path="/events" element={<EventsPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/pending-approval" element={<PendingApprovalPage />} />
                <Route path="/create-event" element={<CreateEventPage/>} />
            </Routes>
        </AuthProvider>
    )
}