import { use, useEffect, useState } from "react";
import { CreateEventForm } from "../types/createEventData";
import LocationAutocomplete from "../components/LocationAutocomplete";

import api from "../api/axiosConfig";
import { useNavigate } from "react-router-dom";

export default function CreateEventPage() {
    const [eventForm, setEventForm] = useState<CreateEventForm>({
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
        mediaUrls: [],
    });

    const [errorMessage, setErrorMessage] = useState("");

    const navigate = useNavigate();

    const [availableCategories, setAvailableCategories] = useState<{ categoryId: number; categoryName: string }[]>([]);

    useEffect(() => {
        async function fetchCategories() {
            try {
                const response = await api.get("/events/categories");
                setAvailableCategories(response.data);
            } catch (err) {
                console.error("Failed to load categories");
            }
        }
        fetchCategories();
    }, []);

    async function handleNewEvent(e: React.SubmitEvent) {
        e.preventDefault();

        // basic validation
        if (!eventForm.title || !eventForm.eventType || !eventForm.venue ||
            !eventForm.country || !eventForm.city || !eventForm.address ||
            !eventForm.startDatetime || !eventForm.endDatetime ||
            !eventForm.description || eventForm.capacity <= 0) {
            setErrorMessage("Please fill in all required fields.");
            return;
        }

        if (eventForm.categoryIds.length === 0) {
            setErrorMessage("Please select at least one category.");
            return;
        }

        if (eventForm.ticketTypes.length === 0) {
            setErrorMessage("Please add at least one ticket type.");
            return;
        }

        setErrorMessage("");

        try {
            const payload = {
                ...eventForm,
                startDatetime: new Date(eventForm.startDatetime).toISOString(),
                endDatetime: new Date(eventForm.endDatetime).toISOString(),
            };
            const tokenInStorage = localStorage.getItem("token");
            console.log("Token in storage at submit:", tokenInStorage);
            console.log("Sending payload:", payload);
            
            await api.post("/events", payload);
            navigate("/events");

        } catch (error: any) {
            console.log("Error response:", error.response?.data); 
            console.log("Validation errors:", error.response?.data?.errors);
            const message = error.response?.data?.detail
                ?? "Failed to create event. Please try again.";
            setErrorMessage(message);
        }
    }

    function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
        const { name, value, type } = e.target;

        setEventForm((prev) => ({
            ...prev,
            [name]: type === "number" ? (value === "" ? null : Number(value)) : value,
        }));
    }

    function handleCategoryToggle(categoryId: number) {
        setEventForm((prev) => {
            const already = prev.categoryIds.includes(categoryId);
            return {
                ...prev,
                categoryIds: already
                    ? prev.categoryIds.filter((id) => id !== categoryId)
                    : [...prev.categoryIds, categoryId],
            };
        });
    }

    function handleTicketChange(index: number, field: string, value: string) {
    setEventForm((prev) => {
        const updated = [...prev.ticketTypes];
        updated[index] = {
            ...updated[index],
            [field]: field === "price" || field === "quantity" ? Number(value) : value,
        };
        return { ...prev, ticketTypes: updated };
    });
}

    function addTicketType() {
        setEventForm((prev) => ({
            ...prev,
            ticketTypes: [...prev.ticketTypes, { name: "", price: 0, quantity: 0 }],
        }));
    }

    function removeTicketType(index: number) {
        setEventForm((prev) => ({
            ...prev,
            ticketTypes: prev.ticketTypes.filter((_, i) => i !== index),
        }));
    }
        
    return (
        <form className="event-creation-body" onSubmit={handleNewEvent}>
            <h1 className="header">Create your Event</h1>

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

            {/* Location */}
            <div>
                <label>Location *</label>
                <LocationAutocomplete
                    placeholder="Search for venue address..."
                    onSelect={(location) => {
                        setEventForm((prev) => ({
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
            </div>

            {/* Show selected location details as read-only */}
            {eventForm.city && (
                <div className="location-selected">
                    <span>📍 {eventForm.address}, {eventForm.city}, {eventForm.country}</span>
                    {eventForm.latitude && (
                        <span className="location-coords">
                            {eventForm.latitude.toFixed(4)}, {eventForm.longitude?.toFixed(4)}
                        </span>
                    )}
                </div>
            )}

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
                <input name="capacity" type="number" value={eventForm.capacity} onChange={handleChange} placeholder="Max attendees" />
            </div>

            {/* Description */}
            <div>
                <label>Description</label>
                <textarea name="description" value={eventForm.description} onChange={handleChange} placeholder="Describe your event" />
            </div>

            {/* Categories */}
            <div>
                <label>Categories</label>
                <div>
                    {availableCategories.map((cat) => (
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
                            onChange={(e) => handleTicketChange(index, "name", e.target.value)}
                        />
                        <input
                            type="number"
                            placeholder="Price"
                            value={ticket.price}
                            onChange={(e) => handleTicketChange(index, "price", e.target.value)}
                        />
                        <input
                            type="number"
                            placeholder="Quantity"
                            value={ticket.quantity}
                            onChange={(e) => handleTicketChange(index, "quantity", e.target.value)}
                        />
                        <button type="button" onClick={() => removeTicketType(index)}>Remove</button>
                    </div>
                ))}
                <button type="button" onClick={addTicketType}>+ Add Ticket Type</button>
            </div>

            {/* Error message */}
            {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}

            {/* Submit */}
            <button type="submit">Create Event</button>
        </form>
    );
}