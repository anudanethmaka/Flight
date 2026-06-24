import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Search, SlidersHorizontal, ArrowRight, Plane,
  Clock, Users, DollarSign, ChevronUp, ChevronDown, X,
} from 'lucide-react';
import Layout from '../components/ui/Layout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Alert from '../components/ui/Alert';
import AirportInput from '../components/ui/AirportInput';
import api from '../services/api';

const STATUS_COLORS = {
  Scheduled: 'text-accent bg-accent/10',
  Boarding:  'text-green-400 bg-green-400/10',
  Delayed:   'text-yellow-400 bg-yellow-400/10',
  Completed: 'text-muted bg-white/5',
};

export default function FlightSearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // ─── Search form state ─────────────────────────────────────────────────────
  const [from, setFrom]   = useState(searchParams.get('from') || '');
  const [to,   setTo]     = useState(searchParams.get('to')   || '');
  const [date, setDate]   = useState(searchParams.get('date') || '');

  // ─── Results + loading ─────────────────────────────────────────────────────
  const [flights,  setFlights]  = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');

  // ─── Filter / sort state ───────────────────────────────────────────────────
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy,      setSortBy]      = useState('departure'); // departure | price_asc | price_desc
  const [maxPrice,    setMaxPrice]    = useState(5000);
  const [statusFilter, setStatusFilter] = useState('all');

  // ─── Fetch flights ─────────────────────────────────────────────────────────
  const search = useCallback(async (f, t, d) => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (f) params.set('from', f);
      if (t) params.set('to',   t);
      if (d) params.set('date', d);
      const { data } = await api.get(`/flights/search?${params.toString()}`);
      setFlights(data);
    } catch {
      setError('Failed to load flights. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load from URL params
  useEffect(() => {
    search(
      searchParams.get('from') || '',
      searchParams.get('to')   || '',
      searchParams.get('date') || '',
    );
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = (e) => {
    e.preventDefault();
    const params = {};
    if (from) params.from = from;
    if (to)   params.to   = to;
    if (date) params.date = date;
    setSearchParams(params);
    search(from, to, date);
  };

  // ─── Apply client-side sort + filter ──────────────────────────────────────
  const displayed = flights
    .filter((f) => f.price <= maxPrice)
    .filter((f) => statusFilter === 'all' || f.status === statusFilter)
    .sort((a, b) => {
      if (sortBy === 'price_asc')  return a.price - b.price;
      if (sortBy === 'price_desc') return b.price - a.price;
      return new Date(a.departureTime) - new Date(b.departureTime);
    });

  const maxPriceInResults = flights.length ? Math.max(...flights.map((f) => f.price), 500) : 5000;

  return (
    <Layout>
      {/* ─── Re-search form ────────────────────────────────────────────────── */}
      <Card className="mb-6">
        <form onSubmit={handleSearch}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <AirportInput label="From" value={from} onChange={setFrom} placeholder="Departure airport" />
            <AirportInput label="To"   value={to}   onChange={setTo}   placeholder="Arrival airport" />
            <div>
              <label className="block text-xs font-medium text-muted mb-1.5">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-foreground outline-none focus:border-accent transition-colors"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <Button type="submit" className="flex-1">
              <Search className="w-4 h-4 mr-2" /> Search Flights
            </Button>
            <Button type="button" variant="secondary" onClick={() => setShowFilters((v) => !v)}>
              <SlidersHorizontal className="w-4 h-4 mr-1.5" />
              Filters
              {showFilters ? <ChevronUp className="w-3.5 h-3.5 ml-1" /> : <ChevronDown className="w-3.5 h-3.5 ml-1" />}
            </Button>
          </div>
        </form>

        {/* ─── Filter panel ─────────────────────────────────────────────────── */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 pt-4 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-4"
          >
            {/* Sort */}
            <div>
              <label className="block text-xs font-medium text-muted mb-1.5">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-foreground outline-none focus:border-accent transition-colors"
              >
                <option value="departure">Earliest Departure</option>
                <option value="price_asc">Price: Low → High</option>
                <option value="price_desc">Price: High → Low</option>
              </select>
            </div>

            {/* Status filter */}
            <div>
              <label className="block text-xs font-medium text-muted mb-1.5">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-foreground outline-none focus:border-accent transition-colors"
              >
                <option value="all">All Statuses</option>
                <option value="Scheduled">Scheduled</option>
                <option value="Boarding">Boarding</option>
                <option value="Delayed">Delayed</option>
              </select>
            </div>

            {/* Max price */}
            <div>
              <label className="block text-xs font-medium text-muted mb-1.5">
                Max Price: <span className="text-accent font-semibold">${maxPrice}</span>
              </label>
              <input
                type="range"
                min={0}
                max={maxPriceInResults}
                step={10}
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-teal-400"
              />
              <div className="flex justify-between text-[10px] text-muted mt-1">
                <span>$0</span><span>${maxPriceInResults}</span>
              </div>
            </div>

            {/* Reset */}
            <div className="sm:col-span-3 flex justify-end">
              <button
                type="button"
                onClick={() => { setSortBy('departure'); setMaxPrice(maxPriceInResults); setStatusFilter('all'); }}
                className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-foreground transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" /> Reset filters
              </button>
            </div>
          </motion.div>
        )}
      </Card>

      {/* ─── Results header ────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-semibold text-foreground">
          {loading ? 'Searching…' : `${displayed.length} flight${displayed.length !== 1 ? 's' : ''} found`}
          {flights.length !== displayed.length && !loading && (
            <span className="text-sm text-muted font-normal ml-2">
              ({flights.length - displayed.length} filtered out)
            </span>
          )}
        </h1>
      </div>

      {/* ─── States ───────────────────────────────────────────────────────── */}
      {loading && <LoadingSpinner />}
      {error   && <Alert type="error" message={error} />}

      {!loading && !error && displayed.length === 0 && (
        <Card className="text-center py-16">
          <Plane className="w-10 h-10 mx-auto mb-3 text-muted opacity-40" />
          <p className="text-foreground font-medium">No flights found</p>
          <p className="text-sm text-muted mt-1">
            Try adjusting your search or removing filters.
          </p>
        </Card>
      )}

      {/* ─── Flight cards ─────────────────────────────────────────────────── */}
      {!loading && !error && (
        <div className="flex flex-col gap-4">
          {displayed.map((flight, i) => {
            const dep = new Date(flight.departureTime);
            const arr = new Date(flight.arrivalTime);
            const durationMins = Math.round((arr - dep) / 60000);
            const hours = Math.floor(durationMins / 60);
            const mins  = durationMins % 60;

            return (
              <motion.div
                key={flight._id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: i * 0.05 }}
              >
                <Card className="hover:border-accent/30 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    {/* Route */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-muted">{flight.airline}</span>
                        <span className="text-xs font-mono text-muted">·</span>
                        <span className="text-xs font-mono text-muted">{flight.flightNumber}</span>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${STATUS_COLORS[flight.status] || 'text-muted bg-white/5'}`}>
                          {flight.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-center">
                          <p className="text-xl font-bold text-foreground">{flight.departureAirport}</p>
                          <p className="text-xs text-muted">{dep.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                          <p className="text-[10px] text-muted">{dep.toLocaleDateString([], { month: 'short', day: 'numeric' })}</p>
                        </div>
                        <div className="flex-1 flex flex-col items-center">
                          <div className="text-[10px] text-muted mb-1 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {hours > 0 && `${hours}h `}{mins}m
                          </div>
                          <div className="w-full h-px bg-white/10 relative">
                            <ArrowRight className="w-3 h-3 text-accent absolute right-0 -top-1.5" />
                          </div>
                        </div>
                        <div className="text-center">
                          <p className="text-xl font-bold text-foreground">{flight.arrivalAirport}</p>
                          <p className="text-xs text-muted">{arr.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                          <p className="text-[10px] text-muted">{arr.toLocaleDateString([], { month: 'short', day: 'numeric' })}</p>
                        </div>
                      </div>
                    </div>

                    {/* Price + seats + CTA */}
                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 sm:min-w-[140px]">
                      <div className="text-right">
                        <p className="text-2xl font-bold text-accent">${flight.price}</p>
                        <div className="flex items-center gap-1 text-xs text-muted justify-end">
                          <Users className="w-3 h-3" />
                          {flight.availableSeats} seat{flight.availableSeats !== 1 ? 's' : ''} left
                        </div>
                      </div>
                      <Button
                        onClick={() => navigate(`/flights/${flight._id}`)}
                        variant="primary"
                        className="whitespace-nowrap"
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </Layout>
  );
}
