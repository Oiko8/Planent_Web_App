import { useEffect, useMemo, useState } from "react";
import EventCard from "../components/EventCard";
import { EventItem } from "../types/event";
import api from "../api/axiosConfig";

const CATEGORIES = ["Music", "Workshop", "Sports", "Theater", "Festival", "Culture", "Technology", "Other"];


export default function EventsPage() {
    const [events, setEvents] = useState<EventItem[]>([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Fetch the events from the api
    useEffect(() => {
        const controller = new AbortController();

        async function fetchEvents() {
            try {
                const response = await api.get("/events", { signal: controller.signal });
                setEvents(response.data.content);
                setLoading(false);
            } catch (err: any) {
                if (err.name !== "CanceledError") {
                    setError("Failed to load events. Please try again.");
                }
                setLoading(false);

            }
        }

        fetchEvents();

        return () => controller.abort(); // cancel fetch if component unmounts
    }, []);


  
    const filteredEvents = useMemo(() => {
        const q = search.toLowerCase().trim();
        if (!q) return events;

        return events.filter((event) =>
            [event.title, event.city, event.venue, event.eventType, event.description,
            ...event.categories.map(c => c.categoryName)]
            .join(" ")
            .toLowerCase()
            .includes(q)
        );
    }, [search, events]);

    if (loading) return <p>Loading events...</p>;
    if (error) return <p style={{ color: "red" }}>{error}</p>;

    return (
        <div>
        <h1 className="header">Browse events</h1>

        <div className="event-body">
            <input
            className="search-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="🔍  Search events by title, city, type..."
            />
        </div>

        {loading && <p>Loading events...</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}

        {CATEGORIES.map((category) => {
            const categoryEvents = filteredEvents.filter((event) =>
            event.categories.some(c => c.categoryName === category)
            );

            if (categoryEvents.length === 0) return null;

            return (
            <section className="category-section" key={category}>
                <h2 className="category-title">{category}</h2>
                <div className="event-body-grid">
                {categoryEvents.map((event) => (
                    <EventCard
                    key={event.eventId}
                    event={event}
                    onOpen={() => console.log("Open event", event.eventId)}
                    />
                ))}
                </div>
            </section>
            );
        })}
        </div>
    );
}