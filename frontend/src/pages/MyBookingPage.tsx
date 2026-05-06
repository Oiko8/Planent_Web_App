import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axiosConfig";
import type { PageResponse } from "../types/event";
import type { BookingItem, BookingStatus } from "../types/bookingData";


export default function MyBookingsPage() {
    const navigate = useNavigate();
    const [bookings, setBookings] = useState<BookingItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [confirmCancelId, setConfirmCancelId] = useState<number | null>(null);
    const [successMessage, setSuccessMessage] = useState("");

    useEffect(() => {
        async function fetchBookings() {
            try {
                const response = await api.get<PageResponse<BookingItem>>("/bookings/my-bookings");
                setBookings(response.data.content);
            } catch (err) {
                setError("Failed to load your bookings.");
            } finally {
                setLoading(false);
            }
        }
        fetchBookings();
    }, []);

    async function handleCancel(bookingId: number) {
        try {
            await api.post(`/bookings/${bookingId}/cancel`);
            setBookings(prev => prev.map(b =>
                b.bookingId === bookingId
                    ? { ...b, bookingStatus: "CANCELLED" }
                    : b
            ));
            setSuccessMessage("Booking cancelled successfully.");
            setConfirmCancelId(null);
        } catch (err: any) {
            setError(err.response?.data?.detail ?? "Failed to cancel booking.");
            setConfirmCancelId(null);
        }
    }

    if (loading) return <p className="header">Loading...</p>;

    return (
        <div className="admin-page">
            <h1 className="header">My Bookings</h1>

            {successMessage && (
                <div className="message-success">{successMessage}</div>
            )}
            {error && (
                <div className="message-error">{error}</div>
            )}

            {bookings.length === 0 && !loading && (
                <div style={{ textAlign: "center", color: "#64748b", marginTop: "3rem" }}>
                    <p>You have no bookings yet.</p>
                    <button className="create-event-button" onClick={() => navigate("/events")}>
                        Browse Events
                    </button>
                </div>
            )}

            {bookings.map(booking => (
                <div key={booking.bookingId} className="my-event-card">
                    <div className="admin-user-info">
                        <strong
                            className="booking-event-link"
                            onClick={() => navigate(`/events/${booking.eventId}`)}
                        >
                            {booking.eventTitle}
                        </strong>
                        <span className="admin-user-meta">
                            🎫 {booking.ticketType.name} · {booking.numberOfTickets} ticket{booking.numberOfTickets > 1 ? "s" : ""}
                        </span>
                        <span className="admin-user-meta">
                            💰 Total: €{Number(booking.totalCost).toFixed(2)}
                        </span>
                        <span className="admin-user-meta">
                            🗓 Booked on: {new Date(booking.bookingTime).toLocaleDateString("el-GR")}
                        </span>
                    </div>

                    <div className="my-event-actions">
                        <span className={`status-badge ${booking.bookingStatus === "CONFIRMED" ? "status-published" : "status-cancelled"}`}>
                            {booking.bookingStatus}
                        </span>

                        {booking.bookingStatus === "CONFIRMED" && confirmCancelId !== booking.bookingId && (
                            <button
                                className="admin-btn-reject"
                                onClick={() => {
                                    setSuccessMessage("");
                                    setError("");
                                    setConfirmCancelId(booking.bookingId);
                                }}
                            >
                                Cancel
                            </button>
                        )}

                        {confirmCancelId === booking.bookingId && (
                            <div className="confirm-banner-inline">
                                <p>Cancel this booking?</p>
                                <button onClick={() => handleCancel(booking.bookingId)}>Yes</button>
                                <button onClick={() => setConfirmCancelId(null)}>No</button>
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}