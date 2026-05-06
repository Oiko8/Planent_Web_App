import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "../api/axiosConfig";
import type { EventItem } from "../types/event";

export default function ComposeMessagePage() {
    const [searchParams] = useSearchParams();
    const eventId = searchParams.get("eventId");
    const receiverId = searchParams.get("receiverId");
    const navigate = useNavigate();

    const [event, setEvent] = useState<EventItem | null>(null);
    const [body, setBody] = useState("");
    const [sending, setSending] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (!eventId) return;
        api.get(`/events/${eventId}`)
            .then(res => setEvent(res.data))
            .catch(() => setError("Failed to load event."));
    }, [eventId]);

    async function handleSend() {
        if (!body.trim()) {
            setError("Please write a message.");
            return;
        }
        if (!eventId) {
            setError("Missing event context.");
            return;
        }

        // attendee → organizer: receiverId comes from event.organizerId
        // organizer → attendee: receiverId comes from URL param
        const resolvedReceiverId = receiverId
            ? Number(receiverId)
            : event?.organizerId;

        if (!resolvedReceiverId) {
            setError("Cannot determine message recipient.");
            return;
        }

        setSending(true);
        setError("");
        try {
            await api.post("/messages", {
                receiverId: resolvedReceiverId,
                eventId: Number(eventId),
                body,
            });
            setSuccess(true);
        } catch (err: any) {
            setError(err.response?.data?.detail ?? "Failed to send message.");
        } finally {
            setSending(false);
        }
    }

    if (success) {
        return (
            <div className="auth-page">
                <div className="auth-card" style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>✉️</div>
                    <h2 className="auth-title">Message Sent!</h2>
                    <p className="auth-subtitle">Your message has been delivered to the organizer.</p>
                    <button className="auth-button" onClick={() => navigate("/messages")}>
                        Go to Messages
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-page">
            <div className="auth-card auth-card-wide">
                <h1 className="auth-title">Message Organizer</h1>

                {event && (
                    <div className="booking-event-summary" style={{ marginBottom: "1.5rem" }}>
                        <p style={{ margin: 0, color: "#94a3b8", fontSize: "0.85rem" }}>
                            Regarding: <strong style={{ color: "#f1f5f9" }}>{event.title}</strong>
                        </p>
                        <p style={{ margin: "0.3rem 0 0", color: "#64748b", fontSize: "0.8rem" }}>
                            Organizer will receive your message
                        </p>
                    </div>
                )}

                <div className="auth-field">
                    <label className="auth-label">Your Message</label>
                    <textarea
                        className="auth-input auth-textarea"
                        style={{ minHeight: "150px" }}
                        value={body}
                        onChange={e => setBody(e.target.value)}
                        placeholder="Write your message here..."
                    />
                </div>

                {error && <p className="auth-error">{error}</p>}

                <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
                    <button
                        className="auth-button"
                        style={{ flex: 1 }}
                        onClick={handleSend}
                        disabled={sending}
                    >
                        {sending ? "Sending..." : "Send Message"}
                    </button>
                    <button
                        className="borderless-button"
                        style={{ marginTop: "1.5rem" }}
                        onClick={() => navigate(-1)}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}