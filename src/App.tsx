import { useState } from "react";
import './styles/index.css'
import Navbar from "./components/Navbar";
import EventsPage from "./pages/EventsPage"
import WelcomePage from "./pages/WelcomePage"
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";


type Page = "welcome" | "events" | "login" | "register";

export default function App() {
    const [page, setPage] = useState<Page>("welcome");

    return(
        <div>
            {/* navigate bar  */}
            <Navbar onNavigate={(NextPage) => setPage(NextPage as Page)} />
            
            {/* Page content */}
            {page === "welcome" && <WelcomePage />}
            
            {page === "events" && <EventsPage />}

            {page === "login" && <LoginPage onNavigate={(nextPage) => setPage(nextPage as Page)}/>}

            {page === "register" && <RegisterPage />}
        </div>
    )
}