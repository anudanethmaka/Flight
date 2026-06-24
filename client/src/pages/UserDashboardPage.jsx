import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { X, Plane, ArrowRight, Calendar, CreditCard, User, Tag } from 'lucide-react';
import api from '../services/api';
import Layout from '../components/ui/Layout';
import Card from '../components/ui/Card';
import Alert from '../components/ui/Alert';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';

// ─── Booking Details Modal ────────────────────────────────────────────────────
function BookingDetailsModal({ booking, onClose, onCancel }) {
  if (!booking) return null;

  const isCancellable = booking.status === 'Confirmed';
  const statusColors = {
    Confirmed: 'bg-success/15 text-success border-success/30',
    Cancelled: 'bg-danger/15 text-danger border-danger/30',
    Pending:   'bg-warning/15 text-warning border-warning/30',
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="relative bg-surface-2 border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Gradient top bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-primary-light to-accent" />

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-white/10">
          <div>
            <h2 className="text-lg font-bold text-foreground">Booking Details</h2>
            <p className="text-xs text-muted mt-0.5">Reference: <span className="font-mono text-accent">{booking.bookingReference}</span></p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors cursor-pointer text-muted hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          {/* Status badge */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted">Status</span>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusColors[booking.status] || 'bg-white/10 text-muted border-white/10'}`}>
              {booking.status}
            </span>
          </div>

          {/* Flight info */}
          <div className="bg-white/5 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Plane className="w-4 h-4 text-accent" />
              {booking.flight.airline} · <span className="font-mono">{booking.flight.flightNumber}</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-muted">
              <span className="font-medium text-foreground">{booking.flight.departureAirport}</span>
              <ArrowRight className="w-4 h-4 text-accent flex-shrink-0" />
              <span className="font-medium text-foreground">{booking.flight.arrivalAirport}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted">
              <Calendar className="w-3.5 h-3.5" />
              Departure: {new Date(booking.flight.departureTime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
            </div>
            {booking.flight.arrivalTime && (
              <div className="flex items-center gap-2 text-xs text-muted">
                <Calendar className="w-3.5 h-3.5" />
                Arrival: {new Date(booking.flight.arrivalTime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
              </div>
            )}
          </div>

          {/* Passenger info */}
          <div className="bg-white/5 rounded-xl p-4 space-y-2">
            <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">Passenger</p>
            <div className="flex items-center gap-2 text-sm text-foreground">
              <User className="w-3.5 h-3.5 text-accent" />
              <span className="font-medium">{booking.passengerName}</span>
              {booking.passengerAge && <span className="text-muted text-xs">({booking.passengerAge} yrs)</span>}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted">
              <Tag className="w-3.5 h-3.5" />
              Seat: <span className="font-mono font-semibold text-accent ml-1">{booking.seatNumber}</span>
            </div>
          </div>

          {/* Price */}
          <div className="flex items-center justify-between bg-accent/10 border border-accent/20 rounded-xl p-4">
            <div className="flex items-center gap-2 text-sm text-muted">
              <CreditCard className="w-4 h-4 text-accent" />
              Total Paid
            </div>
            <span className="text-xl font-bold text-accent">${booking.totalPrice}</span>
          </div>

          {/* Booked on */}
          <p className="text-xs text-muted text-center">
            Booked on {new Date(booking.createdAt).toLocaleDateString([], { dateStyle: 'long' })}
          </p>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex gap-3">
          <Button variant="ghost" onClick={onClose} className="flex-1">
            Close
          </Button>
          {isCancellable && (
            <Button
              variant="danger"
              onClick={() => { onCancel(booking._id); onClose(); }}
              className="flex-1"
            >
              Cancel Booking
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Dashboard Page ──────────────────────────────────────────────────────
export default function UserDashboardPage() {
  const location = useLocation();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState(location.state?.message || '');
  const [selectedBooking, setSelectedBooking] = useState(null);

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
      }, 5001);
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

  const statusColors = {
    Confirmed: 'bg-success/15 text-success border-success/30',
    Cancelled: 'bg-danger/15 text-danger border-danger/30',
    Pending:   'bg-warning/15 text-warning border-warning/30',
  };

  return (
    <Layout>
      <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-6">My Dashboard</h1>

      {successMessage && <Alert type="success" className="mb-6">{successMessage}</Alert>}
      {error && <Alert type="error" className="mb-6">{error}</Alert>}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card className="p-6 text-center">
          <p className="text-sm text-muted">Total Bookings</p>
          <p className="text-3xl font-extrabold text-primary-light">{bookings.length}</p>
        </Card>
        <Card className="p-6 text-center">
          <p className="text-sm text-muted">Upcoming Flights</p>
          <p className="text-3xl font-extrabold text-accent">{upcomingBookings.length}</p>
        </Card>
        <Card className="p-6 text-center">
          <p className="text-sm text-muted">Cancelled</p>
          <p className="text-3xl font-extrabold text-danger">{cancelledBookings.length}</p>
        </Card>
      </div>

      {/* Recent Bookings */}
      <h2 className="text-xl font-bold mb-4">Recent Bookings</h2>

      {bookings.length === 0 ? (
        <Card className="p-6">
          <p className="text-muted text-center py-8">Your bookings will appear here once you book a flight.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <Card key={booking._id} className="p-6 hover:border-accent/30 transition-colors cursor-pointer group" onClick={() => setSelectedBooking(booking)}>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-bold text-accent">{booking.bookingReference}</p>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${statusColors[booking.status] || 'bg-white/10 text-muted border-white/10'}`}
                    >
                      {booking.status}
                    </span>
                  </div>
                  <p className="text-sm text-muted mb-2">
                    Flight {booking.flight.flightNumber} • {booking.flight.airline}
                  </p>
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <span>{booking.flight.departureAirport}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-accent" />
                    <span>{booking.flight.arrivalAirport}</span>
                  </div>
                  <p className="text-xs text-muted mt-1">
                    Departure: {new Date(booking.flight.departureTime).toLocaleString()}
                  </p>
                </div>

                <div className="text-left md:text-right w-full md:w-auto glass rounded-lg p-3">
                  <p className="text-sm text-muted">Passenger: <span className="font-medium text-foreground">{booking.passengerName}</span></p>
                  <p className="text-sm text-muted">Seat: <span className="font-mono font-semibold text-accent">{booking.seatNumber}</span></p>
                  <p className="text-sm text-muted">Total: <span className="font-medium text-foreground">${booking.totalPrice}</span></p>
                </div>

                <div className="flex flex-col gap-2 w-full md:w-auto" onClick={(e) => e.stopPropagation()}>
                  <Button
                    variant="ghost"
                    onClick={() => setSelectedBooking(booking)}
                    className="w-full md:w-auto text-xs"
                  >
                    View Details
                  </Button>
                  {booking.status === 'Confirmed' && (
                    <Button
                      variant="danger"
                      onClick={() => handleCancel(booking._id)}
                      className="w-full md:w-auto text-xs"
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Booking Details Modal */}
      {selectedBooking && (
        <BookingDetailsModal
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
          onCancel={handleCancel}
        />
      )}
    </Layout>
  );
}
