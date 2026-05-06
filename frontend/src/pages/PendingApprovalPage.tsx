import { useNavigate } from "react-router-dom";

export default function PendingApprovalPage() {
    const navigate = useNavigate();

    return (
        <div className="auth-page">
            <div className="auth-card" style={{ textAlign: "center" }}>
                <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>⏳</div>
                <h1 className="auth-title">Pending Approval</h1>
                <p className="auth-subtitle" style={{ marginBottom: "1rem" }}>
                    Thank you for signing up!
                </p>
                <p style={{ color: "#94a3b8", fontSize: "0.9rem", lineHeight: "1.6", marginBottom: "2rem" }}>
                    Your account is currently under review by an administrator.
                    You will be notified once your registration has been approved.
                </p>
                <button className="auth-button" onClick={() => navigate("/")}>
                    Back to Home
                </button>
            </div>
        </div>
    );
}