import { useState, useEffect, useRef } from "react";

function AddressAutocomplete({ name, value, onChange, placeholder }) {
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const searchAddress = async (query) => {
    if (query.length < 3) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&countrycodes=br&addressdetails=1`,
        { headers: { "User-Agent": "CaronaApp/1.0" } }
      );
      const data = await res.json();
      setSuggestions(data);
      setShowSuggestions(data.length > 0);
    } catch {
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    onChange({ target: { name, value: val } });

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => searchAddress(val), 400);
  };

  const handleSelect = (suggestion) => {
    const displayName = suggestion.display_name;
    onChange({ target: { name, value: displayName } });
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const formatSuggestion = (s) => {
    const a = s.address || {};
    const parts = [
      s.name || a.road,
      a.suburb || a.neighbourhood || a.quarter,
      a.city || a.town || a.municipality,
      a.state,
    ].filter(Boolean);
    return parts.join(", ");
  };

  return (
    <div ref={containerRef} style={{ position: "relative" }}>
      <input
        type="text"
        name={name}
        value={value}
        onChange={handleInputChange}
        onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
        placeholder={placeholder}
        autoComplete="off"
        required
      />
      {loading && (
        <div style={{
          position: "absolute",
          right: "1rem",
          top: "50%",
          transform: "translateY(-50%)",
          fontSize: "0.75rem",
          color: "var(--text-secondary)"
        }}>
          Buscando...
        </div>
      )}
      {showSuggestions && (
        <ul style={{
          position: "absolute",
          top: "100%",
          left: 0,
          right: 0,
          zIndex: 1000,
          background: "var(--secondary-bg)",
          border: "1px solid var(--border)",
          borderRadius: "0.5rem",
          marginTop: "0.25rem",
          padding: 0,
          listStyle: "none",
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          maxHeight: "200px",
          overflowY: "auto",
        }}>
          {suggestions.map((s) => (
            <li
              key={s.place_id}
              onClick={() => handleSelect(s)}
              style={{
                padding: "0.75rem 1rem",
                cursor: "pointer",
                fontSize: "0.875rem",
                borderBottom: "1px solid var(--border)",
                color: "var(--text-primary)",
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = "var(--tertiary-bg)"}
              onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
            >
              <div style={{ fontWeight: "500" }}>{formatSuggestion(s)}</div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "0.2rem" }}>
                {s.display_name.substring(0, 80)}...
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default AddressAutocomplete;
