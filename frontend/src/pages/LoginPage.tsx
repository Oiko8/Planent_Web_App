import { useState } from "react";
import api from "../api/axiosConfig";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const { login } = useAuth();
    const navigate = useNavigate();

    // Client-side Validation
    function validateForm(): boolean {
        const errors: Record<string, string> = {};

        if (!username || username.trim() === "") {
            errors.username = "Username is required.";
        }
        if (!password || password.trim() === "") {
            errors.password = "Password is required.";
        }

        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setErrorMessage("");
        setFieldErrors({});

        if (!validateForm()) return;
        localStorage.removeItem("token");

        try {
            const loginResponse = await api.post("/auth/login", { username, password });
            localStorage.setItem("token", loginResponse.data.jwtToken);
            const userResponse = await api.get("/users/me");
            const user = userResponse.data;
            login(user);

            if (user.isAdmin) navigate("/admin");
            else if (user.isApproved) navigate("/");
            else navigate("/pending-approval");
        } catch (error: any) {
            const status = error.response?.status;
            const message = error.response?.data?.detail;
            if (status === 403 && message === "Account is not yet enabled by an administrator.") {
                navigate("/pending-approval");
                return;
            }
            setErrorMessage(message ?? "Login failed. Please try again.");
        }
    }

    function handleFieldChange(field: "username" | "password", value: string) {
        if (field === "username") setUsername(value);
        if (field === "password") setPassword(value);

        if (fieldErrors[field]) {
            setFieldErrors(prev => {
                const copy = { ...prev };
                delete copy[field];
                return copy;
            });
        }
    }

    return (
        <div className="auth-page">
            <div className="auth-card">
                <h1 className="auth-title">Welcome back</h1>
                <p className="auth-subtitle">Sign in to your account</p>

                {/* 🔥 Μετατρέψαμε το div σε form για σωστό UX και υποστήριξη password managers */}
                <form onSubmit={handleSubmit}>

                    {/* Username Field */}
                    <div className="auth-field">
                        <label className="auth-label">Username *</label>
                        <input
                            className={`auth-input ${fieldErrors.username ? "auth-input-error" : ""}`}
                            value={username}
                            onChange={e => handleFieldChange("username", e.target.value)}
                            placeholder="Enter username"
                        />
                        {fieldErrors.username && <span className="error-text">{fieldErrors.username}</span>}
                    </div>

                    {/* Password Field */}
                    <div className="auth-field" style={{ marginTop: "1rem" }}>
                        <label className="auth-label">Password *</label>
                        <input
                            className={`auth-input ${fieldErrors.password ? "auth-input-error" : ""}`}
                            type="password"
                            value={password}
                            onChange={e => handleFieldChange("password", e.target.value)}
                            placeholder="Enter password"
                        />
                        {fieldErrors.password && <span className="error-text">{fieldErrors.password}</span>}
                    </div>

                    {/* Global Backend Errors */}
                    {errorMessage && <p className="auth-error">{errorMessage}</p>}

                    <button className="auth-button" type="submit">Login</button>

                    <p className="auth-footer">
                        Don't have an account?{" "}
                        <span className="auth-link" onClick={() => navigate("/register")}>Sign up</span>
                    </p>
                </form>
            </div>
        </div>
    );
}