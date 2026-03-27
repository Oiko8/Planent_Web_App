import type { EventItem } from "../types/event";

type EventCardProps = {
    event: EventItem;
    onOpen: () => void;
};


export default function EventCard({ event, onOpen }: EventCardProps) {
    return (
        <div>
            <h3>{event.title}</h3>
            <p>{event.type} - {event.city} - {event.date}</p>
            <p>{event.description}</p>
            <button onClick={onOpen}>More</button>
        </div>
    );
}