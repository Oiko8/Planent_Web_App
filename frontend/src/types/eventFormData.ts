export type TicketTypeForm = {
    name: string;
    price: number;
    quantity: number;
};

export type EventFormBase = {
    title: string;
    eventType: string;
    venue: string;
    country: string;
    city: string;
    address: string;
    latitude: number | null;
    longitude: number | null;
    startDatetime: string;
    endDatetime: string;
    capacity: number;
    description: string;
    categoryIds: number[];
    ticketTypes: TicketTypeForm[];
};

type BuildOptions = {
    /** Existing media URLs to KEEP (update only). Anything omitted is deleted server-side. */
    keepMediaUrls?: string[];
    publish?: boolean;
    cancel?: boolean;
};

export function buildEventFormData(
    form: EventFormBase,
    newFiles: File[],
    opts: BuildOptions = {}
): FormData {
    const fd = new FormData();

    fd.append("title", form.title);
    fd.append("eventType", form.eventType);
    fd.append("venue", form.venue);
    fd.append("country", form.country);
    fd.append("city", form.city);
    fd.append("address", form.address);
    if (form.latitude != null) fd.append("latitude", String(form.latitude));
    if (form.longitude != null) fd.append("longitude", String(form.longitude));
    fd.append("startDatetime", new Date(form.startDatetime).toISOString());
    fd.append("endDatetime", new Date(form.endDatetime).toISOString());
    fd.append("capacity", String(form.capacity));
    fd.append("description", form.description);

    // simple-type list -> repeated field name
    form.categoryIds.forEach((id) => fd.append("categoryIds", String(id)));

    // complex-type list -> indexed property paths
    form.ticketTypes.forEach((t, i) => {
        fd.append(`ticketTypes[${i}].name`, t.name);
        fd.append(`ticketTypes[${i}].price`, String(t.price));
        fd.append(`ticketTypes[${i}].quantity`, String(t.quantity));
    });

    // existing media to retain (update only)
    opts.keepMediaUrls?.forEach((url) => fd.append("mediaUrls", url));

    if (opts.publish != null) fd.append("publish", String(opts.publish));
    if (opts.cancel != null) fd.append("cancel", String(opts.cancel));

    // new image files
    newFiles.forEach((file) => fd.append("media", file));

    return fd;
}

/** Status-only PATCH (publish / cancel). The endpoint is multipart-only now, so even
 *  these one-field updates must be sent as FormData. Unsent fields stay unchanged. */
export function statusFormData(opts: { publish?: boolean; cancel?: boolean }): FormData {
    const fd = new FormData();
    if (opts.publish != null) fd.append("publish", String(opts.publish));
    if (opts.cancel != null) fd.append("cancel", String(opts.cancel));
    return fd;
}

/** Client-side image validation mirroring the backend (JPEG/PNG, <= 5MB each).
 *  Returns an error message, or null if all files are valid. */
export function validateImages(files: File[]): string | null {
    const allowed = ["image/jpeg", "image/jpg", "image/png"];
    const maxBytes = 5 * 1024 * 1024;
    for (const f of files) {
        if (!allowed.includes(f.type.toLowerCase())) {
            return `"${f.name}" is not a supported image type. Use JPEG or PNG.`;
        }
        if (f.size > maxBytes) {
            return `"${f.name}" is larger than 5MB.`;
        }
    }
    return null;
}