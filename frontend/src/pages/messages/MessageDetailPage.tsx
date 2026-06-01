import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/axiosConfig";
import type { MessageFull } from "../../types/message";
import Loader from "../../components/Loader";

export default function MessageDetailPage() {
    const { messageId } = useParams();
    const navigate = useNavigate();

    const [message, setMessage] = useState<MessageFull | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [deleting, setDeleting] = useState(false);

    // Fetch the full message on mount. The backend marks it as read inside this GET.
    useEffect(() => {
        if (!messageId) return;
        async function fetchMessage() {
            try {
                const response = await api.get<MessageFull>(`/messages/${messageId}`);
                setMessage(response.data);
            } catch (err: any) {
                const status = err.response?.status;
                if (status === 403) setError("You are not authorized to view this message.");
                else if (status === 404) setError("Message not found.");
                else setError(err.response?.data?.detail ?? "Failed to load message.");
            } finally {
                setLoading(false);
            }
        }
        fetchMessage();
    }, [messageId]);

    async function handleDelete() {
        if (!message) return;
        setDeleting(true);
        try {
            await api.delete(`/messages/${message.messageId}`);
            navigate("/messages");
        } catch (err: any) {
            setError(err.response?.data?.detail ?? "Failed to delete message.");
            setDeleting(false);
            setConfirmDelete(false);
        }
    }

    function handleReply() {
        if (!message?.eventId) return;
        navigate(
            `/messages/compose?eventId=${message.eventId}&receiverId=${message.otherUser.userId}`
        );
    }

    if (loading) return <Loader />;

    if (error || !message) {
        return (
            <div className="admin-page">
                <div className="event-detail-header">
                    <button className="borderless-button" onClick={() => navigate("/messages")}>
                        ← Messages
                    </button>
                </div>
                <div className="message-error">{error || "Message not found."}</div>
            </div>
        );
    }

    return (
        <div className="admin-page">
            <div className="event-detail-header">
                <button className="borderless-button" onClick={() => navigate("/messages")}>
                    ← Messages
                </button>
            </div>

            <article className="message-detail">
                {/* Subject (always the event title — every message is tied to an event) */}
                {message.eventTitle && (
                    <header className="message-detail-subject">
                        <span className="message-detail-subject-label">Subject</span>
                        <span className="message-detail-subject-text">
                            Re: {message.eventTitle}
                        </span>
                    </header>
                )}

                {/* Meta — who it's from + a link back to the event */}
                <div className="message-detail-meta">
                    <p className="message-detail-from">
                        From{" "}
                        <strong>
                            {message.otherUser.firstName} {message.otherUser.lastName}
                        </strong>
                        <span className="message-detail-username">
                            {" @"}{message.otherUser.username}
                        </span>
                    </p>
                    {message.eventId && (
                        <button
                            className="event-card-button-secondary"
                            onClick={() => navigate(`/events/${message.eventId}`)}
                        >
                            View event →
                        </button>
                    )}
                </div>

                {/* Body */}
                <div className="message-detail-body">{message.body}</div>

                {/* Actions */}
                <footer className="message-detail-actions">
                    {message.eventId && (
                        <button
                            className="auth-button"
                            style={{ marginTop: 0 }}
                            onClick={handleReply}
                        >
                            ↩ Reply
                        </button>
                    )}

                    {!confirmDelete ? (
                        <button
                            className="admin-btn-reject"
                            onClick={() => setConfirmDelete(true)}
                            disabled={deleting}
                        >
                            Delete
                        </button>
                    ) : (
                        <div className="confirm-banner-inline">
                            <p>Delete this message?</p>
                            <button onClick={handleDelete} disabled={deleting}>
                                {deleting ? "..." : "Yes, delete"}
                            </button>
                            <button
                                onClick={() => setConfirmDelete(false)}
                                disabled={deleting}
                            >
                                Cancel
                            </button>
                        </div>
                    )}
                </footer>
            </article>
        </div>
    );
}