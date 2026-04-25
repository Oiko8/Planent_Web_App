import { useEffect, useState } from "react";
import EventCard from "../components/EventCard";
import type { EventItem } from "../types/event";
import api from "../api/axiosConfig";

type WelcomePageProps = {
    onNavigate: (page: string) => void;
};

export default function WelcomePage({ onNavigate }: WelcomePageProps) {
    const [featuredEvents, setFeaturedEvents] = useState<EventItem[]>([]);

    useEffect(() => {
        async function fetchFeaturedEvents() {
            try {
                const response = await api.get("/events");
                // take only the first 2 events to feature
                setFeaturedEvents(response.data.slice(0, 2));
            } catch (err) {
                // silently fail — featured events are not critical
            }
        }
        fetchFeaturedEvents();
    }, []);

    return (
        <div className="welcome-page">
            <section className="welcome-header">
                <h1 className="welcome-title">Welcome to Planent: a world full of events</h1>
                <p className="welcome-description">Discover and book tickets for the best events in town.</p>
                <button className="welcome-button" onClick={() => onNavigate("events")}>Browse events</button>
            </section>

            <section className="featured-events">
                <h2>Famous events</h2>
                <div className="featured-events-grid">
                    {featuredEvents.length > 0 ? (
                        featuredEvents.map((event) => (
                            <EventCard
                                key={event.eventId}
                                event={event}
                                onOpen={() => onNavigate("events")}
                            />
                        ))
                    ) : (
                        <p>No featured events at the moment.</p>
                    )}
                </div>
            </section>
        </div>
    );
}