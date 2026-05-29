import { useNavigate } from "react-router-dom";
import type { EventSummary } from "../types/event";

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

    return (
        <div className="event-card">
            {event.mainMedia && (
                <img
                    className="event-card-image"
                    src={event.mainMedia.photoUrl}
                    alt={event.title}
                />
            )}

            <div className="event-card-top">
                <span className="event-card-type">{event.eventType}</span>
                <h3 className="event-card-title">{event.title}</h3>
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
                    <button
                        className="event-card-button-primary"
                        onClick={() => navigate(`/book/${event.eventId}`)}
                    >
                        Book Your Place
                    </button>
                </div>
            </div>
        </div>
    );
}