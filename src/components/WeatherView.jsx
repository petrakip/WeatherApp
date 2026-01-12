import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import SearchBar from "./SearchBar";
import WeatherPropertyTile from "./WeatherPropertyTile";
import WeatherTile from "./WeatherTile";
import "../css/WeatherView.css";
import FavoriteView from "./FavoriteView";

const WeatherView = forwardRef(function WeatherView({ onHistoryAdd }, ref) {
    const [weatherData, setWeatherData] = useState(false);
    const [favorites, setFavorites] = useState([]);

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

        try {
            let lat, lon, displayName;

            if (coords?.lat && coords?.lon) {
                lat = coords.lat;
                lon = coords.lon;
                displayName = coords.name;
            } else {
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

            const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${import.meta.env.VITE_API_KEY}`;

            const response = await fetch(url);
            if (!response.ok) {
                console.log(response);
                return;
            }

            const data = await response.json();

            // ✅ ενημέρωση history (στο App) με callback
            const cityForHistory = displayName || data.name;
            const now = new Date();
            const date = now.toLocaleDateString("en-GB"); // 22/05/2026
            const time = now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }); // 21:00
            onHistoryAdd?.({ city: cityForHistory, date, time });

            const iconCode = data.weather[0].icon;
            const isDay = iconCode.endsWith("d");
            const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;

            const appElement = document.querySelector(".app");
            if (appElement) {
                // ✅ Day/Night backgrounds (κρατάμε αυτό)
                appElement.classList.toggle("day-bg", isDay);
                appElement.classList.toggle("night-bg", !isDay);

                // ✅ Καθάρισε ΜΟΝΟ τα weather effects
                appElement.classList.remove("weather-snow", "weather-rain");

                // ✅ Βάλε ΜΟΝΟ snow ή rain
                const main = (data.weather?.[0]?.main || "").toLowerCase();

                if (main === "snow") {
                    appElement.classList.add("weather-snow");
                } else if (main === "rain" || main === "drizzle" || main === "thunderstorm") {
                    appElement.classList.add("weather-rain");
                }
            }

            setWeatherData({
                humidity: data.main.humidity,
                windSpeed: data.wind.speed,
                temperature: Math.floor(data.main.temp),
                location: displayName || data.name,
                icon: iconUrl,
            });
        } catch (error) {
            setWeatherData(false);
            console.log("Error in fetching weather data", error);
        }
    };

    // ✅ Εκθέτουμε μέθοδο στο App μέσω ref
    useImperativeHandle(ref, () => ({
        searchCity: (city) => search(city),
    }));

    useEffect(() => {
        search("Athens");
    }, []);

    const isFavorite = weatherData && favorites.includes(weatherData.location);

    return (
        <div className="weather-view">
            <div className="weather-layout">
                <div className="weather-main">
                    {weatherData && (
                        <span className="favorite-icon" onClick={() => favorite(weatherData.location)}>
                            {isFavorite ? "❤️" : "🤍"}
                        </span>
                    )}

                    <SearchBar searchFunction={search} />
                    <WeatherTile weatherData={weatherData} />

                    <div className="weather-property-data">
                        <WeatherPropertyTile type="humidity" value={weatherData.humidity} />
                        <WeatherPropertyTile type="wind" value={weatherData.windSpeed} />
                    </div>
                </div>

                {favorites.length > 0 && (
                    <div className="favorites-container mobile-only">
                        <FavoriteView favorites={favorites} onRemove={favorite} onSelect={search} />
                    </div>
                )}

                <div className="favorites-container desktop-only">
                    <FavoriteView favorites={favorites} onRemove={favorite} onSelect={search} />
                </div>
            </div>
        </div>
    );
});

export default WeatherView;
