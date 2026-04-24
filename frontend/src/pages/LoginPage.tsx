import { useState } from "react";
import api from "../api/axiosConfig";
import { useAuth } from "../context/AuthContext";

type LoginPageProps = {
    onNavigate: (page: string) => void;
}


export default function LoginPage({ onNavigate }: LoginPageProps) {
    const [username, setUsername] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [errorMessage, setErrorMessage] = useState<string>("");

    const { login } = useAuth(); // returns the whole auth context

    async function handleLogin() {
        if (!username || !password) {
        setErrorMessage("Please fill in all the fields");
        return;
        }

    setErrorMessage("");
    localStorage.removeItem("token");

    try {
        // 1. Login and get the token
        const loginResponse = await api.post("/auth/login", { username, password });
        const token = loginResponse.data.jwtToken;
        
        // 2. Store the token in localStorage for the rest of the session
        localStorage.setItem("token", token);
        console.log("Token stored:", localStorage.getItem("token"));

        // 3. fetch the current user
        const userResponse = await api.get("/users/me");
        const user = userResponse.data;

        // 4. store user in the Auth context
        login(user);


        // 5. navigate based on approval status
        if (user.isApproved) {
            onNavigate("welcome");
        } else {
            onNavigate("pendingApproval");
        }

        }
        catch ( error:any ){
            console.log("Full error:", error);
            console.log("Response data:", error.response?.data);
            console.log("Status:", error.response?.status);
            
            const status = error.response?.status;
            const message = error.response?.data?.detail;

            if (status === 403 && message === "Account is not yet enabled by an administrator.") {
                onNavigate("pendingApproval");
                return;
            }

            setErrorMessage(message ?? "Login failed. Please try again.");
        }

    }

    return (
        <div className="login-body">
        <h1 className="header">Login</h1>

        <div>
            <label>Username</label>
            <br />
            <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter username"
            />
        </div>

        <div>
            <label>Password</label>
            <br />
            <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            />
        </div>

        {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}

        <button className="login-button" onClick={handleLogin}>Login</button>

        <p>
            Don't have an account?{" "}
            <button className="login-button" onClick={() => onNavigate("register")}>Sign up</button>
        </p>
        </div>
    );

}