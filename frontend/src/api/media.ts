import api from "./axiosConfig";

/**
 * The backend returns media paths relative to the server root, e.g. "/media/12/poster.webp".
 * Images are served at the host root (NOT under the API base path), so we prefix the
 * photoUrl with the API host's origin.
 */
export function mediaUrl(photoUrl?: string | null): string | undefined {
    if (!photoUrl) return undefined;

    const base = (api.defaults.baseURL ?? "") as string;
    try {
        return new URL(base).origin + photoUrl; // absolute base
    } catch {
        return photoUrl; // relative base -> rely on same-origin / proxy
    }
}