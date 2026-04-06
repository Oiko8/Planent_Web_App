import { useState } from "react";
import { RegisterFormData } from "../types/registerData";
import axios from "axios";

type RegisterPageProps = {
    onNavigate: (page: string) => void;
};

export default function RegisterPage({ onNavigate }: RegisterPageProps) {
    const [formData, setFormData] = useState<RegisterFormData>({
        username: "",
        password: "",
        confirmPassword: "",
        firstName: "",
        lastName: "",
        email: "",
        phoneNumber: "",
        country: "",
        city: "",
        address: "",
        zipCode: "",
        afm: "",
    });

    const [errorMessage, setErrorMessage] = useState("");

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        if (
            !formData.username ||
            !formData.password ||
            !formData.confirmPassword ||
            !formData.firstName ||
            !formData.lastName ||
            !formData.email ||
            !formData.phoneNumber
        ) {
            setErrorMessage("Please fill in all required fields.");
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setErrorMessage("Password and Confirmation do not match.");
            return;
        }

        setErrorMessage("");

        // console.log("Register form submitted:", formData);
        const reponse = await axios.post("http://localhost:5000/register", formData, {
        headers: {
            "Content-Type": "application/json",
        },
        });
        console.log("Server response:", reponse.data);

        // Go to approval page in case of success
        onNavigate("pendingApproval");
    }

    function handleChange(field: keyof RegisterFormData, value: string) {
        setFormData((prev) => ({ ...prev, [field]: value }));
    }

    return(
        <form className="register-body" onSubmit={handleSubmit}>
            <h1 className="header">Sign up</h1>

            {/* Username */}
            <div>
                <label>Username</label>
                <input
                value={formData.username}
                onChange={(e) => handleChange("username", e.target.value)}
                placeholder="Enter username"
                />
            </div>
            <br></br>

            {/* Password */}
            <div>
                <label>Password</label>
                <input
                type="password"
                value={formData.password}
                onChange={(e) => handleChange("password", e.target.value)}
                placeholder="Enter password"
                />
            </div>
            <br></br>
            
            {/* Password Confirmation */}
            <div>
                <label>Confirm Password</label>
                <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => handleChange("confirmPassword", e.target.value)}
                placeholder="Confirm password"
                />
            </div>
            <br></br>

            {/* Full name */}
            <div>
                <label>First Name</label>
                <input
                value={formData.firstName}
                onChange={(e) => handleChange("firstName", e.target.value)}
                placeholder="Enter first name"
                />
            </div>
            <br></br>
            <div>
                <label>Last Name</label>
                <input
                value={formData.lastName}
                onChange={(e) => handleChange("lastName", e.target.value)}
                placeholder="Enter last name"
                />
            </div>
            <br></br>

            {/* Email */}
            <div>
                <label>Email</label>
                <input
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="Enter email"
                />
            </div>
            <br></br>

            {/* Phone Number */}
            <div>
                <label>Phone Number</label>
                <input
                value={formData.phoneNumber}
                onChange={(e) => handleChange("phoneNumber", e.target.value)}
                placeholder="Enter phone number"
                />
            </div>
            
            {/* checking the error Message */}
            {<p className="register-error-message">{errorMessage || "\u00A0"}</p>}

            {/* register button */}
            <div>
                <button className="register-button" type="submit">
                    Register
                </button>

            </div>
        </form>


        

    );
}
