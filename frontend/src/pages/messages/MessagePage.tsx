import { useEffect, useState } from "react";
import api from "../../api/axiosConfig";
import type { MessagePreview } from "../../types/message";
import type { PageResponse } from "../../types/event";
import { useNavigate } from "react-router-dom";
import Pagination from "../../components/Pagination";
import Loader from "../../components/Loader";

type Tab = "inbox" | "sent";

const PAGE_SIZE = 10;

export default function MessagePage() {
    const [activeTab, setActiveTab] = useState<Tab>("inbox");

    // Each tab keeps its own pageData + page state — they're independent lists
    const [inboxData, setInboxData] = useState<PageResponse<MessagePreview> | null>(null);
    const [sentData, setSentData] = useState<PageResponse<MessagePreview> | null>(null);
    const [inboxPage, setInboxPage] = useState(0);
    const [sentPage, setSentPage] = useState(0);

    // Total unread count across all inbox pages — fetched from a dedicated endpoint
    const [unreadCount, setUnreadCount] = useState(0);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const navigate = useNavigate();

    // Fetch unread count on mount. This page remounts when the user returns
    // from the detail view, so the count refreshes naturally.
    useEffect(() => {
        api.get<{ count: number }>("/messages/unread-count")
            .then(res => setUnreadCount(res.data.count))
            .catch(() => { /* non-critical */ });
    }, []);

    // Fetch inbox whenever inboxPage changes
    useEffect(() => {
        async function fetchInbox() {
            try {
                const response = await api.get<PageResponse<MessagePreview>>("/messages/inbox", {
                    params: { page: inboxPage, size: PAGE_SIZE },
                });
                setInboxData(response.data);
            } catch {
                setError("Failed to load inbox.");
            } finally {
                setLoading(false);
            }
        }
        fetchInbox();
    }, [inboxPage]);

    // Fetch sent whenever sentPage changes
    useEffect(() => {
        async function fetchSent() {
            try {
                const response = await api.get<PageResponse<MessagePreview>>("/messages/sent", {
                    params: { page: sentPage, size: PAGE_SIZE },
                });
                setSentData(response.data);
            } catch {
                setError("Failed to load sent messages.");
            }
        }
        fetchSent();
    }, [sentPage]);

    async function handleDelete(e: React.MouseEvent, messageId: number) {
        e.stopPropagation(); // don't trigger the row's navigate
        try {
            await api.delete(`/messages/${messageId}`);

            // If we just deleted an unread inbox message, drop the count too
            const deletingUnreadInbox = inboxData?.content.some(
                m => m.messageId === messageId && !m.isRead
            );
            if (deletingUnreadInbox) {
                setUnreadCount(prev => Math.max(0, prev - 1));
            }

            // The same messageId only appears in one of the two lists for a given
            // user, but filtering both is safe and saves a branch.
            setInboxData(prev => prev ? {
                ...prev,
                content: prev.content.filter(m => m.messageId !== messageId),
                page: { ...prev.page, totalElements: prev.page.totalElements - 1 },
            } : prev);
            setSentData(prev => prev ? {
                ...prev,
                content: prev.content.filter(m => m.messageId !== messageId),
                page: { ...prev.page, totalElements: prev.page.totalElements - 1 },
            } : prev);
        } catch {
            setError("Failed to delete message.");
        }
    }

    // Pick the right data and setter based on the active tab
    const currentData = activeTab === "inbox" ? inboxData : sentData;
    const onPageChange = activeTab === "inbox" ? setInboxPage : setSentPage;
    const currentMessages = currentData?.content ?? [];

    // Cap large counts to "9+" for visual balance
    const badgeLabel = unreadCount > 9 ? "9+" : unreadCount;

    if (loading && !inboxData) return <Loader />;

    return (
        <div className="admin-page">
            <h1 className="header">Messages</h1>

            {/* Compose entry point */}
            <div className="my-events-top-bar">
                <button
                    className="create-event-button"
                    onClick={() => navigate("/messages/new")}
                >
                    + New Message
                </button>
            </div>

            {error && <div className="message-error">{error}</div>}

            {/* Tabs */}
            <div className="admin-tabs">
                <button
                    className={`admin-tab ${activeTab === "inbox" ? "admin-tab-active" : ""}`}
                    onClick={() => setActiveTab("inbox")}
                >
                    Inbox
                    {unreadCount > 0 && (
                        <span className="admin-badge" style={{ marginLeft: "0.5rem" }}>
                            {badgeLabel}
                        </span>
                    )}
                </button>
                <button
                    className={`admin-tab ${activeTab === "sent" ? "admin-tab-active" : ""}`}
                    onClick={() => setActiveTab("sent")}
                >
                    Sent
                </button>
            </div>

            {/* Message list */}
            {currentMessages.length === 0 && (
                <p className="admin-empty">
                    {activeTab === "inbox" ? "Your inbox is empty." : "You have no sent messages."}
                </p>
            )}

            {currentMessages.map(message => (
                <div
                    key={message.messageId}
                    className={`message-card ${!message.isRead && activeTab === "inbox" ? "message-unread" : ""}`}
                    onClick={() => navigate(`/messages/${message.messageId}`)}
                >
                    <div className="message-card-info">
                        <div className="message-card-header">
                            <span className="message-card-user">
                                {activeTab === "inbox" ? "From" : "To"}: {message.otherUser.firstName} {message.otherUser.lastName}
                                <span className="message-card-username"> @{message.otherUser.username}</span>
                            </span>
                            {!message.isRead && activeTab === "inbox" && (
                                <span className="message-unread-dot" />
                            )}
                        </div>

                        {/* Subject — the event this message refers to */}
                        {message.eventTitle && (
                            <p className="message-card-subject">
                                Re: <strong>{message.eventTitle}</strong>
                            </p>
                        )}

                        <p className="message-card-preview">{message.bodyPreview}</p>
                    </div>

                    <button
                        className="admin-btn-reject"
                        onClick={e => handleDelete(e, message.messageId)}
                    >
                        Delete
                    </button>
                </div>
            ))}

            {/* Pagination follows the active tab */}
            <Pagination pageData={currentData} onPageChange={onPageChange} />
        </div>
    );
}