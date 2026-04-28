import { useEffect, useState } from "react";
import EventCard from "../components/EventCard";
import type { EventItem } from "../types/event";
import api from "../api/axiosConfig";
import { useNavigate } from "react-router-dom";


export default function WelcomePage() {
    const [featuredEvents, setFeaturedEvents] = useState<EventItem[]>([]);
    const navigate = useNavigate()

    useEffect(() => {
        async function fetchFeaturedEvents() {
            try {
                const response = await api.get("/events");
                // take only the first 2 events to feature
                setFeaturedEvents(response.data.content.slice(0, 2));
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
                <button className="welcome-button" onClick={() => navigate("/events")}>Browse events</button>
            </section>

            <section className="featured-events">
                <h2>Famous events</h2>
                <div className="featured-events-grid">
                    {featuredEvents.length > 0 ? (
                        featuredEvents.map((event) => (
                            <EventCard
                                key={event.eventId}
                                event={event}
                                onOpen={() => navigate("/events")}
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