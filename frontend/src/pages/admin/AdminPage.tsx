import { useEffect, useState } from "react";
import api from "../../api/axiosConfig";
import type { PageResponse, EventSummary } from "../../types/event";
import type { User } from "../../types/user";
import { statusFormData } from "../../types/eventFormData";
import Loader from "../../components/Loader";
import UserDropdownDetails from "../../components/UserDropdown";
import Pagination from "../../components/Pagination";
import { useNavigate } from "react-router-dom";

type Tab = "users" | "events";

const PAGE_SIZE = 10;

export default function AdminPage() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<Tab>("users");

    // Users state
    const [users, setUsers] = useState<User[]>([]);
    const [usersLoading, setUsersLoading] = useState(true);
    const [usersError, setUsersError] = useState("");
    const [userMessage, setUserMessage] = useState("");
    // User dropdown for details
    const [expandedUserId, setExpandedUserId] = useState<number | null>(null);

    // Events state — /events returns EventSummaryResponse, not the full event
    const [eventsPageData, setEventsPageData] = useState<PageResponse<EventSummary> | null>(null);
    const [eventsPage, setEventsPage] = useState(0);
    const [eventsLoading, setEventsLoading] = useState(true);
    const [eventsError, setEventsError] = useState("");

    // Export state
    const [exporting, setExporting] = useState<"xml" | "json" | null>(null);
    const [exportError, setExportError] = useState("");

    // Fetch users once when first loading
    useEffect(() => {
        fetchUsers();
    }, []);

    // Fetch on page change
    useEffect(() => {
        fetchEvents();
    }, [eventsPage]);

    async function fetchUsers() {
        try {
            const response = await api.get<User[]>("/users");
            setUsers(response.data);
        } catch (err) {
            setUsersError("Failed to load users.");
        } finally {
            setUsersLoading(false);
        }
    }

    async function fetchEvents() {
        try {
            const response = await api.get<PageResponse<EventSummary>>("/events", {
                params: {
                    page: eventsPage,
                    size: PAGE_SIZE
                },
            });
            setEventsPageData(response.data);
        } catch (err) {
            setEventsError("Failed to load events.");
        } finally {
            setEventsLoading(false);
        }
    }

    // User dropdown
    const toggleUserDropdown = (userId: number) => {
        setExpandedUserId(prev => (prev === userId ? null : userId));
    };

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
            await api.patch(`/events/${eventId}`, statusFormData({ publish: true }));
            setEventsPageData(prev => {
                if (!prev) return null;
                return {
                    ...prev,
                    content: prev.content.map(e =>
                        e.eventId === eventId ? { ...e, status: "PUBLISHED" as const } : e
                    )
                };
            });
        } catch (err: any) {
            setEventsError(err.response?.data?.detail ?? "Failed to publish event.");
        }
    }

    async function handleCancelEvent(eventId: number) {
        try {
            await api.patch(`/events/${eventId}`, statusFormData({ cancel: true }));
            setEventsPageData(prev => {
                if (!prev) return null;
                return {
                    ...prev,
                    content: prev.content.map(e =>
                        e.eventId === eventId ? { ...e, status: "CANCELLED" as const } : e
                    )
                };
            });
        } catch (err: any) {
            setEventsError(err.response?.data?.detail ?? "Failed to cancel event.");
        }
    }

    async function handleExport(format: "xml" | "json") {
        setExporting(format);
        setExportError("");
        try {
            const response = await api.get("/admin/export/events", {
                params: { format },
                responseType: "blob",
            });

            // Pull filename from Content-Disposition; fall back to a sensible default.
            const disposition = (response.headers["content-disposition"] ?? "") as string;
            const match = /filename="?([^"]+)"?/.exec(disposition);
            const filename = match?.[1] ?? `events-export.${format}`;

            // Build a download link and click it. The browser handles the rest.
            const blob = new Blob([response.data], {
                type: format === "xml" ? "application/xml" : "application/json",
            });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (err: any) {
            // With responseType:"blob", error bodies come back as Blob too
            let detail = `Failed to export events as ${format.toUpperCase()}.`;
            if (err.response?.data instanceof Blob) {
                try {
                    const text = await err.response.data.text();
                    const parsed = JSON.parse(text);
                    detail = parsed.detail ?? parsed.error ?? detail;
                } catch {
                    // not json - generic message
                }
            } else if (err.response?.data?.detail) {
                detail = err.response.data.detail;
            }
            setExportError(detail);
        } finally {
            setExporting(null);
        }
    }

    const pendingUsers = users.filter(u => !u.isApproved && !u.isAdmin);
    const approvedUsers = users.filter(u => u.isApproved && !u.isAdmin);
    const events = eventsPageData?.content ?? [];

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
                                <div key={user.userId} className="admin-user-container">
                                    <div
                                        className="admin-user-card admin-user-pending admin-clickable"
                                        onClick={() => toggleUserDropdown(user.userId)}
                                    >
                                        <div className="admin-user-info">
                                            <strong>{user.firstName} {user.lastName}</strong>
                                            <span className="admin-user-username">@{user.username}</span>
                                            <span className="admin-user-meta">{user.email} · {user.city}, {user.country}</span>
                                        </div>
                                        <div className="admin-user-actions" onClick={(e) => e.stopPropagation()}>
                                            <button className="admin-btn-approve" onClick={() => handleApprove(user.userId)}>
                                                Approve
                                            </button>
                                            <button className="admin-btn-reject" onClick={() => handleReject(user.userId)}>
                                                Reject
                                            </button>
                                            <span className="admin-dropdown-arrow" onClick={() => toggleUserDropdown(user.userId)}>
                                                {expandedUserId === user.userId ? "▲" : "▼"}
                                            </span>
                                        </div>
                                    </div>

                                    {expandedUserId === user.userId && (
                                        <UserDropdownDetails user={user} />
                                    )}
                                </div>
                            ))}
                        </>
                    )}

                    {pendingUsers.length === 0 && !usersLoading && (
                        <p className="admin-empty">No pending users.</p>
                    )}

                    {/* Approved users */}
                    <h2 className="admin-section-title">
                        Approved Users
                        <span className="admin-badge">{approvedUsers.length}</span>
                    </h2>
                    {approvedUsers.map(user => (
                        <div key={user.userId} className="admin-user-container">
                            <div
                                className="admin-user-card admin-clickable"
                                onClick={() => toggleUserDropdown(user.userId)}
                            >
                                <div className="admin-user-info">
                                    <strong>{user.firstName} {user.lastName}</strong>
                                    <span className="admin-user-username">@{user.username}</span>
                                    <span className="admin-user-meta">{user.email} · {user.city}, {user.country}</span>
                                </div>
                                <div className="admin-user-actions flex-actions" onClick={(e) => e.stopPropagation()}>
                                    <span className="status-badge status-published">Active</span>
                                    <span className="admin-dropdown-arrow" onClick={() => toggleUserDropdown(user.userId)}>
                                        {expandedUserId === user.userId ? "▲" : "▼"}
                                    </span>
                                </div>
                            </div>

                            {expandedUserId === user.userId && (
                                <UserDropdownDetails user={user} />
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Events Tab */}
            {activeTab === "events" && (
                <div className="admin-section">
                    {/* Export bar */}
                    <div className="admin-export-bar">
                        <button
                            className="create-event-button"
                            onClick={() => handleExport("xml")}
                            disabled={exporting !== null}
                        >
                            {exporting === "xml" ? "Exporting..." : "📥 Export XML"}
                        </button>
                        <button
                            className="create-event-button"
                            onClick={() => handleExport("json")}
                            disabled={exporting !== null}
                        >
                            {exporting === "json" ? "Exporting..." : "📥 Export JSON"}
                        </button>
                    </div>

                    {exportError && <div className="message-error">{exportError}</div>}

                    {eventsLoading && <Loader />}
                    {eventsError && <p className="message-error">{eventsError}</p>}

                    {!eventsLoading && !eventsError && events.length === 0 && (
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

                    <Pagination pageData={eventsPageData} onPageChange={setEventsPage} />
                </div>
            )}
        </div>
    );
}