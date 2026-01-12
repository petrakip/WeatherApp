import SearchHistoryItem from "./SearchHistoryItem";
import "../css/SearchHistory.css"

function SearchHistory({ history = [], onSelect, onClear }) {

    return (
        <div className="search-history">
            <div className="search-history-top">
                <h3 className="search-history-title">Latest Searches</h3>

                {history.length > 0 && (
                    <button className="search-history-clear" type="button" onClick={onClear}>
                        Clear
                    </button>
                )}
            </div>

            <div className="search-history-head">
                <span>City</span>
                <span>Date</span>
                <span>Time</span>
            </div>

            <div className="search-history-list">
                {history.map((item) => (
                    <SearchHistoryItem
                        key={`${item.city}-${item.date}-${item.time}`}
                        city={item.city}
                        date={item.date}
                        time={item.time}
                        onClick={() => onSelect && onSelect(item.city)}
                    />
                ))}
            </div>
        </div>
    );
}

export default SearchHistory;