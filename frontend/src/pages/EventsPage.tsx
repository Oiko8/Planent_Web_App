import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import EventCard from "../components/EventCard";
import Pagination from "../components/Pagination";
import type { EventItem, CategoryResponse, PageResponse } from "../types/event";
import api from "../api/axiosConfig";

type Filters = {
    text: string;
    category: string;
    city: string;
    maxPrice: string;
    startDate: string;
    endDate: string;
};

const EMPTY_FILTERS: Filters = {
    text: "",
    category: "",
    city: "",
    maxPrice: "",
    startDate: "",
    endDate: "",
};

const DEBOUNCE_MS = 400;
const PAGE_SIZE = 10;

export default function EventsPage() {
    const navigate = useNavigate();

    // Filter inputs (immediate)
    const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
    // Only free-text gets debounced
    const [debouncedText, setDebouncedText] = useState("");
    // Current page (0-based, like Spring Data)
    const [page, setPage] = useState(0);

    // Data / status
    const [pageData, setPageData] = useState<PageResponse<EventItem> | null>(null);
    const [categories, setCategories] = useState<CategoryResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Debounce the free-text input. Also resets to page 0 when the
    // debounced text actually changes (typing on a later page should
    // bring the user back to page 1 of the new results).
    useEffect(() => {
        const t = setTimeout(() => {
            setDebouncedText(filters.text);
            setPage(0);
        }, DEBOUNCE_MS);
        return () => clearTimeout(t);
    }, [filters.text]);

    // Load categories once for the dropdown
    useEffect(() => {
        api.get<CategoryResponse[]>("/events/categories")
            .then(res => setCategories(res.data))
            .catch(() => { /* non-critical: dropdown will just be empty */ });
    }, []);

    // Fetch events whenever filters or page change
    useEffect(() => {
        const controller = new AbortController();

        async function fetchEvents() {
            setLoading(true);
            setError("");

            try {
                const params: Record<string, string | number> = {
                    page,
                    size: PAGE_SIZE,
                };

                if (debouncedText.trim()) params.text = debouncedText.trim();
                if (filters.category) params.category = filters.category;
                if (filters.city.trim()) params.city = filters.city.trim();
                if (filters.maxPrice) params.maxPrice = filters.maxPrice;
                if (filters.startDate) {
                    params.startDate = new Date(filters.startDate + "T00:00:00").toISOString();
                }
                if (filters.endDate) {
                    params.endDate = new Date(filters.endDate + "T23:59:59").toISOString();
                }

                const response = await api.get<PageResponse<EventItem>>("/events/search", {
                    params,
                    signal: controller.signal,
                });

                setPageData(response.data);
            } catch (err: any) {
                if (err.name !== "CanceledError") {
                    setError(err.response?.data?.detail ?? "Failed to load events. Please try again.");
                }
            } finally {
                setLoading(false);
            }
        }

        fetchEvents();
        return () => controller.abort();
    }, [debouncedText, filters.category, filters.city, filters.maxPrice, filters.startDate, filters.endDate, page]);

    // Every non-text filter change resets to page 0 *in the same render*,
    // so the fetch effect fires exactly once with the new filter + page 0.
    function updateFilter<K extends keyof Filters>(key: K, value: Filters[K]) {
        setFilters(prev => ({ ...prev, [key]: value }));
        if (key !== "text") setPage(0); // text resets page via the debounce effect
    }

    function resetFilters() {
        setFilters(EMPTY_FILTERS);
        setPage(0);
    }

    const events = pageData?.content ?? [];
    const totalElements = pageData?.totalElements ?? 0;
    const hasActiveFilters = Object.values(filters).some(v => v !== "");

    return (
        <div>
            <h1 className="header">Browse events</h1>

            {/* Filter bar */}
            <div className="events-filters">
                <input
                    className="events-filter-input events-filter-text"
                    type="text"
                    value={filters.text}
                    onChange={e => updateFilter("text", e.target.value)}
                    placeholder="🔍  Search by title or description..."
                />

                <select
                    className="events-filter-input"
                    value={filters.category}
                    onChange={e => updateFilter("category", e.target.value)}
                >
                    <option value="">All categories</option>
                    {categories.map(c => (
                        <option key={c.categoryId} value={c.categoryName}>
                            {c.categoryName}
                        </option>
                    ))}
                </select>

                <input
                    className="events-filter-input"
                    type="text"
                    value={filters.city}
                    onChange={e => updateFilter("city", e.target.value)}
                    placeholder="📍  City"
                />

                <input
                    className="events-filter-input"
                    type="number"
                    min={0}
                    step="0.01"
                    value={filters.maxPrice}
                    onChange={e => updateFilter("maxPrice", e.target.value)}
                    placeholder="💶  Max price"
                />

                <input
                    className="events-filter-input"
                    type="date"
                    value={filters.startDate}
                    onChange={e => updateFilter("startDate", e.target.value)}
                    title="Starts from"
                />

                <input
                    className="events-filter-input"
                    type="date"
                    value={filters.endDate}
                    onChange={e => updateFilter("endDate", e.target.value)}
                    title="Ends by"
                />

                {hasActiveFilters && (
                    <button className="borderless-button" onClick={resetFilters}>
                        Clear filters
                    </button>
                )}
            </div>

            {/* Result count */}
            {!loading && !error && (
                <p className="events-result-count">
                    {totalElements} event{totalElements !== 1 ? "s" : ""} found
                </p>
            )}

            {/* Status messages */}
            {loading && <p className="events-status-message">Loading events...</p>}
            {error && <p className="events-status-message message-error">{error}</p>}

            {!loading && !error && events.length === 0 && (
                <p className="events-status-message">No events match your filters.</p>
            )}

            {/* Event grid */}
            {events.length > 0 && (
                <div className="event-body-grid">
                    {events.map(event => (
                        <EventCard
                            key={event.eventId}
                            event={event}
                            onOpen={() => navigate(`/events/${event.eventId}`)}
                        />
                    ))}
                </div>
            )}

            {/* Pagination controls — render nothing if totalPages <= 1 */}
            <Pagination pageData={pageData} onPageChange={setPage} />
        </div>
    );
}