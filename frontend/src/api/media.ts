import api from "./axiosConfig";

export function mediaUrl(photoUrl?: string | null): string | undefined {
    if (!photoUrl) return undefined;

    const base = (api.defaults.baseURL ?? "") as string; // e.g. "/api" or "http://host:5000/api"
    try {
        // absolute base -> origin + base path + photoUrl
        const u = new URL(base);
        return u.origin + u.pathname.replace(/\/$/, "") + photoUrl;
    } catch {
        // relative base (e.g. "/api") -> "/api" + "/media/..." = "/api/media/..."
        return base.replace(/\/$/, "") + photoUrl;
    }
}