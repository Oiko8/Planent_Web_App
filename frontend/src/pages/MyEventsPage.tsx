import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axiosConfig";
import type { EventItem, PageResponse } from "../types/event";

export default function MyEventsPage() {
    const [events, setEvents] = useState<EventItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
    const [successMessage, setSuccessMessage] = useState("");
    const [deleteError, setDeleteError] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        async function fetchMyEvents() {
            try {
                const response = await api.get<PageResponse<EventItem>>("/events/my-events");
                setEvents(response.data.content);
            } catch (err) {
                setError("Failed to load your events.");
            } finally {
                setLoading(false);
            }
        }
        fetchMyEvents();
    }, []);

    async function handleDelete(eventId: number) {
        setSuccessMessage("");
        setDeleteError("");

        try {
            await api.delete(`/events/${eventId}`);
            setEvents((prev) => prev.filter((e) => e.eventId !== eventId));
            setSuccessMessage("Event deleted successfully!");
        } catch (err: any) {
            const message = err.response?.data?.detail
                ?? "This event cannot be deleted because it is published and already has bookings.";
            setDeleteError(message);
        } finally {
            setConfirmDeleteId(null);
        }
    }

    if (loading) return <p>Loading your events...</p>;
    if (error) return <p style={{ color: "red" }}>{error}</p>;

    return (
        <div>
            <h1 className="header">My Events</h1>

            {successMessage && (
                <div className="message-success">{successMessage}</div>
            )}

            {deleteError && (
                <div className="message-error">{deleteError}</div>
            )}

            {/* Create button — above everything */}
            <div className="my-events-top-bar">
                <button className="create-event-button" onClick={() => navigate("/create-event")}>
                    + Create New Event
                </button>
            </div>


            {events.length === 0 ? (
                <div>
                    <p>You have no events yet.</p>
                    <button onClick={() => navigate("/create-event")}>Create your first event</button>
                </div>
            ) : (
                <div>
                    {events.map((event) => (
                        <div key={event.eventId} className="my-event-card">
                            <div>
                                <h3>{event.title}</h3>
                                <p>{event.eventType} — {event.city}, {event.country}</p>
                                <p>{new Date(event.startDatetime).toLocaleDateString("el-GR")}</p>
                                <span className={`status-badge status-${event.status.toLowerCase()}`}>
                                    {event.status}
                                </span>
                            </div>

                            <div className="my-event-actions">
                                <button
                                    className="borderless-button"
                                    onClick={() => navigate(`/edit-event/${event.eventId}`)}
                                >
                                    Edit
                                </button>

                                {event.status === "DRAFT" && confirmDeleteId !== event.eventId && (
                                    <button
                                        className="borderless-button"
                                        onClick={() => {
                                            setSuccessMessage("");
                                            setDeleteError("");
                                            setConfirmDeleteId(event.eventId);
                                        }}
                                    >
                                        Delete
                                    </button>
                                )}

                                {/* Confirmation banner inline inside the card */}
                                {confirmDeleteId === event.eventId && (
                                    <div className="confirm-banner-inline">
                                        <p>Delete this event?</p>
                                        <button onClick={() => handleDelete(event.eventId)}>Yes, delete</button>
                                        <button onClick={() => setConfirmDeleteId(null)}>Cancel</button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <button onClick={() => navigate("/create-event")}>+ Create New Event</button>
        </div>
    );
}