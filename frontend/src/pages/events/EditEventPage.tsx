import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/axiosConfig";
import { mediaUrl } from "../../api/media";
import { buildEventFormData, statusFormData, validateImages } from "../../types/eventFormData";
import { UpdateEventForm } from "../../types/updateEventData";
import type { MediaResponse, EventStatus } from "../../types/event";
import LocationAutocomplete from "../../components/LocationAutocomplete";
import Loader from "../../components/Loader";

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

    // existing images to KEEP (removing one here deletes it on save)
    const [existingMedia, setExistingMedia] = useState<MediaResponse[]>([]);
    // newly added image files
    const [newFiles, setNewFiles] = useState<File[]>([]);
    const [newPreviews, setNewPreviews] = useState<string[]>([]);

    const [eventStatus, setEventStatus] = useState<EventStatus | "">("");
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
                setExistingMedia(event.media ?? []);

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

    // build/revoke object URLs for new image previews
    useEffect(() => {
        const urls = newFiles.map(f => URL.createObjectURL(f));
        setNewPreviews(urls);
        return () => urls.forEach(u => URL.revokeObjectURL(u));
    }, [newFiles]);

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

    function handleFilesSelected(e: React.ChangeEvent<HTMLInputElement>) {
        const picked = Array.from(e.target.files ?? []);
        if (picked.length === 0) return;

        const err = validateImages(picked);
        if (err) {
            setErrorMessage(err);
            e.target.value = "";
            return;
        }

        setNewFiles(prev => [...prev, ...picked]);
        setErrorMessage("");
        e.target.value = "";
    }

    function removeNewFile(index: number) {
        setNewFiles(prev => prev.filter((_, i) => i !== index));
    }

    function removeExistingImage(mediaId: number) {
        setExistingMedia(prev => prev.filter(m => m.mediaId !== mediaId));
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setErrorMessage("");

        try {
            const formData = buildEventFormData(eventForm, newFiles, {
                // URLs of existing images we want to keep; omitted ones get deleted server-side
                keepMediaUrls: existingMedia.map(m => m.photoUrl),
            });
            await api.patch(`/events/${eventId}`, formData);
            navigate("/my-events");
        } catch (err: any) {
            setErrorMessage(err.response?.data?.detail ?? "Failed to update event.");
        }
    }

    async function handleCancelEvent() {
        try {
            // endpoint is multipart-only now -> send a FormData with just `cancel`
            await api.patch(`/events/${eventId}`, statusFormData({ cancel: true }));
            navigate("/my-events");
        } catch (err: any) {
            setErrorMessage(err.response?.data?.detail ?? "Failed to cancel event.");
        }
    }

    if (loading) return <Loader />;

    return (
        <form className="auth-page" onSubmit={handleSubmit}>
            <div className="auth-card auth-card-wide">
                <div className="edit-event-heading">
                    <div>
                        <h1 className="auth-title">Edit Event</h1>
                        <p className="auth-subtitle">Update the details of your event</p>
                    </div>
                    {eventStatus && (
                        <span className={`status-badge status-${eventStatus.toLowerCase()}`}>
                            {eventStatus}
                        </span>
                    )}
                </div>

                <p className="auth-section-label">Basic Info</p>
                <div className="auth-grid-2">
                    <div className="auth-field">
                        <label className="auth-label">Title</label>
                        <input className="auth-input" name="title" value={eventForm.title} onChange={handleChange} placeholder="Event title" />
                    </div>
                    <div className="auth-field">
                        <label className="auth-label">Event Type</label>
                        <input className="auth-input" name="eventType" value={eventForm.eventType} onChange={handleChange} placeholder="e.g. Concert, Workshop" />
                    </div>
                    <div className="auth-field">
                        <label className="auth-label">Venue</label>
                        <input className="auth-input" name="venue" value={eventForm.venue} onChange={handleChange} placeholder="Venue name" />
                    </div>
                    <div className="auth-field">
                        <label className="auth-label">Capacity</label>
                        <input className="auth-input" name="capacity" type="number" value={eventForm.capacity} onChange={handleChange} placeholder="Max attendees" />
                    </div>
                </div>

                <p className="auth-section-label">Date & Time</p>
                <div className="auth-grid-2">
                    <div className="auth-field">
                        <label className="auth-label">Start</label>
                        <input className="auth-input" name="startDatetime" type="datetime-local" value={eventForm.startDatetime} onChange={handleChange} />
                    </div>
                    <div className="auth-field">
                        <label className="auth-label">End</label>
                        <input className="auth-input" name="endDatetime" type="datetime-local" value={eventForm.endDatetime} onChange={handleChange} />
                    </div>
                </div>

                <p className="auth-section-label">Location</p>
                <div className="auth-field">
                    <label className="auth-label">Search new address</label>
                    <LocationAutocomplete
                        placeholder="Search new address..."
                        onSelect={(location) => {
                            setEventForm(prev => ({
                                ...prev,
                                address: location.address,
                                city: location.city,
                                country: location.country,
                                latitude: location.latitude,
                                longitude: location.longitude,
                            }));
                        }}
                    />
                    {eventForm.city && (
                        <div className="location-selected">
                            <span>📍 {eventForm.address}, {eventForm.city}, {eventForm.country}</span>
                            {eventForm.latitude && (
                                <span className="location-coords">
                                    {Number(eventForm.latitude).toFixed(4)}, {Number(eventForm.longitude).toFixed(4)}
                                </span>
                            )}
                        </div>
                    )}
                </div>

                <p className="auth-section-label">Description</p>
                <div className="auth-field">
                    <label className="auth-label">Description</label>
                    <textarea className="auth-input auth-textarea" name="description" value={eventForm.description} onChange={handleChange} placeholder="Describe your event" />
                </div>

                <p className="auth-section-label">Images</p>
                <div className="auth-field">
                    {existingMedia.length > 0 && (
                        <>
                            <label className="auth-label">Current images</label>
                            <div className="media-preview-grid">
                                {existingMedia.map(m => (
                                    <div key={m.mediaId} className="media-preview-item">
                                        <img src={mediaUrl(m.photoUrl)} alt="event" className="media-preview-img" />
                                        <button
                                            type="button"
                                            className="media-preview-remove"
                                            onClick={() => removeExistingImage(m.mediaId)}
                                            aria-label="Remove image"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}

                    <label className="auth-label" style={{ marginTop: existingMedia.length > 0 ? "1rem" : 0 }}>
                        Add images (JPEG or PNG, up to 5MB each)
                    </label>
                    <input
                        className="auth-input"
                        type="file"
                        accept="image/jpeg,image/png"
                        multiple
                        onChange={handleFilesSelected}
                    />

                    {newPreviews.length > 0 && (
                        <div className="media-preview-grid">
                            {newPreviews.map((src, i) => (
                                <div key={i} className="media-preview-item">
                                    <img src={src} alt={`new upload ${i + 1}`} className="media-preview-img" />
                                    <button
                                        type="button"
                                        className="media-preview-remove"
                                        onClick={() => removeNewFile(i)}
                                        aria-label="Remove image"
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <p className="auth-section-label">Categories</p>
                <div className="auth-checkboxes">
                    {availableCategories.map(cat => (
                        <label key={cat.categoryId} className="auth-checkbox-label">
                            <input
                                type="checkbox"
                                checked={eventForm.categoryIds.includes(cat.categoryId)}
                                onChange={() => handleCategoryToggle(cat.categoryId)}
                            />
                            {cat.categoryName}
                        </label>
                    ))}
                </div>

                <p className="auth-section-label">Ticket Types</p>
                {eventForm.ticketTypes.map((ticket, index) => (
                    <div key={index} className="ticket-form-row">
                        <div className="auth-field">
                            <label className="auth-label">Type Name</label>
                            <input
                                className="auth-input"
                                placeholder="e.g. VIP, Standard"
                                value={ticket.name}
                                onChange={e => handleTicketChange(index, "name", e.target.value)}
                            />
                        </div>
                        <div className="auth-field">
                            <label className="auth-label">Price (€)</label>
                            <input
                                className="auth-input"
                                type="number"
                                min="0"
                                step="0.01"
                                placeholder="0.00"
                                value={ticket.price}
                                onChange={e => handleTicketChange(index, "price", e.target.value)}
                            />
                        </div>
                        <div className="auth-field">
                            <label className="auth-label">Quantity</label>
                            <input
                                className="auth-input"
                                type="number"
                                min="0"
                                placeholder="0"
                                value={ticket.quantity}
                                onChange={e => handleTicketChange(index, "quantity", e.target.value)}
                            />
                        </div>
                        <button
                            type="button"
                            className="admin-btn-reject"
                            onClick={() => removeTicketType(index)}
                        >
                            Remove
                        </button>
                    </div>
                ))}
                <button type="button" className="borderless-button" onClick={addTicketType}>
                    + Add Ticket Type
                </button>

                {errorMessage && <p className="auth-error">{errorMessage}</p>}

                <div className="edit-event-actions">
                    <button type="submit" className="auth-button">Save Changes</button>
                    <button type="button" className="borderless-button" onClick={() => navigate("/my-events")}>
                        Back
                    </button>
                </div>

                {/* Cancel event — only for PUBLISHED */}
                {eventStatus === "PUBLISHED" && (
                    <div className="edit-danger-zone">
                        <div className="edit-danger-zone-text">
                            <strong>Cancel this event</strong>
                            <span>Attendees will be notified and bookings closed. This can't be undone.</span>
                        </div>

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
                                <div className="confirm-banner-actions">
                                    <button type="button" className="admin-btn-reject" onClick={handleCancelEvent}>
                                        Yes, cancel event
                                    </button>
                                    <button type="button" className="borderless-button" onClick={() => setConfirmCancel(false)}>
                                        Go back
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </form>
    );
}