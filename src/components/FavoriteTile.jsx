import "../css/FavoriteTile.css";

function FavoriteTile({ city, onRemove, onSelect }) {
    return (
        <div className="favorite-tile">
            <p className="favorite-city" onClick={() => onSelect(city)}>{ city }</p>
            <span className="favorite-remove" onClick={() => onRemove(city)}>❤️</span>
        </div>
    );
}

export default FavoriteTile;