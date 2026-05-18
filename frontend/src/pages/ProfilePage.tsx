import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axiosConfig";
import { useAuth } from "../context/AuthContext";

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
};

const EMPTY_FORM: ProfileForm = {
    firstName: "", lastName: "", email: "", phone: "",
    country: "", city: "", address: "", zipcode: "", afm: "",
};

export default function ProfilePage() {
    const { user, login } = useAuth();
    const navigate = useNavigate();

    const [profile, setProfile] = useState<any>(null);
    const [form, setForm] = useState<ProfileForm>(EMPTY_FORM);
    const [editMode, setEditMode] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
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
                setError("Failed to load your profile.");
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
        };
    }

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    }

    async function handleSave() {
        if (!user) return;
        setSaving(true);
        setError("");
        setSuccess("");
        try {
            const res = await api.patch(`/users/${user.userId}`, form);
            setProfile(res.data);
            setForm(toForm(res.data));
            login(res.data);      // refresh user in AuthContext so the navbar shows new name/email
            setEditMode(false);
            setSuccess("Profile updated successfully.");
        } catch (err: any) {
            // Validation errors come back per-field; show the first one
            const fieldErrors = err.response?.data?.errors;
            if (fieldErrors && Object.keys(fieldErrors).length > 0) {
                setError(String(Object.values(fieldErrors)[0]));
            } else {
                setError(err.response?.data?.detail ?? "Failed to update profile.");
            }
        } finally {
            setSaving(false);
        }
    }

    function handleCancel() {
        if (profile) setForm(toForm(profile));
        setEditMode(false);
        setError("");
    }

    if (loading) return <p className="header">Loading...</p>;
    if (!profile) return null;

    return (
        <div className="auth-page">
            <div className="auth-card auth-card-wide">
                <h1 className="auth-title">My Profile</h1>
                <p className="auth-subtitle">@{profile.username}</p>

                {success && <div className="message-success">{success}</div>}
                {error && <div className="message-error">{error}</div>}

                <p className="auth-section-label">Personal</p>
                <div className="auth-grid-2">
                    <div className="auth-field">
                        <label className="auth-label">First Name</label>
                        <input className="auth-input" name="firstName" value={form.firstName}
                            onChange={handleChange} disabled={!editMode} />
                    </div>
                    <div className="auth-field">
                        <label className="auth-label">Last Name</label>
                        <input className="auth-input" name="lastName" value={form.lastName}
                            onChange={handleChange} disabled={!editMode} />
                    </div>
                </div>

                <p className="auth-section-label">Contact</p>
                <div className="auth-grid-2">
                    <div className="auth-field">
                        <label className="auth-label">Email</label>
                        <input className="auth-input" name="email" type="email" value={form.email}
                            onChange={handleChange} disabled={!editMode} />
                    </div>
                    <div className="auth-field">
                        <label className="auth-label">Phone</label>
                        <input className="auth-input" name="phone" value={form.phone}
                            onChange={handleChange} disabled={!editMode} placeholder="10 digits" />
                    </div>
                </div>

                <p className="auth-section-label">Address</p>
                <div className="auth-field">
                    <label className="auth-label">Street Address</label>
                    <input className="auth-input" name="address" value={form.address}
                        onChange={handleChange} disabled={!editMode} />
                </div>
                <div className="auth-grid-2" style={{ marginTop: "1rem" }}>
                    <div className="auth-field">
                        <label className="auth-label">City</label>
                        <input className="auth-input" name="city" value={form.city}
                            onChange={handleChange} disabled={!editMode} />
                    </div>
                    <div className="auth-field">
                        <label className="auth-label">Country</label>
                        <input className="auth-input" name="country" value={form.country}
                            onChange={handleChange} disabled={!editMode} />
                    </div>
                </div>
                <div className="auth-grid-2" style={{ marginTop: "1rem" }}>
                    <div className="auth-field">
                        <label className="auth-label">Zipcode</label>
                        <input className="auth-input" name="zipcode" value={form.zipcode}
                            onChange={handleChange} disabled={!editMode} />
                    </div>
                    <div className="auth-field">
                        <label className="auth-label">AFM</label>
                        <input className="auth-input" name="afm" value={form.afm}
                            onChange={handleChange} disabled={!editMode} placeholder="9 digits" />
                    </div>
                </div>

                <div style={{ display: "flex", gap: "1rem", marginTop: "2rem" }}>
                    {!editMode ? (
                        <button
                            className="auth-button"
                            style={{ marginTop: 0 }}
                            onClick={() => { setEditMode(true); setSuccess(""); setError(""); }}
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