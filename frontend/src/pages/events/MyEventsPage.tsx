import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axiosConfig";
import Pagination from "../../components/Pagination";
import type { EventSummary, PageResponse } from "../../types/event";
import { statusFormData } from "../../types/eventFormData";
import Loader from "../../components/Loader";

const PAGE_SIZE = 10;

export default function MyEventsPage() {
    // /events/my-events returns EventSummaryResponse, not the full event
    const [pageData, setPageData] = useState<PageResponse<EventSummary> | null>(null);
    const [page, setPage] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
    const [successMessage, setSuccessMessage] = useState("");
    const [deleteError, setDeleteError] = useState("");
    const navigate = useNavigate();

    // Refetches whenever `page` changes
    useEffect(() => {
        async function fetchMyEvents() {
            setLoading(true);
            try {
                const response = await api.get<PageResponse<EventSummary>>("/events/my-events", {
                    params: { page, size: PAGE_SIZE },
                });
                setPageData(response.data);
            } catch (err) {
                setError("Failed to load your events.");
            } finally {
                setLoading(false);
            }
        }
        fetchMyEvents();
    }, [page]);

    async function handleDelete(eventId: number) {
        setSuccessMessage("");
        setDeleteError("");

        try {
            await api.delete(`/events/${eventId}`);
            setPageData(prev => prev ? {
                ...prev,
                content: prev.content.filter(e => e.eventId !== eventId),
                page: { ...prev.page, totalElements: prev.page.totalElements - 1 },
            } : prev);
            setSuccessMessage("Event deleted successfully!");
        } catch (err: any) {
            const message = err.response?.data?.detail
                ?? "This event cannot be deleted because it is published and already has bookings.";
            setDeleteError(message);
        } finally {
            setConfirmDeleteId(null);
        }
    }

    async function handlePublish(eventId: number) {
        try {
            await api.patch(`/events/${eventId}`, statusFormData({ publish: true }));
            setPageData(prev => prev ? {
                ...prev,
                content: prev.content.map(e =>
                    e.eventId === eventId ? { ...e, status: "PUBLISHED" as const } : e
                ),
            } : prev);
            setSuccessMessage("Event published successfully!");
        } catch (err: any) {
            setDeleteError(err.response?.data?.detail ?? "Failed to publish event.");
        }
    }

    if (loading && !pageData) return <Loader />;
    if (error) return <p style={{ color: "red" }}>{error}</p>;

    const events = pageData?.content ?? [];

    return (
        <div>
            <h1 className="header">My Events</h1>

            {successMessage && (
                <div className="message-success">{successMessage}</div>
            )}

            {deleteError && (
                <div className="message-error">{deleteError}</div>
            )}

            <div className="my-events-top-bar">
                <button className="create-event-button" onClick={() => navigate("/create-event")}>
                    + Create New Event
                </button>
            </div>

            {events.length === 0 ? (
                <div style={{ textAlign: "center", color: "#64748b", marginTop: "1rem" }}>
                    <p>You have no events yet.</p>
                </div>
            ) : (
                <div>
                    {events.map((event) => (
                        <div key={event.eventId} className="my-event-card">
                            <div>
                                <h3 className="my-event-title">
                                    <button
                                        type="button"
                                        className="event-title-button"
                                        onClick={() => navigate(`/events/${event.eventId}`)}
                                    >
                                        {event.title}
                                    </button>
                                </h3>
                                <p className="event-card-meta">{event.eventType} — {event.city}, {event.country}</p>
                                <p className="event-card-meta" style={{ marginBottom: "0.6rem" }}>
                                    {new Date(event.startDatetime).toLocaleDateString("el-GR")}
                                </p>
                                <span className={`status-badge status-${event.status.toLowerCase()}`}>
                                    {event.status}
                                </span>
                            </div>

                            <div className="my-event-actions">
                                {/* View Bookings — hidden for DRAFT (no bookings possible yet) */}
                                {event.status !== "DRAFT" && (
                                    <button
                                        className="event-card-button-secondary"
                                        onClick={() => navigate(`/my-events/${event.eventId}/bookings`)}
                                    >
                                        View Bookings
                                    </button>
                                )}

                                {/* Edit — always visible except for completed/cancelled */}
                                {event.status !== "COMPLETED" && event.status !== "CANCELLED" && (
                                    <button
                                        className="event-card-button-secondary"
                                        onClick={() => navigate(`/edit-event/${event.eventId}`)}
                                    >
                                        Edit
                                    </button>
                                )}

                                {/* Publish — only for DRAFT */}
                                {event.status === "DRAFT" && (
                                    <button
                                        className="admin-btn-approve"
                                        onClick={() => handlePublish(event.eventId)}
                                    >
                                        Publish
                                    </button>
                                )}

                                {/* Delete — only for DRAFT */}
                                {event.status === "DRAFT" && confirmDeleteId !== event.eventId && (
                                    <button
                                        className="event-card-button-secondary"
                                        onClick={() => {
                                            setSuccessMessage("");
                                            setDeleteError("");
                                            setConfirmDeleteId(event.eventId);
                                        }}
                                    >
                                        Delete
                                    </button>
                                )}

                                {/* Inline delete confirmation */}
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

            <Pagination pageData={pageData} onPageChange={setPage} />
        </div>
    );
}