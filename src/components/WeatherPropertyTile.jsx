import humidity_icon from "../assets/humidity.png";
import wind_icon from "../assets/wind.png";
import "../css/WeatherPropertyTile.css"


function WeatherPropertyTile({ type, value }) {
    var icon = "", title = "";
    switch(type) {
        case "humidity":
            icon = humidity_icon;
            title = "Humidity";
            value = value + "%";
            break;
        case "wind":
            icon = wind_icon;
            title = "Wind speed";
            value = value + " km/h";
            break;
    }

    return (
        <div className="col">
            <img src={icon} alt={title} />
            <div>
                <p>{value}</p>
                <span>{title}</span>
            </div>
        </div>
    )
}

export default WeatherPropertyTile;