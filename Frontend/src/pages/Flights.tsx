import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { flightApi } from '../services/api';
import { Plane, Plus, Edit2, Trash2, Calendar, MapPin, DollarSign, Filter, ArrowUpDown, X, User } from 'lucide-react';

const Flights: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [flights, setFlights] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search filter inputs inside the page
  const [departure, setDeparture] = useState('');
  const [arrival, setArrival] = useState('');
  const [date, setDate] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState('DepartureTime');

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedFlight, setSelectedFlight] = useState<any>(null);

  // Add/Edit Form state
  const [formFlightNumber, setFormFlightNumber] = useState('');
  const [formDepartureAirport, setFormDepartureAirport] = useState('');
  const [formArrivalAirport, setFormArrivalAirport] = useState('');
  const [formDepartureDate, setFormDepartureDate] = useState('');
  const [formDepartureTime, setFormDepartureTime] = useState('');
  const [formArrivalTime, setFormArrivalTime] = useState('');
  const [formTotalSeats, setFormTotalSeats] = useState(180);
  const [formPrice, setFormPrice] = useState(350);
  const [formStatus, setFormStatus] = useState('Scheduled');

  // Parse query parameters
  const queryParams = new URLSearchParams(location.search);
  const queryDep = queryParams.get('departure');
  const queryArr = queryParams.get('arrival');
  const queryDate = queryParams.get('date');

  const fetchFlights = async () => {
    setLoading(true);
    setError(null);
    try {
      const depParam = departure || queryDep || undefined;
      const arrParam = arrival || queryArr || undefined;
      const dateParam = date || queryDate || undefined;
      
      const response = await flightApi.search(depParam, arrParam, dateParam);
      setFlights(response.data);
      setLoading(false);
    } catch (err: any) {
      console.error(err);
      setError('Failed to fetch flights. Please try again.');
      setLoading(false);
    }
  };

  useEffect(() => {
    // Prefill form states on query params match
    if (queryDep) setDeparture(queryDep);
    if (queryArr) setArrival(queryArr);
    if (queryDate) setDate(queryDate);

    fetchFlights();
  }, [location.search]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchFlights();
  };

  const handleReset = () => {
    setDeparture('');
    setArrival('');
    setDate('');
    navigate('/flights');
  };

  const handleAddFlight = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        flightNumber: formFlightNumber,
        departureAirport: formDepartureAirport,
        arrivalAirport: formArrivalAirport,
        departureDate: formDepartureDate,
        departureTime: formDepartureTime,
        arrivalTime: formArrivalTime,
        totalSeats: Number(formTotalSeats),
        price: Number(formPrice)
      };

      await flightApi.create(payload);
      setShowAddModal(false);
      resetForm();
      fetchFlights();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create flight');
    }
  };

  const handleEditFlight = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFlight) return;
    try {
      const payload = {
        flightNumber: formFlightNumber,
        departureAirport: formDepartureAirport,
        arrivalAirport: formArrivalAirport,
        departureDate: formDepartureDate,
        departureTime: formDepartureTime,
        arrivalTime: formArrivalTime,
        totalSeats: Number(formTotalSeats),
        price: Number(formPrice),
        flightStatus: formStatus
      };

      await flightApi.update(selectedFlight.id, payload);
      setShowEditModal(false);
      resetForm();
      fetchFlights();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update flight');
    }
  };

  const handleDeleteFlight = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this flight?')) return;
    try {
      await flightApi.delete(id);
      fetchFlights();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete flight');
    }
  };

  const openEditModal = (flight: any) => {
    setSelectedFlight(flight);
    setFormFlightNumber(flight.flightNumber);
    setFormDepartureAirport(flight.departureAirport);
    setFormArrivalAirport(flight.arrivalAirport);
    setFormDepartureDate(flight.departureDate.split('T')[0]);
    setFormDepartureTime(flight.departureTime);
    setFormArrivalTime(flight.arrivalTime);
    setFormTotalSeats(flight.totalSeats);
    setFormPrice(flight.price);
    setFormStatus(flight.flightStatus);
    setShowEditModal(true);
  };

  const resetForm = () => {
    setSelectedFlight(null);
    setFormFlightNumber('');
    setFormDepartureAirport('');
    setFormArrivalAirport('');
    setFormDepartureDate('');
    setFormDepartureTime('');
    setFormArrivalTime('');
    setFormTotalSeats(180);
    setFormPrice(350);
    setFormStatus('Scheduled');
  };

  // Sort and Filter Logic
  const filteredFlights = flights
    .filter(f => statusFilter === 'All' || f.flightStatus.toLowerCase() === statusFilter.toLowerCase())
    .sort((a, b) => {
      if (sortBy === 'Price') return a.price - b.price;
      if (sortBy === 'Seats') return b.availableSeats - a.availableSeats;
      return a.departureTime.localeCompare(b.departureTime); // default time sort
    });

  const isStaffOrAdmin = isAuthenticated && user && (user.role === 'Administrator' || user.role === 'Staff');

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 space-y-8 min-h-screen">
      
      {/* Title Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Available Flights</h1>
          <p className="text-sm text-slate-500">Book your next journey or manage current routes</p>
        </div>
        
        {isStaffOrAdmin && (
          <button 
            onClick={() => { resetForm(); setShowAddModal(true); }}
            className="bg-airline-600 hover:bg-airline-700 text-white font-bold px-4 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center space-x-2 text-sm"
          >
            <Plus className="h-4 w-4" />
            <span>Add Flight</span>
          </button>
        )}
      </div>

      {/* Filter Box & Search Inputs */}
      <div className="glass-panel p-6 rounded-2xl shadow-sm border border-slate-200/50">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">From</label>
            <input 
              type="text" 
              placeholder="Departure (e.g. CMB)"
              value={departure}
              onChange={(e) => setDeparture(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:ring-1 focus:ring-airline-500 outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">To</label>
            <input 
              type="text" 
              placeholder="Arrival (e.g. LHR)"
              value={arrival}
              onChange={(e) => setArrival(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:ring-1 focus:ring-airline-500 outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Date</label>
            <input 
              type="date" 
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:ring-1 focus:ring-airline-500 outline-none"
            />
          </div>
          <div className="flex gap-2">
            <button 
              type="submit" 
              className="flex-1 bg-airline-600 hover:bg-airline-700 text-white font-bold py-2 rounded-xl text-xs shadow transition-colors"
            >
              Apply Filter
            </button>
            <button 
              type="button" 
              onClick={handleReset}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-semibold transition-colors"
            >
              Reset
            </button>
          </div>
        </form>

        {/* Sorting and Secondary Filters */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap gap-4 justify-between items-center text-xs">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-slate-500 font-medium">
              <Filter className="h-3.5 w-3.5" />
              <span>Status:</span>
            </div>
            <div className="flex gap-1.5">
              {['All', 'Scheduled', 'Boarding', 'Delayed', 'Cancelled'].map(status => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1 rounded-full font-semibold transition-all ${statusFilter === status ? 'bg-airline-100 text-airline-700' : 'bg-slate-100/80 text-slate-600 hover:bg-slate-200/60'}`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-slate-500 font-medium flex items-center space-x-1">
              <ArrowUpDown className="h-3 w-3" />
              <span>Sort By:</span>
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg py-1 px-2.5 outline-none font-semibold text-slate-700 cursor-pointer"
            >
              <option value="DepartureTime">Departure Time</option>
              <option value="Price">Price (Low to High)</option>
              <option value="Seats">Available Seats</option>
            </select>
          </div>
        </div>
      </div>

      {/* Flight Listing Tables */}
      {loading ? (
        <div className="text-center py-20 text-slate-500">Loading flights...</div>
      ) : error ? (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl text-center text-sm">{error}</div>
      ) : filteredFlights.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-200/50 text-slate-400">
          <Plane className="h-10 w-10 mx-auto opacity-20 mb-3" />
          <p className="text-sm">No flights found matching your search criteria.</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/50 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider border-b border-slate-100">
                  <th className="py-4 px-6">Flight No.</th>
                  <th className="py-4 px-6">Route</th>
                  <th className="py-4 px-6">Departure Date & Time</th>
                  <th className="py-4 px-6">Arrival Time</th>
                  <th className="py-4 px-6">Available Seats</th>
                  <th className="py-4 px-6">Price</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredFlights.map((flight) => (
                  <tr key={flight.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6 font-bold text-slate-800">{flight.flightNumber}</td>
                    <td className="py-4 px-6 space-y-0.5">
                      <div className="font-semibold text-slate-700">{flight.departureAirport} → {flight.arrivalAirport}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-medium text-slate-700">{new Date(flight.departureDate).toLocaleDateString()}</div>
                      <div className="text-xs text-slate-400">{flight.departureTime}</div>
                    </td>
                    <td className="py-4 px-6 text-slate-600">{flight.arrivalTime}</td>
                    <td className="py-4 px-6 font-medium text-slate-600">
                      {flight.availableSeats} / {flight.totalSeats}
                    </td>
                    <td className="py-4 px-6 font-bold text-airline-600">${flight.price.toFixed(2)}</td>
                    <td className="py-4 px-6">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-xxs font-bold uppercase tracking-wider ${
                        flight.flightStatus === 'Scheduled' ? 'bg-blue-50 text-blue-600' :
                        flight.flightStatus === 'Boarding' ? 'bg-green-50 text-green-600' :
                        flight.flightStatus === 'Delayed' ? 'bg-amber-50 text-amber-600 animate-pulse' :
                        flight.flightStatus === 'Cancelled' ? 'bg-red-50 text-red-600' :
                        'bg-slate-50 text-slate-500'
                      }`}>
                        {flight.flightStatus}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {/* Book Flight button */}
                        {flight.flightStatus !== 'Cancelled' ? (
                          <button
                            onClick={() => {
                              if (!isAuthenticated) navigate('/login');
                              else navigate(`/booking/${flight.id}`);
                            }}
                            className="bg-airline-50 hover:bg-airline-600 text-airline-600 hover:text-white font-bold px-3 py-1.5 rounded-lg text-xs transition-colors"
                          >
                            Book
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400 font-semibold px-3 py-1.5 bg-slate-100 rounded-lg">Unavailable</span>
                        )}

                        {/* Edit / Delete Options */}
                        {isStaffOrAdmin && (
                          <button 
                            onClick={() => openEditModal(flight)}
                            className="p-1.5 text-slate-400 hover:text-airline-600 hover:bg-slate-100 rounded-lg transition-colors"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                        {isAuthenticated && user?.role === 'Administrator' && (
                          <button 
                            onClick={() => handleDeleteFlight(flight.id)}
                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-slate-100 rounded-lg transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- ADD FLIGHT MODAL --- */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl p-6 border border-slate-100 relative animate-in zoom-in-95 duration-200">
            <button onClick={() => setShowAddModal(false)} className="absolute right-4 top-4 p-1 text-slate-400 hover:text-slate-600">
              <X className="h-5 w-5" />
            </button>
            <h3 className="font-extrabold text-slate-800 text-lg mb-4">Add New Flight</h3>
            
            <form onSubmit={handleAddFlight} className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-1">
                <label className="text-xs font-bold text-slate-500">Flight Number</label>
                <input required type="text" placeholder="e.g. SL-101" value={formFlightNumber} onChange={e=>setFormFlightNumber(e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-airline-500 outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500">Departure Airport</label>
                <input required type="text" placeholder="e.g. CMB (Colombo)" value={formDepartureAirport} onChange={e=>setFormDepartureAirport(e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-airline-500 outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500">Arrival Airport</label>
                <input required type="text" placeholder="e.g. SIN (Singapore)" value={formArrivalAirport} onChange={e=>setFormArrivalAirport(e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-airline-500 outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500">Departure Date</label>
                <input required type="date" value={formDepartureDate} onChange={e=>setFormDepartureDate(e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-airline-500 outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500">Departure Time</label>
                <input required type="text" placeholder="e.g. 08:30" value={formDepartureTime} onChange={e=>setFormDepartureTime(e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-airline-500 outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500">Arrival Time</label>
                <input required type="text" placeholder="e.g. 14:15" value={formArrivalTime} onChange={e=>setFormArrivalTime(e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-airline-500 outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500">Total Seats</label>
                <input required type="number" min={1} value={formTotalSeats} onChange={e=>setFormTotalSeats(Number(e.target.value))} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-airline-500 outline-none" />
              </div>
              <div className="col-span-2 space-y-1">
                <label className="text-xs font-bold text-slate-500">Ticket Price ($)</label>
                <input required type="number" min={0} value={formPrice} onChange={e=>setFormPrice(Number(e.target.value))} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-airline-500 outline-none" />
              </div>

              <button type="submit" className="col-span-2 mt-4 bg-airline-600 hover:bg-airline-700 text-white font-bold py-2 rounded-xl text-xs transition-colors shadow">
                Save Flight
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- EDIT FLIGHT MODAL --- */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl p-6 border border-slate-100 relative animate-in zoom-in-95 duration-200">
            <button onClick={() => setShowEditModal(false)} className="absolute right-4 top-4 p-1 text-slate-400 hover:text-slate-600">
              <X className="h-5 w-5" />
            </button>
            <h3 className="font-extrabold text-slate-800 text-lg mb-4">Edit Flight ({formFlightNumber})</h3>
            
            <form onSubmit={handleEditFlight} className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500">Departure Airport</label>
                <input required type="text" value={formDepartureAirport} onChange={e=>setFormDepartureAirport(e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-airline-500 outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500">Arrival Airport</label>
                <input required type="text" value={formArrivalAirport} onChange={e=>setFormArrivalAirport(e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-airline-500 outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500">Departure Date</label>
                <input required type="date" value={formDepartureDate} onChange={e=>setFormDepartureDate(e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-airline-500 outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500">Departure Time</label>
                <input required type="text" value={formDepartureTime} onChange={e=>setFormDepartureTime(e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-airline-500 outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500">Arrival Time</label>
                <input required type="text" value={formArrivalTime} onChange={e=>setFormArrivalTime(e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-airline-500 outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500">Total Seats</label>
                <input required type="number" min={1} value={formTotalSeats} onChange={e=>setFormTotalSeats(Number(e.target.value))} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-airline-500 outline-none" />
              </div>
              <div className="space-y-1 col-span-2">
                <label className="text-xs font-bold text-slate-500">Price ($)</label>
                <input required type="number" min={0} value={formPrice} onChange={e=>setFormPrice(Number(e.target.value))} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-airline-500 outline-none" />
              </div>
              <div className="col-span-2 space-y-1">
                <label className="text-xs font-bold text-slate-500">Flight Status</label>
                <select 
                  value={formStatus}
                  onChange={e=>setFormStatus(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-airline-500 outline-none bg-white font-medium cursor-pointer"
                >
                  <option value="Scheduled">Scheduled</option>
                  <option value="Boarding">Boarding</option>
                  <option value="Delayed">Delayed</option>
                  <option value="Cancelled">Cancelled</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              <button type="submit" className="col-span-2 mt-4 bg-airline-600 hover:bg-airline-700 text-white font-bold py-2 rounded-xl text-xs transition-colors shadow">
                Update Flight Info
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Flights;
