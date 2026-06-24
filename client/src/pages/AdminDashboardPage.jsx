import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Plane,
  Ticket,
  Users,
  Settings,
  LogOut,
  RefreshCw,
  Search,
  Plus,
  Pencil,
  Trash2,
  X,
  DollarSign,
  TrendingUp,
  ArrowRight,
} from 'lucide-react';
import Card from '../components/ui/Card';
import Alert from '../components/ui/Alert';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function AdminDashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  // Data States
  const [stats, setStats] = useState({ totalUsers: 0, totalFlights: 0, totalBookings: 0, revenue: 0 });
  const [flights, setFlights] = useState([]);
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);

  // UX States
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Modals / Forms States
  const [flightModalOpen, setFlightModalOpen] = useState(false);
  const [currentFlight, setCurrentFlight] = useState(null);
  const [flightFormError, setFlightFormError] = useState('');
  const [flightForm, setFlightForm] = useState({
    flightNumber: '',
    airline: '',
    departureAirport: '',
    arrivalAirport: '',
    departureTime: '',
    arrivalTime: '',
    totalSeats: '',
    price: '',
    status: 'Scheduled',
  });

  // Search / Filter States
  const [flightSearch, setFlightSearch] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [bookingSearch, setBookingSearch] = useState('');

  const fetchStats = useCallback(async () => {
    try {
      const { data } = await api.get('/admin/stats');
      setStats(data);
    } catch (err) {
      console.error('Error fetching stats:', err);
      setError('Failed to fetch dashboard statistics.');
    }
  }, []);

  const fetchFlights = useCallback(async () => {
    try {
      const { data } = await api.get('/flights');
      // GET /flights returns a paginated object: { flights, total, page, pages }
      setFlights(Array.isArray(data) ? data : data.flights || []);
    } catch (err) {
      console.error('Error fetching flights:', err);
      setError('Failed to fetch flights list.');
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      const { data } = await api.get('/admin/users');
      setUsers(data);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to fetch users list.');
    }
  }, []);

  const fetchBookings = useCallback(async () => {
    try {
      const { data } = await api.get('/bookings');
      // GET /bookings returns a paginated object: { bookings, total, page, pages }
      setBookings(Array.isArray(data) ? data : data.bookings || []);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError('Failed to fetch bookings list.');
    }
  }, []);

  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      await Promise.all([fetchStats(), fetchFlights(), fetchUsers(), fetchBookings()]);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }, [fetchStats, fetchFlights, fetchUsers, fetchBookings]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleToggleUserStatus = async (userId, currentStatus) => {
    try {
      const { data } = await api.put(`/admin/users/${userId}/status`, { isActive: !currentStatus });
      setUsers(users.map((u) => (u._id === userId ? { ...u, isActive: data.user.isActive } : u)));
      showSuccess(`Successfully ${data.user.isActive ? 'activated' : 'deactivated'} user account.`);
      fetchStats();
    } catch (err) {
      console.error('Error toggling user status:', err);
      setError(err.response?.data?.message || 'Failed to update user status.');
    }
  };

  const openAddFlightModal = () => {
    setCurrentFlight(null);
    setFlightFormError('');
    setFlightForm({
      flightNumber: '',
      airline: '',
      departureAirport: '',
      arrivalAirport: '',
      departureTime: '',
      arrivalTime: '',
      totalSeats: '',
      price: '',
      status: 'Scheduled',
    });
    setFlightModalOpen(true);
  };

  const openEditFlightModal = (flight) => {
    setCurrentFlight(flight);
    setFlightFormError('');
    const formatDateTime = (dateStr) => {
      const d = new Date(dateStr);
      const pad = (num) => String(num).padStart(2, '0');
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    };

    setFlightForm({
      flightNumber: flight.flightNumber,
      airline: flight.airline,
      departureAirport: flight.departureAirport,
      arrivalAirport: flight.arrivalAirport,
      departureTime: formatDateTime(flight.departureTime),
      arrivalTime: formatDateTime(flight.arrivalTime),
      totalSeats: flight.totalSeats,
      price: flight.price,
      status: flight.status,
    });
    setFlightModalOpen(true);
  };

  const closeFlightModal = () => {
    setFlightModalOpen(false);
    setFlightFormError('');
  };

  const handleFlightSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFlightFormError('');

    if (new Date(flightForm.arrivalTime) <= new Date(flightForm.departureTime)) {
      setFlightFormError('Arrival time must be after departure time.');
      return;
    }

    try {
      if (currentFlight) {
        const { data } = await api.put(`/flights/${currentFlight._id}`, flightForm);
        setFlights(flights.map((f) => (f._id === currentFlight._id ? data : f)));
        showSuccess(`Flight ${flightForm.flightNumber} successfully updated.`);
      } else {
        const { data } = await api.post('/flights', flightForm);
        setFlights([data, ...flights]);
        showSuccess(`Flight ${flightForm.flightNumber} successfully created.`);
      }
      closeFlightModal();
      fetchStats();
    } catch (err) {
      console.error('Error submitting flight form:', err);
      setFlightFormError(err.response?.data?.message || 'Failed to save flight details. Make sure the flight number is unique.');
    }
  };

  const handleFlightDelete = async (flightId, flightNum) => {
    if (!window.confirm(`Are you sure you want to delete flight ${flightNum}?`)) return;
    setError('');
    try {
      await api.delete(`/flights/${flightId}`);
      setFlights(flights.filter((f) => f._id !== flightId));
      showSuccess(`Flight ${flightNum} deleted.`);
      fetchStats();
    } catch (err) {
      console.error('Error deleting flight:', err);
      setError(err.response?.data?.message || 'Failed to delete flight.');
    }
  };

  const handleCancelBooking = async (bookingId, reference) => {
    if (!window.confirm(`Are you sure you want to cancel booking ${reference}?`)) return;
    setError('');
    try {
      const { data } = await api.put(`/bookings/${bookingId}/cancel`);
      setBookings(bookings.map((b) => (b._id === bookingId ? { ...b, status: data.status } : b)));
      showSuccess(`Booking ${reference} has been cancelled.`);
      fetchStats();
      fetchFlights();
    } catch (err) {
      console.error('Error cancelling booking:', err);
      setError(err.response?.data?.message || 'Failed to cancel booking.');
    }
  };

  const filteredFlights = flights.filter(
    (f) =>
      f.flightNumber.toLowerCase().includes(flightSearch.toLowerCase()) ||
      f.airline.toLowerCase().includes(flightSearch.toLowerCase()) ||
      f.departureAirport.toLowerCase().includes(flightSearch.toLowerCase()) ||
      f.arrivalAirport.toLowerCase().includes(flightSearch.toLowerCase())
  );

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
      (u.phone && u.phone.includes(userSearch))
  );

  const filteredBookings = bookings.filter(
    (b) =>
      b.bookingReference.toLowerCase().includes(bookingSearch.toLowerCase()) ||
      b.passengerName.toLowerCase().includes(bookingSearch.toLowerCase()) ||
      (b.flight && b.flight.flightNumber.toLowerCase().includes(bookingSearch.toLowerCase()))
  );

  const getStatusBadge = (status) => {
    const classes = {
      Scheduled: 'bg-primary/15 text-primary-light border-primary/30',
      Boarding: 'bg-accent/15 text-accent border-accent/30',
      Delayed: 'bg-warning/15 text-warning border-warning/30',
      Cancelled: 'bg-danger/15 text-danger border-danger/30',
      Completed: 'bg-success/15 text-success border-success/30',
      Confirmed: 'bg-success/15 text-success border-success/30',
      Pending: 'bg-warning/15 text-warning border-warning/30',
    };
    return (
      <span
        className={`px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide border ${
          classes[status] || 'bg-white/10 text-muted border-white/10'
        }`}
      >
        {status}
      </span>
    );
  };

  const navItems = [
    { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'flights', label: 'Flights', icon: Plane },
    { id: 'bookings', label: 'Bookings', icon: Ticket },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const tableSearch = (value, onChange, placeholder) => (
    <div className="relative max-w-md w-full">
      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
      <input
        type="text"
        placeholder={placeholder}
        className="w-full bg-surface-2/60 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-foreground placeholder:text-muted/60 focus:outline-none focus:border-accent/50 focus:ring-2 focus:ring-accent/30 transition-all"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );

  const statCards = [
    {
      label: 'Total Revenue',
      val: `$${stats.revenue.toLocaleString()}`,
      icon: DollarSign,
      tint: 'from-success/25 to-success/5 text-success',
    },
    {
      label: 'Total Bookings',
      val: stats.totalBookings,
      icon: Ticket,
      tint: 'from-accent/25 to-accent/5 text-accent',
    },
    {
      label: 'Active Flights',
      val: stats.totalFlights,
      icon: Plane,
      tint: 'from-primary/25 to-primary/5 text-primary-light',
    },
    {
      label: 'Total Users',
      val: stats.totalUsers,
      icon: Users,
      tint: 'from-warning/25 to-warning/5 text-warning',
    },
  ];

  return (
    <div className="min-h-screen text-foreground flex">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 shrink-0 glass-strong border-r border-white/10 p-5 sticky top-0 h-screen">
        <div className="flex items-center gap-2 font-bold text-lg tracking-tight mb-8 px-1">
          <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent shadow-glow-teal">
            <Plane className="w-5 h-5 text-white" strokeWidth={2.2} />
          </span>
          <span>
            Sky<span className="text-accent">Link</span>
          </span>
        </div>

        <nav className="flex-1 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                  active
                    ? 'bg-accent/15 text-accent border border-accent/30'
                    : 'text-muted hover:text-foreground hover:bg-white/5 border border-transparent'
                }`}
              >
                <Icon className="w-4.5 h-4.5" />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="mt-auto pt-4 border-t border-white/10">
          <div className="flex items-center gap-3 px-2 mb-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-sm font-bold text-white">
              {user?.name?.charAt(0)?.toUpperCase() || 'A'}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate">{user?.name || 'Admin'}</p>
              <p className="text-xs text-muted truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-muted hover:text-danger hover:bg-danger/10 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 min-w-0">
        {/* Mobile tab bar */}
        <div className="md:hidden glass-strong border-b border-white/10 flex overflow-x-auto px-2 sticky top-0 z-30">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center gap-1 px-4 py-3 text-xs font-medium whitespace-nowrap cursor-pointer ${
                  active ? 'text-accent' : 'text-muted'
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </button>
            );
          })}
        </div>

        <div className="max-w-6xl mx-auto px-4 md:px-8 py-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                {navItems.find((n) => n.id === activeTab)?.label || 'Dashboard'}
              </h1>
              <p className="text-sm text-muted mt-1">
                Manage flights, passengers and reservations across SkyLink.
              </p>
            </div>
            <button
              onClick={loadDashboardData}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg glass border border-white/10 text-foreground hover:bg-white/5 transition-colors text-sm font-semibold cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
            </button>
          </div>

          {successMsg && <Alert type="success" className="mb-6">{successMsg}</Alert>}
          {error && <Alert type="error" className="mb-6">{error}</Alert>}

          {loading ? (
            <LoadingSpinner size="lg" />
          ) : (
            <>
              {/* OVERVIEW */}
              {activeTab === 'overview' && (
                <div className="space-y-8 animate-fadeIn">
                  {/* Stats row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {statCards.map((s) => {
                      const Icon = s.icon;
                      return (
                        <Card key={s.label} className="p-5 hover:border-accent/30 transition-colors">
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <p className="text-xs font-medium text-muted uppercase tracking-wider">
                                {s.label}
                              </p>
                              <p className="text-2xl md:text-3xl font-extrabold text-foreground">
                                {s.val}
                              </p>
                            </div>
                            <div
                              className={`w-11 h-11 rounded-xl flex items-center justify-center bg-gradient-to-br border border-white/10 ${s.tint}`}
                            >
                              <Icon className="w-5 h-5" />
                            </div>
                          </div>
                        </Card>
                      );
                    })}
                  </div>

                  {/* Logistics + quick actions */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Card className="lg:col-span-2 p-6 space-y-5">
                      <h3 className="text-lg font-bold flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-accent" /> System Health & Logistics
                      </h3>
                      {[
                        {
                          label: 'Flight Occupancy Average',
                          color: 'bg-accent',
                          text: 'text-accent',
                          pct:
                            stats.totalFlights > 0 && flights.reduce((sum, f) => sum + f.totalSeats, 0) > 0
                              ? Math.round(
                                  (flights.reduce((sum, f) => sum + (f.totalSeats - f.availableSeats), 0) /
                                    flights.reduce((sum, f) => sum + f.totalSeats, 0)) *
                                    100
                                )
                              : 0,
                        },
                        {
                          label: 'Deactivated Accounts Ratio',
                          color: 'bg-danger',
                          text: 'text-danger',
                          pct: users.length > 0 ? Math.round((users.filter((u) => !u.isActive).length / users.length) * 100) : 0,
                        },
                        {
                          label: 'Delayed & Cancelled Flights',
                          color: 'bg-warning',
                          text: 'text-warning',
                          pct:
                            flights.length > 0
                              ? Math.round(
                                  (flights.filter((f) => f.status === 'Delayed' || f.status === 'Cancelled').length /
                                    flights.length) *
                                    100
                                )
                              : 0,
                        },
                      ].map((row) => (
                        <div key={row.label}>
                          <div className="flex justify-between text-sm mb-1.5">
                            <span className="text-muted font-medium">{row.label}</span>
                            <span className={`font-bold ${row.text}`}>{row.pct}%</span>
                          </div>
                          <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
                            <div
                              className={`${row.color} h-2 rounded-full transition-all duration-500`}
                              style={{ width: `${row.pct}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </Card>

                    <Card className="p-6 flex flex-col">
                      <h3 className="text-lg font-bold">Quick Actions</h3>
                      <p className="text-xs text-muted mt-1">Common administrative operations.</p>
                      <div className="space-y-3 mt-4">
                        <button
                          onClick={() => {
                            setActiveTab('flights');
                            openAddFlightModal();
                          }}
                          className="w-full flex items-center justify-between py-2.5 px-3 rounded-lg border border-white/10 hover:bg-white/5 text-sm font-semibold transition-colors cursor-pointer"
                        >
                          <span className="flex items-center gap-2">
                            <Plus className="w-4 h-4 text-accent" /> New Flight Schedule
                          </span>
                          <ArrowRight className="w-4 h-4 text-muted" />
                        </button>
                        <button
                          onClick={() => setActiveTab('users')}
                          className="w-full flex items-center justify-between py-2.5 px-3 rounded-lg border border-white/10 hover:bg-white/5 text-sm font-semibold transition-colors cursor-pointer"
                        >
                          <span className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-primary-light" /> Review Inactive Users
                          </span>
                          <span className="bg-danger/15 text-danger text-xs px-2 py-0.5 rounded-full font-bold border border-danger/30">
                            {users.filter((u) => !u.isActive).length}
                          </span>
                        </button>
                        <button
                          onClick={() => setActiveTab('bookings')}
                          className="w-full flex items-center justify-between py-2.5 px-3 rounded-lg border border-white/10 hover:bg-white/5 text-sm font-semibold transition-colors cursor-pointer"
                        >
                          <span className="flex items-center gap-2">
                            <Ticket className="w-4 h-4 text-accent" /> View Ticket Ledger
                          </span>
                          <ArrowRight className="w-4 h-4 text-muted" />
                        </button>
                      </div>
                    </Card>
                  </div>

                  {/* Recent bookings */}
                  <div>
                    <h3 className="text-lg font-bold mb-4">Recent Bookings</h3>
                    <Card className="p-0 overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                          <thead>
                            <tr className="text-muted uppercase text-xs font-bold border-b border-white/10">
                              <th className="py-4 px-6">Booking ID</th>
                              <th className="py-4 px-6">Passenger</th>
                              <th className="py-4 px-6">Flight</th>
                              <th className="py-4 px-6">Date</th>
                              <th className="py-4 px-6">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                            {bookings.length === 0 ? (
                              <tr>
                                <td colSpan="5" className="py-12 text-center text-muted font-medium">
                                  No bookings yet.
                                </td>
                              </tr>
                            ) : (
                              bookings.slice(0, 6).map((booking) => (
                                <tr key={booking._id} className="hover:bg-white/[0.03] transition-colors">
                                  <td className="py-4 px-6 font-bold text-accent tracking-wide">
                                    {booking.bookingReference}
                                  </td>
                                  <td className="py-4 px-6 font-medium">{booking.passengerName}</td>
                                  <td className="py-4 px-6 text-muted">
                                    {booking.flight ? booking.flight.flightNumber : 'N/A'}
                                  </td>
                                  <td className="py-4 px-6 text-muted text-xs">
                                    {new Date(booking.createdAt).toLocaleDateString()}
                                  </td>
                                  <td className="py-4 px-6">{getStatusBadge(booking.status)}</td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </Card>
                  </div>
                </div>
              )}

              {/* FLIGHTS */}
              {activeTab === 'flights' && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
                    {tableSearch(flightSearch, setFlightSearch, 'Search by flight, airline, airports...')}
                    <Button onClick={openAddFlightModal}>
                      <Plus className="w-4 h-4" /> Add Flight Schedule
                    </Button>
                  </div>

                  <Card className="p-0 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead>
                          <tr className="text-muted uppercase text-xs font-bold border-b border-white/10">
                            <th className="py-4 px-6">Flight No</th>
                            <th className="py-4 px-6">Airline</th>
                            <th className="py-4 px-6">Route</th>
                            <th className="py-4 px-6">Departure</th>
                            <th className="py-4 px-6 text-center">Seats</th>
                            <th className="py-4 px-6 text-right">Price</th>
                            <th className="py-4 px-6">Status</th>
                            <th className="py-4 px-6 text-center">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {filteredFlights.length === 0 ? (
                            <tr>
                              <td colSpan="8" className="py-12 text-center text-muted font-medium">
                                No flights match your search query.
                              </td>
                            </tr>
                          ) : (
                            filteredFlights.map((flight) => (
                              <tr key={flight._id} className="hover:bg-white/[0.03] transition-colors">
                                <td className="py-4 px-6 font-bold text-accent">{flight.flightNumber}</td>
                                <td className="py-4 px-6 font-medium">{flight.airline}</td>
                                <td className="py-4 px-6">
                                  <div className="flex items-center gap-1.5 font-medium">
                                    <span>{flight.departureAirport.replace(/\s*\(.*\)/, '')}</span>
                                    <ArrowRight className="w-3.5 h-3.5 text-muted" />
                                    <span>{flight.arrivalAirport.replace(/\s*\(.*\)/, '')}</span>
                                  </div>
                                </td>
                                <td className="py-4 px-6 text-muted text-xs">
                                  {new Date(flight.departureTime).toLocaleString(undefined, {
                                    dateStyle: 'short',
                                    timeStyle: 'short',
                                  })}
                                </td>
                                <td className="py-4 px-6 text-center">
                                  <span className={`font-bold ${flight.availableSeats === 0 ? 'text-danger' : 'text-foreground'}`}>
                                    {flight.availableSeats}
                                  </span>
                                  <span className="text-muted"> / {flight.totalSeats}</span>
                                </td>
                                <td className="py-4 px-6 text-right font-bold">${flight.price}</td>
                                <td className="py-4 px-6">{getStatusBadge(flight.status)}</td>
                                <td className="py-4 px-6">
                                  <div className="flex justify-center items-center gap-1">
                                    <button
                                      onClick={() => openEditFlightModal(flight)}
                                      className="p-2 text-primary-light hover:bg-primary/10 rounded-lg transition-colors cursor-pointer"
                                      title="Edit"
                                    >
                                      <Pencil className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() => handleFlightDelete(flight._id, flight.flightNumber)}
                                      className="p-2 text-danger hover:bg-danger/10 rounded-lg transition-colors cursor-pointer"
                                      title="Delete"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </Card>
                </div>
              )}

              {/* USERS */}
              {activeTab === 'users' && (
                <div className="space-y-6 animate-fadeIn">
                  {tableSearch(userSearch, setUserSearch, 'Search users by name, email, phone...')}
                  <Card className="p-0 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead>
                          <tr className="text-muted uppercase text-xs font-bold border-b border-white/10">
                            <th className="py-4 px-6">Passenger Name</th>
                            <th className="py-4 px-6">Email</th>
                            <th className="py-4 px-6">Phone</th>
                            <th className="py-4 px-6">Role</th>
                            <th className="py-4 px-6">Joined</th>
                            <th className="py-4 px-6 text-center">Status</th>
                            <th className="py-4 px-6 text-center">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {filteredUsers.length === 0 ? (
                            <tr>
                              <td colSpan="7" className="py-12 text-center text-muted font-medium">
                                No passengers registered.
                              </td>
                            </tr>
                          ) : (
                            filteredUsers.map((u) => (
                              <tr key={u._id} className="hover:bg-white/[0.03] transition-colors">
                                <td className="py-4 px-6 font-bold">{u.name}</td>
                                <td className="py-4 px-6 text-muted">{u.email}</td>
                                <td className="py-4 px-6 text-muted">{u.phone || 'N/A'}</td>
                                <td className="py-4 px-6">
                                  <span
                                    className={`px-2 py-0.5 rounded text-xs font-semibold uppercase border ${
                                      u.role === 'admin'
                                        ? 'bg-primary/15 text-primary-light border-primary/30'
                                        : 'bg-white/10 text-muted border-white/10'
                                    }`}
                                  >
                                    {u.role}
                                  </span>
                                </td>
                                <td className="py-4 px-6 text-muted text-xs">
                                  {new Date(u.createdAt).toLocaleDateString()}
                                </td>
                                <td className="py-4 px-6 text-center">
                                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold">
                                    <span
                                      className={`w-2 h-2 rounded-full ${
                                        u.isActive ? 'bg-success animate-pulse' : 'bg-danger'
                                      }`}
                                    />
                                    <span className={u.isActive ? 'text-success' : 'text-danger'}>
                                      {u.isActive ? 'Active' : 'Suspended'}
                                    </span>
                                  </span>
                                </td>
                                <td className="py-4 px-6 text-center">
                                  <button
                                    onClick={() => handleToggleUserStatus(u._id, u.isActive)}
                                    className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-all border ${
                                      u.isActive
                                        ? 'bg-danger/10 text-danger border-danger/30 hover:bg-danger/20'
                                        : 'bg-success/10 text-success border-success/30 hover:bg-success/20'
                                    }`}
                                  >
                                    {u.isActive ? 'Suspend' : 'Activate'}
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </Card>
                </div>
              )}

              {/* BOOKINGS */}
              {activeTab === 'bookings' && (
                <div className="space-y-6 animate-fadeIn">
                  {tableSearch(bookingSearch, setBookingSearch, 'Search by ref, passenger or flight...')}
                  <Card className="p-0 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead>
                          <tr className="text-muted uppercase text-xs font-bold border-b border-white/10">
                            <th className="py-4 px-6">Booking ID</th>
                            <th className="py-4 px-6">Passenger</th>
                            <th className="py-4 px-6">Flight</th>
                            <th className="py-4 px-6">Route</th>
                            <th className="py-4 px-6 text-center">Seat</th>
                            <th className="py-4 px-6 text-right">Price</th>
                            <th className="py-4 px-6">Date</th>
                            <th className="py-4 px-6">Status</th>
                            <th className="py-4 px-6 text-center">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {filteredBookings.length === 0 ? (
                            <tr>
                              <td colSpan="9" className="py-12 text-center text-muted font-medium">
                                No reservations found.
                              </td>
                            </tr>
                          ) : (
                            filteredBookings.map((booking) => (
                              <tr key={booking._id} className="hover:bg-white/[0.03] transition-colors">
                                <td className="py-4 px-6 font-bold text-accent tracking-wide">
                                  {booking.bookingReference}
                                </td>
                                <td className="py-4 px-6">
                                  <div className="font-semibold">{booking.passengerName}</div>
                                  {booking.passengerAge && (
                                    <div className="text-muted text-xs">Age: {booking.passengerAge}</div>
                                  )}
                                </td>
                                <td className="py-4 px-6 font-bold text-primary-light">
                                  {booking.flight ? booking.flight.flightNumber : 'N/A'}
                                </td>
                                <td className="py-4 px-6">
                                  {booking.flight ? (
                                    <div className="text-xs font-medium text-muted">
                                      {booking.flight.departureAirport.replace(/\s*\(.*\)/, '')} →{' '}
                                      {booking.flight.arrivalAirport.replace(/\s*\(.*\)/, '')}
                                    </div>
                                  ) : (
                                    <span className="text-danger text-xs font-semibold">Flight Deleted</span>
                                  )}
                                </td>
                                <td className="py-4 px-6 text-center font-bold text-accent">{booking.seatNumber}</td>
                                <td className="py-4 px-6 text-right font-bold">${booking.totalPrice}</td>
                                <td className="py-4 px-6 text-muted text-xs">
                                  {new Date(booking.createdAt).toLocaleDateString()}
                                </td>
                                <td className="py-4 px-6">{getStatusBadge(booking.status)}</td>
                                <td className="py-4 px-6 text-center">
                                  {booking.status === 'Confirmed' ? (
                                    <button
                                      onClick={() => handleCancelBooking(booking._id, booking.bookingReference)}
                                      className="text-xs bg-danger/10 text-danger border border-danger/30 rounded-lg px-2.5 py-1 font-semibold hover:bg-danger/20 transition-colors cursor-pointer"
                                    >
                                      Cancel
                                    </button>
                                  ) : (
                                    <span className="text-muted text-xs font-medium">—</span>
                                  )}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </Card>
                </div>
              )}

              {/* SETTINGS */}
              {activeTab === 'settings' && (
                <div className="animate-fadeIn max-w-2xl">
                  <Card className="p-8 space-y-6">
                    <div>
                      <h3 className="text-lg font-bold">Administrator Profile</h3>
                      <p className="text-sm text-muted mt-1">Your account details for this control center.</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-2xl font-bold text-white">
                        {user?.name?.charAt(0)?.toUpperCase() || 'A'}
                      </div>
                      <div>
                        <p className="font-semibold text-lg">{user?.name || 'Admin'}</p>
                        <p className="text-sm text-muted">{user?.email}</p>
                        <span className="inline-block mt-1 px-2 py-0.5 rounded text-xs font-semibold uppercase bg-primary/15 text-primary-light border border-primary/30">
                          {user?.role || 'admin'}
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-white/10">
                      <div className="glass rounded-xl p-4">
                        <p className="text-xs text-muted uppercase tracking-wider">Managed Flights</p>
                        <p className="text-2xl font-extrabold mt-1">{stats.totalFlights}</p>
                      </div>
                      <div className="glass rounded-xl p-4">
                        <p className="text-xs text-muted uppercase tracking-wider">Registered Users</p>
                        <p className="text-2xl font-extrabold mt-1">{stats.totalUsers}</p>
                      </div>
                    </div>
                    <Button variant="secondary" onClick={() => navigate('/profile')}>
                      Edit profile & password
                    </Button>
                  </Card>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* FLIGHT MODAL */}
      {flightModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="glass-strong rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden border border-white/10 animate-scaleUp">
            <div className="bg-gradient-to-r from-primary/30 to-accent/20 border-b border-white/10 p-6 flex justify-between items-center">
              <h3 className="text-xl font-bold">
                {currentFlight ? `Edit Flight ${currentFlight.flightNumber}` : 'Add New Flight Schedule'}
              </h3>
              <button
                onClick={closeFlightModal}
                className="text-muted hover:text-foreground transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleFlightSubmit} className="p-6 space-y-4">
              {flightFormError && <Alert type="error">{flightFormError}</Alert>}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Flight Number"
                  placeholder="e.g. SKY-123"
                  value={flightForm.flightNumber}
                  onChange={(e) => setFlightForm({ ...flightForm, flightNumber: e.target.value.toUpperCase() })}
                  required
                />
                <Input
                  label="Airline"
                  placeholder="e.g. SkyLink Airways"
                  value={flightForm.airline}
                  onChange={(e) => setFlightForm({ ...flightForm, airline: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Departure Airport"
                  placeholder="e.g. Colombo (CMB)"
                  value={flightForm.departureAirport}
                  onChange={(e) => setFlightForm({ ...flightForm, departureAirport: e.target.value })}
                  required
                />
                <Input
                  label="Arrival Airport"
                  placeholder="e.g. London Heathrow (LHR)"
                  value={flightForm.arrivalAirport}
                  onChange={(e) => setFlightForm({ ...flightForm, arrivalAirport: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Departure Date & Time"
                  type="datetime-local"
                  value={flightForm.departureTime}
                  onChange={(e) => setFlightForm({ ...flightForm, departureTime: e.target.value })}
                  required
                />
                <Input
                  label="Arrival Date & Time"
                  type="datetime-local"
                  value={flightForm.arrivalTime}
                  onChange={(e) => setFlightForm({ ...flightForm, arrivalTime: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input
                  label="Total Seats"
                  type="number"
                  placeholder="e.g. 150"
                  value={flightForm.totalSeats}
                  onChange={(e) => setFlightForm({ ...flightForm, totalSeats: e.target.value })}
                  required
                />
                <Input
                  label="Seat Price ($)"
                  type="number"
                  placeholder="e.g. 450"
                  value={flightForm.price}
                  onChange={(e) => setFlightForm({ ...flightForm, price: e.target.value })}
                  required
                />
                <div className="mb-4">
                  <label className="block text-sm font-medium text-muted mb-1.5">Status</label>
                  <select
                    className="w-full bg-surface-2/60 border border-white/10 rounded-lg px-3 py-2.5 text-foreground focus:outline-none focus:border-accent/50 focus:ring-2 focus:ring-accent/30 transition-all"
                    value={flightForm.status}
                    onChange={(e) => setFlightForm({ ...flightForm, status: e.target.value })}
                  >
                    <option value="Scheduled">Scheduled</option>
                    <option value="Boarding">Boarding</option>
                    <option value="Delayed">Delayed</option>
                    <option value="Cancelled">Cancelled</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end items-center gap-3 pt-4 border-t border-white/10">
                <Button type="button" variant="secondary" onClick={closeFlightModal}>
                  Cancel
                </Button>
                <Button type="submit">{currentFlight ? 'Save Updates' : 'Publish Schedule'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
