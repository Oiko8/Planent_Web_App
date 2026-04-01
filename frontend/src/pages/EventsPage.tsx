import { useMemo, useState } from "react";
import EventCard from "../components/EventCard";
import { mockEvents } from "../data/mockEvents";
import type { EventCategory } from "../types/event";

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

  const categories: EventCategory[] = ["Music", "Workshop", "Sports", "Theater", "Festival", "Culture", "Technology", "Other"];

  return (
    <div>
      <h1 className="header">Browse events</h1>

      <div className="event-body">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search events"
        />
      </div>

      {categories.map((category) => {
        const categoryEvents = filteredEvents.filter((event) => 
          event.category.includes(category)
        );

        return (
          <section className="category-section" key={category}>
            <h2 className="category-title">{category}</h2>

            <div className="event-body-grid">
              {categoryEvents.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  onOpen={() => console.log("Open event", event.id)}
                />
              ))}
            </div>
          </section>
        );
      }
      )}
    </div>
  );
}