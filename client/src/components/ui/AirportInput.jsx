import { useState, useEffect, useRef } from 'react';
import { MapPin, ChevronDown } from 'lucide-react';
import api from '../../services/api';

// Singleton cache so we only fetch airports once per session
let airportCache = null;
let fetchPromise = null;

async function fetchAirports() {
  if (airportCache) return airportCache;
  if (fetchPromise) return fetchPromise;
  fetchPromise = api.get('/flights/airports').then((r) => {
    airportCache = r.data || [];
    return airportCache;
  }).catch(() => []);
  return fetchPromise;
}

export default function AirportInput({ label, value, onChange, placeholder = 'e.g. Colombo, DXB' }) {
  const [airports, setAirports]     = useState([]);
  const [query, setQuery]           = useState(value || '');
  const [filtered, setFiltered]     = useState([]);
  const [open, setOpen]             = useState(false);
  const [focused, setFocused]       = useState(false);
  const ref = useRef(null);

  // Load airport list once
  useEffect(() => {
    fetchAirports().then(setAirports);
  }, []);

  // Sync external value
  useEffect(() => {
    setQuery(value || '');
  }, [value]);

  // Filter airports as user types
  useEffect(() => {
    if (!query.trim()) {
      setFiltered(airports.slice(0, 8));
    } else {
      const q = query.toLowerCase();
      setFiltered(airports.filter((a) => a.toLowerCase().includes(q)).slice(0, 8));
    }
  }, [query, airports]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelect = (airport) => {
    setQuery(airport);
    onChange(airport);
    setOpen(false);
  };

  const handleChange = (e) => {
    setQuery(e.target.value);
    onChange(e.target.value);
    setOpen(true);
  };

  return (
    <div className="relative" ref={ref}>
      {label && (
        <label className="block text-xs font-medium text-muted mb-1.5">{label}</label>
      )}
      <div className={`relative flex items-center rounded-xl border transition-colors ${
        focused ? 'border-accent bg-white/5' : 'border-white/10 bg-white/5'
      }`}>
        <MapPin className="absolute left-3 w-4 h-4 text-muted pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={handleChange}
          onFocus={() => { setFocused(true); setOpen(true); }}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          className="w-full bg-transparent pl-9 pr-8 py-2.5 text-sm text-foreground placeholder:text-muted outline-none"
          autoComplete="off"
        />
        <ChevronDown className={`absolute right-3 w-4 h-4 text-muted pointer-events-none transition-transform ${open ? 'rotate-180' : ''}`} />
      </div>

      {/* Dropdown */}
      {open && filtered.length > 0 && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 glass-strong border border-white/10 rounded-xl shadow-2xl overflow-hidden">
          {filtered.map((airport) => (
            <button
              key={airport}
              onMouseDown={() => handleSelect(airport)}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-foreground hover:bg-white/10 transition-colors text-left cursor-pointer"
            >
              <MapPin className="w-3.5 h-3.5 text-accent flex-shrink-0" />
              {airport}
            </button>
          ))}
        </div>
      )}

      {/* No matches hint */}
      {open && query.length > 1 && filtered.length === 0 && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 glass-strong border border-white/10 rounded-xl shadow-xl px-3 py-2.5 text-xs text-muted">
          No airports match "{query}" — you can still search with this text.
        </div>
      )}
    </div>
  );
}
