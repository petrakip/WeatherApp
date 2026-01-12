import { useEffect, useState } from "react";
import SearchBar from "./SearchBar";
import WeatherPropertyTile from "./WeatherPropertyTile";
import WeatherTile from "./WeatherTile";
import "../css/WeatherView.css"

function WeatherView() {

    const [weatherData, setWeatherData] = useState(false);
    const [favorites, setFavorites] = useState([]);

    const favorite = (city) => {
        
        if (favorites.includes(city)) {
            setFavorites(favorites.filter((c) => c !== city));
        } else {
            setFavorites([...favorites, city]);
        }
        
    };

    const search = async (city) => {
        if (city === "") {
            alert("Enter City Name")
            return;
        }

        try {
            const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}
                &units=metric&appid=${import.meta.env.VITE_API_KEY}`;

            // console.log("fetching url...", url);

            const response = await fetch(url);
            var data = {};
            if (response.ok) {
                data = await response.json();
            }

            // console.log("response", response, data);

            if (!response.ok) {
                console.log(response);
                return;
            }

            // console.log("Weather Data", data);

            const iconCode = data.weather[0].icon;
            const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;

            setWeatherData({
                humidity: data.main.humidity,
                windSpeed: data.wind.speed,
                temperature: Math.floor(data.main.temp),
                location: data.name,
                icon: iconUrl
            })
        } catch (error) {
            setWeatherData(false);
            console.log("Error in fetching weather data", error);
        }
    };

    useEffect(() => {
        search("Athens");
    }, []);

    useEffect(() => {
        console.log("Favorites after:", favorites);
    }, [favorites]);

    const isFavorite = weatherData && favorites.includes(weatherData.location);

    return (
        <div className="weather-view">
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
    )
}

export default WeatherView;