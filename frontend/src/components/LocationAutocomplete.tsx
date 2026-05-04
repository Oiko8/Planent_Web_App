import { useState, useEffect, useRef } from "react";

type GeoSuggestion = {
    formatted: string;
    lat: number;
    lon: number;
    city: string;
    country: string;
    address_line1: string;
    postcode: string;
};

type LocationAutocompleteProps = {
    onSelect: (location: {
        address: string;
        city: string;
        country: string;
        zipcode: string;
        latitude: number;
        longitude: number;
    }) => void;
    placeholder?: string;
};

export default function LocationAutocomplete({ onSelect, placeholder }: LocationAutocompleteProps) {
    const [query, setQuery] = useState("");
    const [suggestions, setSuggestions] = useState<GeoSuggestion[]>([]);
    const [loading, setLoading] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setShowDropdown(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        const value = e.target.value;
        setQuery(value);

        if (debounceTimer.current) clearTimeout(debounceTimer.current);

        if (value.length < 3) {
            setSuggestions([]);
            setShowDropdown(false);
            return;
        }

        // debounce — wait 400ms after user stops typing before calling API
        debounceTimer.current = setTimeout(async () => {
            setLoading(true);
            try {
                const apiKey = import.meta.env.VITE_GEOAPIFY_API_KEY;
                const url = `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(value)}&apiKey=${apiKey}&limit=5&lang=en`;
                const response = await fetch(url);
                const data = await response.json();

                const results: GeoSuggestion[] = data.features.map((f: any) => ({
                    formatted: f.properties.formatted,
                    lat: f.properties.lat,
                    lon: f.properties.lon,
                    city: f.properties.city || f.properties.town || f.properties.village || "",
                    country: f.properties.country || "",
                    address_line1: f.properties.address_line1 || "",
                    postcode: f.properties.postcode || "",
                }));

                setSuggestions(results);
                setShowDropdown(true);
            } catch (err) {
                console.error("Geoapify error:", err);
            } finally {
                setLoading(false);
            }
        }, 400);
    }

    function handleSelect(suggestion: GeoSuggestion) {
        setQuery(suggestion.formatted);
        setShowDropdown(false);
        setSuggestions([]);

        onSelect({
            address: suggestion.address_line1 || suggestion.formatted,
            city: suggestion.city,
            country: suggestion.country,
            zipcode: suggestion.postcode,
            latitude: suggestion.lat,
            longitude: suggestion.lon,
        });
    }

    return (
        <div ref={containerRef} className="location-autocomplete">
            <input
                className="search-input"
                value={query}
                onChange={handleChange}
                placeholder={placeholder || "Search address..."}
                autoComplete="off"
            />

            {loading && <p className="location-loading">Searching...</p>}

            {showDropdown && suggestions.length > 0 && (
                <ul className="location-dropdown">
                    {suggestions.map((s, i) => (
                        <li
                            key={i}
                            className="location-dropdown-item"
                            onMouseDown={() => handleSelect(s)}
                        >
                            {s.formatted}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}