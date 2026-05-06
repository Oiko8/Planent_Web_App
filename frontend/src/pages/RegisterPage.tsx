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
    const [errorMessage, setErrorMessage] = useState("");
    const navigate = useNavigate();

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!formData.username || !formData.password || !formData.confirmPassword ||
            !formData.firstName || !formData.lastName || !formData.email || !formData.phone) {
            setErrorMessage("Please fill in all required fields.");
            return;
        }
        if (formData.password !== formData.confirmPassword) {
            setErrorMessage("Passwords do not match.");
            return;
        }
        setErrorMessage("");
        try {
            await api.post("/auth/register", formData);
            navigate("/pending-approval");
        } catch (error: any) {
            setErrorMessage(error.response?.data?.detail ?? "Registration failed. Please try again.");
        }
    }

    function handleChange(field: keyof RegisterFormData, value: string) {
        setFormData(prev => ({ ...prev, [field]: value }));
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
                            <input className="auth-input" value={formData.username}
                                onChange={e => handleChange("username", e.target.value)} placeholder="Choose a username" />
                        </div>
                        <div className="auth-field">
                            <label className="auth-label">Email *</label>
                            <input className="auth-input" type="email" value={formData.email}
                                onChange={e => handleChange("email", e.target.value)} placeholder="your@email.com" />
                        </div>
                        <div className="auth-field">
                            <label className="auth-label">Password *</label>
                            <input className="auth-input" type="password" value={formData.password}
                                onChange={e => handleChange("password", e.target.value)} placeholder="Create password" />
                        </div>
                        <div className="auth-field">
                            <label className="auth-label">Confirm Password *</label>
                            <input className="auth-input" type="password" value={formData.confirmPassword}
                                onChange={e => handleChange("confirmPassword", e.target.value)} placeholder="Confirm password" />
                        </div>
                    </div>

                    {/* Personal info */}
                    <p className="auth-section-label">Personal Info</p>
                    <div className="auth-grid-2">
                        <div className="auth-field">
                            <label className="auth-label">First Name *</label>
                            <input className="auth-input" value={formData.firstName}
                                onChange={e => handleChange("firstName", e.target.value)} placeholder="First name" />
                        </div>
                        <div className="auth-field">
                            <label className="auth-label">Last Name *</label>
                            <input className="auth-input" value={formData.lastName}
                                onChange={e => handleChange("lastName", e.target.value)} placeholder="Last name" />
                        </div>
                        <div className="auth-field">
                            <label className="auth-label">Phone *</label>
                            <input className="auth-input" value={formData.phone}
                                onChange={e => handleChange("phone", e.target.value)} placeholder="10-digit number" />
                        </div>
                        <div className="auth-field">
                            <label className="auth-label">AFM</label>
                            <input className="auth-input" value={formData.afm}
                                onChange={e => handleChange("afm", e.target.value)} placeholder="9-digit AFM" />
                        </div>
                    </div>

                    {/* Address */}
                    <p className="auth-section-label">Address</p>
                    <div className="auth-field">
                        <label className="auth-label">Search Address</label>
                        <LocationAutocomplete
                            placeholder="Search your address..."
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
                            }}
                        />
                        {formData.city && (
                            <div className="location-selected">
                                <span>📍 {formData.address}, {formData.city}, {formData.country}</span>
                                {formData.latitude && (
                                <span className="location-coords">
                                    {formData.latitude.toFixed(4)}, {formData.longitude?.toFixed(4)}
                                </span>
                            )}
                            </div>
                        )}
                    </div>

                    {/* Keep these as read-only confirmation fields or hidden */}
                    <div className="auth-grid-2" style={{ marginTop: "0.8rem" }}>
                        <div className="auth-field">
                            <label className="auth-label">Country</label>
                            <input className="auth-input" value={formData.country}
                                onChange={e => handleChange("country", e.target.value)}
                                placeholder="Auto-filled" />
                        </div>
                        <div className="auth-field">
                            <label className="auth-label">City</label>
                            <input className="auth-input" value={formData.city}
                                onChange={e => handleChange("city", e.target.value)}
                                placeholder="Auto-filled" />
                        </div>
                        <div className="auth-field">
                            <label className="auth-label">Address</label>
                            <input className="auth-input" value={formData.address}
                                onChange={e => handleChange("address", e.target.value)}
                                placeholder="Auto-filled" />
                        </div>
                        <div className="auth-field">
                            <label className="auth-label">Zipcode</label>
                            <input className="auth-input" value={formData.zipcode}
                                onChange={e => handleChange("zipcode", e.target.value)}
                                placeholder="Auto-filled" />
                        </div>
                    </div>

                    {errorMessage && <p className="auth-error">{errorMessage}</p>}

                    <button className="auth-button" type="submit">Create Account</button>

                    <p className="auth-footer">
                        Already have an account?{" "}
                        <span className="auth-link" onClick={() => navigate("/login")}>Login</span>
                    </p>
                </form>
            </div>
        </div>
    );
}