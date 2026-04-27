import { useNavigate } from "react-router-dom";

export default function PendingApprovalPage() {
    const navigate = useNavigate()

    return(
        <div className="pending-approval-body">
            <h1>Your registration is pending approval</h1>
            <p>Thank you for signing up! Your account is currently under review. We will notify you via email once your registration has been approved.</p>
            <p>
                In the meantime, feel free to explore our website and discover the exciting events we have to offer.
            </p>
                <button onClick={() => navigate("/")}>Back to Home</button>
            
        </div>

    );
}