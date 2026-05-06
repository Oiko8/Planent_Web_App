import { useEffect, useState } from "react";
import api from "../api/axiosConfig";
import type { PageResponse, EventItem } from "../types/event";

type UserResponse = {
    userId: number;
    username: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    country: string;
    city: string;
    isApproved: boolean;
    isAdmin: boolean;
};

type Tab = "users" | "events";

export default function AdminPage() {
    const [activeTab, setActiveTab] = useState<Tab>("users");

    // Users state
    const [users, setUsers] = useState<UserResponse[]>([]);
    const [usersLoading, setUsersLoading] = useState(true);
    const [usersError, setUsersError] = useState("");
    const [userMessage, setUserMessage] = useState("");

    // Events state
    const [events, setEvents] = useState<EventItem[]>([]);
    const [eventsLoading, setEventsLoading] = useState(true);
    const [eventsError, setEventsError] = useState("");

    useEffect(() => {
        fetchUsers();
        fetchEvents();
    }, []);

    async function fetchUsers() {
        try {
            const response = await api.get("/users");
            setUsers(response.data);
        } catch (err) {
            setUsersError("Failed to load users.");
        } finally {
            setUsersLoading(false);
        }
    }

    async function fetchEvents() {
        try {
            const response = await api.get("/events?size=100");
            setEvents(response.data.content);
        } catch (err) {
            setEventsError("Failed to load events.");
        } finally {
            setEventsLoading(false);
        }
    }

    async function handleApprove(userId: number) {
        try {
            await api.patch(`/users/${userId}/approve`);
            setUsers(prev => prev.map(u =>
                u.userId === userId ? { ...u, isApproved: true } : u
            ));
            setUserMessage("User approved successfully.");
        } catch {
            setUserMessage("Failed to approve user.");
        }
    }

    async function handleReject(userId: number) {
        try {
            await api.delete(`/users/${userId}`);
            setUsers(prev => prev.filter(u => u.userId !== userId));
            setUserMessage("User rejected and removed.");
        } catch {
            setUserMessage("Failed to reject user.");
        }
    }

    async function handlePublishEvent(eventId: number) {
        try {
            await api.patch(`/events/${eventId}`, { publish: true });
            setEvents(prev => prev.map(e =>
                e.eventId === eventId ? { ...e, status: "PUBLISHED" as const } : e
            ));
        } catch (err: any) {
            setEventsError(err.response?.data?.detail ?? "Failed to publish event.");
        }
    }

    async function handleCancelEvent(eventId: number) {
        try {
            await api.patch(`/events/${eventId}`, { cancel: true });
            setEvents(prev => prev.map(e =>
                e.eventId === eventId ? { ...e, status: "CANCELLED" as const } : e
            ));
        } catch (err: any) {
            setEventsError(err.response?.data?.detail ?? "Failed to cancel event.");
        }
    }

    const pendingUsers = users.filter(u => !u.isApproved && !u.isAdmin);
    const approvedUsers = users.filter(u => u.isApproved && !u.isAdmin);

    return (
        <div className="admin-page">
            <h1 className="header">Admin Panel</h1>

            {/* Tabs */}
            <div className="admin-tabs">
                <button
                    className={`admin-tab ${activeTab === "users" ? "admin-tab-active" : ""}`}
                    onClick={() => setActiveTab("users")}
                >
                    Users
                </button>
                <button
                    className={`admin-tab ${activeTab === "events" ? "admin-tab-active" : ""}`}
                    onClick={() => setActiveTab("events")}
                >
                    Events
                </button>
            </div>

            {/* Users Tab */}
            {activeTab === "users" && (
                <div className="admin-section">
                    {userMessage && (
                        <div className="message-success">{userMessage}</div>
                    )}

                    {usersLoading && <p>Loading users...</p>}
                    {usersError && <p className="message-error">{usersError}</p>}

                    {/* Pending users */}
                    {pendingUsers.length > 0 && (
                        <>
                            <h2 className="admin-section-title">
                                Pending Approval
                                <span className="admin-badge">{pendingUsers.length}</span>
                            </h2>
                            {pendingUsers.map(user => (
                                <div key={user.userId} className="admin-user-card admin-user-pending">
                                    <div className="admin-user-info">
                                        <strong>{user.firstName} {user.lastName}</strong>
                                        <span className="admin-user-username">@{user.username}</span>
                                        <span className="admin-user-meta">{user.email} · {user.city}, {user.country}</span>
                                    </div>
                                    <div className="admin-user-actions">
                                        <button className="admin-btn-approve" onClick={() => handleApprove(user.userId)}>
                                            Approve
                                        </button>
                                        <button className="admin-btn-reject" onClick={() => handleReject(user.userId)}>
                                            Reject
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </>
                    )}

                    {pendingUsers.length === 0 && !usersLoading && (
                        <p className="admin-empty">No pending users.</p>
                    )}

                    {/* Approved users */}
                    <h2 className="admin-section-title" style={{ marginTop: "2rem" }}>
                        Approved Users
                        <span className="admin-badge">{approvedUsers.length}</span>
                    </h2>
                    {approvedUsers.map(user => (
                        <div key={user.userId} className="admin-user-card">
                            <div className="admin-user-info">
                                <strong>{user.firstName} {user.lastName}</strong>
                                <span className="admin-user-username">@{user.username}</span>
                                <span className="admin-user-meta">{user.email} · {user.city}, {user.country}</span>
                            </div>
                            <span className="status-badge status-published">Active</span>
                        </div>
                    ))}
                </div>
            )}

            {/* Events Tab */}
            {activeTab === "events" && (
                <div className="admin-section">
                    {eventsLoading && <p>Loading events...</p>}
                    {eventsError && <p className="message-error">{eventsError}</p>}

                    {events.length === 0 && !eventsLoading && (
                        <p className="admin-empty">No events found.</p>
                    )}

                    {events.map(event => (
                        <div key={event.eventId} className="admin-user-card">
                            <div className="admin-user-info">
                                <strong>{event.title}</strong>
                                <span className="admin-user-meta">
                                    {event.eventType} · {event.city}, {event.country}
                                </span>
                                <span className="admin-user-meta">
                                    {new Date(event.startDatetime).toLocaleDateString("el-GR")}
                                </span>
                            </div>
                            <div className="admin-user-actions">
                                <span className={`status-badge status-${event.status.toLowerCase()}`}>
                                    {event.status}
                                </span>
                                {event.status === "DRAFT" && (
                                    <button
                                        className="admin-btn-approve"
                                        onClick={() => handlePublishEvent(event.eventId)}
                                    >
                                        Publish
                                    </button>
                                )}
                                {event.status === "PUBLISHED" && (
                                    <button
                                        className="admin-btn-reject"
                                        onClick={() => handleCancelEvent(event.eventId)}
                                    >
                                        Cancel
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}