import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
        <div className="flex justify-center my-12">
          <LoadingSpinner size="lg" />
        </div>
      </Layout>
    );
  }

  if (error || !flight) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto">
          <Alert type="error">{error || 'Flight not found'}</Alert>
          <Button className="mt-4" onClick={() => navigate('/flights')}>Back to Flights</Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-primary mb-6">Book Flight {flight.flightNumber}</h1>
        
        {bookingError && <Alert type="error" className="mb-6">{bookingError}</Alert>}

        <Card className="p-6 mb-6 bg-blue-50 border border-blue-100">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-muted">From</p>
              <p className="font-semibold">{flight.departureAirport}</p>
            </div>
            <div className="text-xl">✈️</div>
            <div className="text-right">
              <p className="text-sm text-muted">To</p>
              <p className="font-semibold">{flight.arrivalAirport}</p>
            </div>
          </div>
          <div className="mt-4 flex justify-between items-end border-t border-blue-200 pt-4">
            <div>
              <p className="text-sm text-muted">Price</p>
              <p className="font-bold text-xl text-primary">${flight.price}</p>
            </div>
            <div>
              <p className="text-sm text-muted">Date</p>
              <p className="font-medium">{new Date(flight.departureTime).toLocaleDateString()}</p>
            </div>
          </div>
        </Card>

        <form onSubmit={handleBooking}>
          <Card className="p-8 mb-6">
            <h2 className="text-lg font-semibold text-primary mb-4">Passenger Details</h2>
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
            <h2 className="text-lg font-semibold text-primary mb-4">Seat Selection</h2>
            <p className="text-muted text-sm mb-4">Select your preferred seat. Selected: <strong>{selectedSeat || 'None'}</strong></p>
            
            <div className="bg-gray-100 p-6 rounded-xl flex justify-center">
              <div className="grid grid-cols-6 gap-3">
                {Array.from({ length: 30 }, (_, i) => {
                  const row = Math.floor(i / 6) + 1;
                  const col = String.fromCharCode(65 + (i % 6));
                  const seatId = `${row}${col}`;
                  
                  // Mock some unavailable seats for visual flair
                  const isUnavailable = (i % 7 === 0);
                  
                  return (
                    <div
                      key={seatId}
                      onClick={() => !isUnavailable && setSelectedSeat(seatId)}
                      className={`h-10 w-10 sm:h-12 sm:w-12 rounded-t-lg rounded-b-sm flex items-center justify-center text-xs font-medium border-b-4 
                        ${
                          isUnavailable
                            ? 'bg-gray-300 border-gray-400 text-gray-500 cursor-not-allowed'
                            : selectedSeat === seatId
                            ? 'bg-primary border-primary-dark text-white cursor-pointer shadow-inner transform translate-y-1'
                            : 'bg-white border-blue-200 text-primary hover:bg-blue-50 cursor-pointer shadow-sm'
                        } transition-all`}
                    >
                      {seatId}
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div className="mt-6 flex justify-center gap-6 text-sm">
              <div className="flex items-center gap-2"><div className="w-4 h-4 bg-white border border-blue-200 rounded-sm"></div> Available</div>
              <div className="flex items-center gap-2"><div className="w-4 h-4 bg-primary rounded-sm"></div> Selected</div>
              <div className="flex items-center gap-2"><div className="w-4 h-4 bg-gray-300 rounded-sm"></div> Unavailable</div>
            </div>
          </Card>

          <Button 
            type="submit" 
            variant="accent" 
            className="w-full py-4 text-xl shadow-lg hover:shadow-xl transition-shadow flex justify-center items-center gap-2"
            disabled={isSubmitting}
          >
            {isSubmitting ? <LoadingSpinner size="sm" /> : 'Confirm Booking'}
          </Button>
        </form>
      </div>
    </Layout>
  );
}
