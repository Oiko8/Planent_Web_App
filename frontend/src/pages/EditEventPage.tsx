import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axiosConfig";
import { UpdateEventForm } from "../types/updateEventData";
import LocationAutocomplete from "../components/LocationAutocomplete";

export default function EditEventPage() {
    const { eventId } = useParams();
    const navigate = useNavigate();

    const [eventForm, setEventForm] = useState<UpdateEventForm>({
        title: "",
        eventType: "",
        venue: "",
        country: "",
        city: "",
        address: "",
        latitude: null,
        longitude: null,
        startDatetime: "",
        endDatetime: "",
        capacity: 0,
        description: "",
        categoryIds: [],
        ticketTypes: [],
    });

    const [eventStatus, setEventStatus] = useState<string>("");
    const [availableCategories, setAvailableCategories] = useState<{ categoryId: number; categoryName: string }[]>([]);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");
    const [confirmCancel, setConfirmCancel] = useState(false);

    // fetch event data and categories on mount
    useEffect(() => {
        async function fetchData() {
            try {
                const [eventRes, categoriesRes] = await Promise.all([
                    api.get(`/events/${eventId}`),
                    api.get("/events/categories"),
                ]);

                const event = eventRes.data;
                setEventStatus(event.status);
                setAvailableCategories(categoriesRes.data);

                // convert ISO datetimes to datetime-local input format (YYYY-MM-DDTHH:MM)
                const toLocalInput = (iso: string) =>
                    new Date(iso).toISOString().slice(0, 16);

                setEventForm({
                    title: event.title,
                    eventType: event.eventType,
                    venue: event.venue,
                    country: event.country,
                    city: event.city,
                    address: event.address,
                    latitude: event.latitude,
                    longitude: event.longitude,
                    startDatetime: toLocalInput(event.startDatetime),
                    endDatetime: toLocalInput(event.endDatetime),
                    capacity: event.capacity,
                    description: event.description,
                    categoryIds: event.categories.map((c: any) => c.categoryId),
                    ticketTypes: event.ticketTypes.map((t: any) => ({
                        name: t.name,
                        price: t.price,
                        quantity: t.quantity,
                    })),
                });
            } catch (err) {
                setErrorMessage("Failed to load event.");
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [eventId]);

    function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
        const { name, value, type } = e.target;
        setEventForm(prev => ({
            ...prev,
            [name]: type === "number" ? (value === "" ? null : Number(value)) : value,
        }));
    }

    function handleCategoryToggle(categoryId: number) {
        setEventForm(prev => {
            const already = prev.categoryIds.includes(categoryId);
            return {
                ...prev,
                categoryIds: already
                    ? prev.categoryIds.filter(id => id !== categoryId)
                    : [...prev.categoryIds, categoryId],
            };
        });
    }

    function handleTicketChange(index: number, field: string, value: string) {
        setEventForm(prev => {
            const updated = [...prev.ticketTypes];
            updated[index] = {
                ...updated[index],
                [field]: field === "price" || field === "quantity" ? Number(value) : value,
            };
            return { ...prev, ticketTypes: updated };
        });
    }

    function addTicketType() {
        setEventForm(prev => ({
            ...prev,
            ticketTypes: [...prev.ticketTypes, { name: "", price: 0, quantity: 0 }],
        }));
    }

    function removeTicketType(index: number) {
        setEventForm(prev => ({
            ...prev,
            ticketTypes: prev.ticketTypes.filter((_, i) => i !== index),
        }));
    }

    async function handleSubmit(e: React.SubmitEvent) {
        e.preventDefault();
        setErrorMessage("");

        try {
            await api.patch(`/events/${eventId}`, {
                ...eventForm,
                startDatetime: new Date(eventForm.startDatetime).toISOString(),
                endDatetime: new Date(eventForm.endDatetime).toISOString(),
            });
            navigate("/my-events");
        } catch (err: any) {
            setErrorMessage(err.response?.data?.detail ?? "Failed to update event.");
        }
    }

    async function handleCancelEvent() {
        try {
            await api.patch(`/events/${eventId}`, { cancel: true });
            navigate("/my-events");
        } catch (err: any) {
            setErrorMessage(err.response?.data?.detail ?? "Failed to cancel event.");
        }
    }

    if (loading) return <p>Loading...</p>;

    return (
        <form className="event-creation-body" onSubmit={handleSubmit}>
            <h1 className="header">Edit Event</h1>

            {/* Title */}
            <div>
                <label>Title</label>
                <input name="title" value={eventForm.title} onChange={handleChange} placeholder="Event title" />
            </div>

            {/* Event Type */}
            <div>
                <label>Event Type</label>
                <input name="eventType" value={eventForm.eventType} onChange={handleChange} placeholder="e.g. Concert, Workshop" />
            </div>

            {/* Venue */}
            <div>
                <label>Venue</label>
                <input name="venue" value={eventForm.venue} onChange={handleChange} placeholder="Venue name" />
            </div>

            {/* Location Autocomplete */}
            <div>
                <label>Location</label>
                <LocationAutocomplete
                    placeholder="Search new address..."
                    onSelect={(location) => {
                        setEventForm(prev => ({
                            ...prev,
                            address: location.address,
                            city: location.city,
                            country: location.country,
                            zipcode: location.zipcode,
                            latitude: location.latitude,
                            longitude: location.longitude,
                        }));
                    }}
                />
                {/* Show current location */}
                <div className="location-selected">
                    <span>📍 {eventForm.address}, {eventForm.city}, {eventForm.country}</span>
                    {eventForm.latitude && (
                        <span className="location-coords">
                            {Number(eventForm.latitude).toFixed(4)}, {Number(eventForm.longitude).toFixed(4)}
                        </span>
                    )}
                </div>
            </div>

            {/* Start DateTime */}
            <div>
                <label>Start Date & Time</label>
                <input name="startDatetime" type="datetime-local" value={eventForm.startDatetime} onChange={handleChange} />
            </div>

            {/* End DateTime */}
            <div>
                <label>End Date & Time</label>
                <input name="endDatetime" type="datetime-local" value={eventForm.endDatetime} onChange={handleChange} />
            </div>

            {/* Capacity */}
            <div>
                <label>Capacity</label>
                <input name="capacity" type="number" value={eventForm.capacity} onChange={handleChange} />
            </div>

            {/* Description */}
            <div>
                <label>Description</label>
                <textarea name="description" value={eventForm.description} onChange={handleChange} />
            </div>

            {/* Categories */}
            <div>
                <label>Categories</label>
                <div>
                    {availableCategories.map(cat => (
                        <label key={cat.categoryId}>
                            <input
                                type="checkbox"
                                checked={eventForm.categoryIds.includes(cat.categoryId)}
                                onChange={() => handleCategoryToggle(cat.categoryId)}
                            />
                            {cat.categoryName}
                        </label>
                    ))}
                </div>
            </div>

            {/* Ticket Types */}
            <div>
                <label>Ticket Types</label>
                {eventForm.ticketTypes.map((ticket, index) => (
                    <div key={index}>
                        <input
                            placeholder="Name (e.g. VIP)"
                            value={ticket.name}
                            onChange={e => handleTicketChange(index, "name", e.target.value)}
                        />
                        <input
                            type="number"
                            placeholder="Price"
                            value={ticket.price}
                            onChange={e => handleTicketChange(index, "price", e.target.value)}
                        />
                        <input
                            type="number"
                            placeholder="Quantity"
                            value={ticket.quantity}
                            onChange={e => handleTicketChange(index, "quantity", e.target.value)}
                        />
                        <button type="button" onClick={() => removeTicketType(index)}>Remove</button>
                    </div>
                ))}
                <button type="button" onClick={addTicketType}>+ Add Ticket Type</button>
            </div>

            {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}

            {/* Action buttons */}
            <div style={{ display: "flex", gap: "1rem", justifyContent: "center", marginTop: "1rem" }}>
                <button type="submit" className="create-event-button">Save Changes</button>
                <button type="button" className="borderless-button" onClick={() => navigate("/my-events")}>
                    Back
                </button>
            </div>

            {/* Cancel event — only for PUBLISHED */}
            {eventStatus === "PUBLISHED" && (
                <div style={{ marginTop: "2rem" }}>
                    {!confirmCancel ? (
                        <button
                            type="button"
                            className="admin-btn-reject"
                            onClick={() => setConfirmCancel(true)}
                        >
                            Cancel Event
                        </button>
                    ) : (
                        <div className="confirm-banner">
                            <p>Are you sure? This will cancel the event and notify all attendees.</p>
                            <button type="button" onClick={handleCancelEvent}>Yes, cancel event</button>
                            <button type="button" onClick={() => setConfirmCancel(false)}>Go back</button>
                        </div>
                    )}
                </div>
            )}
        </form>
    );
}