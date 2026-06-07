using System; // Placeholder for formatting, this is a TypeScript file.
import React, { useState, useEffect } from 'react';
import { bookingApi, notificationApi, flightApi } from '../services/api';
import { Plane, Calendar, Bell, ShieldAlert, Award, FileText, CheckCircle, XCircle } from 'lucide-react';

const PassengerDashboard: React.FC = () => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [flightsMap, setFlightsMap] = useState<Record<number, any>>({});
  const [notifications, setNotifications] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Fetch bookings
      const bookingsRes = await bookingApi.getMyBookings();
      const bookingsData = bookingsRes.data;

      // 2. Fetch flights to map itineraries
      const flightsRes = await flightApi.search();
      const flightsData = flightsRes.data;
      const fMap: Record<number, any> = {};
      flightsData.forEach((f: any) => { fMap[f.id] = f; });

      setFlightsMap(fMap);
      setBookings(bookingsData);

      // 3. Fetch notifications
      const notifRes = await notificationApi.getMyNotifications();
      setNotifications(notifRes.data);

      setLoading(false);
    } catch (err) {
      console.error(err);
      setError('Failed to load dashboard data.');
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCancelBooking = async (id: number) => {
    if (!window.confirm('Are you sure you want to cancel this booking? This will restore seats inventory.')) return;
    try {
      await bookingApi.cancel(id);
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to cancel booking.');
    }
  };

  const markNotificationRead = async (id: number) => {
    try {
      await notificationApi.markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error('Failed to mark read', err);
    }
  };

  if (loading) return <div className="text-center py-20 text-slate-500">Loading your profile dashboard...</div>;
  if (error) return <div className="bg-red-50 text-red-600 p-4 rounded-xl text-center text-sm">{error}</div>;

  const activeBookings = bookings.filter(b => b.status === 'Confirmed');
  const pastBookings = bookings.filter(b => b.status === 'Cancelled');

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 space-y-8 min-h-screen">

      {/* Title Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Passenger Portal</h1>
        <p className="text-sm text-slate-500">Monitor flights, download tickets, and review alerts</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* LEFT COLUMN: Bookings List */}
        <div className="lg:col-span-2 space-y-6">

          {/* Active / Upcoming Bookings */}
          <div className="space-y-4">
            <h2 className="text-lg font-extrabold text-slate-800 flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-airline-600" />
              <span>Upcoming Flights</span>
            </h2>

            {activeBookings.length === 0 ? (
              <div className="bg-white border border-slate-200/50 rounded-2xl p-8 text-center text-slate-400 text-sm">
                No active flight bookings.
              </div>
            ) : (
              activeBookings.map((booking) => {
                const flight = flightsMap[booking.flightId];
                return (
                  <div key={booking.id} className="glass-card p-6 border-l-4 border-l-airline-600 space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-xxs font-bold text-slate-400 uppercase tracking-wider block">Reference Number</span>
                        <span className="font-mono text-sm font-bold text-airline-600">{booking.bookingReference}</span>
                      </div>
                      <span className="text-xxs font-bold uppercase tracking-wider text-green-600 bg-green-50 px-2.5 py-1 rounded-full border border-green-200/50">
                        {booking.status}
                      </span>
                    </div>

                    {flight ? (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl text-xs">
                        <div>
                          <span className="text-slate-400 block mb-0.5">Flight Number</span>
                          <span className="font-bold text-slate-800">{flight.flightNumber}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block mb-0.5">Route</span>
                          <span className="font-bold text-slate-800">{flight.departureAirport} → {flight.arrivalAirport}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block mb-0.5">Schedule</span>
                          <span className="font-bold text-slate-800">{new Date(flight.departureDate).toLocaleDateString()}</span>
                          <span className="text-slate-400 block">{flight.departureTime}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block mb-0.5">Status</span>
                          <span className={`font-bold ${flight.flightStatus === 'Delayed' ? 'text-amber-600' :
                              flight.flightStatus === 'Cancelled' ? 'text-red-500' :
                                'text-slate-700'
                            }`}>{flight.flightStatus}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-xs text-slate-400">Loading flight details...</div>
                    )}

                    {/* Passenger Tickets details */}
                    <div className="space-y-2">
                      <span className="text-xxs font-bold text-slate-400 uppercase tracking-wider block">Boarding Passes</span>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {booking.tickets.map((t: any, idx: number) => (
                          <div key={idx} className="flex justify-between items-center bg-white p-2.5 rounded-lg border border-slate-100 text-xs">
                            <span className="font-medium text-slate-700">{t.passengerName} (Seat <span className="font-bold text-airline-600">{t.seatNumber}</span>)</span>
                            <span className="font-mono text-slate-400">{t.ticketNumber}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-end pt-2 border-t border-slate-50">
                      <button
                        onClick={() => handleCancelBooking(booking.id)}
                        className="text-xs font-bold text-red-500 hover:text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-all"
                      >
                        Cancel Booking
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Booking History (Cancelled) */}
          <div className="space-y-4">
            <h2 className="text-lg font-extrabold text-slate-800 flex items-center space-x-2">
              <FileText className="h-5 w-5 text-slate-500" />
              <span>Booking History</span>
            </h2>

            {pastBookings.length === 0 ? (
              <div className="bg-white border border-slate-200/50 rounded-2xl p-8 text-center text-slate-400 text-sm">
                No past transactions.
              </div>
            ) : (
              <div className="bg-white border border-slate-200/50 rounded-2xl overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                      <th className="py-3.5 px-5">Ref Code</th>
                      <th className="py-3.5 px-5">Flight</th>
                      <th className="py-3.5 px-5">Date</th>
                      <th className="py-3.5 px-5">Price</th>
                      <th className="py-3.5 px-5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 text-slate-600">
                    {pastBookings.map((b) => {
                      const flight = flightsMap[b.flightId];
                      return (
                        <tr key={b.id} className="hover:bg-slate-50/50">
                          <td className="py-3 px-5 font-mono font-bold text-slate-700">{b.bookingReference}</td>
                          <td className="py-3 px-5">{flight?.flightNumber || 'Unknown'}</td>
                          <td className="py-3 px-5">{new Date(b.bookingDate).toLocaleDateString()}</td>
                          <td className="py-3 px-5 font-bold">${b.totalPrice.toFixed(2)}</td>
                          <td className="py-3 px-5">
                            <span className="inline-flex items-center space-x-1 text-red-500 font-bold bg-red-50 px-2 py-0.5 rounded-full uppercase scale-95 border border-red-100">
                              <XCircle className="h-3 w-3" />
                              <span>Cancelled</span>
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Notifications Panel */}
        <div className="space-y-4">
          <h2 className="text-lg font-extrabold text-slate-800 flex items-center space-x-2">
            <Bell className="h-5 w-5 text-airline-600" />
            <span>Activity Feed</span>
          </h2>

          <div className="glass-panel rounded-3xl p-6 border border-slate-200/50 space-y-4 max-h-[500px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-xs">No alerts yet.</div>
            ) : (
              <div className="divide-y divide-slate-100">
                {notifications.map((n) => (
                  <div key={n.id} className="py-3.5 first:pt-0 last:pb-0 space-y-1.5">
                    <div className="flex justify-between items-start gap-2">
                      <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${n.type === 'BookingConfirmation' ? 'bg-green-50 text-green-600' :
                          n.type === 'FlightDelay' ? 'bg-amber-50 text-amber-600' :
                            'bg-red-50 text-red-500'
                        }`}>
                        {n.type.replace('Flight', '')}
                      </span>
                      {!n.isRead && (
                        <button
                          onClick={() => markNotificationRead(n.id)}
                          className="text-[10px] font-bold text-airline-600 hover:text-airline-700 bg-airline-50 hover:bg-airline-100 px-2 py-0.5 rounded transition-colors"
                        >
                          Mark read
                        </button>
                      )}
                    </div>
                    <p className={`text-xs leading-relaxed ${n.isRead ? 'text-slate-400' : 'text-slate-700 font-medium'}`}>
                      {n.message}
                    </p>
                    <span className="text-[10px] text-slate-400 block">
                      {new Date(n.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default PassengerDashboard;
