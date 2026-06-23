import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plane } from 'lucide-react';
import api from '../services/api';
import Layout from '../components/ui/Layout';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Alert from '../components/ui/Alert';
import LoadingSpinner from '../components/ui/LoadingSpinner';

export default function BookingPage() {
  const { flightId } = useParams();
  const navigate = useNavigate();

  const [flight, setFlight] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [passengerName, setPassengerName] = useState('');
  const [passengerAge, setPassengerAge] = useState('');
  const [selectedSeat, setSelectedSeat] = useState('');
  const [bookingError, setBookingError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchFlight = async () => {
      try {
        const { data } = await api.get(`/flights/${flightId}`);
        setFlight(data);
      } catch (err) {
        setError('Failed to load flight details.');
      } finally {
        setLoading(false);
      }
    };
    fetchFlight();
  }, [flightId]);

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!passengerName || !selectedSeat) {
      setBookingError('Please provide passenger name and select a seat.');
      return;
    }

    setIsSubmitting(true);
    setBookingError('');

    try {
      await api.post('/bookings', {
        flightId,
        passengerName,
        passengerAge,
        seatNumber: selectedSeat,
      });
      navigate('/dashboard', { state: { message: 'Booking successful!' } });
    } catch (err) {
      setBookingError(err.response?.data?.message || 'Failed to complete booking.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <LoadingSpinner size="lg" />
      </Layout>
    );
  }

  if (error || !flight) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto">
          <Alert type="error">{error || 'Flight not found'}</Alert>
          <Button className="mt-4" onClick={() => navigate('/flights')}>
            Back to Flights
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-6">
          Book Flight <span className="text-accent">{flight.flightNumber}</span>
        </h1>

        {bookingError && <Alert type="error" className="mb-6">{bookingError}</Alert>}

        <Card className="p-6 mb-6 border-accent/20">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-muted">From</p>
              <p className="font-semibold">{flight.departureAirport}</p>
            </div>
            <Plane className="w-5 h-5 text-accent" />
            <div className="text-right">
              <p className="text-sm text-muted">To</p>
              <p className="font-semibold">{flight.arrivalAirport}</p>
            </div>
          </div>
          <div className="mt-4 flex justify-between items-end border-t border-white/10 pt-4">
            <div>
              <p className="text-sm text-muted">Price</p>
              <p className="font-bold text-xl text-accent">${flight.price}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted">Date</p>
              <p className="font-medium">{new Date(flight.departureTime).toLocaleDateString()}</p>
            </div>
          </div>
        </Card>

        <form onSubmit={handleBooking}>
          <Card className="p-8 mb-6">
            <h2 className="text-lg font-semibold mb-4">Passenger Details</h2>
            <Input
              label="Passenger Name"
              placeholder="Full name as on ID"
              value={passengerName}
              onChange={(e) => setPassengerName(e.target.value)}
              required
            />
            <Input
              label="Age"
              type="number"
              placeholder="Age (Optional)"
              value={passengerAge}
              onChange={(e) => setPassengerAge(e.target.value)}
            />
          </Card>

          <Card className="p-8 mb-6">
            <h2 className="text-lg font-semibold mb-4">Seat Selection</h2>
            <p className="text-muted text-sm mb-4">
              Select your preferred seat. Selected:{' '}
              <strong className="text-accent">{selectedSeat || 'None'}</strong>
            </p>

            <div className="glass rounded-xl p-6 flex justify-center">
              <div className="grid grid-cols-6 gap-3">
                {Array.from({ length: 30 }, (_, i) => {
                  const row = Math.floor(i / 6) + 1;
                  const col = String.fromCharCode(65 + (i % 6));
                  const seatId = `${row}${col}`;
                  const isUnavailable = i % 7 === 0;

                  return (
                    <button
                      type="button"
                      key={seatId}
                      onClick={() => !isUnavailable && setSelectedSeat(seatId)}
                      disabled={isUnavailable}
                      className={`h-10 w-10 sm:h-12 sm:w-12 rounded-t-lg rounded-b-sm flex items-center justify-center text-xs font-semibold border-b-4 transition-all
                        ${
                          isUnavailable
                            ? 'bg-white/5 border-white/10 text-muted/40 cursor-not-allowed'
                            : selectedSeat === seatId
                            ? 'bg-accent border-accent-dark text-surface cursor-pointer translate-y-1 shadow-glow-teal'
                            : 'bg-surface-3/70 border-primary/40 text-foreground hover:bg-surface-3 cursor-pointer'
                        }`}
                    >
                      {seatId}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-6 flex justify-center gap-6 text-sm text-muted">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-surface-3/70 border border-primary/40 rounded-sm" /> Available
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-accent rounded-sm" /> Selected
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-white/5 border border-white/10 rounded-sm" /> Unavailable
              </div>
            </div>
          </Card>

          <Button
            type="submit"
            variant="accent"
            className="w-full py-4 text-lg"
            disabled={isSubmitting}
          >
            {isSubmitting ? <LoadingSpinner size="sm" /> : 'Confirm Booking'}
          </Button>
        </form>
      </div>
    </Layout>
  );
}
