import EventCard from "../components/EventCard";
import { mockEvents } from "../data/mockEvents";

type WelcomePageProps = {
    onNavigate: (page: string) => void;
};

export default function WelcomePage({ onNavigate }: WelcomePageProps) {

    const featuredEvents = mockEvents.slice(0, 2);

    return(
        <div className="welcome-page">
            <section className="welcome-header">
                <h1 className="welcome-title">Welcome to Planent: a world full of events</h1>
                <p className="welcome-description">Discover and book tickets for the best events in town.</p>
                <button className="welcome-button" onClick={() => onNavigate("events")}>Browse events</button>
            </section>

            <section className="featured-events">
                <h2>Famous events</h2>

                <div className="featured-events-grid">
                {featuredEvents.map((event) => (
                    <EventCard
                    key={event.id}
                    event={event}
                    onOpen={() => onNavigate("events")}
                    />
                ))}
                </div>
            </section>

        </div>
        
    );
}