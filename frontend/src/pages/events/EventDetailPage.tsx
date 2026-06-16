import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import api from "../../api/axiosConfig";
import { mediaUrl } from "../../api/media";
import type { EventItem } from "../../types/event";
import { useAuth } from "../../context/AuthContext";
import Loader from "../../components/Loader";
import ErrorPage from "../ErrorPage";

export default function EventDetailPage() {
    const { eventId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [event, setEvent] = useState<EventItem | null>(null);
    const [loading, setLoading] = useState(true);
    const [errorCode, setErrorCode] = useState<404 | 403 | null>(null);

    // gallery state
    const [activeImage, setActiveImage] = useState(0);

    // booking state
    const [selectedTicketTypeId, setSelectedTicketTypeId] = useState<number | null>(null);
    const [numberOfTickets, setNumberOfTickets] = useState(1);
    const [confirmBooking, setConfirmBooking] = useState(false);
    const [bookingSuccess, setBookingSuccess] = useState(false);
    const [bookingError, setBookingError] = useState("");

    useEffect(() => {
        async function fetchEvent() {
            try {
                const response = await api.get(`/events/${eventId}`);
                setEvent(response.data);
                setActiveImage(0);
            } catch (err: any) {
                const status = err.response?.status;
                if (status === 403 || status === 404) {
                    setErrorCode(status);
                } else {
                    setErrorCode(404); // fallback
                }
            } finally {
                setLoading(false);
            }
        }
        fetchEvent();
    }, [eventId]);

    // event view interaction
    useEffect(() => {
        if (!user || !event) return; // abort if anonymous guest or event hasnt loaded yet

        if (event.organizerId === user.userId) return; // abort if organizer

        async function recordViewInteraction() {
            try {
                await api.post(`/events/${eventId}/view`);
            } catch (err) {
                // silent failure
                console.error("Interaction tracking failed:", err);
            }
        }
        recordViewInteraction();
    }, [eventId, user, event]);

    async function handleBooking() {
        if (!selectedTicketTypeId) return;
        setBookingError("");

        try {
            await api.post("/bookings", {
                ticketTypeId: selectedTicketTypeId,
                numberOfTickets,
            });

            setBookingSuccess(true);
            setConfirmBooking(false);

            // refresh event to update available ticket counts
            const response = await api.get(`/events/${eventId}`);
            setEvent(response.data);
        } catch (err: any) {
            setBookingError(err.response?.data?.detail ?? "Booking failed. Please try again.");
            setConfirmBooking(false);
        }
    }

    if (loading) return <Loader />;
    if (errorCode) return <ErrorPage code={errorCode} />;
    if (!event) return null;

    const selectedTicket = event.ticketTypes.find(t => t.ticketTypeId === selectedTicketTypeId);
    const totalCost = selectedTicket ? (selectedTicket.price * numberOfTickets).toFixed(2) : "0.00";
    const canBook = event.status === "PUBLISHED" && user && event.organizerId !== user.userId;

    const media = event.media ?? [];
    const heroSrc = mediaUrl(media[activeImage]?.photoUrl);

    const startDate = new Date(event.startDatetime);
    const endDate = new Date(event.endDatetime);
    const isSameDay = startDate.toLocaleDateString("el-GR") === endDate.toLocaleDateString("el-GR");

    const formattedDateRange = isSameDay
        ? `${startDate.toLocaleString("el-GR", { dateStyle: "short", timeStyle: "short" })} - ${endDate.toLocaleTimeString("el-GR", { timeStyle: "short" })}`
        : `${startDate.toLocaleString("el-GR", { dateStyle: "short", timeStyle: "short" })} - ${endDate.toLocaleString("el-GR", { dateStyle: "short", timeStyle: "short" })}`;

    return (
        <div className="event-detail-page">

            {/* Header */}
            <div className="event-detail-header">
                <button className="borderless-button" onClick={() => navigate(-1)}>← Back</button>
                <span className={`status-badge status-${event.status.toLowerCase()}`}>
                    {event.status}
                </span>
            </div>

            <h1 className="event-detail-title">{event.title}</h1>

            {/* Image gallery */}
            {media.length > 0 && (
                <div className="event-detail-gallery">
                    {heroSrc && (
                        <a
                            href={heroSrc}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="event-detail-gallery-main-wrapper"
                        >
                            <img
                                className="event-detail-gallery-main"
                                src={heroSrc}
                                alt={event.title}
                            />
                        </a>
                    )}
                    {media.length > 1 && (
                        <div className="event-detail-gallery-thumbs">
                            {media.map((m, i) => {
                                const thumb = mediaUrl(m.photoUrl);
                                return (
                                    <img
                                        key={m.mediaId}
                                        src={thumb}
                                        alt={`${event.title} ${i + 1}`}
                                        className={
                                            "event-detail-gallery-thumb" +
                                            (i === activeImage ? " event-detail-gallery-thumb-active" : "")
                                        }
                                        onClick={() => setActiveImage(i)}
                                    />
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* Meta info */}
            <div className="event-detail-meta-grid">

                <div className="meta-item">
                    <div className="meta-icon">🎭</div>
                    <div className="meta-content">
                        <span className="meta-label">Event Type</span>
                        <span className="meta-value">{event.eventType}</span>
                    </div>
                </div>

                <div className="meta-item">
                    <div className="meta-icon">📍</div>
                    <div className="meta-content">
                        <span className="meta-label">Location</span>
                        <span className="meta-value">{event.venue}, {event.city}, {event.country}</span>
                    </div>
                </div>

                <div className="meta-item">
                    <div className="meta-icon">🗓</div>
                    <div className="meta-content">
                        <span className="meta-label">Date & Time</span>
                        <span className="meta-value">{formattedDateRange}</span>
                    </div>
                </div>

                <div className="meta-item">
                    <div className="meta-icon">👥</div>
                    <div className="meta-content">
                        <span className="meta-label">Capacity</span>
                        <span className="meta-value">{event.capacity} people</span>
                    </div>
                </div>

            </div>

            {/* Categories */}
            <div className="event-detail-categories">
                {event.categories.map(c => (
                    <span key={c.categoryId} className="event-category-tag">
                        <span className="category-hashtag">#</span>
                        {c.categoryName}
                    </span>
                ))}
            </div>

            {/* Description */}
            <div className="event-detail-description">
                <h3>About this event</h3>
                <p>{event.description}</p>
            </div>

            {/* Map */}
            {event.latitude && event.longitude && (
                <div className="event-detail-map">
                    <h3>Location</h3>
                    <MapContainer
                        center={[Number(event.latitude), Number(event.longitude)]}
                        zoom={15}
                        style={{ height: "300px", width: "100%", borderRadius: "8px" }}
                    >
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        <Marker position={[Number(event.latitude), Number(event.longitude)]}>
                            <Popup>{event.venue}<br />{event.address}</Popup>
                        </Marker>
                    </MapContainer>
                </div>
            )}

            {/* Tickets */}
            <div className="event-detail-tickets">
                <h3>Tickets</h3>
                {/* Tickets — show availability and sort such that available ones are first*/}
                {[...event.ticketTypes]
                    .sort((a, b) => (a.available === 0 ? 1 : 0) - (b.available === 0 ? 1 : 0))
                    .map(ticket => (
                        <div
                            key={ticket.ticketTypeId}
                            className={`ticket-type-card ${ticket.available === 0 ? "ticket-soldout" : ""}`}
                        >
                            <div>
                                <strong>{ticket.name}</strong>
                                <span className={`ticket-available ${ticket.available > 0 ? "" : "ticket-soldout-text"}`}>
                        {ticket.available > 0 ? `${ticket.available} Available` : "Sold out"}
                    </span>
                            </div>
                            <span className="ticket-price">€{Number(ticket.price).toFixed(2)}</span>
                        </div>
                    ))}

                {/* Book button (published non-organizer only)*/}
                {event.status === "PUBLISHED" && event.organizerId !== user?.userId && (
                    <div style={{ marginTop: "1.5rem" }}>
                        {event.ticketTypes.some(t => t.available > 0) ? (
                            <button
                                className="event-card-button-primary"
                                style={{ width: "100%", padding: "0.8rem" }}
                                onClick={() => navigate(`/book/${event.eventId}`)}
                            >
                                Book Your Place
                            </button>
                        ) : (
                            <button className="event-card-button-primary" disabled
                                style={{ width: "100%", padding: "0.8rem", opacity: 0.5, cursor: "not-allowed" }}>
                                Sold Out
                            </button>
                        )}
                    </div>
                )}

                {/* Booking section */}
                {canBook && selectedTicketTypeId && !bookingSuccess && (
                    <div className="booking-section">
                        <div className="booking-controls">
                            <label>Number of tickets:</label>
                            <input
                                type="number"
                                min={1}
                                max={selectedTicket?.available ?? 1}
                                value={numberOfTickets}
                                onChange={e => setNumberOfTickets(Number(e.target.value))}
                            />
                            <span className="booking-total">Total: €{totalCost}</span>
                        </div>

                        {!confirmBooking ? (
                            <button
                                className="event-card-button-primary"
                                onClick={() => setConfirmBooking(true)}
                            >
                                Book Your Place
                            </button>
                        ) : (
                            <div className="confirm-banner">
                                <p>Confirm booking of {numberOfTickets} × {selectedTicket?.name} for €{totalCost}? This cannot be undone.</p>
                                <button onClick={handleBooking}>Yes, confirm</button>
                                <button onClick={() => setConfirmBooking(false)}>Cancel</button>
                            </div>
                        )}

                        {bookingError && <p className="message-error">{bookingError}</p>}
                    </div>
                )}

                {/* Success message */}
                {bookingSuccess && (
                    <div className="message-success">
                        🎉 Booking confirmed! Check your bookings for details.
                    </div>
                )}

                {/* Guest message */}
                {!user && event.status === "PUBLISHED" && (
                    <p className="booking-guest-msg">
                        <button className="borderless-button" onClick={() => navigate("/login")}>
                            Login
                        </button> to book tickets for this event.
                    </p>
                )}

                {/* Organizer message */}
                {user && event.organizerId === user.userId && (
                    <p className="booking-guest-msg">You are the organizer of this event.</p>
                )}
            </div>
        </div>
    );
}