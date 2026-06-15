import { useState } from "react";
import { RegisterFormData } from "../types/registerData";
import api from "../api/axiosConfig";
import { useNavigate } from "react-router-dom";
import LocationAutocomplete from "../components/LocationAutocomplete";

export default function RegisterPage() {
    const [formData, setFormData] = useState<RegisterFormData>({
        username: "", password: "", confirmPassword: "",
        firstName: "", lastName: "", email: "",
        phone: "", country: "", city: "",
        address: "", zipcode: "", afm: "",
        latitude: null, longitude: null,
    });
    // errors for each field
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [globalError, setGlobalError] = useState("");
    const navigate = useNavigate();

    // Client-side Validation (before POST)
    function validateForm(): boolean {
        const errors: Record<string, string> = {};

        // Required fields
        const requiredFields: (keyof RegisterFormData)[] = [
            "username", "password", "confirmPassword", "firstName",
            "lastName", "email", "phone", "afm", "address", "city", "country", "zipcode"
        ];

        requiredFields.forEach(field => {
            if (!formData[field] || String(formData[field]).trim() === "") {
                errors[field] = "This field is required.";
            }
        });

        // Password match
        if (formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword) {
            errors.confirmPassword = "Passwords do not match.";
        }

        // Regex for other fields
        if (formData.username && !/^[a-zA-Z0-9_]+$/.test(formData.username)) {
            errors.username = "Use only latin letters, numbers and underscores.";
        }

        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            errors.email = "Invalid email format.";
        }

        if (formData.phone && !/^[0-9]{10}$/.test(formData.phone)) {
            errors.phone = "Phone number must contain exactly 10 digits.";
        }

        if (formData.afm && !/^[0-9]{9}$/.test(formData.afm)) {
            errors.afm = "AFM must contain exactly 9 digits.";
        }

        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setGlobalError("");

        if (!validateForm()) return;

        try {
            await api.post("/auth/register", formData);
            navigate("/pending-approval");
        } catch (error: any) {
            const data = error.response?.data;

            if (error.response?.status === 400 && data?.errors) {
                // from MethodArgumentNotValidException handler
                setFieldErrors(data.errors);
            } else if (data?.detail) {
                // from ValidationException ("Username already exists" / "Email already exists")
                const detail = data.detail;
                if (detail.includes("Username")) {
                    setFieldErrors(prev => ({ ...prev, username: detail }));
                } else if (detail.includes("Email")) {
                    setFieldErrors(prev => ({ ...prev, email: detail }));
                } else {
                    setGlobalError(detail);
                }
            } else {
                setGlobalError("Registration failed. Please try again.");
            }
        }
    }

    // Clear error in the field the user is typing
    function handleChange(field: keyof RegisterFormData, value: string) {
        setFormData(prev => ({ ...prev, [field]: value }));
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
            <div className="auth-card auth-card-wide">
                <h1 className="auth-title">Create account</h1>
                <p className="auth-subtitle">Join Planent to discover and create events</p>

                <form onSubmit={handleSubmit}>
                    {/* Account info */}
                    <p className="auth-section-label">Account</p>
                    <div className="auth-grid-2">
                        <div className="auth-field">
                            <label className="auth-label">Username *</label>
                            <input className={`auth-input ${fieldErrors.username ? "auth-input-error" : ""}`} value={formData.username}
                                   onChange={e => handleChange("username", e.target.value)} placeholder="Choose a username" />
                            {fieldErrors.username && <span className="error-text">{fieldErrors.username}</span>}
                        </div>
                        <div className="auth-field">
                            <label className="auth-label">Email *</label>
                            <input className={`auth-input ${fieldErrors.email ? "auth-input-error" : ""}`} type="email" value={formData.email}
                                   onChange={e => handleChange("email", e.target.value)} placeholder="your@email.com" />
                            {fieldErrors.email && <span className="error-text">{fieldErrors.email}</span>}
                        </div>
                        <div className="auth-field">
                            <label className="auth-label">Password *</label>
                            <input className={`auth-input ${fieldErrors.password ? "auth-input-error" : ""}`} type="password" value={formData.password}
                                   onChange={e => handleChange("password", e.target.value)} placeholder="Create password" />
                            {fieldErrors.password && <span className="error-text">{fieldErrors.password}</span>}
                        </div>
                        <div className="auth-field">
                            <label className="auth-label">Confirm Password *</label>
                            <input className={`auth-input ${fieldErrors.confirmPassword ? "auth-input-error" : ""}`} type="password" value={formData.confirmPassword}
                                   onChange={e => handleChange("confirmPassword", e.target.value)} placeholder="Confirm password" />
                            {fieldErrors.confirmPassword && <span className="error-text">{fieldErrors.confirmPassword}</span>}
                        </div>
                    </div>

                    {/* Personal info */}
                    <p className="auth-section-label">Personal Info</p>
                    <div className="auth-grid-2">
                        <div className="auth-field">
                            <label className="auth-label">First Name *</label>
                            <input className={`auth-input ${fieldErrors.firstName ? "auth-input-error" : ""}`} value={formData.firstName}
                                   onChange={e => handleChange("firstName", e.target.value)} placeholder="First name" />
                            {fieldErrors.firstName && <span className="error-text">{fieldErrors.firstName}</span>}
                        </div>
                        <div className="auth-field">
                            <label className="auth-label">Last Name *</label>
                            <input className={`auth-input ${fieldErrors.lastName ? "auth-input-error" : ""}`} value={formData.lastName}
                                   onChange={e => handleChange("lastName", e.target.value)} placeholder="Last name" />
                            {fieldErrors.lastName && <span className="error-text">{fieldErrors.lastName}</span>}
                        </div>
                        <div className="auth-field">
                            <label className="auth-label">Phone *</label>
                            <input className={`auth-input ${fieldErrors.phone ? "auth-input-error" : ""}`} value={formData.phone}
                                   onChange={e => handleChange("phone", e.target.value)} placeholder="10-digit number" />
                            {fieldErrors.phone && <span className="error-text">{fieldErrors.phone}</span>}
                        </div>
                        <div className="auth-field">
                            <label className="auth-label">AFM *</label>
                            <input className={`auth-input ${fieldErrors.afm ? "auth-input-error" : ""}`} value={formData.afm}
                                   onChange={e => handleChange("afm", e.target.value)} placeholder="9-digit AFM" />
                            {fieldErrors.afm && <span className="error-text">{fieldErrors.afm}</span>}
                        </div>
                    </div>

                    {/* Address */}
                    <p className="auth-section-label">Location</p>
                    <div className="auth-field">
                        <label className="auth-label">Search address via autocomplete</label>
                        <LocationAutocomplete
                            placeholder="Search your address"
                            onSelect={(location) => {
                                handleChange("address", location.address);
                                handleChange("city", location.city);
                                handleChange("country", location.country);
                                handleChange("zipcode", location.zipcode);
                                setFormData(prev => ({
                                    ...prev,
                                    latitude: location.latitude,
                                    longitude: location.longitude,
                                }));

                                setFieldErrors(prev => {
                                    const c = { ...prev };
                                    delete c.address; delete c.city; delete c.country; delete c.zipcode;
                                    return c;
                                });
                            }}
                        />
                        {(fieldErrors.address || fieldErrors.city || fieldErrors.country || fieldErrors.zipcode) && (
                            <span className="error-text" style={{ display: "block", marginTop: "0.4rem" }}>
                                Please select a valid address from the autocomplete dropdown.
                            </span>
                        )}
                    </div>

                    {/* Read-only feedback layout */}
                    <div className="auth-grid-2" style={{ marginTop: "0.8rem" }}>
                        <div className="auth-field">
                            <label className="auth-label">Country *</label>
                            <input className="auth-input" value={formData.country}
                                   readOnly
                                   autoComplete="off"
                                   placeholder="Auto-filled"
                            />
                        </div>
                        <div className="auth-field">
                            <label className="auth-label">City *</label>
                            <input className="auth-input" value={formData.city}
                                   readOnly
                                   autoComplete="off"
                                   placeholder="Auto-filled"
                            />
                        </div>
                        <div className="auth-field">
                            <label className="auth-label">Address *</label>
                            <input className="auth-input" value={formData.address}
                                   readOnly
                                   autoComplete="off"
                                   placeholder="Auto-filled"
                            />
                        </div>
                        <div className="auth-field">
                            <label className="auth-label">Zipcode *</label>
                            <input className="auth-input" value={formData.zipcode}
                                   readOnly
                                   autoComplete="off"
                                   placeholder="Auto-filled"
                            />
                        </div>
                    </div>

                    {globalError && <p className="auth-error">{globalError}</p>}

                    <button className="auth-button" type="submit" style={{ marginTop: "1.5rem" }}>Create Account</button>

                    <p className="auth-footer">
                        Already have an account?{" "}
                        <span className="auth-link" onClick={() => navigate("/login")}>Login</span>
                    </p>
                </form>
            </div>
        </div>
    );
}