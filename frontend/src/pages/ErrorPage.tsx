import { useNavigate } from "react-router-dom";

type ErrorPageProps = {
    code?: 403 | 404;
};

export default function ErrorPage({ code = 404 }: ErrorPageProps) {
    const navigate = useNavigate();

    const errorConfigs = {
        403: {
            title: "Access Denied",
            message: "You do not have permission to view or manage this page."
        },
        404: {
            title: "Page Not Found",
            message: "The page you are looking for does not exist or has been moved."
        }
    };

    const { title, message } = errorConfigs[code];

    return (
        <div className="auth-page">
            <div className="auth-card auth-card-error">
                <h1 className="auth-title">{title}</h1>
                <p className="auth-subtitle">{message}</p>
                <button
                    className="auth-button"
                    type="button"
                    onClick={() => navigate(-1)}
                >
                    ← Go Back
                </button>
            </div>
        </div>
    );
}