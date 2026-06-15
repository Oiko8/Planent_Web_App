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
        if (!eventForm.title.trim()) localErrors.title = "Missing title";
        else if (eventForm.title.length > 100) localErrors.title = "Title too long (max 100 characters)";

        if (!eventForm.eventType.trim()) localErrors.eventType = "Missing type";
        else if (eventForm.eventType.length > 100) localErrors.eventType = "Type too long (max 100 characters)";

        if (!eventForm.venue.trim()) localErrors.venue = "Missing venue";
        else if (eventForm.venue.length > 100) localErrors.venue = "Venue too long (max 100 characters)";

        if (!eventForm.capacity || eventForm.capacity < 1) {
            localErrors.capacity = "Capacity must be at least 1";
        }

        // Date & Time Validations (@Future & Logic)
        const now = new Date();
        if (!eventForm.startDatetime) {
            localErrors.startDatetime = "Missing start date time";
        } else if (new Date(eventForm.startDatetime) <= now) {
            localErrors.startDatetime = "Event must start in the future";
        }

        if (!eventForm.endDatetime) {
            localErrors.endDatetime = "Missing end date time";
        } else if (eventForm.startDatetime && new Date(eventForm.endDatetime) <= new Date(eventForm.startDatetime)) {
            localErrors.endDatetime = "End date must be after the start date";
        }

        // Location Validations (@NotNull coordinates)
        if (!eventForm.address || eventForm.latitude == null || eventForm.longitude == null) {
            localErrors.location = "Please select the venue's address from the autocomplete";
        }

        // Description Validation (@NotBlank)
        if (!eventForm.description.trim()) {
            localErrors.description = "Missing description";
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

                {/* Basic Info */}
                <p className="auth-section-label">Basic Info</p>
                <div className="auth-grid-2">
                    <div className="auth-field">
                        <label className="auth-label">Title *</label>
                        <input
                            className={`auth-input ${errors.title ? "auth-input-error" : ""}`}
                            name="title"
                            value={eventForm.title}
                            onChange={handleChange}
                            placeholder="Event title"
                        />
                        {errors.title && <span className="error-text">{errors.title}</span>}
                    </div>
                    <div className="auth-field">
                        <label className="auth-label">Event Type *</label>
                        <input
                            className={`auth-input ${errors.eventType ? "auth-input-error" : ""}`}
                            name="eventType"
                            value={eventForm.eventType}
                            onChange={handleChange}
                            placeholder="e.g. Concert, Workshop"
                        />
                        {errors.eventType && <span className="error-text">{errors.eventType}</span>}
                    </div>
                    <div className="auth-field">
                        <label className="auth-label">Venue *</label>
                        <input
                            className={`auth-input ${errors.venue ? "auth-input-error" : ""}`}
                            name="venue"
                            value={eventForm.venue}
                            onChange={handleChange}
                            placeholder="Venue name"
                        />
                        {errors.venue && <span className="error-text">{errors.venue}</span>}
                    </div>
                    <div className="auth-field">
                        <label className="auth-label">Capacity *</label>
                        <input
                            className={`auth-input ${errors.capacity ? "auth-input-error" : ""}`}
                            name="capacity"
                            type="number"
                            value={eventForm.capacity}
                            onChange={handleChange}
                            placeholder="Max attendees"
                        />
                        {errors.capacity && <span className="error-text">{errors.capacity}</span>}
                    </div>
                </div>

                {/* Date & Time */}
                <p className="auth-section-label">Date & Time</p>
                <div className="auth-grid-2">
                    <div className="auth-field">
                        <label className="auth-label">Start Time *</label>
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
                            className={`auth-input ${errors.startDatetime ? "auth-input-error" : ""}`}
                        />
                        {errors.startDatetime && <span className="error-text">{errors.startDatetime}</span>}
                    </div>
                    <div className="auth-field">
                        <label className="auth-label">End Time *</label>
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
                            className={`auth-input ${errors.endDatetime ? "auth-input-error" : ""}`}
                        />
                        {errors.endDatetime && <span className="error-text">{errors.endDatetime}</span>}
                    </div>
                </div>

                {/* Location Section */}
                <p className="auth-section-label">Location</p>
                <div className="auth-field">
                    <label className="auth-label">Search address via autocomplete</label>
                    <LocationAutocomplete
                        placeholder="Search address"
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
                    {errors.location && <span className="error-text" style={{ marginTop: "0.4rem" }}>{errors.location}</span>}
                </div>

                {/* Read-Only Feedback Fields */}
                <div className="auth-field" style={{ marginTop: "1rem" }}>
                    <label className="auth-label">Address *</label>
                    <input
                        className={`auth-input ${errors.location ? "auth-input-error" : ""}`}
                        value={eventForm.address}
                        readOnly
                        autoComplete="off"
                        placeholder="Auto-filled via Map"
                    />
                </div>

                <div className="auth-grid-2" style={{ marginTop: "1rem" }}>
                    <div className="auth-field">
                        <label className="auth-label">Country *</label>
                        <input
                            className={`auth-input ${errors.location ? "auth-input-error" : ""}`}
                            value={eventForm.country}
                            readOnly
                            autoComplete="off"
                            placeholder="Auto-filled"
                        />
                    </div>
                    <div className="auth-field">
                        <label className="auth-label">City *</label>
                        <input
                            className={`auth-input ${errors.location ? "auth-input-error" : ""}`}
                            value={eventForm.city}
                            readOnly
                            autoComplete="off"
                            placeholder="Auto-filled"
                        />
                    </div>
                </div>

                {/* Description */}
                <p className="auth-section-label">Description</p>
                <div className="auth-field">
                    <label className="auth-label">Description *</label>
                    <textarea
                        className={`auth-input auth-textarea ${errors.description ? "auth-input-error" : ""}`}
                        name="description"
                        value={eventForm.description}
                        onChange={handleChange}
                        placeholder="Describe your event"
                    />
                    {errors.description && <span className="error-text">{errors.description}</span>}
                </div>

                {/* Images */}
                <p className="auth-section-label">Images</p>
                <div className="auth-field">
                    <label className="auth-label">Event photos (JPEG or PNG, up to 5MB each)</label>
                    <input
                        className={`auth-input ${errors.media ? "auth-input-error" : ""}`}
                        type="file"
                        accept="image/jpeg,image/png"
                        multiple
                        onChange={handleFilesSelected}
                    />
                    {errors.media && <span className="error-text">{errors.media}</span>}

                    {previews.length > 0 && (
                        <div className="media-preview-grid" style={{ marginTop: "1rem" }}>
                            {previews.map((src, i) => (
                                <div key={i} className="media-preview-item">
                                    <img src={src} alt={`upload ${i + 1}`} className="media-preview-img" />
                                    <button type="button" className="media-preview-remove" onClick={() => removeFile(i)} aria-label="Remove image">✕</button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Categories */}
                <p className="auth-section-label">Categories</p>
                <div className="auth-checkboxes">
                    {availableCategories.map(cat => (
                        <label key={cat.categoryId} className="auth-checkbox-label">
                            <input type="checkbox" checked={eventForm.categoryIds.includes(cat.categoryId)} onChange={() => handleCategoryToggle(cat.categoryId)} />
                            {cat.categoryName}
                        </label>
                    ))}
                </div>
                {errors.categories && <span className="error-text">{errors.categories}</span>}

                {/* Ticket Types */}
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
                                    <input
                                        className={`auth-input ${nameErr ? "auth-input-error" : ""}`}
                                        placeholder="e.g. VIP, Standard"
                                        value={ticket.name}
                                        onChange={e => handleTicketChange(index, "name", e.target.value)}
                                    />
                                </div>
                                <div className="auth-field">
                                    <label className="auth-label">Price (€)</label>
                                    <input
                                        className={`auth-input ${priceErr ? "auth-input-error" : ""}`}
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
                                        className={`auth-input ${qtyErr ? "auth-input-error" : ""}`}
                                        type="number"
                                        min="0"
                                        placeholder="0"
                                        value={ticket.quantity}
                                        onChange={e => handleTicketChange(index, "quantity", e.target.value)}
                                    />
                                </div>
                                <button type="button" className="admin-btn-reject" onClick={() => removeTicketType(index)}>Remove</button>
                            </div>

                            {/* Validation block for individual ticket parameters */}
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
                {errors.ticketTypes && <span className="error-text" style={{ marginTop: "0.5rem" }}>{errors.ticketTypes}</span>}

                {globalError && <p className="auth-error">{globalError}</p>}

                <button type="submit" className="auth-button" style={{ marginTop: "1.5rem" }}>
                    Create Event
                </button>
            </div>
        </form>
    );
}