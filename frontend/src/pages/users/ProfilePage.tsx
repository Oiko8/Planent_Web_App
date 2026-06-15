import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axiosConfig";
import { useAuth } from "../../context/AuthContext";
import Loader from "../../components/Loader";
import LocationAutocomplete from "../../components/LocationAutocomplete";

type ProfileForm = {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    country: string;
    city: string;
    address: string;
    zipcode: string;
    afm: string;
    latitude: number | null;
    longitude: number | null;
};

const EMPTY_FORM: ProfileForm = {
    firstName: "", lastName: "", email: "", phone: "",
    country: "", city: "", address: "", zipcode: "", afm: "",
    latitude: null, longitude: null
};

export default function ProfilePage() {
    const { user, login } = useAuth();
    const navigate = useNavigate();

    const [profile, setProfile] = useState<any>(null);
    const [form, setForm] = useState<ProfileForm>(EMPTY_FORM);
    const [editMode, setEditMode] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Validation States
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [globalError, setGlobalError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        if (!user) {
            navigate("/login");
            return;
        }
        async function fetchProfile() {
            try {
                const res = await api.get("/users/me");
                setProfile(res.data);
                setForm(toForm(res.data));
            } catch {
                setGlobalError("Failed to load your profile.");
            } finally {
                setLoading(false);
            }
        }
        fetchProfile();
    }, [user, navigate]);

    function toForm(data: any): ProfileForm {
        return {
            firstName: data.firstName ?? "",
            lastName: data.lastName ?? "",
            email: data.email ?? "",
            phone: data.phone ?? "",
            country: data.country ?? "",
            city: data.city ?? "",
            address: data.address ?? "",
            zipcode: data.zipcode ?? "",
            afm: data.afm ?? "",
            latitude: data.latitude ?? null,
            longitude: data.longitude ?? null,
        };
    }

    // Client-side Validation
    function validateForm(): boolean {
        const errors: Record<string, string> = {};

        // Required fields
        const requiredFields: (keyof ProfileForm)[] = [
            "firstName", "lastName", "email", "phone", "country", "city", "address", "zipcode", "afm"
        ];

        requiredFields.forEach(field => {
            if (!form[field] || String(form[field]).trim() === "") {
                errors[field] = "This field cannot be empty.";
            }
        });

        // Regex for other fields
        if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
            errors.email = "Invalid email format.";
        }

        if (form.phone && !/^[0-9]{10}$/.test(form.phone)) {
            errors.phone = "Phone number must contain exactly 10 digits.";
        }

        if (form.afm && !/^[0-9]{9}$/.test(form.afm)) {
            errors.afm = "AFM must contain exactly 9 digits.";
        }

        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    }

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));

        if (fieldErrors[name]) {
            setFieldErrors(prev => {
                const copy = { ...prev };
                delete copy[name];
                return copy;
            });
        }
    }

    async function handleSave() {
        if (!user) return;
        setGlobalError("");
        setSuccess("");

        if (!validateForm()) return;

        setSaving(true);
        try {
            const res = await api.patch(`/users/${user.userId}`, form);
            setProfile(res.data);
            setForm(toForm(res.data));
            login(res.data);      // refresh user in AuthContext so the navbar shows new name/email
            setEditMode(false);
            setSuccess("Profile updated successfully.");
        } catch (err: any) {
            const data = err.response?.data;

            if (err.response?.status === 400 && data?.errors) {
                // @Valid errors from Spring Boot
                setFieldErrors(data.errors);
            } else if (data?.detail) {
                // ValidationExceptions handlers ("Email exists")
                const detail = data.detail;
                if (detail.includes("Email")) {
                    setFieldErrors(prev => ({ ...prev, email: detail }));
                } else {
                    setGlobalError(detail);
                }
            } else {
                setGlobalError("Failed to update profile. Please try again.");
            }
        } finally {
            setSaving(false);
        }
    }

    function handleCancel() {
        if (profile) setForm(toForm(profile));
        setEditMode(false);
        setFieldErrors({});
        setGlobalError("");
        setSuccess("");
    }

    if (loading) return <Loader />;
    if (!profile) return null;

    return (
        <div className="auth-page">
            <div className="auth-card auth-card-wide">
                <h1 className="auth-title">My Profile</h1>
                <p className="auth-subtitle">@{profile.username}</p>

                {success && <div className="message-success">{success}</div>}
                {globalError && <div className="message-error">{globalError}</div>}

                {/* Personal Section */}
                <p className="auth-section-label">Personal</p>
                <div className="auth-grid-2">
                    <div className="auth-field">
                        <label className="auth-label">First Name *</label>
                        <input
                            className={`auth-input ${fieldErrors.firstName ? "auth-input-error" : ""}`}
                            name="firstName"
                            value={form.firstName}
                            onChange={handleChange}
                            disabled={!editMode}
                            placeholder="First name"
                        />
                        {fieldErrors.firstName && <span className="error-text">{fieldErrors.firstName}</span>}
                    </div>
                    <div className="auth-field">
                        <label className="auth-label">Last Name *</label>
                        <input
                            className={`auth-input ${fieldErrors.lastName ? "auth-input-error" : ""}`}
                            name="lastName"
                            value={form.lastName}
                            onChange={handleChange}
                            disabled={!editMode}
                            placeholder="Last name"
                        />
                        {fieldErrors.lastName && <span className="error-text">{fieldErrors.lastName}</span>}
                    </div>
                </div>

                <div className="auth-field" style={{ marginTop: "1rem" }}>
                    <label className="auth-label">AFM *</label>
                    <input
                        className={`auth-input ${fieldErrors.afm ? "auth-input-error" : ""}`}
                        name="afm"
                        value={form.afm}
                        onChange={handleChange}
                        disabled={!editMode}
                        placeholder="9-digit AFM"
                    />
                    {fieldErrors.afm && <span className="error-text">{fieldErrors.afm}</span>}
                </div>

                {/* Contact Section */}
                <p className="auth-section-label">Contact</p>
                <div className="auth-grid-2">
                    <div className="auth-field">
                        <label className="auth-label">Email *</label>
                        <input
                            className={`auth-input ${fieldErrors.email ? "auth-input-error" : ""}`}
                            name="email"
                            type="email"
                            value={form.email}
                            onChange={handleChange}
                            disabled={!editMode}
                            placeholder="your@email.com"
                        />
                        {fieldErrors.email && <span className="error-text">{fieldErrors.email}</span>}
                    </div>
                    <div className="auth-field">
                        <label className="auth-label">Phone *</label>
                        <input
                            className={`auth-input ${fieldErrors.phone ? "auth-input-error" : ""}`}
                            name="phone"
                            value={form.phone}
                            onChange={handleChange}
                            disabled={!editMode}
                            placeholder="10-digit number"
                        />
                        {fieldErrors.phone && <span className="error-text">{fieldErrors.phone}</span>}
                    </div>
                </div>

                {/* Location / Address Section (Autocomplete) */}
                <p className="auth-section-label">Location</p>

                {/* Autocomplete in Edit Mode */}
                {editMode && (
                    <div className="auth-field" style={{ marginBottom: "1.5rem" }}>
                        <label className="auth-label">Update address via autocomplete</label>
                        <LocationAutocomplete
                            placeholder="Search your new address"
                            onSelect={(location : { address: string; city: string; country: string; zipcode: string; latitude: number; longitude: number }) => {
                                setForm(prev => ({
                                    ...prev,
                                    address: location.address,
                                    city: location.city,
                                    country: location.country,
                                    zipcode: location.zipcode,
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
                    </div>
                )}

                {/* Read-only feedback layout */}
                <div className="auth-grid-2" style={{ marginTop: "0.8rem" }}>
                    <div className="auth-field">
                        <label className="auth-label">Country *</label>
                        <input
                            className={`auth-input ${fieldErrors.country ? "auth-input-error" : ""}`}
                            value={form.country}
                            readOnly
                            autoComplete="off"
                            placeholder="Auto-filled"
                        />
                        {fieldErrors.country && <span className="error-text">{fieldErrors.country}</span>}
                    </div>
                    <div className="auth-field">
                        <label className="auth-label">City *</label>
                        <input
                            className={`auth-input ${fieldErrors.city ? "auth-input-error" : ""}`}
                            value={form.city}
                            readOnly
                            autoComplete="off"
                            placeholder="Auto-filled"
                        />
                        {fieldErrors.city && <span className="error-text">{fieldErrors.city}</span>}
                    </div>
                    <div className="auth-field">
                        <label className="auth-label">Address *</label>
                        <input
                            className={`auth-input ${fieldErrors.address ? "auth-input-error" : ""}`}
                            value={form.address}
                            readOnly
                            autoComplete="off"
                            placeholder="Auto-filled"
                        />
                        {fieldErrors.address && <span className="error-text">{fieldErrors.address}</span>}
                    </div>
                    <div className="auth-field">
                        <label className="auth-label">Zipcode *</label>
                        <input
                            className={`auth-input ${fieldErrors.zipcode ? "auth-input-error" : ""}`}
                            value={form.zipcode}
                            readOnly
                            autoComplete="off"
                            placeholder="Auto-filled"
                        />
                        {fieldErrors.zipcode && <span className="error-text">{fieldErrors.zipcode}</span>}
                    </div>
                </div>

                {/* Actions */}
                <div style={{ display: "flex", gap: "1rem", marginTop: "2rem" }}>
                    {!editMode ? (
                        <button
                            className="auth-button"
                            style={{ marginTop: 0 }}
                            onClick={() => { setEditMode(true); setSuccess(""); setGlobalError(""); }}
                        >
                            Edit Profile
                        </button>
                    ) : (
                        <>
                            <button
                                className="auth-button"
                                style={{ marginTop: 0, flex: 1 }}
                                onClick={handleSave}
                                disabled={saving}
                            >
                                {saving ? "Saving..." : "Save Changes"}
                            </button>
                            <button
                                className="event-card-button-secondary"
                                style={{ flex: 1 }}
                                onClick={handleCancel}
                                disabled={saving}
                            >
                                Cancel
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}