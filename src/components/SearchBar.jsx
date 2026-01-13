import { useEffect, useRef, useState } from "react";
import "../css/SearchBar.css";

// Delay (in ms) before we consider the user "done typing"
const DEBOUNCE_MS = 300;
// Max number of location suggestions to request from the API
const LIMIT = 6;

/**
 * SearchBar
 * - Lets the user type a city name
 * - Shows autocomplete suggestions from OpenWeather Geo API
 * - Calls `searchFunction` either when selecting a suggestion or clicking the search icon
 */
function SearchBar({ searchFunction }) {
    const inputRef = useRef();
    const [raw, setRaw] = useState("");   // ✅ NEW
    const [query, setQuery] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [open, setOpen] = useState(false);

    // Debounce raw -> query
    useEffect(() => {
        const timer = setTimeout(() => setQuery(raw.trim()), DEBOUNCE_MS);
        return () => clearTimeout(timer);
    }, [raw]);

    // Listen to typing
    const onChange = () => {
        const val = inputRef.current?.value ?? "";
        setRaw(val);
    };

    // Fetch suggestions
    useEffect(() => {
        const query = query;
        if (!query || query.length < 2) {
            setSuggestions([]);
            setOpen(false);
            return;
        }

        let cancelled = false;

        (async () => {
            try {
                const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(
                    query
                )}&limit=${LIMIT}&appid=${import.meta.env.VITE_API_KEY}`;

                const res = await fetch(geoUrl);
                if (!res.ok) return;

                const data = await res.json();
                if (cancelled) return;

                const mapped = (Array.isArray(data) ? data : []).map((x) => ({
                    name: x.name,
                    state: x.state,
                    country: x.country,
                    lat: x.lat,
                    lon: x.lon,
                }));

                setSuggestions(mapped);
                setOpen(mapped.length > 0);
            } catch {
                if (!cancelled) {
                    setSuggestions([]);
                    setOpen(false);
                }
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [query]); 

    const label = (s) =>
        `${s.name}${s.state ? `, ${s.state}` : ""}, ${s.country}`;

    const choose = async (s) => {
        const text = label(s);
        inputRef.current.value = text;
        setRaw(text); // synchronize raw, otherwise the old one will remain
        setOpen(false);
        setSuggestions([]);
        await searchFunction({ name: s.name, lat: s.lat, lon: s.lon });
    };

    const doSearch = async () => {
        const val = inputRef.current.value;
        await searchFunction(val);
        setOpen(false);
    };

    return (
        <div className="search-bar">
            <div className="search-input-wrap">
                <input
                    type="text"
                    placeholder="Search..."
                    ref={inputRef}
                    onChange={onChange}
                    onFocus={() => setOpen(suggestions.length > 0)}
                    onBlur={() => setTimeout(() => setOpen(false), 120)}
                />

                {open && (
                    <div className="search-dropdown">
                        {suggestions.map((s, idx) => (
                            <div
                                key={`${s.name}-${s.lat}-${s.lon}-${idx}`}
                                className="search-item"
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => choose(s)}
                            >
                                {label(s)}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <span className="search-icon" onClick={doSearch}>
                🔍
            </span>
        </div>
    );
}

export default SearchBar;
