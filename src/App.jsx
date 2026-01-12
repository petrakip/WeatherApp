import { useRef, useState } from "react";
import WeatherView from "./components/WeatherView";
import SearchHistory from "./components/SearchHistory";

const App = () => {
  const weatherRef = useRef(null);
  const [history, setHistory] = useState([]);

  const addHistory = (entry) => {
    setHistory((prev) => {
      const filtered = prev.filter((h) => h.city !== entry.city);
      return [entry, ...filtered].slice(0, 8);
    });
  };

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

