import { useRef, useState } from "react"
import "../css/SearchBar.css"

function SearchBar({ searchFunction }) {
    const inputRef = useRef();
    const search = searchFunction;

    return (
        <div className="search-bar">
            <input type="text" placeholder="Search..." ref={inputRef} />
            <span className="search-icon" onClick={
                async () => {
                    console.log("searching for city: ", inputRef.current.value, search);
                    await search(inputRef.current.value);
                }
            }>🔍</span>
        </div>
    )
}

export default SearchBar;