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

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [globalError, setGlobalError] = useState("");

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
                const toLocalInput = (iso: string) => {
                    const d = new Date(iso);
                    const pad = (n: number) => String(n).padStart(2, "0");
                    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
                };

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
                setGlobalError("Failed to load event.");
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

        // Clear errors when typing
        if (errors[name]) {
            setErrors(prev => { const { [name]: removed, ...rest } = prev; return rest; });
        }
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

        if (errors.categories) {
            setErrors(prev => { const { categories, ...rest } = prev; return rest; });
        }
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

        const errorKey = field === "name" ? `ticketName_${index}` : field === "price" ? `ticketPrice_${index}` : `ticketQuantity_${index}`;
        if (errors[errorKey]) {
            setErrors(prev => { const { [errorKey]: removed, ...rest } = prev; return rest; });
        }
    }

    function addTicketType() {
        setEventForm(prev => ({
            ...prev,
            ticketTypes: [...prev.ticketTypes, { name: "", price: 0, quantity: 0 }],
        }));
        if (errors.ticketTypes) {
            setErrors(prev => { const { ticketTypes, ...rest } = prev; return rest; });
        }
    }

    function removeTicketType(index: number) {
        setEventForm(prev => ({
            ...prev,
            ticketTypes: prev.ticketTypes.filter((_, i) => i !== index),
        }));

        setErrors(prev => {
            const copy = { ...prev };
            delete copy[`ticketName_${index}`];
            delete copy[`ticketPrice_${index}`];
            delete copy[`ticketQuantity_${index}`];
            return copy;
        });
    }

    function handleFilesSelected(e: React.ChangeEvent<HTMLInputElement>) {
        const picked = Array.from(e.target.files ?? []);
        if (picked.length === 0) return;

        const err = validateImages(picked);
        if (err) {
            setErrors(prev => ({ ...prev, media: err }));
            e.target.value = "";
            return;
        }

        setNewFiles(prev => [...prev, ...picked]);
        setErrors(prev => { const { media, ...rest } = prev; return rest; });
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

        const localErrors: Record<string, string> = {};
        setGlobalError("");

        // Basic Info Validations (@Size & @NotBlank)
        if (!eventForm.title.trim()) localErrors.title = "Missing event title";
        else if (eventForm.title.length > 100) localErrors.title = "Event title too long (max 100 characters)";

        if (!eventForm.eventType.trim()) localErrors.eventType = "Missing event type";
        else if (eventForm.eventType.length > 100) localErrors.eventType = "Event type too long (max 100 characters)";

        if (!eventForm.venue.trim()) localErrors.venue = "Missing event venue";
        else if (eventForm.venue.length > 100) localErrors.venue = "Event venue too long (max 100 characters)";

        if (!eventForm.capacity || eventForm.capacity < 1) {
            localErrors.capacity = "Capacity must be at least 1";
        }

        // Date & Time Validations (@Future)
        const now = new Date();
        if (!eventForm.startDatetime) {
            localErrors.startDatetime = "Missing event start date time";
        } else if (new Date(eventForm.startDatetime) <= now) {
            localErrors.startDatetime = "Event must start in the future";
        }

        if (!eventForm.endDatetime) {
            localErrors.endDatetime = "Missing event end date time";
        } else if (eventForm.startDatetime && new Date(eventForm.endDatetime) <= new Date(eventForm.startDatetime)) {
            localErrors.endDatetime = "Event end date must be after the start date";
        }

        // Location Validations
        if (!eventForm.address || eventForm.latitude == null || eventForm.longitude == null) {
            localErrors.location = "Please select the venue address from the suggestions";
        }

        // Description Validation
        if (!eventForm.description.trim()) {
            localErrors.description = "Missing event description";
        }

        // Validation of ticket types (if they exist when updating)
        eventForm.ticketTypes.forEach((ticket, idx) => {
            if (!ticket.name.trim()) {
                localErrors[`ticketName_${idx}`] = "Missing ticket type name";
            }
            if (ticket.price < 0) {
                localErrors[`ticketPrice_${idx}`] = "Price cannot be negative";
            }
            if (ticket.quantity < 1) {
                localErrors[`ticketQuantity_${idx}`] = "Quantity must be at least 1";
            }
        });

        // Errors -> do not PATCH
        if (Object.keys(localErrors).length > 0) {
            setErrors(localErrors);
            return;
        }

        setErrors({});

        try {
            // convert date to ISO and map existing media to urls
            const preparedForm = {
                ...eventForm,
                startDatetime: new Date(eventForm.startDatetime).toISOString(),
                endDatetime: new Date(eventForm.endDatetime).toISOString(),
                mediaUrls: existingMedia.map(m => m.photoUrl), // Απόλυτα συμβατό με το DTO
            };

            const formData = buildEventFormData(preparedForm, newFiles);

            await api.patch(`/events/${eventId}`, formData);
            navigate("/my-events");
        } catch (err: any) {
            setGlobalError(err.response?.data?.detail ?? "Failed to update event.");
        }
    }

    async function handleCancelEvent() {
        setGlobalError("");
        try {
            await api.patch(`/events/${eventId}`, statusFormData({ cancel: true }));
            navigate("/my-events");
        } catch (err: any) {
            setGlobalError(err.response?.data?.detail ?? "Failed to cancel event.");
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
                        {errors.title && <span className="auth-error-inline">⚠️ {errors.title}</span>}
                        <input className="auth-input" name="title" value={eventForm.title} onChange={handleChange} placeholder="Event title" />
                    </div>
                    <div className="auth-field">
                        <label className="auth-label">Event Type</label>
                        {errors.eventType && <span className="auth-error-inline">⚠️ {errors.eventType}</span>}
                        <input className="auth-input" name="eventType" value={eventForm.eventType} onChange={handleChange} placeholder="e.g. Concert, Workshop" />
                    </div>
                    <div className="auth-field">
                        <label className="auth-label">Venue</label>
                        {errors.venue && <span className="auth-error-inline">⚠️ {errors.venue}</span>}
                        <input className="auth-input" name="venue" value={eventForm.venue} onChange={handleChange} placeholder="Venue name" />
                    </div>
                    <div className="auth-field">
                        <label className="auth-label">Capacity</label>
                        {errors.capacity && <span className="auth-error-inline">⚠️ {errors.capacity}</span>}
                        <input className="auth-input" name="capacity" type="number" value={eventForm.capacity} onChange={handleChange} placeholder="Max attendees" />
                    </div>
                </div>

                <p className="auth-section-label">Date & Time</p>
                <div className="auth-grid-2">
                    <div className="auth-field">
                        <label className="auth-label">Start</label>
                        {errors.startDatetime && <span className="auth-error-inline">⚠️ {errors.startDatetime}</span>}
                        <input className="auth-input" name="startDatetime" type="datetime-local" value={eventForm.startDatetime} onChange={handleChange} />
                    </div>
                    <div className="auth-field">
                        <label className="auth-label">End</label>
                        {errors.endDatetime && <span className="auth-error-inline">⚠️ {errors.endDatetime}</span>}
                        <input className="auth-input" name="endDatetime" type="datetime-local" value={eventForm.endDatetime} onChange={handleChange} />
                    </div>
                </div>

                <p className="auth-section-label">Location</p>
                <div className="auth-field">
                    <label className="auth-label">Search new address</label>
                    {errors.location && <span className="auth-error-inline">⚠️ {errors.location}</span>}
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
                            if (errors.location) {
                                setErrors(prev => { const { location: loc, ...rest } = prev; return rest; });
                            }
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
                    {errors.description && <span className="auth-error-inline">⚠️ {errors.description}</span>}
                    <textarea className="auth-input auth-textarea" name="description" value={eventForm.description} onChange={handleChange} placeholder="Describe your event" />
                </div>

                <p className="auth-section-label">Images</p>
                <div className="auth-field">
                    {errors.media && <span className="auth-error-inline">⚠️ {errors.media}</span>}
                    {existingMedia.length > 0 && (
                        <>
                            <label className="auth-label">Current images</label>
                            <div className="media-preview-grid">
                                {existingMedia.map(m => (
                                    <div key={m.mediaId} className="media-preview-item">
                                        <img src={mediaUrl(m.photoUrl)} alt="event" className="media-preview-img" />
                                        <button type="button" className="media-preview-remove" onClick={() => removeExistingImage(m.mediaId)} aria-label="Remove image">✕</button>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}

                    <label className="auth-label" style={{ marginTop: existingMedia.length > 0 ? "1rem" : 0 }}>
                        Add images (JPEG or PNG, up to 5MB each)
                    </label>
                    <input className="auth-input" type="file" accept="image/jpeg,image/png" multiple onChange={handleFilesSelected} />

                    {newPreviews.length > 0 && (
                        <div className="media-preview-grid">
                            {newPreviews.map((src, i) => (
                                <div key={i} className="media-preview-item">
                                    <img src={src} alt={`new upload ${i + 1}`} className="media-preview-img" />
                                    <button type="button" className="media-preview-remove" onClick={() => removeNewFile(i)} aria-label="Remove image">✕</button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <p className="auth-section-label">Categories</p>
                <div className="auth-checkboxes">
                    {availableCategories.map(cat => (
                        <label key={cat.categoryId} className="auth-checkbox-label">
                            <input type="checkbox" checked={eventForm.categoryIds.includes(cat.categoryId)} onChange={() => handleCategoryToggle(cat.categoryId)} />
                            {cat.categoryName}
                        </label>
                    ))}
                </div>

                <p className="auth-section-label">Ticket Types</p>
                {eventForm.ticketTypes.map((ticket, index) => {
                    const nameErr = errors[`ticketName_${index}`];
                    const priceErr = errors[`ticketPrice_${index}`];
                    const qtyErr = errors[`ticketQuantity_${index}`];

                    return (
                        <div key={index} style={{ marginBottom: "1rem" }}>
                            <div className="ticket-form-row" style={{ marginBottom: "0.25rem" }}>
                                <div className="auth-field">
                                    <label className="auth-label">Type Name</label>
                                    <input className="auth-input" placeholder="e.g. VIP, Standard" value={ticket.name} onChange={e => handleTicketChange(index, "name", e.target.value)} />
                                </div>
                                <div className="auth-field">
                                    <label className="auth-label">Price (€)</label>
                                    <input className="auth-input" type="number" min="0" step="0.01" placeholder="0.00" value={ticket.price} onChange={e => handleTicketChange(index, "price", e.target.value)} />
                                </div>
                                <div className="auth-field">
                                    <label className="auth-label">Quantity</label>
                                    <input className="auth-input" type="number" min="0" placeholder="0" value={ticket.quantity} onChange={e => handleTicketChange(index, "quantity", e.target.value)} />
                                </div>
                                <button type="button" className="admin-btn-reject" onClick={() => removeTicketType(index)}>Remove</button>
                            </div>

                            {(nameErr || priceErr || qtyErr) && (
                                <div className="ticket-error-block">
                                    {nameErr && <div>• {nameErr}</div>}
                                    {priceErr && <div>• {priceErr}</div>}
                                    {qtyErr && <div>• {qtyErr}</div>}
                                </div>
                            )}
                        </div>
                    );
                })}
                <button type="button" className="borderless-button" onClick={addTicketType}>
                    + Add Ticket Type
                </button>

                {globalError && <p className="auth-error">{globalError}</p>}

                <div className="edit-event-actions">
                    <button type="submit" className="auth-button">Save Changes</button>
                    <button type="button" className="borderless-button" onClick={() => navigate("/my-events")}>
                        Back
                    </button>
                </div>

                {eventStatus === "PUBLISHED" && (
                    <div className="edit-danger-zone">
                        <div className="edit-danger-zone-text">
                            <strong>Cancel this event</strong>
                            <span>Attendees will be notified and bookings closed. This can't be undone.</span>
                        </div>

                        {!confirmCancel ? (
                            <button type="button" className="admin-btn-reject" onClick={() => setConfirmCancel(true)}>
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