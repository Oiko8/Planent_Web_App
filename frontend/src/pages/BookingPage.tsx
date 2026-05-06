import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axiosConfig";
import type { EventItem, TicketTypeResponse } from "../types/event";
import { useAuth } from "../context/AuthContext";

export default function BookingPage() {
    const { eventId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [event, setEvent] = useState<EventItem | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedTicket, setSelectedTicket] = useState<TicketTypeResponse | null>(null);
    const [numberOfTickets, setNumberOfTickets] = useState(1);
    const [confirmBooking, setConfirmBooking] = useState(false);
    const [bookingSuccess, setBookingSuccess] = useState(false);
    const [bookingError, setBookingError] = useState("");

    useEffect(() => {
        async function fetchEvent() {
            try {
                const response = await api.get(`/events/${eventId}`);
                setEvent(response.data);
            } catch {
                navigate("/events");
            } finally {
                setLoading(false);
            }
        }
        fetchEvent();
    }, [eventId]);

    async function handleBooking() {
        if (!selectedTicket) return;
        setBookingError("");

        try {
            await api.post("/bookings", {
                ticketTypeId: selectedTicket.ticketTypeId,
                numberOfTickets,
            });
            setBookingSuccess(true);
            setConfirmBooking(false);
        } catch (err: any) {
            setBookingError(err.response?.data?.detail ?? "Booking failed. Please try again.");
            setConfirmBooking(false);
        }
    }

    if (loading) return <p className="header">Loading...</p>;
    if (!event) return null;

    const totalCost = selectedTicket
        ? (selectedTicket.price * numberOfTickets).toFixed(2)
        : "0.00";

    // redirect guests to login
    if (!user) {
        return (
            <div className="booking-page">
                <h1 className="header">Book Your Place</h1>
                <div className="booking-login-prompt">
                    <p>You need to be logged in to make a booking.</p>
                    <button
                        className="create-event-button"
                        onClick={() => navigate("/login")}
                    >
                        Login to continue
                    </button>
                </div>
            </div>
        );
    }

    // success screen
    if (bookingSuccess) {
        return (
            <div className="booking-page">
                <div className="booking-success-screen">
                    <h2>🎉 Booking Confirmed!</h2>
                    <p>You booked <strong>{numberOfTickets}</strong> × <strong>{selectedTicket?.name}</strong></p>
                    <p>Total paid: <strong>€{totalCost}</strong></p>
                    <p>Event: <strong>{event.title}</strong></p>
                    <div style={{ display: "flex", gap: "1rem", justifyContent: "center", marginTop: "1.5rem" }}>
                        <button className="create-event-button" onClick={() => navigate("/my-bookings")}>
                            View My Bookings
                        </button>
                        <button className="borderless-button" onClick={() => navigate("/events")}>
                            Browse More Events
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="booking-page">
            <h1 className="header">Book Your Place</h1>

            {/* Event summary */}
            <div className="booking-event-summary">
                <h2>{event.title}</h2>
                <p>📍 {event.venue}, {event.city}</p>
                <p>🗓 {new Date(event.startDatetime).toLocaleString("el-GR")}</p>
            </div>

            {/* Ticket selection */}
            <div className="booking-tickets">
                <h3>Select Ticket Type</h3>
                {event.ticketTypes.map(ticket => (
                    <div
                        key={ticket.ticketTypeId}
                        className={`booking-ticket-type-card ${selectedTicket?.ticketTypeId === ticket.ticketTypeId ? "ticket-selected" : ""} ${ticket.available === 0 ? "ticket-soldout" : ""}`}
                        onClick={() => {
                            if (ticket.available > 0) {
                                setSelectedTicket(ticket);
                                setNumberOfTickets(1);
                                setBookingError("");
                            }
                        }}
                    >
                        <div>
                            <strong>{ticket.name}</strong>
                            <span className="ticket-available">
                                {ticket.available > 0 ? `${ticket.available} available` : "Sold out"}
                            </span>
                        </div>
                        <span className="ticket-price">€{Number(ticket.price).toFixed(2)}</span>
                    </div>
                ))}
            </div>

            {/* Quantity + confirm */}
            {selectedTicket && (
                <div className="booking-section">
                    <div className="booking-controls">
                        <label>Number of tickets:</label>
                        <input
                            type="number"
                            min={1}
                            max={selectedTicket.available}
                            value={numberOfTickets}
                            onChange={e => setNumberOfTickets(Math.max(1, Number(e.target.value)))}
                        />
                        <span className="booking-total">Total: €{totalCost}</span>
                    </div>

                    {bookingError && (
                        <div className="message-error" style={{ marginBottom: "1rem" }}>
                            {bookingError}
                        </div>
                    )}

                    {!confirmBooking ? (
                        <button
                            className="create-event-button"
                            style={{ width: "100%" }}
                            onClick={() => setConfirmBooking(true)}
                        >
                            Book Your Place
                        </button>
                    ) : (
                        <div className="confirm-banner">
                            <p>
                                Confirm {numberOfTickets} × {selectedTicket.name} for €{totalCost}?
                                This cannot be undone.
                            </p>
                            <button onClick={handleBooking}>Yes, confirm</button>
                            <button onClick={() => setConfirmBooking(false)}>Cancel</button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}