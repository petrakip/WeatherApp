import "../css/SearchHistoryItem.css"

function SearchHistoryItem({ city, date, time, onClick }) {
    return (
        <div className="search-history-item" onClick={onClick}>
            <span>{city}</span>
            <span>{date}</span>
            <span>{time}</span>
        </div>
    );
}

export default SearchHistoryItem;