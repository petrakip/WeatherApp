import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import SearchBar from "./SearchBar";
import WeatherPropertyTile from "./WeatherPropertyTile";
import WeatherTile from "./WeatherTile";
import "../css/WeatherView.css";
import FavoriteView from "./FavoriteView";

/* ---------------- OFFLINE CACHE HELPERS ---------------- */
const CACHE_PREFIX = "wx_cache_v1:";
const LAST_KEY = "wx_last_v1";

const normalizeKey = (s) => (s || "").trim().toLowerCase();

const saveCityCache = (cityName, payload) => {
    try {
        localStorage.setItem(
            CACHE_PREFIX + normalizeKey(cityName),
            JSON.stringify({ ts: Date.now(), payload })
        );
    } catch { }
};

const loadCityCache = (cityName) => {
    try {
        const raw = localStorage.getItem(CACHE_PREFIX + normalizeKey(cityName));
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        return parsed?.payload ?? null;
    } catch {
        return null;
    }
};

const saveLast = (payload) => {
    try {
        localStorage.setItem(LAST_KEY, JSON.stringify({ ts: Date.now(), payload }));
    } catch { }
};

const loadLast = () => {
    try {
        const raw = localStorage.getItem(LAST_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        return parsed?.payload ?? null;
    } catch {
        return null;
    }
};

/* ---------------- APP THEME APPLY (day/night + effects) ---------------- */
const applyAppClasses = (theme) => {
    const app = document.querySelector(".app");
    if (!app) return;

    // day/night
    app.classList.toggle("day-bg", !!theme?.isDay);
    app.classList.toggle("night-bg", !theme?.isDay);

    // effects (ONLY snow/rain)
    app.classList.remove("weather-snow", "weather-rain");
    if (theme?.effect === "snow") app.classList.add("weather-snow");
    if (theme?.effect === "rain") app.classList.add("weather-rain");
};

const WeatherView = forwardRef(function WeatherView({ onHistoryAdd }, ref) {
    const [weatherData, setWeatherData] = useState(false);
    const [favorites, setFavorites] = useState([]);
    const [isOnline, setIsOnline] = useState(navigator.onLine);

    useEffect(() => {
        const on = () => setIsOnline(true);
        const off = () => setIsOnline(false);
        window.addEventListener("online", on);
        window.addEventListener("offline", off);
        return () => {
            window.removeEventListener("online", on);
            window.removeEventListener("offline", off);
        };
    }, []);

    const favorite = (city) => {
        if (!city) return;

        if (favorites.includes(city)) {
            setFavorites(favorites.filter((c) => c !== city));
        } else {
            setFavorites([...favorites, city]);
        }
    };

    const search = async (input) => {
        const text = typeof input === "string" ? input.trim() : "";
        const coords = typeof input === "object" && input ? input : null;

        if (!text && !coords) {
            alert("Enter City Name");
            return;
        }

        /* ✅ OFFLINE PATH (before ANY fetch) */
        const offline = !navigator.onLine;
        if (offline) {
            const cityName = coords?.name || text;
            if (cityName) {
                const cached = loadCityCache(cityName);
                if (cached) {
                    setWeatherData(cached);
                    applyAppClasses(cached);
                    return;
                }
            }
            alert("You are offline. No cached data for this city yet.");
            return;
        }

        /* ✅ ONLINE PATH */
        try {
            let lat, lon, displayName;

            // coords from autocomplete
            if (coords?.lat && coords?.lon) {
                lat = coords.lat;
                lon = coords.lon;
                displayName = coords.name;
            } else {
                // geocoding by text
                const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(
                    text
                )}&limit=1&appid=${import.meta.env.VITE_API_KEY}`;

                const geoRes = await fetch(geoUrl);
                if (!geoRes.ok) return;

                const geoData = await geoRes.json();
                if (!Array.isArray(geoData) || geoData.length === 0) {
                    alert("City not found");
                    return;
                }

                lat = geoData[0].lat;
                lon = geoData[0].lon;
                displayName = geoData[0].name;
            }

            // weather by lat/lon
            const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${import.meta.env.VITE_API_KEY}`;

            const response = await fetch(url);
            if (!response.ok) {
                console.log(response);
                return;
            }

            const data = await response.json();

            const cityForHistory = displayName || data.name;

            // history callback (App)
            const now = new Date();
            const date = now.toLocaleDateString("en-GB");
            const time = now.toLocaleTimeString("en-GB", {
                hour: "2-digit",
                minute: "2-digit",
            });
            onHistoryAdd?.({ city: cityForHistory, date, time });

            // icon/day-night
            const iconCode = data.weather?.[0]?.icon;
            const isDay = !!iconCode && iconCode.endsWith("d");
            const iconUrl = iconCode
                ? `https://openweathermap.org/img/wn/${iconCode}@2x.png`
                : "";

            // ONLY snow/rain effects
            const main = (data.weather?.[0]?.main || "").toLowerCase();
            let effect = null;
            if (main === "snow") effect = "snow";
            else if (main === "rain" || main === "drizzle" || main === "thunderstorm")
                effect = "rain";

            const nextWeather = {
                humidity: data.main.humidity,
                windSpeed: data.wind.speed,
                temperature: Math.floor(data.main.temp),
                location: cityForHistory,
                icon: iconUrl,

                // ✅ saved for offline restore of UI
                isDay,
                effect,
            };

            setWeatherData(nextWeather);

            // apply theme to app
            applyAppClasses(nextWeather);

            // cache
            saveCityCache(cityForHistory, nextWeather);
            saveLast(nextWeather);
        } catch (error) {
            setWeatherData(false);
            console.log("Error in fetching weather data", error);
        }
    };

    // expose to App via ref
    useImperativeHandle(ref, () => ({
        searchCity: (city) => search(city),
    }));

    // initial load: show last cached immediately, then fetch Athens if online
    useEffect(() => {
        const cachedLast = loadLast();
        if (cachedLast) {
            setWeatherData(cachedLast);
            applyAppClasses(cachedLast);
        }

        if (navigator.onLine) {
            search("Athens");
        }
    }, []);

    const isFavorite = weatherData && favorites.includes(weatherData.location);

    return (
        <div className="weather-view">
            <div className="weather-layout">
                <div className="weather-main">
                    {!isOnline && <div className="offline-badge">Offline mode</div>}

                    {weatherData && (
                        <span
                            className="favorite-icon"
                            onClick={() => favorite(weatherData.location)}
                        >
                            {isFavorite ? "❤️" : "🤍"}
                        </span>
                    )}

                    <SearchBar searchFunction={search} />
                    <WeatherTile weatherData={weatherData} />

                    <div className="weather-property-data">
                        <WeatherPropertyTile type="humidity" value={weatherData?.humidity} />
                        <WeatherPropertyTile type="wind" value={weatherData?.windSpeed} />
                    </div>
                </div>

                {favorites.length > 0 && (
                    <div className="favorites-container mobile-only">
                        <FavoriteView
                            favorites={favorites}
                            onRemove={favorite}
                            onSelect={search}
                        />
                    </div>
                )}

                <div className="favorites-container desktop-only">
                    <FavoriteView
                        favorites={favorites}
                        onRemove={favorite}
                        onSelect={search}
                    />
                </div>
            </div>
        </div>
    );
});

export default WeatherView;
