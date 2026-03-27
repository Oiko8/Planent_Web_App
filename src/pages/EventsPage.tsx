import { useMemo, useState } from "react";
import EventCard from "../components/EventCard";
import { mockEvents } from "../data/mockEvents";

export default function EventsPage() {
  const [search, setSearch] = useState("");

  const filteredEvents = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return mockEvents;

    return mockEvents.filter((event) =>
      [event.title, event.city, event.venue, event.type, event.description, ...event.category]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [search]);

  return (
    <div>
      <h1>Browse events</h1>

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search events"
      />

      <div>
        {filteredEvents.map((event) => (
          <EventCard
            key={event.id}
            event={event}
            onOpen={() => console.log("Open event", event.id)}
          />
        ))}
      </div>
    </div>
  );
}