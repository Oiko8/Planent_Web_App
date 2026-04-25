import type { EventItem } from "../types/event";

type EventCardProps = {
    event: EventItem;
    onOpen: () => void;
};

export default function EventCard({ event, onOpen }: EventCardProps) {
    return (
        <div>
            <h3>{event.title}</h3>
            <p>{event.eventType} - {event.city} - {event.startDatetime}</p>
            <p>{event.description}</p>
            <button className="borderless-button-event" onClick={onOpen}>More...</button>
        </div>
    );
}