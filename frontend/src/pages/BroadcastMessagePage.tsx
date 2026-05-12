import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axiosConfig";
import type { EventItem, PageResponse } from "../types/event";
import type { BookingItem } from "../types/bookingData";

export default function BroadcastMessagePage() {
    const { eventId } = useParams();
    const navigate = useNavigate();

    const [event, setEvent] = useState<EventItem | null>(null);
    const [attendeeCount, setAttendeeCount] = useState<number | null>(null);
    const [body, setBody] = useState("");
    const [confirmSend, setConfirmSend] = useState(false);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState("");
    const [sentTo, setSentTo] = useState<number | null>(null);

    // Load event + a single page of bookings just to know "how many can I message"
    useEffect(() => {
        async function fetchContext() {
            try {
                const [eventRes, bookingsRes] = await Promise.all([
                    api.get<EventItem>(`/events/${eventId}`),
                    api.get<PageResponse<BookingItem>>(`/bookings/event/${eventId}`, { params: { size: 1 } }),
                ]);
                setEvent(eventRes.data);
                // totalElements is enough — we don't need the actual content
                setAttendeeCount(bookingsRes.data.totalElements);
            } catch (err: any) {
                const status = err.response?.status;
                if (status === 403) setError("You are not authorized to broadcast to this event.");
                else if (status === 404) setError("Event not found.");
                else setError("Failed to load event details.");
            }
        }
        fetchContext();
    }, [eventId]);

    async function handleSend() {
        if (!body.trim()) {
            setError("Please write a message before sending.");
            setConfirmSend(false);
            return;
        }

        setSending(true);
        setError("");

        try {
            const response = await api.post<{ recipientCount: number }>(
                `/messages/broadcast/${eventId}`,
                { body }
            );
            setSentTo(response.data.recipientCount);
        } catch (err: any) {
            setError(err.response?.data?.detail ?? "Failed to send broadcast.");
            setConfirmSend(false);
        } finally {
            setSending(false);
        }
    }

    // Success view
    if (sentTo !== null) {
        return (
            <div className="admin-page">
                <div className="event-detail-header">
                    <button
                        className="borderless-button"
                        onClick={() => navigate(`/my-events/${eventId}/bookings`)}
                    >
                        ← Back to bookings
                    </button>
                </div>

                <div className="booking-success-screen">
                    <h2>📨 Broadcast sent!</h2>
                    <p>
                        Your message was delivered to{" "}
                        <strong>{sentTo} attendee{sentTo !== 1 ? "s" : ""}</strong>.
                    </p>
                    {sentTo === 0 && (
                        <p style={{ color: "#94a3b8" }}>
                            (No active attendees on this event — nothing was sent.)
                        </p>
                    )}
                    <div style={{ display: "flex", gap: "1rem", justifyContent: "center", marginTop: "1.5rem" }}>
                        <button
                            className="create-event-button"
                            onClick={() => navigate("/messages")}
                        >
                            View Sent Messages
                        </button>
                        <button
                            className="borderless-button"
                            onClick={() => navigate(`/my-events/${eventId}/bookings`)}
                        >
                            Back to Bookings
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Compose view
    return (
        <div className="admin-page">
            <div className="event-detail-header">
                <button
                    className="borderless-button"
                    onClick={() => navigate(`/my-events/${eventId}/bookings`)}
                >
                    ← Back to bookings
                </button>
            </div>

            <h1 className="header">Message all attendees</h1>

            {event && (
                <p className="events-result-count">
                    Event: <strong>{event.title}</strong>
                </p>
            )}
            {attendeeCount !== null && (
                <p className="events-result-count" style={{ marginTop: "-0.5rem" }}>
                    Up to {attendeeCount} booking{attendeeCount !== 1 ? "s" : ""} on this event
                    {" "}— cancelled bookings will not receive the message.
                </p>
            )}

            {error && <div className="message-error">{error}</div>}

            <div className="auth-card auth-card-wide" style={{ margin: "1rem auto" }}>
                <div className="auth-field">
                    <label className="auth-label">Message body *</label>
                    <textarea
                        className="auth-input auth-textarea"
                        value={body}
                        onChange={e => setBody(e.target.value)}
                        placeholder="Write your announcement to all attendees..."
                        rows={8}
                        disabled={sending}
                    />
                </div>

                {!confirmSend ? (
                    <div style={{ display: "flex", gap: "1rem", marginTop: "1.5rem" }}>
                        <button
                            className="auth-button"
                            style={{ marginTop: 0 }}
                            onClick={() => {
                                if (!body.trim()) {
                                    setError("Please write a message before sending.");
                                    return;
                                }
                                setError("");
                                setConfirmSend(true);
                            }}
                            disabled={sending}
                        >
                            Send to all attendees
                        </button>
                        <button
                            className="borderless-button"
                            onClick={() => navigate(`/my-events/${eventId}/bookings`)}
                        >
                            Cancel
                        </button>
                    </div>
                ) : (
                    <div className="confirm-banner" style={{ marginTop: "1.5rem" }}>
                        <p>
                            Send this message to all active attendees? This cannot be undone.
                        </p>
                        <button onClick={handleSend} disabled={sending}>
                            {sending ? "Sending..." : "Yes, send"}
                        </button>
                        <button onClick={() => setConfirmSend(false)} disabled={sending}>
                            Go back
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}