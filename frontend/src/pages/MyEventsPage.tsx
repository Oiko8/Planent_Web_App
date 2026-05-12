import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axiosConfig";
import Pagination from "../components/Pagination";
import type { EventItem, PageResponse } from "../types/event";

const PAGE_SIZE = 10;

export default function MyEventsPage() {
    const [pageData, setPageData] = useState<PageResponse<EventItem> | null>(null);
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
                const response = await api.get<PageResponse<EventItem>>("/events/my-events", {
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
            // Local update: drop the event from current page's content.
            // totalElements/totalPages stay slightly stale until next page navigation;
            // for perfect accuracy you would refetch the page here instead.
            setPageData(prev => prev ? {
                ...prev,
                content: prev.content.filter(e => e.eventId !== eventId),
                totalElements: prev.totalElements - 1,
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
            await api.patch(`/events/${eventId}`, { publish: true });
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

    if (loading && !pageData) return <p>Loading your events...</p>;
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

            {/* Create button */}
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
                                <h3>{event.title}</h3>
                                <p>{event.eventType} — {event.city}, {event.country}</p>
                                <p>{new Date(event.startDatetime).toLocaleDateString("el-GR")}</p>
                                <span className={`status-badge status-${event.status.toLowerCase()}`}>
                                    {event.status}
                                </span>
                            </div>

                            <div className="my-event-actions">
                                {/* Edit — always visible except for completed */}
                                {event.status !== "COMPLETED" && (
                                    <button
                                        className="borderless-button"
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

                                {/* Inline confirmation */}
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