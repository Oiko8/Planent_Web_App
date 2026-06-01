import { useEffect, useState } from "react";
import EventCard from "../../components/EventCard";
import Pagination from "../../components/Pagination";
import type { EventSummary, CategoryResponse, PageResponse } from "../../types/event";
import api from "../../api/axiosConfig";
import Loader from "../../components/Loader";
import DatePicker from "react-datepicker";
import { format } from "date-fns";

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
const PAGE_SIZE = 4;

export default function EventsPage() {
    const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
    const [debouncedText, setDebouncedText] = useState("");
    const [page, setPage] = useState(0);

    // /events/search returns EventSummaryResponse, not the full event
    const [pageData, setPageData] = useState<PageResponse<EventSummary> | null>(null);
    const [categories, setCategories] = useState<CategoryResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const t = setTimeout(() => {
            setDebouncedText(filters.text);
            setPage(0);
        }, DEBOUNCE_MS);
        return () => clearTimeout(t);
    }, [filters.text]);

    useEffect(() => {
        api.get<CategoryResponse[]>("/events/categories")
            .then(res => setCategories(res.data))
            .catch(() => { /* non-critical */ });
    }, []);

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

                const response = await api.get<PageResponse<EventSummary>>("/events/search", {
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

    function updateFilter<K extends keyof Filters>(key: K, value: Filters[K]) {
        setFilters(prev => ({ ...prev, [key]: value }));
        if (key !== "text") setPage(0);
    }

    function resetFilters() {
        setFilters(EMPTY_FILTERS);
        setPage(0);
    }

    const events = pageData?.content ?? [];
    const totalElements = pageData?.page.totalElements ?? 0;
    const hasActiveFilters = Object.values(filters).some(v => v !== "");

    return (
        <div>
            <h1 className="header">Browse events</h1>

            <div className="search-container">
                {/* Primary search bar */}
                <div className="search-bar">
                    <span className="search-bar-icon">🔍</span>
                    <input
                        className="search-bar-input"
                        type="text"
                        value={filters.text}
                        onChange={e => updateFilter("text", e.target.value)}
                        placeholder="Search events by title or description..."
                    />
                    {filters.text && (
                        <button
                            className="search-bar-clear"
                            onClick={() => updateFilter("text", "")}
                            aria-label="Clear search"
                            title="Clear search"
                        >
                            ✕
                        </button>
                    )}
                </div>

                {/* Secondary filters */}
                <div className="search-filters">
                    <div className="search-filter-group">
                        <label className="search-filter-label">Category</label>
                        <select
                            className="search-filter-input"
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
                    </div>

                    <div className="search-filter-group">
                        <label className="search-filter-label">City</label>
                        <input
                            className="search-filter-input"
                            type="text"
                            value={filters.city}
                            onChange={e => updateFilter("city", e.target.value)}
                            placeholder="Any city"
                        />
                    </div>

                    <div className="search-filter-group">
                        <label className="search-filter-label">Max price</label>
                        <input
                            className="search-filter-input"
                            type="number"
                            min={0}
                            step="0.01"
                            value={filters.maxPrice}
                            onChange={e => updateFilter("maxPrice", e.target.value)}
                            placeholder="No limit"
                        />
                    </div>

                    <div className="search-filter-group">
                        <label className="search-filter-label">From</label>
                        <DatePicker
                            selected={filters.startDate ? new Date(filters.startDate) : null}
                            onChange={(date: Date | null) =>
                                updateFilter("startDate", date ? format(date, "yyyy-MM-dd") : "")
                            }
                            dateFormat="yyyy-MM-dd"
                            placeholderText="Any date"
                            isClearable
                            className="search-filter-input"
                        />
                    </div>

                    <div className="search-filter-group">
                        <label className="search-filter-label">Until</label>
                        <DatePicker
                            selected={filters.endDate ? new Date(filters.endDate) : null}
                            onChange={(date: Date | null) =>
                                updateFilter("endDate", date ? format(date, "yyyy-MM-dd") : "")
                            }
                            dateFormat="yyyy-MM-dd"
                            placeholderText="Any date"
                            isClearable
                            minDate={filters.startDate ? new Date(filters.startDate) : undefined}
                            className="search-filter-input"
                        />
                    </div>

                    {hasActiveFilters && (
                        <button className="search-clear-all" onClick={resetFilters}>
                            Clear all
                        </button>
                    )}
                </div>
            </div>

            {loading && <Loader />}
            {error && <p className="events-status-message message-error">{error}</p>}

            {!loading && !error && events.length === 0 && (
                <p className="events-status-message">No events match your filters.</p>
            )}

            {!loading && events.length > 0 && (
                <div className="event-body-grid">
                    {events.map(event => (
                        <EventCard key={event.eventId} event={event} />
                    ))}
                </div>
            )}

            <Pagination pageData={pageData} onPageChange={setPage} />
        </div>
    );
}