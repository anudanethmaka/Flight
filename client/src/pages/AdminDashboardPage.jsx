import { useState, useEffect, useCallback } from 'react';
import Layout from '../components/ui/Layout';
import Card from '../components/ui/Card';
import Alert from '../components/ui/Alert';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import api from '../services/api';

export default function AdminDashboardPage() {
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
  const [currentFlight, setCurrentFlight] = useState(null); // null for Add, flight object for Edit
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

  // Fetch Stats
  const fetchStats = useCallback(async () => {
    try {
      const { data } = await api.get('/admin/stats');
      setStats(data);
    } catch (err) {
      console.error('Error fetching stats:', err);
      setError('Failed to fetch dashboard statistics.');
    }
  }, []);

  // Fetch Flights
  const fetchFlights = useCallback(async () => {
    try {
      const { data } = await api.get('/flights');
      setFlights(data);
    } catch (err) {
      console.error('Error fetching flights:', err);
      setError('Failed to fetch flights list.');
    }
  }, []);

  // Fetch Users
  const fetchUsers = useCallback(async () => {
    try {
      const { data } = await api.get('/admin/users');
      setUsers(data);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to fetch users list.');
    }
  }, []);

  // Fetch Bookings
  const fetchBookings = useCallback(async () => {
    try {
      const { data } = await api.get('/bookings');
      setBookings(data);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError('Failed to fetch bookings list.');
    }
  }, []);

  // Combined Initializer
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

  // Flash messages helper
  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  // Toggle User Activation
  const handleToggleUserStatus = async (userId, currentStatus) => {
    try {
      const { data } = await api.put(`/admin/users/${userId}/status`, { isActive: !currentStatus });
      setUsers(users.map(u => u._id === userId ? { ...u, isActive: data.user.isActive } : u));
      showSuccess(`Successfully ${data.user.isActive ? 'activated' : 'deactivated'} user account.`);
      fetchStats(); // Update stats in case users count changed
    } catch (err) {
      console.error('Error toggling user status:', err);
      setError(err.response?.data?.message || 'Failed to update user status.');
    }
  };

  // Open Add Modal
  const openAddFlightModal = () => {
    setCurrentFlight(null);
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

  // Open Edit Modal
  const openEditFlightModal = (flight) => {
    setCurrentFlight(flight);
    // Format dates for input datetime-local
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

  // Handle Flight Submit
  const handleFlightSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      if (currentFlight) {
        // Edit Mode
        const { data } = await api.put(`/flights/${currentFlight._id}`, flightForm);
        setFlights(flights.map(f => f._id === currentFlight._id ? data : f));
        showSuccess(`Flight ${flightForm.flightNumber} successfully updated.`);
      } else {
        // Add Mode
        const { data } = await api.post('/flights', flightForm);
        setFlights([data, ...flights]);
        showSuccess(`Flight ${flightForm.flightNumber} successfully created.`);
      }
      setFlightModalOpen(false);
      fetchStats();
    } catch (err) {
      console.error('Error submitting flight form:', err);
      setError(err.response?.data?.message || 'Failed to save flight details. Make sure the flight number is unique.');
    }
  };

  // Handle Flight Delete
  const handleFlightDelete = async (flightId, flightNum) => {
    if (!window.confirm(`Are you sure you want to delete flight ${flightNum}?`)) return;
    setError('');
    
    try {
      await api.delete(`/flights/${flightId}`);
      setFlights(flights.filter(f => f._id !== flightId));
      showSuccess(`Flight ${flightNum} deleted.`);
      fetchStats();
    } catch (err) {
      console.error('Error deleting flight:', err);
      setError(err.response?.data?.message || 'Failed to delete flight.');
    }
  };

  // Handle Admin Booking Cancel
  const handleCancelBooking = async (bookingId, reference) => {
    if (!window.confirm(`Are you sure you want to cancel booking ${reference}?`)) return;
    setError('');
    
    try {
      const { data } = await api.put(`/bookings/${bookingId}/cancel`);
      setBookings(bookings.map(b => b._id === bookingId ? { ...b, status: data.status } : b));
      showSuccess(`Booking ${reference} has been cancelled.`);
      fetchStats();
      fetchFlights(); // Refresh available seats
    } catch (err) {
      console.error('Error cancelling booking:', err);
      setError(err.response?.data?.message || 'Failed to cancel booking.');
    }
  };

  // Filters
  const filteredFlights = flights.filter(f => 
    f.flightNumber.toLowerCase().includes(flightSearch.toLowerCase()) ||
    f.airline.toLowerCase().includes(flightSearch.toLowerCase()) ||
    f.departureAirport.toLowerCase().includes(flightSearch.toLowerCase()) ||
    f.arrivalAirport.toLowerCase().includes(flightSearch.toLowerCase())
  );

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
    (u.phone && u.phone.includes(userSearch))
  );

  const filteredBookings = bookings.filter(b => 
    b.bookingReference.toLowerCase().includes(bookingSearch.toLowerCase()) ||
    b.passengerName.toLowerCase().includes(bookingSearch.toLowerCase()) ||
    (b.flight && b.flight.flightNumber.toLowerCase().includes(bookingSearch.toLowerCase()))
  );

  // Status Badge Helper
  const getStatusBadge = (status) => {
    const classes = {
      Scheduled: 'bg-blue-100 text-blue-800',
      Boarding: 'bg-purple-100 text-purple-800',
      Delayed: 'bg-amber-100 text-amber-800',
      Cancelled: 'bg-red-100 text-red-800',
      Completed: 'bg-green-100 text-green-800',
      Confirmed: 'bg-green-100 text-green-800',
      Pending: 'bg-yellow-100 text-yellow-800',
    };
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide ${classes[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
  };

  return (
    <Layout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-primary tracking-tight">Control Center</h1>
          <p className="text-sm text-muted">Manage flights, activate passengers, and track system logistics.</p>
        </div>
        <button 
          onClick={loadDashboardData}
          disabled={loading}
          className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 rounded-lg bg-white text-primary hover:bg-gray-50 transition-colors text-sm font-semibold shadow-sm cursor-pointer disabled:opacity-50"
        >
          🔄 Refresh
        </button>
      </div>

      {successMsg && <Alert type="success" className="mb-6 shadow-sm border-green-200">{successMsg}</Alert>}
      {error && <Alert type="error" className="mb-6 shadow-sm border-red-200">{error}</Alert>}

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-8 overflow-x-auto gap-2">
        {[
          { id: 'overview', label: '📊 Overview' },
          { id: 'flights', label: '✈️ Flights' },
          { id: 'users', label: '👥 Users' },
          { id: 'bookings', label: '🎟️ Bookings' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`py-3 px-5 border-b-2 font-semibold text-sm transition-all duration-200 whitespace-nowrap cursor-pointer ${
              activeTab === tab.id
                ? 'border-primary text-primary bg-primary/5 rounded-t-lg font-bold'
                : 'border-transparent text-muted hover:text-primary hover:border-gray-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingSpinner size="lg" />
      ) : (
        <>
          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="space-y-8 animate-fadeIn">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: 'Registered Users', val: stats.totalUsers, icon: '👥', color: 'text-primary bg-blue-50 border-blue-100' },
                  { label: 'Active Flights', val: stats.totalFlights, icon: '✈️', color: 'text-indigo-600 bg-indigo-50 border-indigo-100' },
                  { label: 'Bookings Reserved', val: stats.totalBookings, icon: '🎟️', color: 'text-amber-600 bg-amber-50 border-amber-100' },
                  { label: 'Accumulated Revenue', val: `$${stats.revenue.toLocaleString()}`, icon: '💰', color: 'text-green-600 bg-green-50 border-green-100' }
                ].map((s, idx) => (
                  <Card key={idx} className="p-6 flex items-center justify-between border shadow-sm hover:shadow-md transition-all duration-300 group">
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-muted uppercase tracking-wider">{s.label}</p>
                      <p className="text-3xl font-extrabold text-gray-900 group-hover:scale-105 transition-transform duration-200 origin-left">{s.val}</p>
                    </div>
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl border ${s.color}`}>
                      {s.icon}
                    </div>
                  </Card>
                ))}
              </div>

              {/* Occupancy and Logistics Summary */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 p-6 border shadow-sm space-y-4">
                  <h3 className="text-lg font-bold text-primary">System Health & Logistics</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted font-medium">Flight Occupancy Average</span>
                        <span className="font-bold text-primary">
                          {stats.totalFlights > 0
                            ? Math.round((flights.reduce((sum, f) => sum + (f.totalSeats - f.availableSeats), 0) / flights.reduce((sum, f) => sum + f.totalSeats, 0)) * 100)
                            : 0}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all duration-500" 
                          style={{
                            width: `${stats.totalFlights > 0
                              ? (flights.reduce((sum, f) => sum + (f.totalSeats - f.availableSeats), 0) / flights.reduce((sum, f) => sum + f.totalSeats, 0)) * 100
                              : 0}%`
                          }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted font-medium">Deactivated Accounts Ratio</span>
                        <span className="font-bold text-red-600">
                          {users.length > 0 ? Math.round((users.filter(u => !u.isActive).length / users.length) * 100) : 0}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div 
                          className="bg-red-500 h-2 rounded-full transition-all duration-500" 
                          style={{ width: `${users.length > 0 ? (users.filter(u => !u.isActive).length / users.length) * 100 : 0}%` }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted font-medium">Delayed & Cancelled Flights</span>
                        <span className="font-bold text-amber-600">
                          {flights.length > 0 ? Math.round((flights.filter(f => f.status === 'Delayed' || f.status === 'Cancelled').length / flights.length) * 100) : 0}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div 
                          className="bg-amber-500 h-2 rounded-full transition-all duration-500" 
                          style={{ width: `${flights.length > 0 ? (flights.filter(f => f.status === 'Delayed' || f.status === 'Cancelled').length / flights.length) * 100 : 0}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 border shadow-sm flex flex-col justify-between">
                  <div className="space-y-2">
                    <h3 className="text-lg font-bold text-primary">Quick Actions</h3>
                    <p className="text-xs text-muted">Take common administrative operations quickly.</p>
                  </div>
                  <div className="space-y-3 mt-4">
                    <button 
                      onClick={() => { setActiveTab('flights'); openAddFlightModal(); }}
                      className="w-full text-left py-2 px-3 border border-gray-150 rounded-lg hover:bg-gray-50 text-sm font-semibold transition-colors flex items-center justify-between cursor-pointer"
                    >
                      <span>➕ New Flight Schedule</span>
                      <span className="text-muted">→</span>
                    </button>
                    <button 
                      onClick={() => setActiveTab('users')}
                      className="w-full text-left py-2 px-3 border border-gray-150 rounded-lg hover:bg-gray-50 text-sm font-semibold transition-colors flex items-center justify-between cursor-pointer"
                    >
                      <span>👥 Review Deactive Users</span>
                      <span className="bg-red-100 text-red-800 text-xs px-2 py-0.5 rounded-full font-bold">
                        {users.filter(u => !u.isActive).length}
                      </span>
                    </button>
                    <button 
                      onClick={() => setActiveTab('bookings')}
                      className="w-full text-left py-2 px-3 border border-gray-150 rounded-lg hover:bg-gray-50 text-sm font-semibold transition-colors flex items-center justify-between cursor-pointer"
                    >
                      <span>🎟️ View Ticket Ledger</span>
                      <span className="text-muted">→</span>
                    </button>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* FLIGHTS TAB */}
          {activeTab === 'flights' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
                <div className="relative flex-1 max-w-md">
                  <input
                    type="text"
                    placeholder="Search by flight, airline, airports..."
                    className="w-full border border-gray-200 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-light bg-white shadow-sm"
                    value={flightSearch}
                    onChange={(e) => setFlightSearch(e.target.value)}
                  />
                  <span className="absolute left-3 top-2.5 text-muted">🔍</span>
                </div>
                <Button onClick={openAddFlightModal} className="shadow-sm flex items-center gap-1">
                  <span>➕</span> Add Flight Schedule
                </Button>
              </div>

              <Card className="overflow-hidden border shadow-sm p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-gray-50 text-muted uppercase text-xs font-bold border-b border-gray-100">
                        <th className="py-4 px-6">Flight No</th>
                        <th className="py-4 px-6">Airline</th>
                        <th className="py-4 px-6">Route</th>
                        <th className="py-4 px-6">Departure Time</th>
                        <th className="py-4 px-6 text-center">Seats (Avail/Total)</th>
                        <th className="py-4 px-6 text-right">Price</th>
                        <th className="py-4 px-6">Status</th>
                        <th className="py-4 px-6 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                      {filteredFlights.length === 0 ? (
                        <tr>
                          <td colSpan="8" className="py-12 text-center text-muted font-medium">
                            No flights match your search query.
                          </td>
                        </tr>
                      ) : (
                        filteredFlights.map((flight) => (
                          <tr key={flight._id} className="hover:bg-gray-50/50 transition-colors">
                            <td className="py-4 px-6 font-bold text-primary">{flight.flightNumber}</td>
                            <td className="py-4 px-6 font-medium text-gray-700">{flight.airline}</td>
                            <td className="py-4 px-6">
                              <div className="flex items-center gap-1.5 font-medium text-gray-800">
                                <span>{flight.departureAirport.replace(/\s*\(.*\)/, '')}</span>
                                <span className="text-muted text-xs">➔</span>
                                <span>{flight.arrivalAirport.replace(/\s*\(.*\)/, '')}</span>
                              </div>
                            </td>
                            <td className="py-4 px-6 text-gray-600 text-xs">
                              {new Date(flight.departureTime).toLocaleString(undefined, {
                                dateStyle: 'short',
                                timeStyle: 'short'
                              })}
                            </td>
                            <td className="py-4 px-6 text-center">
                              <span className={`font-bold ${flight.availableSeats === 0 ? 'text-red-500' : 'text-gray-700'}`}>
                                {flight.availableSeats}
                              </span>
                              <span className="text-muted"> / {flight.totalSeats}</span>
                            </td>
                            <td className="py-4 px-6 text-right font-bold text-gray-900">${flight.price}</td>
                            <td className="py-4 px-6">{getStatusBadge(flight.status)}</td>
                            <td className="py-4 px-6">
                              <div className="flex justify-center items-center gap-2">
                                <button
                                  onClick={() => openEditFlightModal(flight)}
                                  className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors cursor-pointer"
                                  title="Edit"
                                >
                                  ✏️
                                </button>
                                <button
                                  onClick={() => handleFlightDelete(flight._id, flight.flightNumber)}
                                  className="p-1.5 text-danger hover:bg-red-50 rounded transition-colors cursor-pointer"
                                  title="Delete"
                                >
                                  🗑️
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

          {/* USERS TAB */}
          {activeTab === 'users' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="relative max-w-md">
                <input
                  type="text"
                  placeholder="Search users by name, email, phone..."
                  className="w-full border border-gray-200 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-light bg-white shadow-sm"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                />
                <span className="absolute left-3 top-2.5 text-muted">🔍</span>
              </div>

              <Card className="overflow-hidden border shadow-sm p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-gray-50 text-muted uppercase text-xs font-bold border-b border-gray-100">
                        <th className="py-4 px-6">Passenger Name</th>
                        <th className="py-4 px-6">Email Address</th>
                        <th className="py-4 px-6">Phone Number</th>
                        <th className="py-4 px-6">Role</th>
                        <th className="py-4 px-6">Joined Date</th>
                        <th className="py-4 px-6 text-center">Status</th>
                        <th className="py-4 px-6 text-center">Toggle status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                      {filteredUsers.length === 0 ? (
                        <tr>
                          <td colSpan="7" className="py-12 text-center text-muted font-medium">
                            No passengers registered.
                          </td>
                        </tr>
                      ) : (
                        filteredUsers.map((user) => (
                          <tr key={user._id} className="hover:bg-gray-50/50 transition-colors">
                            <td className="py-4 px-6 font-bold text-gray-800">{user.name}</td>
                            <td className="py-4 px-6 font-medium text-gray-600">{user.email}</td>
                            <td className="py-4 px-6 text-gray-500">{user.phone || 'N/A'}</td>
                            <td className="py-4 px-6">
                              <span className={`px-2 py-0.5 rounded text-xs font-semibold uppercase ${
                                user.role === 'admin' ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100 text-gray-700'
                              }`}>
                                {user.role}
                              </span>
                            </td>
                            <td className="py-4 px-6 text-gray-500 text-xs">
                              {new Date(user.createdAt).toLocaleDateString()}
                            </td>
                            <td className="py-4 px-6 text-center">
                              <span className={`inline-block w-2.5 h-2.5 rounded-full mr-1 ${
                                user.isActive ? 'bg-green-500 animate-pulse' : 'bg-red-400'
                              }`}></span>
                              <span className={`font-semibold ${user.isActive ? 'text-green-700' : 'text-danger'}`}>
                                {user.isActive ? 'Active' : 'Suspended'}
                              </span>
                            </td>
                            <td className="py-4 px-6">
                              <div className="flex justify-center items-center">
                                <button
                                  onClick={() => handleToggleUserStatus(user._id, user.isActive)}
                                  className={`px-3 py-1 rounded text-xs font-semibold cursor-pointer transition-all duration-200 ${
                                    user.isActive 
                                      ? 'bg-red-50 text-danger hover:bg-red-100'
                                      : 'bg-green-50 text-success hover:bg-green-100'
                                  }`}
                                >
                                  {user.isActive ? '🛑 Suspend' : '✅ Activate'}
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

          {/* BOOKINGS TAB */}
          {activeTab === 'bookings' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="relative max-w-md">
                <input
                  type="text"
                  placeholder="Search by ref, passenger name or flight..."
                  className="w-full border border-gray-200 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-light bg-white shadow-sm"
                  value={bookingSearch}
                  onChange={(e) => setBookingSearch(e.target.value)}
                />
                <span className="absolute left-3 top-2.5 text-muted">🔍</span>
              </div>

              <Card className="overflow-hidden border shadow-sm p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-gray-50 text-muted uppercase text-xs font-bold border-b border-gray-100">
                        <th className="py-4 px-6">Booking Ref</th>
                        <th className="py-4 px-6">Passenger</th>
                        <th className="py-4 px-6">Flight No</th>
                        <th className="py-4 px-6">Route</th>
                        <th className="py-4 px-6 text-center">Seat</th>
                        <th className="py-4 px-6 text-right">Price</th>
                        <th className="py-4 px-6">Booking Date</th>
                        <th className="py-4 px-6">Status</th>
                        <th className="py-4 px-6 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                      {filteredBookings.length === 0 ? (
                        <tr>
                          <td colSpan="9" className="py-12 text-center text-muted font-medium">
                            No reservations found.
                          </td>
                        </tr>
                      ) : (
                        filteredBookings.map((booking) => (
                          <tr key={booking._id} className="hover:bg-gray-50/50 transition-colors">
                            <td className="py-4 px-6 font-bold text-accent tracking-wide">{booking.bookingReference}</td>
                            <td className="py-4 px-6">
                              <div className="font-semibold text-gray-800">{booking.passengerName}</div>
                              {booking.passengerAge && (
                                <div className="text-muted text-xs">Age: {booking.passengerAge}</div>
                              )}
                            </td>
                            <td className="py-4 px-6 font-bold text-primary">
                              {booking.flight ? booking.flight.flightNumber : 'N/A'}
                            </td>
                            <td className="py-4 px-6">
                              {booking.flight ? (
                                <div className="text-xs font-medium text-gray-700">
                                  {booking.flight.departureAirport.replace(/\s*\(.*\)/, '')} ➔ {booking.flight.arrivalAirport.replace(/\s*\(.*\)/, '')}
                                </div>
                              ) : (
                                <span className="text-red-500 text-xs font-semibold">Flight Deleted</span>
                              )}
                            </td>
                            <td className="py-4 px-6 text-center font-bold text-indigo-700 bg-indigo-50/30">{booking.seatNumber}</td>
                            <td className="py-4 px-6 text-right font-bold text-gray-900">${booking.totalPrice}</td>
                            <td className="py-4 px-6 text-gray-500 text-xs">
                              {new Date(booking.createdAt).toLocaleDateString()}
                            </td>
                            <td className="py-4 px-6">{getStatusBadge(booking.status)}</td>
                            <td className="py-4 px-6 text-center">
                              {booking.status === 'Confirmed' ? (
                                <button
                                  onClick={() => handleCancelBooking(booking._id, booking.bookingReference)}
                                  className="text-xs bg-red-50 text-danger border border-red-200 rounded px-2.5 py-1 font-semibold hover:bg-red-100 transition-colors cursor-pointer"
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

          {/* FLIGHT MODAL (ADD & EDIT) */}
          {flightModalOpen && (
            <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
              <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden border border-gray-150 relative animate-scaleUp">
                
                {/* Header */}
                <div className="bg-primary text-white p-6 flex justify-between items-center">
                  <h3 className="text-xl font-bold">
                    {currentFlight ? `Edit Flight ${currentFlight.flightNumber}` : 'Add New Flight Schedule'}
                  </h3>
                  <button 
                    onClick={() => setFlightModalOpen(false)}
                    className="text-white hover:text-gray-200 text-2xl font-bold cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                {/* Form */}
                <form onSubmit={handleFlightSubmit} className="p-6 space-y-4">
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
                      label="Total Seats Capacity"
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
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <select
                        className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary-light transition-colors"
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

                  <div className="flex justify-end items-center gap-3 pt-4 border-t border-gray-100">
                    <Button 
                      type="button" 
                      variant="secondary"
                      onClick={() => setFlightModalOpen(false)}
                      className="cursor-pointer"
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit"
                      className="cursor-pointer"
                    >
                      {currentFlight ? 'Save Updates' : 'Publish Schedule'}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </>
      )}
    </Layout>
  );
}
