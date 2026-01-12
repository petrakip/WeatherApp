import "../css/WeatherTile.css"

function WeatherTile({weatherData}) {
    const data = weatherData || {};
    return (
        <div className="weather-tile">
            <img className="weather-icon" src={data.icon} />
            <p className="temperature">{data.temperature} °c</p>
            <p className="location">{data.location}</p>
        </div>
    )
}

export default WeatherTile;