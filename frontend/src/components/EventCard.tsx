import type { EventItem } from "../types/event";

type EventCardProps = {
    event: EventItem;
    onOpen: () => void;
};

export default function EventCard({ event, onOpen }: EventCardProps) {
    const formattedDate = new Date(event.startDatetime).toLocaleDateString("el-GR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });

    const lowestPrice = event.ticketTypes.length > 0
        ? Math.min(...event.ticketTypes.map(t => t.price))
        : null;

    return (
        <div className="event-card">
            <div className="event-card-top">
                <span className="event-card-type">{event.eventType}</span>
                <h3 className="event-card-title">{event.title}</h3>
                <p className="event-card-meta">📍 {event.venue}, {event.city}</p>
                <p className="event-card-meta">🗓 {formattedDate}</p>
                <p className="event-card-description">{event.description}</p>
            </div>

            <div className="event-card-bottom">
                {lowestPrice !== null && (
                    <span className="event-card-price">From €{lowestPrice.toFixed(2)}</span>
                )}
                <div className="event-card-actions">
                    <button className="event-card-button-secondary" onClick={onOpen}>
                        More
                    </button>
                    <button className="event-card-button-primary" onClick={() => {}}>
                        Book Your Place
                    </button>
                </div>
            </div>
        </div>
    );
}