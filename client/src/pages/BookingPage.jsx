import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Minus, User, Plane, ArrowRight } from 'lucide-react';
import Layout from '../components/ui/Layout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Alert from '../components/ui/Alert';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import api from '../services/api';

const COLS  = ['A', 'B', 'C', 'D', 'E', 'F'];

function buildSeatGrid(totalSeats, bookedSeats) {
  const seats = [];
  const total = totalSeats || 30;
  const rows = Math.ceil(total / COLS.length);
  for (let r = 1; r <= rows; r++) {
    COLS.forEach((c) => {
      const id = `${r}${c}`;
      const seatIndex = (r - 1) * COLS.length + COLS.indexOf(c);
      if (seatIndex < total) {
        seats.push({ id, row: r, booked: bookedSeats.includes(id) });
      }
    });
  }
  return seats;
}

export default function BookingPage() {
  const { flightId } = useParams();
  const navigate = useNavigate();

  const [flight,      setFlight]      = useState(null);
  const [bookedSeats, setBookedSeats] = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState('');

  // Multi-passenger state
  const [passengerCount, setPassengerCount] = useState(1);
  const [passengers, setPassengers] = useState([
    { passengerName: '', passengerAge: '', seatNumber: '' },
  ]);

  // Load flight + real booked seats
  useEffect(() => {
    async function load() {
      try {
        const [flightRes, seatsRes] = await Promise.all([
          api.get(`/flights/${flightId}`),
          api.get(`/flights/${flightId}/seats`),
        ]);
        setFlight(flightRes.data);
        setBookedSeats(seatsRes.data || []);
      } catch {
        setError('Failed to load flight details.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [flightId]);

  // Sync passenger array when count changes
  const changeCount = (delta) => {
    const next = Math.max(1, Math.min(6, passengerCount + delta));
    setPassengerCount(next);
    setPassengers((prev) => {
      if (next > prev.length) {
        return [...prev, ...Array(next - prev.length).fill({ passengerName: '', passengerAge: '', seatNumber: '' })];
      }
      return prev.slice(0, next);
    });
  };

  const updatePassenger = (idx, field, value) => {
    setPassengers((prev) => prev.map((p, i) => i === idx ? { ...p, [field]: value } : p));
  };

  const selectSeat = (idx, seatId) => {
    // Prevent selecting a seat already chosen by another passenger in this booking
    const alreadyChosen = passengers.some((p, i) => i !== idx && p.seatNumber === seatId);
    if (alreadyChosen) return;
    updatePassenger(idx, 'seatNumber', seatId);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Validate all passengers
    for (let i = 0; i < passengers.length; i++) {
      if (!passengers[i].passengerName.trim()) {
        return setError(`Passenger ${i + 1}: name is required.`);
      }
      if (!passengers[i].seatNumber) {
        return setError(`Passenger ${i + 1}: please select a seat.`);
      }
    }

    // Check duplicate seats across passengers
    const seats = passengers.map((p) => p.seatNumber);
    if (new Set(seats).size !== seats.length) {
      return setError('Each passenger must have a different seat.');
    }

    if (flight.availableSeats < passengers.length) {
      return setError(`Only ${flight.availableSeats} seat(s) available.`);
    }

    // Navigate to payment page with booking details in state
    navigate('/payment', {
      state: {
        flightId,
        flight,
        passengers,
        totalAmount: flight.price * passengers.length,
      },
    });
  };

  if (loading) return <Layout><LoadingSpinner /></Layout>;
  if (error && !flight) return <Layout><Alert type="error" message={error} /></Layout>;

  const seats = buildSeatGrid(flight?.totalSeats || 30, bookedSeats);
  const rowCount = Math.ceil((flight?.totalSeats || 30) / COLS.length);

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-foreground mb-6">Book Your Flight</h1>

        {error && <Alert type="error" message={error} className="mb-4" />}

        {/* Flight summary */}
        {flight && (
          <Card className="mb-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-accent/10">
                  <Plane className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">{flight.airline} · {flight.flightNumber}</p>
                  <div className="flex items-center gap-2 text-sm text-muted">
                    <span>{flight.departureAirport}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                    <span>{flight.arrivalAirport}</span>
                    <span>·</span>
                    <span>{new Date(flight.departureTime).toLocaleDateString([], { dateStyle: 'medium' })}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-accent">${flight.price} <span className="text-sm font-normal text-muted">/ person</span></p>
                <p className="text-xs text-muted">{flight.availableSeats} seats remaining</p>
              </div>
            </div>
          </Card>
        )}

        <form onSubmit={handleSubmit}>
          {/* Passenger count */}
          <Card className="mb-6">
            <h2 className="text-sm font-semibold text-foreground mb-4">Number of Passengers</h2>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => changeCount(-1)}
                disabled={passengerCount <= 1}
                className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-foreground hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="text-2xl font-bold text-foreground w-8 text-center">{passengerCount}</span>
              <button
                type="button"
                onClick={() => changeCount(1)}
                disabled={passengerCount >= Math.min(6, flight?.availableSeats || 6)}
                className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-foreground hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
              </button>
              <span className="text-sm text-muted">passenger{passengerCount > 1 ? 's' : ''}</span>
              <span className="ml-auto text-accent font-bold text-lg">
                Total: ${(flight?.price || 0) * passengerCount}
              </span>
            </div>
          </Card>

          {/* Per-passenger forms */}
          {passengers.map((p, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: idx * 0.05 }}
            >
              <Card className="mb-6">
                <h2 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                  <User className="w-4 h-4 text-accent" />
                  Passenger {idx + 1}
                </h2>

                {/* Passenger details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                  <div>
                    <label className="block text-xs font-medium text-muted mb-1.5">Full Name *</label>
                    <input
                      type="text"
                      value={p.passengerName}
                      onChange={(e) => updatePassenger(idx, 'passengerName', e.target.value)}
                      placeholder="As on travel document"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted outline-none focus:border-accent transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted mb-1.5">Age (optional)</label>
                    <input
                      type="number"
                      min="1" max="120"
                      value={p.passengerAge}
                      onChange={(e) => updatePassenger(idx, 'passengerAge', e.target.value)}
                      placeholder="e.g. 28"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted outline-none focus:border-accent transition-colors"
                    />
                  </div>
                </div>

                {/* Seat map */}
                <div>
                  <p className="text-xs font-medium text-muted mb-3">
                    Select Seat {p.seatNumber && <span className="text-accent ml-1">— {p.seatNumber} selected</span>}
                  </p>
                  <div className="flex gap-3 text-xs text-muted mb-3">
                    <span className="flex items-center gap-1.5"><span className="w-4 h-4 rounded bg-accent/20 border border-accent inline-block" /> Available</span>
                    <span className="flex items-center gap-1.5"><span className="w-4 h-4 rounded bg-accent inline-block" /> Selected</span>
                    <span className="flex items-center gap-1.5"><span className="w-4 h-4 rounded bg-white/5 border border-white/10 opacity-40 inline-block" /> Unavailable</span>
                  </div>

                  {/* Column headers */}
                  <div className="mb-2">
                    <div className="grid gap-1" style={{ gridTemplateColumns: 'repeat(7, minmax(0, 1fr))' }}>
                      <div /> {/* row number spacer */}
                      {COLS.map((c) => (
                        <div key={c} className="text-center text-[10px] text-muted font-semibold">{c}</div>
                      ))}
                    </div>
                  </div>

                  {/* Seat rows */}
                  {Array.from({ length: rowCount }, (_, r) => {
                    const rowSeats = seats.filter((s) => s.row === r + 1);
                    return (
                      <div key={r} className="grid gap-1 mb-1" style={{ gridTemplateColumns: 'repeat(7, minmax(0, 1fr))' }}>
                        <div className="flex items-center justify-center text-[10px] text-muted">{r + 1}</div>
                        {rowSeats.map((seat) => {
                          const isBooked   = seat.booked;
                          const isSelected = p.seatNumber === seat.id;
                          const takenByOther = passengers.some((op, oi) => oi !== idx && op.seatNumber === seat.id);
                          const disabled   = isBooked || takenByOther;

                          return (
                            <button
                              key={seat.id}
                              type="button"
                              onClick={() => !disabled && selectSeat(idx, seat.id)}
                              disabled={disabled}
                              className={`h-8 rounded text-[11px] font-medium transition-all border ${
                                isSelected
                                  ? 'bg-accent text-surface border-accent shadow-glow-teal'
                                  : disabled
                                    ? 'bg-white/5 border-white/5 text-white/20 cursor-not-allowed'
                                    : 'bg-accent/10 border-accent/30 text-accent hover:bg-accent/20 cursor-pointer'
                              }`}
                            >
                              {seat.id}
                            </button>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </Card>
            </motion.div>
          ))}

          {/* Submit */}
          <Button type="submit" className="w-full" variant="primary">
            Proceed to Payment — ${(flight?.price || 0) * passengerCount}
          </Button>
        </form>
      </div>
    </Layout>
  );
}
