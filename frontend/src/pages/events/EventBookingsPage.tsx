import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/axiosConfig";
import Pagination from "../../components/Pagination";
import { useAuth } from "../../context/AuthContext";
import type { EventItem, PageResponse } from "../../types/event";
import type { BookingItem } from "../../types/bookingData";
import Loader from "../../components/Loader";
import ErrorPage from "../ErrorPage";

const PAGE_SIZE = 10;

export default function EventBookingsPage() {
    const { eventId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [event, setEvent] = useState<EventItem | null>(null);
    const [pageData, setPageData] = useState<PageResponse<BookingItem> | null>(null);
    const [page, setPage] = useState(0);
    const [loading, setLoading] = useState(true);
    const [errorCode, setErrorCode] = useState<404 | 403 | null>(null);

    useEffect(() => {
        api.get<EventItem>(`/events/${eventId}`)
            .then(res => setEvent(res.data))
            .catch(() => { /* non-critical; the bookings load is what matters */ });
    }, [eventId]);

    useEffect(() => {
        async function fetchBookings() {
            setLoading(true);
            try {
                const response = await api.get<PageResponse<BookingItem>>(
                    `/bookings/event/${eventId}`,
                    { params: { page, size: PAGE_SIZE, sort: "bookingTime,desc" } }
                );
                setPageData(response.data);
            } catch (err: any) {
                const status = err.response?.status;
                if (status === 403 || status === 404) {
                    setErrorCode(status);
                } else {
                    setErrorCode(404);
                }
            } finally {
                setLoading(false);
            }
        }
        fetchBookings();
    }, [eventId, page]);

    if (loading && !pageData) return <Loader />;
    if (errorCode) return <ErrorPage code={errorCode} />;

    if (event?.status === "DRAFT") {
        return (
            <div className="admin-page">
                <div className="event-detail-header">
                    <button className="borderless-button" onClick={() => navigate("/my-events")}>
                        ← My Events
                    </button>
                </div>
                <div className="booking-success-screen booking-denied-screen" style={{ marginTop: "2rem" }}>
                    <h2 className="booking-denied-title">🚫 Access Denied</h2>
                    <p>You cannot view bookings for <strong>draft</strong> events, as they are not published yet.</p>
                    <div className="booking-denied-actions">
                        <button className="create-event-button" onClick={() => navigate(-1)}>
                            ← Go Back
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const bookings = pageData?.content ?? [];
    const totalBookings = pageData?.page.totalElements ?? 0;
    const canBroadcast = totalBookings > 0 && event && event.status !== "DRAFT" && event.status !== "CANCELLED";

    return (
        <div className="admin-page">
            <div className="event-detail-header">
                <button className="borderless-button" onClick={() => navigate("/my-events")}>
                    ← My Events
                </button>
            </div>

            <h1 className="header">Bookings for &ldquo;{event?.title ?? "..."}&rdquo;</h1>

            <p className="events-result-count">
                {totalBookings} booking{totalBookings !== 1 ? "s" : ""} in total
            </p>

            {/* Broadcast entry point — only shown when there's actually someone to message + is published/completed */}
            {canBroadcast && (
                <div className="my-events-top-bar">
                    <button
                        className="create-event-button"
                        onClick={() => navigate(`/my-events/${eventId}/broadcast`)}
                    >
                        📢 Message All Attendees
                    </button>
                </div>
            )}

            {bookings.length === 0 ? (
                <p className="events-status-message">No bookings yet for this event.</p>
            ) : (
                <div className="bookings-list">
                    {bookings.map(booking => {
                        // Hide "Message" button on the row that is the current user
                        // (e.g. organizer who test-booked their own event).
                        const canMessage = user && booking.attendee.userId !== user.userId;

                        return (
                            <div key={booking.bookingId} className="booking-card">
                                <div className="booking-card-attendee">
                                    <strong>
                                        {booking.attendee.firstName} {booking.attendee.lastName}
                                    </strong>
                                    <span className="booking-card-username">@{booking.attendee.username}</span>
                                    <span className="booking-card-meta">📧 {booking.attendee.email}</span>
                                </div>

                                <div className="booking-card-details">
                                    <span className="booking-card-meta">
                                        🎫 {booking.ticketType.name} × {booking.numberOfTickets}
                                    </span>
                                    <span className="booking-card-meta">
                                        💰 €{Number(booking.totalCost).toFixed(2)}
                                    </span>
                                    <span className="booking-card-meta">
                                        🗓 {new Date(booking.bookingTime).toLocaleString("el-GR")}
                                    </span>
                                </div>

                                <div className="booking-card-actions">
                                    <span
                                        className={`status-badge ${
                                            booking.bookingStatus === "CONFIRMED"
                                                ? "status-published"
                                                : "status-cancelled"
                                        }`}
                                    >
                                        {booking.bookingStatus}
                                    </span>
                                    {canMessage && (
                                        <button
                                            className="event-card-button-secondary"
                                            onClick={() => navigate(
                                                `/messages/compose?eventId=${eventId}&receiverId=${booking.attendee.userId}`
                                            )}
                                        >
                                            Message
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            <Pagination pageData={pageData} onPageChange={setPage} />
        </div>
    );
}