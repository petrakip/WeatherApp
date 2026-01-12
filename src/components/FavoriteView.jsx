import FavoriteTile from "./FavoriteTile"
import "../css/FavoriteView.css"

function FavoriteView({ favorites, onRemove, onSelect }) {
    if (favorites.length === 0) {
        return (
            <div className="favorites-empty">
                <p>⭐ Your favorites list is empty</p>
                <p className="favorites-hint">
                    Tap the heart icon to add your first favorite city
                </p>
            </div>
        );
    }

    return (
        <div className="favorites-view">
            <h3 className="favorites-title">Favorites</h3>
            {favorites.map((city) => (
                <FavoriteTile
                    key={city}
                    city={city}
                    onRemove={onRemove}
                    onSelect={onSelect}
                />
            ))}
        </div>
    );
}

export default FavoriteView;