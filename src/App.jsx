import { useEffect, useRef, useState } from "react";
import WeatherView from "./components/WeatherView";
import SearchHistory from "./components/SearchHistory";

const HISTORY_KEY = "wx_history_v1";

const loadHistory = () => {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveHistory = (history) => {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch { }
};


const App = () => {
  const weatherRef = useRef(null);
  const [history, setHistory] = useState(() => loadHistory());

  const addHistory = (entry) => {
    setHistory((prev) => {
      const filtered = prev.filter((h) => h.city !== entry.city);
      return [entry, ...filtered].slice(0, 8);
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

