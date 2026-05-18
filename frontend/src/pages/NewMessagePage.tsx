import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axiosConfig";
import type { EventItem, PageResponse } from "../types/event";
import type { BookingItem } from "../types/bookingData";
import Loader from "../components/Loader";

type BookedEventEntry = { eventId: number; eventTitle: string };

export default function NewMessagePage() {
    const navigate = useNavigate();

    const [bookedEvents, setBookedEvents] = useState<BookedEventEntry[]>([]);
    const [myEvents, setMyEvents] = useState<EventItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function fetchAll() {
            try {
                // Fetch in parallel — neither depends on the other
                const [bookingsRes, eventsRes] = await Promise.all([
                    api.get<PageResponse<BookingItem>>("/bookings/my-bookings", { params: { size: 100 } }),
                    api.get<PageResponse<EventItem>>("/events/my-events", { params: { size: 100 } }),
                ]);

                // Dedupe bookings by eventId: one entry per (event → organizer) relationship,
                // regardless of how many times the user booked the same event.
                const uniqueBooked = Array.from(
                    new Map(
                        bookingsRes.data.content.map(b => [
                            b.eventId,
                            { eventId: b.eventId, eventTitle: b.eventTitle },
                        ])
                    ).values()
                );
                setBookedEvents(uniqueBooked);

                // Drafts have no attendees, no point listing them here
                setMyEvents(eventsRes.data.content.filter(e => e.status !== "DRAFT"));
            } catch {
                setError("Failed to load your contacts.");
            } finally {
                setLoading(false);
            }
        }
        fetchAll();
    }, []);

    if (loading) return <Loader />;

    return (
        <div className="admin-page">
            <div className="event-detail-header">
                <button className="borderless-button" onClick={() => navigate("/messages")}>
                    ← Messages
                </button>
            </div>

            <h1 className="header">Start a new message</h1>

            {error && <div className="message-error">{error}</div>}

            {/* Section 1: Message an organizer */}
            <h2 className="compose-section-title">Message an organizer</h2>
            <p className="compose-section-hint">
                Events you've booked — message the organizer with questions.
            </p>

            {bookedEvents.length === 0 ? (
                <p className="admin-empty">You haven't booked any events yet.</p>
            ) : (
                <div className="compose-list">
                    {bookedEvents.map(b => (
                        <div key={b.eventId} className="compose-item">
                            <span className="compose-item-label">{b.eventTitle}</span>
                            <button
                                className="event-card-button-primary"
                                onClick={() => navigate(`/messages/compose?eventId=${b.eventId}`)}
                            >
                                Message organizer
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Section 2: Message an attendee */}
            <h2 className="compose-section-title" style={{ marginTop: "2rem" }}>
                Message an attendee
            </h2>
            <p className="compose-section-hint">
                Pick one of your events to see its attendees.
            </p>

            {myEvents.length === 0 ? (
                <p className="admin-empty">You haven't published any events yet.</p>
            ) : (
                <div className="compose-list">
                    {myEvents.map(e => (
                        <div key={e.eventId} className="compose-item">
                            <span className="compose-item-label">
                                {e.title}
                                <span className={`status-badge status-${e.status.toLowerCase()}`} style={{ marginLeft: "0.6rem" }}>
                                    {e.status}
                                </span>
                            </span>
                            <button
                                className="event-card-button-secondary"
                                onClick={() => navigate(`/my-events/${e.eventId}/bookings`)}
                            >
                                View attendees
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}