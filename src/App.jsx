import { useEffect, useRef, useState } from "react";
import WeatherView from "./components/WeatherView";
import SearchHistory from "./components/SearchHistory";

// localStorage key used to persist the user's search history between page reloads
const HISTORY_KEY = "wx_history_v1";

/*
 * Loads search history from localStorage.
 * Returns an empty array if:
 * - no saved history exists
 * - stored JSON is invalid/corrupted
 */
const loadHistory = () => {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

/*
 * Saves the current search history array to localStorage.
 * Wrapped in try/catch to avoid crashing the app if storage is blocked or full.
 */
const saveHistory = (history) => {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch { }
};


const App = () => {
  const weatherRef = useRef(null);
  const [history, setHistory] = useState(() => loadHistory());


  /*
   * Adds a new entry to history:
   * - Removes any previous entry for the same city (dedupe by city name)
   * - Prepends the new entry (most recent first)
   * - Keeps only the latest 8 items
   *
   * Uses functional setState to avoid stale state issues.
   */
  const HISTORY_LIMIT = 15;

  const addHistory = (entry) => {
    setHistory((prev) => {
      const filtered = prev.filter((h) => h.city !== entry.city);
      return [entry, ...filtered].slice(0, HISTORY_LIMIT);
    });
  };

  useEffect(() => {
    saveHistory(history);
  }, [history]);

  return (
    <div className="app">
      <WeatherView ref={weatherRef} onHistoryAdd={addHistory} />

      <div className="search-history-container">
        <SearchHistory
          history={history}
          onSelect={(city) => weatherRef.current?.searchCity(city)}
          onClear={() => setHistory([])}
        />
      </div>
    </div>
  );
};

export default App;

