import { useEffect, useState } from "react";
import api from "../api/axiosConfig";
import type { MessagePreview, MessageFull } from "../types/message";
import type { PageResponse } from "../types/event";
import { useNavigate } from "react-router-dom";
import Pagination from "../components/Pagination";

type Tab = "inbox" | "sent";

const PAGE_SIZE = 10;

export default function MessagePage() {
    const [activeTab, setActiveTab] = useState<Tab>("inbox");

    // Each tab keeps its own pageData + page state — they're independent lists
    const [inboxData, setInboxData] = useState<PageResponse<MessagePreview> | null>(null);
    const [sentData, setSentData] = useState<PageResponse<MessagePreview> | null>(null);
    const [inboxPage, setInboxPage] = useState(0);
    const [sentPage, setSentPage] = useState(0);

    const [loading, setLoading] = useState(true);
    const [expandedMessage, setExpandedMessage] = useState<MessageFull | null>(null);
    const [expandedId, setExpandedId] = useState<number | null>(null);
    const [error, setError] = useState("");

    const navigate = useNavigate();

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

    async function handleOpenMessage(messageId: number) {
        // Toggle — close if already open
        if (expandedId === messageId) {
            setExpandedId(null);
            setExpandedMessage(null);
            return;
        }

        try {
            const response = await api.get<MessageFull>(`/messages/${messageId}`);
            setExpandedMessage(response.data);
            setExpandedId(messageId);

            // Mark as read locally in inbox (server already marked it on GET)
            setInboxData(prev => prev ? {
                ...prev,
                content: prev.content.map(m =>
                    m.messageId === messageId ? { ...m, isRead: true } : m
                ),
            } : prev);
        } catch {
            setError("Failed to load message.");
        }
    }

    async function handleDelete(messageId: number) {
        try {
            await api.delete(`/messages/${messageId}`);
            // The same messageId can only appear in one of the two lists for
            // the current user, but it's safe to try filtering both.
            setInboxData(prev => prev ? {
                ...prev,
                content: prev.content.filter(m => m.messageId !== messageId),
                totalElements: prev.totalElements - 1,
            } : prev);
            setSentData(prev => prev ? {
                ...prev,
                content: prev.content.filter(m => m.messageId !== messageId),
                totalElements: prev.totalElements - 1,
            } : prev);
            if (expandedId === messageId) {
                setExpandedId(null);
                setExpandedMessage(null);
            }
        } catch {
            setError("Failed to delete message.");
        }
    }

    // Pick the right data and setter based on the active tab
    const currentData = activeTab === "inbox" ? inboxData : sentData;
    const onPageChange = activeTab === "inbox" ? setInboxPage : setSentPage;
    const currentMessages = currentData?.content ?? [];

    // Unread count only reflects the current inbox page — step 5 will replace
    // this with a dedicated /messages/unread-count endpoint
    const unreadCount = inboxData?.content.filter(m => !m.isRead).length ?? 0;

    if (loading && !inboxData) return <p className="header">Loading...</p>;

    return (
        <div className="admin-page">
            <h1 className="header">Messages</h1>

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
                            {unreadCount}
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
                <div key={message.messageId}>
                    <div
                        className={`message-card ${!message.isRead && activeTab === "inbox" ? "message-unread" : ""}`}
                        onClick={() => handleOpenMessage(message.messageId)}
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
                            <p className="message-card-preview">{message.bodyPreview}</p>
                        </div>

                        <button
                            className="admin-btn-reject"
                            onClick={e => {
                                e.stopPropagation();
                                handleDelete(message.messageId);
                            }}
                        >
                            Delete
                        </button>
                    </div>

                    {/* Expanded message body */}
                    {expandedId === message.messageId && expandedMessage && (
                        <div className="message-body-expanded">
                            <p>{expandedMessage.body}</p>
                            {activeTab === "inbox" && expandedMessage.eventId && (
                                <button
                                    className="event-card-button-secondary"
                                    style={{ marginTop: "1rem" }}
                                    onClick={() => navigate(
                                        `/messages/compose?eventId=${expandedMessage.eventId}&receiverId=${expandedMessage.otherUser.userId}`
                                    )}
                                >
                                    ↩ Reply
                                </button>
                            )}
                        </div>
                    )}
                </div>
            ))}

            {/* Pagination follows the active tab */}
            <Pagination pageData={currentData} onPageChange={onPageChange} />
        </div>
    );
}