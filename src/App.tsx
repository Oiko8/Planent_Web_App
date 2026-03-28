import { useState } from "react";
import Navbar from "./components/Navbar";
import EventsPage from "./pages/EventsPage"
import LoginPage from "./pages/LoginPage"
import WelcomePage from "./pages/WelcomePage"

type Page = "welcome" | "login" | "events";

export default function App() {
    const [page, setPage] = useState<Page>("welcome");

    return (
        <div>
            <Navbar onNavigate={ (nextPage) => setPage(nextPage as Page)} />

            {page === "welcome" && <WelcomePage />}
            {page === "login" && <LoginPage />}
            {page === "events" && <EventsPage />}
        </div>
    );
}