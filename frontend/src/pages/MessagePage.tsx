import { useEffect, useState } from "react";
import api from "../api/axiosConfig";
import type { MessagePreview, MessageFull } from "../types/message";
import type { PageResponse } from "../types/event";
import { useNavigate } from "react-router-dom";

type Tab = "inbox" | "sent";

export default function MessagePage() {
    const [activeTab, setActiveTab] = useState<Tab>("inbox");
    const [inbox, setInbox] = useState<MessagePreview[]>([]);
    const [sent, setSent] = useState<MessagePreview[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedMessage, setExpandedMessage] = useState<MessageFull | null>(null);
    const [expandedId, setExpandedId] = useState<number | null>(null);
    const [error, setError] = useState("");

    const navigate = useNavigate();

    useEffect(() => {
        fetchMessages();
    }, []);

    async function fetchMessages() {
        setLoading(true);
        try {
            const [inboxRes, sentRes] = await Promise.all([
                api.get<PageResponse<MessagePreview>>("/messages/inbox"),
                api.get<PageResponse<MessagePreview>>("/messages/sent"),
            ]);
            setInbox(inboxRes.data.content);
            setSent(sentRes.data.content);
        } catch {
            setError("Failed to load messages.");
        } finally {
            setLoading(false);
        }
    }

    async function handleOpenMessage(messageId: number) {
        // toggle — close if already open
        if (expandedId === messageId) {
            setExpandedId(null);
            setExpandedMessage(null);
            return;
        }

        try {
            const response = await api.get<MessageFull>(`/messages/${messageId}`);
            setExpandedMessage(response.data);
            setExpandedId(messageId);

            // mark as read locally in inbox
            setInbox(prev => prev.map(m =>
                m.messageId === messageId ? { ...m, isRead: true } : m
            ));
        } catch {
            setError("Failed to load message.");
        }
    }

    async function handleDelete(messageId: number) {
        try {
            await api.delete(`/messages/${messageId}`);
            setInbox(prev => prev.filter(m => m.messageId !== messageId));
            setSent(prev => prev.filter(m => m.messageId !== messageId));
            if (expandedId === messageId) {
                setExpandedId(null);
                setExpandedMessage(null);
            }
        } catch {
            setError("Failed to delete message.");
        }
    }

    const unreadCount = inbox.filter(m => !m.isRead).length;
    const currentMessages = activeTab === "inbox" ? inbox : sent;

    if (loading) return <p className="header">Loading...</p>;

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
                                e.stopPropagation(); // prevent opening message
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
        </div>
    );
}