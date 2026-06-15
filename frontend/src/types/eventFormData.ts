/** * Centralized helper to package any text payload as a JSON Blob
 * alongside new multipart files to match Spring Boot @RequestPart.
 */

export function buildEventFormData(
    requestPayload: Record<string, any>,
    newFiles: File[]
): FormData {
    const fd = new FormData();

    // text -> application/json blob
    const jsonBlob = new Blob([JSON.stringify(requestPayload)], { type: "application/json" });
    fd.append("request", jsonBlob);

    // media -> multipart
    newFiles.forEach((file) => fd.append("media", file));

    return fd;
}

/** Status-only PATCH (publish / cancel) */
export function statusFormData(opts: { publish?: boolean; cancel?: boolean }): FormData {
    const fd = new FormData();

    // e.g. { publish: true }
    const payload: Record<string, boolean> = {};
    if (opts.publish != null) payload.publish = opts.publish;
    if (opts.cancel != null) payload.cancel = opts.cancel;

    // to json blob
    const jsonBlob = new Blob([JSON.stringify(payload)], { type: "application/json" });
    fd.append("request", jsonBlob);

    return fd;
}

/** Client-side image validation mirroring the backend (JPEG/PNG, <= 5MB each) */
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