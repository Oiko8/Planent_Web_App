import { useState } from "react";
import './styles/index.css'
import Navbar from "./components/Navbar";
import EventsPage from "./pages/EventsPage"
import WelcomePage from "./pages/WelcomePage"
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import PendingApprovalPage from "./pages/PendingApprovalPage";


type Page = "welcome" | "events" | "login" | "register" | "pendingApproval";

export default function App() {
    const [page, setPage] = useState<Page>("welcome");

    return(
        <div>
            {/* navigate bar  */}
            <Navbar onNavigate={(NextPage) => setPage(NextPage as Page)} />
            
            {/* Page content */}
            {page === "welcome" && <WelcomePage onNavigate={(nextPage) => setPage(nextPage as Page)} />}
            
            {page === "events" && <EventsPage />}

            {page === "login" && <LoginPage onNavigate={(nextPage) => setPage(nextPage as Page)}/>}

            {page === "register" && <RegisterPage onNavigate={(nextPage) => setPage(nextPage as Page)}/> }
            
            {page === "pendingApproval" && <PendingApprovalPage onNavigate={(nextPage) => setPage(nextPage as Page)}/> }
            
        </div>
    )
}