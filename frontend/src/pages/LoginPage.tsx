import { useState } from "react";

type LoginPageProps = {
  onNavigate: (page: string) => void;
};

export default function LoginPage({ onNavigate }: LoginPageProps) {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  return (
    <div className="login-body">
      <h1 className="header">Login</h1>

      {/* Username */}
      <div>
        <label>Username</label>
        <br></br>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter username"
        />
      </div>

      {/* Password */}
      <div>
        <label>Password</label>
        <br></br>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter password"
        />
      </div>

      {/* Login button */}
      <button onClick={() => console.log("Login attempt", username, password)}>
        Login
      </button>

      {/* Sign up */}
      <p>
        Don't have an account?{" "}
        <button onClick={() => onNavigate("register")}>
          Sign up
        </button>
      </p>
    </div>
  );
}