import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../services/api';
import Layout from '../components/ui/Layout';
import Card from '../components/ui/Card';
import Alert from '../components/ui/Alert';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';

export default function UserDashboardPage() {
  const location = useLocation();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState(location.state?.message || '');

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/bookings/my');
      setBookings(data);
    } catch (err) {
      setError('Failed to fetch bookings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
    
    // Clear the success message from state after 5 seconds so it doesn't persist on refresh
    if (location.state?.message) {
      const timer = setTimeout(() => {
        setSuccessMessage('');
        window.history.replaceState({}, document.title);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [location.state]);

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    
    try {
      await api.put(`/bookings/${id}/cancel`);
      setSuccessMessage('Booking cancelled successfully.');
      fetchBookings(); // refresh list
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cancel booking.');
    }
  };

  if (loading && bookings.length === 0) {
    return (
      <Layout>
        <div className="flex justify-center my-12">
          <LoadingSpinner size="lg" />
        </div>
      </Layout>
    );
  }

  const upcomingBookings = bookings.filter(
    (b) => b.status === 'Confirmed' && new Date(b.flight.departureTime) > new Date()
  );
  const cancelledBookings = bookings.filter((b) => b.status === 'Cancelled');

  return (
    <Layout>
      <h1 className="text-2xl font-bold text-primary mb-6">My Dashboard</h1>
      
      {successMessage && <Alert type="success" className="mb-6">{successMessage}</Alert>}
      {error && <Alert type="error" className="mb-6">{error}</Alert>}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card className="p-6 text-center">
          <p className="text-sm text-muted">Total Bookings</p>
          <p className="text-3xl font-bold text-primary">{bookings.length}</p>
        </Card>
        <Card className="p-6 text-center">
          <p className="text-sm text-muted">Upcoming Flights</p>
          <p className="text-3xl font-bold text-accent">{upcomingBookings.length}</p>
        </Card>
        <Card className="p-6 text-center">
          <p className="text-sm text-muted">Cancelled</p>
          <p className="text-3xl font-bold text-danger">{cancelledBookings.length}</p>
        </Card>
      </div>

      {/* Recent Bookings */}
      <h2 className="text-xl font-semibold text-primary mb-4">Recent Bookings</h2>
      
      {bookings.length === 0 ? (
        <Card className="p-6">
          <p className="text-muted text-center py-8">Your bookings will appear here once you book a flight.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <Card key={booking._id} className="p-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-primary">{booking.bookingReference}</p>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        booking.status === 'Confirmed' ? 'bg-green-100 text-green-800' :
                        booking.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {booking.status}
                    </span>
                  </div>
                  <p className="text-sm text-muted mb-2">
                    Flight {booking.flight.flightNumber} • {booking.flight.airline}
                  </p>
                  <div className="text-sm font-medium">
                    {booking.flight.departureAirport} → {booking.flight.arrivalAirport}
                  </div>
                  <p className="text-xs text-muted mt-1">
                    Departure: {new Date(booking.flight.departureTime).toLocaleString()}
                  </p>
                </div>
                
                <div className="text-left md:text-right w-full md:w-auto bg-gray-50 p-3 rounded-md">
                  <p className="text-sm text-muted">Passenger: <span className="font-medium text-gray-800">{booking.passengerName}</span></p>
                  <p className="text-sm text-muted">Seat: <span className="font-medium text-gray-800">{booking.seatNumber}</span></p>
                  <p className="text-sm text-muted">Total: <span className="font-medium text-gray-800">${booking.totalPrice}</span></p>
                </div>
                
                {booking.status === 'Confirmed' && new Date(booking.flight.departureTime) > new Date() && (
                  <Button 
                    variant="danger" 
                    onClick={() => handleCancel(booking._id)}
                    className="w-full md:w-auto"
                  >
                    Cancel Booking
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </Layout>
  );
}
