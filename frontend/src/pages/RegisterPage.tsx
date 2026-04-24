import { useState } from "react";
import { RegisterFormData } from "../types/registerData";

import api from "../api/axiosConfig"

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
        phone: "",
        country: "",
        city: "",
        address: "",
        zipcode: "",
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
            !formData.phone
        ) {
            setErrorMessage("Please fill in all required fields.");
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setErrorMessage("Password and Confirmation do not match.");
            return;
        }

        setErrorMessage("");

        try {
            await api.post("/auth/register", formData);
            onNavigate("pendingApproval");
        } 
        catch (error:any) {
            const message = error.response?.data?.detail
            ?? "Registration failed. Please try again.";
            setErrorMessage(message);
        }
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

             <div>
                <label>Country</label>
                <input
                value={formData.country}
                onChange={(e) => handleChange("country", e.target.value)}
                placeholder="Enter country"
                />
            </div>

            <br></br>
             <div>
                <label>City</label>
                <input
                value={formData.city}
                onChange={(e) => handleChange("city", e.target.value)}
                placeholder="Enter city"
                />
            </div>
            <br></br>

            <div>
                <label>Address</label>
                <input
                value={formData.address}
                onChange={(e) => handleChange("address", e.target.value)}
                placeholder="Enter address"
                />
            </div>
            <br></br>

            <div>
                <label>Zipcode</label>
                <input
                value={formData.zipcode}
                onChange={(e) => handleChange("zipcode", e.target.value)}
                placeholder="Enter zipcode"
                />
            </div>
            <br></br>

            {/* AFM */}
            <div>
                <label>AFM</label>
                <input
                value={formData.afm}
                onChange={(e) => handleChange("afm", e.target.value)}
                placeholder="Enter phone number"
                />
            </div>
            <br></br>


            {/* Phone Number */}
            <div>
                <label>Phone Number</label>
                <input
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                placeholder="Enter phone number"
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
