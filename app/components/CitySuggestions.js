"use client"
export default function CitySuggestions({ suggestions, onSelect, isLoading }) {
    if (!suggestions || suggestions.length === 0) {
        return null;
    }

    return (
        <div className="suggestions-dropdown">
            {isLoading && <div className="suggestion-loading">Loading...</div>}
            {suggestions.map((city, index) => (
                <button
                    key={index}
                    type="button"
                    className="suggestion-item"
                    onClick={() => onSelect(city)}
                >
                    {city}
                </button>
            ))}
        </div>
    );
}
