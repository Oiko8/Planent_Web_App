import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axiosConfig";
import Pagination from "../components/Pagination";
import type { PageResponse } from "../types/event";
import type { BookingItem } from "../types/bookingData";
import Loader from "../components/Loader";

const PAGE_SIZE = 10;

export default function MyBookingsPage() {
    const navigate = useNavigate();
    const [pageData, setPageData] = useState<PageResponse<BookingItem> | null>(null);
    const [page, setPage] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [confirmCancelId, setConfirmCancelId] = useState<number | null>(null);
    const [successMessage, setSuccessMessage] = useState("");

    useEffect(() => {
        async function fetchBookings() {
            setLoading(true);
            try {
                const response = await api.get<PageResponse<BookingItem>>("/bookings/my-bookings", {
                    params: { page, size: PAGE_SIZE },
                });
                setPageData(response.data);
            } catch (err) {
                setError("Failed to load your bookings.");
            } finally {
                setLoading(false);
            }
        }
        fetchBookings();
    }, [page]);

    async function handleCancel(bookingId: number) {
        try {
            await api.post(`/bookings/${bookingId}/cancel`);
            // Local update: flip the booking's status in current page's content.
            // No item is removed, so totals stay valid.
            setPageData(prev => prev ? {
                ...prev,
                content: prev.content.map(b =>
                    b.bookingId === bookingId
                        ? { ...b, bookingStatus: "CANCELLED" as const }
                        : b
                ),
            } : prev);
            setSuccessMessage("Booking cancelled successfully.");
            setConfirmCancelId(null);
        } catch (err: any) {
            setError(err.response?.data?.detail ?? "Failed to cancel booking.");
            setConfirmCancelId(null);
        }
    }

    if (loading && !pageData) return <Loader />;

    const bookings = pageData?.content ?? [];

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
                                onClick={() => setConfirmCancelId(booking.bookingId)}
                            >
                                Cancel
                            </button>
                        )}

                        {confirmCancelId === booking.bookingId && (
                            <div className="confirm-banner-inline">
                                <p>Cancel this booking?</p>
                                <button onClick={() => handleCancel(booking.bookingId)}>Yes, cancel</button>
                                <button onClick={() => setConfirmCancelId(null)}>Keep</button>
                            </div>
                        )}
                    </div>
                </div>
            ))}

            <Pagination pageData={pageData} onPageChange={setPage} />
        </div>
    );
}