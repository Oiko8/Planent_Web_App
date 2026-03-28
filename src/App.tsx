import { useState } from "react";
import Navbar from "./components/Navbar";
import EventsPage from "./pages/EventsPage"
import WelcomePage from "./pages/WelcomePage"
import './styles/index.css'


type Page = "welcome" | "events";

export default function App() {
    const [page, setPage] = useState<Page>("events");

    return(
        <div>
            {/* navigate bar  */}
            <Navbar onNavigate={(NextPage) => setPage(NextPage as Page)} />
            
            {/* Page content */}
            {page === "events" && <EventsPage />}
            {page === "welcome" && <WelcomePage />}
        </div>
    )
}