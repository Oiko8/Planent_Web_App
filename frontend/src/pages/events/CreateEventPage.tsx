import { useEffect, useState } from "react";
import { CreateEventForm } from "../../types/createEventData";
import LocationAutocomplete from "../../components/LocationAutocomplete";
import DatePicker from "react-datepicker";

import api from "../../api/axiosConfig";
import { buildEventFormData, validateImages } from "../../types/eventFormData";
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
    });

    const [mediaFiles, setMediaFiles] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [globalError, setGlobalError] = useState("");

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

    // build/revoke object URLs for image previews
    useEffect(() => {
        const urls = mediaFiles.map(f => URL.createObjectURL(f));
        setPreviews(urls);
        return () => urls.forEach(u => URL.revokeObjectURL(u));
    }, [mediaFiles]);

    function handleFilesSelected(e: React.ChangeEvent<HTMLInputElement>) {
        const picked = Array.from(e.target.files ?? []);
        if (picked.length === 0) return;

        const err = validateImages(picked);
        if (err) {
            setErrors(prev => ({ ...prev, media: err }));
            e.target.value = "";
            return;
        }

        setMediaFiles(prev => [...prev, ...picked]);
        setErrors(prev => { const { media, ...rest } = prev; return rest; });
        e.target.value = ""; // allow re-picking the same file
    }

    function removeFile(index: number) {
        setMediaFiles(prev => prev.filter((_, i) => i !== index));
    }

    async function handleNewEvent(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        const localErrors: Record<string, string> = {};
        setGlobalError("");

        // Basic Info Validations (@NotBlank & @Size)
        if (!eventForm.title.trim()) localErrors.title = "Missing event title";
        else if (eventForm.title.length > 100) localErrors.title = "Event title too long (max 100 characters)";

        if (!eventForm.eventType.trim()) localErrors.eventType = "Missing event type";
        else if (eventForm.eventType.length > 100) localErrors.eventType = "Event type too long (max 100 characters)";

        if (!eventForm.venue.trim()) localErrors.venue = "Missing event venue";
        else if (eventForm.venue.length > 100) localErrors.venue = "Event venue too long (max 100 characters)";

        if (!eventForm.capacity || eventForm.capacity < 1) {
            localErrors.capacity = "Capacity must be at least 1";
        }

        // Date & Time Validations (@Future & Logic)
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

        // Location Validations (@NotNull coordinates)
        if (!eventForm.address || eventForm.latitude == null || eventForm.longitude == null) {
            localErrors.location = "Please select the venue address from the suggestions";
        }

        // Description Validation (@NotBlank)
        if (!eventForm.description.trim()) {
            localErrors.description = "Missing event description";
        }

        // Categories Validation (@NotEmpty)
        if (eventForm.categoryIds.length === 0) {
            localErrors.categories = "Please select at least one category";
        }

        // Ticket Types Validation (@NotEmpty & @Valid)
        if (eventForm.ticketTypes.length === 0) {
            localErrors.ticketTypes = "Please add at least one ticket type";
        } else {
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
        }

        // Errors -> do not POST
        if (Object.keys(localErrors).length > 0) {
            setErrors(localErrors);
            return;
        }

        setErrors({});

        try {
            const preparedForm = {
                ...eventForm,
                publish: false
            };

            const formData = buildEventFormData(preparedForm, mediaFiles);
            await api.post("/events", formData);
            navigate("/my-events");
        } catch (error: any) {
            const message = error.response?.data?.detail ?? "Failed to create event. Please try again.";
            setGlobalError(message);
        }
    }

    function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
        const { name, value, type } = e.target;

        setEventForm((prev) => ({
            ...prev,
            [name]: type === "number" ? (value === "" ? null : Number(value)) : value,
        }));

        // Clear error when typing
        if (errors[name]) {
            setErrors(prev => { const { [name]: removed, ...rest } = prev; return rest; });
        }
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

        if (errors.categories) {
            setErrors(prev => { const { categories, ...rest } = prev; return rest; });
        }
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

        const errorKey = field === "name" ? `ticketName_${index}` : field === "price" ? `ticketPrice_${index}` : `ticketQuantity_${index}`;
        if (errors[errorKey]) {
            setErrors(prev => { const { [errorKey]: removed, ...rest } = prev; return rest; });
        }
    }

    function addTicketType() {
        setEventForm((prev) => ({
            ...prev,
            ticketTypes: [...prev.ticketTypes, { name: "", price: 0, quantity: 0 }],
        }));
        if (errors.ticketTypes) {
            setErrors(prev => { const { ticketTypes, ...rest } = prev; return rest; });
        }
    }

    function removeTicketType(index: number) {
        setEventForm((prev) => ({
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

    return (
        <form className="auth-page" onSubmit={handleNewEvent}>
            <div className="auth-card auth-card-wide">
                <h1 className="auth-title">Create your Event</h1>
                <p className="auth-subtitle">Fill in the details to publish your event</p>

                <p className="auth-section-label">Basic Info</p>
                <div className="auth-grid-2">
                    <div className="auth-field">
                        <label className="auth-label">Title *</label>
                        {errors.title && <span className="auth-error-inline">⚠️ {errors.title}</span>}
                        <input className="auth-input" name="title" value={eventForm.title} onChange={handleChange} placeholder="Event title" />
                    </div>
                    <div className="auth-field">
                        <label className="auth-label">Event Type *</label>
                        {errors.eventType && <span className="auth-error-inline">⚠️ {errors.eventType}</span>}
                        <input className="auth-input" name="eventType" value={eventForm.eventType} onChange={handleChange} placeholder="e.g. Concert, Workshop" />
                    </div>
                    <div className="auth-field">
                        <label className="auth-label">Venue *</label>
                        {errors.venue && <span className="auth-error-inline">⚠️ {errors.venue}</span>}
                        <input className="auth-input" name="venue" value={eventForm.venue} onChange={handleChange} placeholder="Venue name" />
                    </div>
                    <div className="auth-field">
                        <label className="auth-label">Capacity *</label>
                        {errors.capacity && <span className="auth-error-inline">⚠️ {errors.capacity}</span>}
                        <input className="auth-input" name="capacity" type="number" value={eventForm.capacity} onChange={handleChange} placeholder="Max attendees" />
                    </div>
                </div>

                <p className="auth-section-label">Date & Time</p>
                <div className="auth-grid-2">
                    <div className="auth-field">
                        <label className="auth-label">Start *</label>
                        {errors.startDatetime && <span className="auth-error-inline">⚠️ {errors.startDatetime}</span>}
                        <DatePicker
                            selected={eventForm.startDatetime ? new Date(eventForm.startDatetime) : null}
                            onChange={(date: Date | null) => {
                                setEventForm(prev => ({ ...prev, startDatetime: date ? date.toISOString() : "" }));
                                setErrors(prev => { const { startDatetime, ...rest } = prev; return rest; });
                            }}
                            showTimeSelect
                            timeIntervals={15}
                            timeFormat="HH:mm"
                            dateFormat="yyyy-MM-dd  HH:mm"
                            minDate={new Date()}
                            placeholderText="Pick start date and time"
                            className="auth-input"
                        />
                    </div>
                    <div className="auth-field">
                        <label className="auth-label">End *</label>
                        {errors.endDatetime && <span className="auth-error-inline">⚠️ {errors.endDatetime}</span>}
                        <DatePicker
                            selected={eventForm.endDatetime ? new Date(eventForm.endDatetime) : null}
                            onChange={(date: Date | null) => {
                                setEventForm(prev => ({ ...prev, endDatetime: date ? date.toISOString() : "" }));
                                setErrors(prev => { const { endDatetime, ...rest } = prev; return rest; });
                            }}
                            showTimeSelect
                            timeIntervals={15}
                            timeFormat="HH:mm"
                            dateFormat="yyyy-MM-dd  HH:mm"
                            minDate={eventForm.startDatetime ? new Date(eventForm.startDatetime) : new Date()}
                            placeholderText="Pick end date and time"
                            className="auth-input"
                        />
                    </div>
                </div>

                <p className="auth-section-label">Location</p>
                <div className="auth-field">
                    <label className="auth-label">Search Address *</label>
                    {errors.location && <span className="auth-error-inline">⚠️ {errors.location}</span>}
                    <LocationAutocomplete
                        placeholder="Search for venue address..."
                        onSelect={(location) => {
                            setEventForm(prev => ({
                                ...prev,
                                address: location.address,
                                city: location.city,
                                country: location.country,
                                latitude: location.latitude,
                                longitude: location.longitude,
                            }));
                            setErrors(prev => { const { location: loc, ...rest } = prev; return rest; });
                        }}
                    />
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
                </div>

                <p className="auth-section-label">Description</p>
                <div className="auth-field">
                    <label className="auth-label">Description *</label>
                    {errors.description && <span className="auth-error-inline">⚠️ {errors.description}</span>}
                    <textarea className="auth-input auth-textarea" name="description" value={eventForm.description} onChange={handleChange} placeholder="Describe your event" />
                </div>

                <p className="auth-section-label">Images</p>
                <div className="auth-field">
                    <label className="auth-label">Event photos (JPEG or PNG, up to 5MB each)</label>
                    {errors.media && <span className="auth-error-inline">⚠️ {errors.media}</span>}
                    <input className="auth-input" type="file" accept="image/jpeg,image/png" multiple onChange={handleFilesSelected} />
                    {previews.length > 0 && (
                        <div className="media-preview-grid">
                            {previews.map((src, i) => (
                                <div key={i} className="media-preview-item">
                                    <img src={src} alt={`upload ${i + 1}`} className="media-preview-img" />
                                    <button type="button" className="media-preview-remove" onClick={() => removeFile(i)} aria-label="Remove image">✕</button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <p className="auth-section-label">Categories</p>
                {errors.categories && <span className="auth-error-inline">⚠️ {errors.categories}</span>}
                <div className="auth-checkboxes">
                    {availableCategories.map(cat => (
                        <label key={cat.categoryId} className="auth-checkbox-label">
                            <input type="checkbox" checked={eventForm.categoryIds.includes(cat.categoryId)} onChange={() => handleCategoryToggle(cat.categoryId)} />
                            {cat.categoryName}
                        </label>
                    ))}
                </div>

                <p className="auth-section-label">Ticket Types</p>
                {errors.ticketTypes && <span className="auth-error-inline">⚠️ {errors.ticketTypes}</span>}

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

                            {/* Validation block for ticket parameters */}
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

                <button type="submit" className="auth-button" style={{ marginTop: "1.5rem" }}>
                    Create Event
                </button>
            </div>
        </form>
    );
}