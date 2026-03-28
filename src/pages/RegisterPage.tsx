import { use, useState } from "react";

type RegisterPageProps = {
    onNavigate: (page: string) => void;
};

export default function RegisterPage() {
    const [username, setUsername] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [passwordConfirm, setPasswordConfim] = useState<string>("");
    const [firstName, setfirstName] = useState<string>("");
    const [surname, setSurname] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [phoneNumber, setPhoneNumber] = useState<string>("");

    return(
      <div className="register-body">
        <h1 className="header">Sign up</h1>

          {/* Username */}
          <div>
              <label>Username</label>
              <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              />
          </div>
          <br></br>

          {/* Password */}
          <div>
              <label>Password</label>
              <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              />
          </div>
          <br></br>
          
          {/* Password Confirmation */}
          <div>
            <label>Confirm Password</label>
            <input
            type="password"
            value={passwordConfirm}
            onChange={(e) => setPasswordConfim(e.target.value)}
            placeholder="Confirm password"
            />
          </div>
          <br></br>

          {/* Full name */}
          <div>
            <label>First Name</label>
            <input
            value={firstName}
            onChange={(e) => setfirstName(e.target.value)}
            placeholder="Enter first name"
            />
          </div>
          <br></br>
          <div>
            <label>Surname</label>
            <input
            value={surname}
            onChange={(e) => setSurname(e.target.value)}
            placeholder="Enter surname"
            />
          </div>
          <br></br>

          {/* Email */}
          <div>
            <label>Email</label>
            <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter email"
            />
          </div>
          <br></br>

          {/* Phone Number */}
          <div>
            <label>Phone Number</label>
            <input
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="Enter phone number"
            />
          </div>

      </div>
    );
}
