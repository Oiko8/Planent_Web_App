import { useState } from "react";
import api from "../api/axiosConfig";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const { login } = useAuth();
    const navigate = useNavigate();

    async function handleLogin() {
        if (!username || !password) {
            setErrorMessage("Please fill in all the fields");
            return;
        }
        setErrorMessage("");
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

    return (
        <div className="auth-page">
            <div className="auth-card">
                <h1 className="auth-title">Welcome back</h1>
                <p className="auth-subtitle">Sign in to your account</p>

                <div className="auth-field">
                    <label className="auth-label">Username</label>
                    <input
                        className="auth-input"
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        placeholder="Enter username"
                    />
                </div>

                <div className="auth-field">
                    <label className="auth-label">Password</label>
                    <input
                        className="auth-input"
                        type="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="Enter password"
                        onKeyDown={e => e.key === "Enter" && handleLogin()}
                    />
                </div>

                {errorMessage && <p className="auth-error">{errorMessage}</p>}

                <button className="auth-button" onClick={handleLogin}>Login</button>

                <p className="auth-footer">
                    Don't have an account?{" "}
                    <span className="auth-link" onClick={() => navigate("/register")}>Sign up</span>
                </p>
            </div>
        </div>
    );
}