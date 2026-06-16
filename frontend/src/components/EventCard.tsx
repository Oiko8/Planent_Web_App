import { useNavigate } from "react-router-dom";
import type { EventSummary } from "../types/event";
import { mediaUrl } from "../api/media";

type EventCardProps = {
    event: EventSummary;
};

export default function EventCard({ event }: EventCardProps) {
    const navigate = useNavigate();

    const formattedDate = new Date(event.startDatetime).toLocaleDateString("el-GR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });

    const imageSrc = mediaUrl(event.mainMedia?.photoUrl);
    const isClosed = event.status === "CANCELLED" || event.status === "COMPLETED";

    return (
        <div className="event-card">

            <div className="event-card-image-container">
                {imageSrc ? (
                    <img src={imageSrc} alt={event.title} className="event-card-image" />
                ) : (
                    <div className="event-card-image-placeholder">
                        {/* No media placeholder */}
                        <span></span>
                    </div>
                )}
            </div>
            {isClosed && (
                <span className={`status-badge status-${event.status.toLowerCase()}`}>
                    {event.status}
                </span>
            )}

            <div className="event-card-top">
                <span className="event-card-type">{event.eventType}</span>
                {/* Clickable Title */}
                <h3 className="event-card-title">
                    <button
                        type="button"
                        className="event-title-button"
                        onClick={() => navigate(`/events/${event.eventId}`)}
                    >
                        {event.title}
                    </button>
                </h3>
                <p className="event-card-meta">📍 {event.venue}, {event.city}</p>
                <p className="event-card-meta">🗓 {formattedDate}</p>
                {/* summary endpoint sends `descriptionSummary`, not `description` */}
                <p className="event-card-description">{event.descriptionSummary}</p>
            </div>

            <div className="event-card-bottom">
                <div className="event-card-actions">
                    <button
                        className="event-card-button-secondary"
                        onClick={() => navigate(`/events/${event.eventId}`)}
                    >
                        More
                    </button>
                    {!isClosed && (
                        <button
                            className="event-card-button-primary"
                            onClick={() => navigate(`/book/${event.eventId}`)}
                        >
                            Book Your Place
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}