import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { bookingApi, flightApi } from '../services/api';
import { Plane, Calendar, FileText } from 'lucide-react';

const StaffDashboard: React.FC = () => {
  const [flights, setFlights] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [flightsRes, bookingsRes] = await Promise.all([
        flightApi.search(),
        bookingApi.getAllBookings(),
      ]);
      setFlights(flightsRes.data);
      setBookings(bookingsRes.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError('Failed to load staff portal data. Make sure you are signed in as a Staff member.');
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) return <div className="text-center py-20 text-slate-500">Loading staff portal...</div>;
  if (error) return <div className="bg-red-50 text-red-600 p-6 rounded-2xl text-center text-sm max-w-2xl mx-auto my-10 border border-red-200">{error}</div>;

  const activeFlights = flights.filter(f => f.flightStatus !== 'Completed' && f.flightStatus !== 'Cancelled');
  const confirmedBookings = bookings.filter(b => b.status === 'Confirmed');

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 space-y-8 min-h-screen">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Staff Operations Center</h1>
          <p className="text-sm text-slate-500">Coordinate active flights, supervise bookings, and update statuses.</p>
        </div>
        <Link 
          to="/flights"
          className="bg-airline-600 hover:bg-airline-700 text-white font-bold px-5 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center space-x-2 text-sm"
        >
          <Plane className="h-4 w-4 transform rotate-45" />
          <span>Manage Flights</span>
        </Link>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 flex items-center space-x-4">
          <div className="p-4 bg-blue-50 text-airline-600 rounded-2xl">
            <Plane className="h-6 w-6 transform rotate-45" />
          </div>
          <div>
            <span className="text-xs text-slate-400 block font-medium">Total Air Routes</span>
            <span className="text-2xl font-extrabold text-slate-800">{flights.length}</span>
          </div>
        </div>
        <div className="glass-card p-6 flex items-center space-x-4">
          <div className="p-4 bg-amber-50 text-amber-600 rounded-2xl">
            <Calendar className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 block font-medium">Active/Scheduled Flights</span>
            <span className="text-2xl font-extrabold text-slate-800">{activeFlights.length}</span>
          </div>
        </div>
        <div className="glass-card p-6 flex items-center space-x-4">
          <div className="p-4 bg-green-50 text-green-600 rounded-2xl">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 block font-medium">Confirmed Passages</span>
            <span className="text-2xl font-extrabold text-slate-800">{confirmedBookings.length}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Active Flights Schedule */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-extrabold text-slate-800 flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-airline-600" />
            <span>Active Flight Schedules</span>
          </h2>
          <div className="bg-white border border-slate-200/50 rounded-2xl overflow-hidden shadow-sm">
            <div className="max-h-[400px] overflow-y-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100 sticky top-0">
                    <th className="py-3 px-5">Flight No.</th>
                    <th className="py-3 px-5">Route</th>
                    <th className="py-3 px-5">Date / Time</th>
                    <th className="py-3 px-5">Seats Left</th>
                    <th className="py-3 px-5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-slate-600">
                  {activeFlights.map((f, i) => (
                    <tr key={i} className="hover:bg-slate-50/50">
                      <td className="py-3 px-5 font-bold text-slate-700">{f.flightNumber}</td>
                      <td className="py-3 px-5">{f.departureAirport} → {f.arrivalAirport}</td>
                      <td className="py-3 px-5">
                        <div>{new Date(f.departureDate).toLocaleDateString()}</div>
                        <div className="text-[10px] text-slate-400">{f.departureTime}</div>
                      </td>
                      <td className="py-3 px-5 font-semibold">{f.availableSeats} / {f.totalSeats}</td>
                      <td className="py-3 px-5">
                        <span className={`inline-block px-2 py-0.5 rounded-full font-bold uppercase text-[9px] ${
                          f.flightStatus === 'Scheduled' ? 'bg-blue-50 text-blue-600' :
                          f.flightStatus === 'Boarding' ? 'bg-green-50 text-green-600' :
                          f.flightStatus === 'Delayed' ? 'bg-amber-50 text-amber-600 animate-pulse' :
                          f.flightStatus === 'Cancelled' ? 'bg-red-50 text-red-600' :
                          'bg-slate-50 text-slate-500'
                        }`}>
                          {f.flightStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right: Bookings Feed */}
        <div className="space-y-4">
          <h2 className="text-lg font-extrabold text-slate-800 flex items-center space-x-2">
            <FileText className="h-5 w-5 text-purple-600" />
            <span>Recent Bookings</span>
          </h2>
          <div className="glass-panel p-6 rounded-3xl shadow-sm border border-slate-200/50 bg-white/70 max-h-[400px] overflow-y-auto">
            <div className="divide-y divide-slate-100">
              {bookings.length === 0 ? (
                <div className="text-center py-10 text-slate-400 text-xs">No bookings recorded.</div>
              ) : (
                bookings.slice(0, 10).map((b) => (
                  <div key={b.id} className="py-3 first:pt-0 last:pb-0 space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-mono font-bold text-airline-600">{b.bookingReference}</span>
                      <span className={`inline-flex items-center space-x-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase scale-90 ${
                        b.status === 'Confirmed' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'
                      }`}>
                        {b.status}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500">
                      User #{b.userId} booked {b.tickets?.length || 0} seat(s) for ${b.totalPrice.toFixed(2)}
                    </p>
                    <span className="text-[9px] text-slate-400 block">
                      {new Date(b.bookingDate).toLocaleDateString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;
