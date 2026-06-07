using System; // Placeholder for formatting, this is a TypeScript file.
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { flightApi, bookingApi } from '../services/api';
import { Plane, Calendar, Clock, DollarSign, User, Plus, Trash2, CheckCircle, ArrowRight } from 'lucide-react';

interface PassengerForm {
  passengerName: string;
  seatNumber: string;
}

const Booking: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const flightId = Number(id);
  const navigate = useNavigate();

  const [flight, setFlight] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [passengers, setPassengers] = useState<PassengerForm[]>([
    { passengerName: '', seatNumber: '' }
  ]);
  const [activePassengerIndex, setActivePassengerIndex] = useState<number>(0);
  const [bookingSuccess, setBookingSuccess] = useState<any>(null);
  const [bookingLoading, setBookingLoading] = useState(false);

  // Seat Selector Grid State
  // Rows 1-15, columns A-F
  const rows = Array.from({ length: 15 }, (_, i) => i + 1);
  const cols = ['A', 'B', 'C', 'D', 'E', 'F'];
  
  // Statically seed some occupied seats to make it realistic
  const [occupiedSeats] = useState<Set<string>>(() => {
    const set = new Set<string>();
    const seed = ['1A', '1F', '3B', '3C', '7D', '10A', '12E', '12F', '14C'];
    seed.forEach(s => set.add(s));
    return set;
  });

  useEffect(() => {
    const fetchFlight = async () => {
      try {
        const response = await flightApi.getById(flightId);
        setFlight(response.data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch flight details.');
        setLoading(false);
      }
    };
    fetchFlight();
  }, [flightId]);

  const addPassenger = () => {
    if (passengers.length >= 5) {
      alert('You can book up to 5 passengers at once.');
      return;
    }
    setPassengers([...passengers, { passengerName: '', seatNumber: '' }]);
    setActivePassengerIndex(passengers.length);
  };

  const removePassenger = (index: number) => {
    if (passengers.length === 1) return;
    const newList = passengers.filter((_, i) => i !== index);
    setPassengers(newList);
    setActivePassengerIndex(0);
  };

  const handleNameChange = (index: number, name: string) => {
    const newList = [...passengers];
    newList[index].passengerName = name;
    setPassengers(newList);
  };

  const selectSeat = (seat: string) => {
    if (occupiedSeats.has(seat)) return;
    
    // Check if another passenger in our booking has already selected this seat
    const alreadySelected = passengers.some((p, idx) => idx !== activePassengerIndex && p.seatNumber === seat);
    if (alreadySelected) {
      alert('This seat is already selected by another passenger in this booking.');
      return;
    }

    const newList = [...passengers];
    newList[activePassengerIndex].seatNumber = seat;
    setPassengers(newList);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate inputs
    for (let i = 0; i < passengers.length; i++) {
      if (!passengers[i].passengerName.trim()) {
        setError(`Please enter the name for Passenger #${i + 1}.`);
        return;
      }
      if (!passengers[i].seatNumber) {
        setError(`Please select a seat for Passenger #${i + 1} (${passengers[i].passengerName}).`);
        return;
      }
    }

    setBookingLoading(true);
    try {
      const payload = {
        flightId,
        passengers: passengers.map(p => ({
          passengerName: p.passengerName,
          seatNumber: p.seatNumber
        }))
      };

      const response = await bookingApi.book(payload);
      setBookingSuccess(response.data);
      setBookingLoading(false);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Booking transaction failed.');
      setBookingLoading(false);
    }
  };

  if (loading) return <div className="text-center py-20 text-slate-500">Loading flight details...</div>;
  if (!flight) return <div className="text-center py-20 text-red-500">Flight not found.</div>;

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 min-h-screen space-y-8">
      
      {/* Title Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Configure Booking</h1>
        <p className="text-sm text-slate-500">Review schedule, add passenger logs, and select seating.</p>
      </div>

      {bookingSuccess ? (
        /* --- BOOKING SUCCESS VIEW --- */
        <div className="glass-card max-w-2xl mx-auto p-8 text-center space-y-6 animate-in zoom-in-95 duration-200">
          <div className="mx-auto bg-green-100 text-green-600 p-4 rounded-full w-16 h-16 flex items-center justify-center">
            <CheckCircle className="h-8 w-8 animate-bounce" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold text-slate-800">Booking Confirmed!</h2>
            <p className="text-sm text-slate-500">Your E-Ticket and confirmation details have been processed.</p>
          </div>

          <div className="bg-slate-50 border border-slate-200/60 p-5 rounded-2xl text-left space-y-3 font-medium text-xs text-slate-700">
            <div className="flex justify-between border-b border-slate-200 pb-2">
              <span className="text-slate-400">Booking Reference:</span>
              <span className="font-mono font-bold text-airline-600 text-sm">{bookingSuccess.bookingReference}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-2">
              <span className="text-slate-400">Total Price:</span>
              <span className="font-bold text-slate-900">${bookingSuccess.totalPrice.toFixed(2)}</span>
            </div>
            <div className="space-y-1.5 pt-1">
              <span className="text-slate-400 font-bold block mb-1.5">E-Tickets generated:</span>
              {bookingSuccess.tickets.map((t: any, i: number) => (
                <div key={i} className="flex justify-between items-center bg-white p-2 rounded-lg border border-slate-100">
                  <span>{t.passengerName} (Seat <span className="font-bold text-airline-600">{t.seatNumber}</span>)</span>
                  <span className="font-mono text-slate-400">{t.ticketNumber}</span>
                </div>
              ))}
            </div>
          </div>

          <button 
            onClick={() => navigate('/dashboard/passenger')}
            className="bg-airline-600 hover:bg-airline-700 text-white font-bold px-6 py-2.5 rounded-xl shadow-md transition-all text-sm inline-flex items-center space-x-2"
          >
            <span>Go to Dashboard</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      ) : (
        /* --- BOOKING WORKSPACE --- */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT: Passenger Names and flight details */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Flight Itinerary Summary card */}
            <div className="glass-card p-6 border-l-4 border-l-airline-600">
              <h3 className="text-sm font-bold uppercase tracking-wider text-airline-600 mb-4 flex items-center space-x-1.5">
                <Plane className="h-4 w-4 transform rotate-45" />
                <span>Flight Itinerary Summary</span>
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block mb-1">Flight Number</span>
                  <span className="font-bold text-slate-800 text-sm">{flight.flightNumber}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-1">Route</span>
                  <span className="font-bold text-slate-800 text-sm">{flight.departureAirport} → {flight.arrivalAirport}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-1">Departure Schedule</span>
                  <span className="font-bold text-slate-800 text-sm">{new Date(flight.departureDate).toLocaleDateString()}</span>
                  <span className="text-slate-400 block">{flight.departureTime}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-1">Fare (Per Ticket)</span>
                  <span className="font-bold text-airline-600 text-sm">${flight.price.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3.5 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs">
                {error}
              </div>
            )}

            {/* Passengers Registry */}
            <div className="glass-panel p-6 rounded-2xl shadow-sm border border-slate-200/50 space-y-6">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="font-extrabold text-slate-800 text-base">Passenger Logs</h3>
                <button 
                  type="button" 
                  onClick={addPassenger}
                  className="text-airline-600 hover:text-airline-700 font-bold text-xs flex items-center space-x-1 hover:bg-airline-50 px-3 py-1.5 rounded-lg transition-all"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Passenger</span>
                </button>
              </div>

              <div className="space-y-4">
                {passengers.map((passenger, idx) => (
                  <div 
                    key={idx}
                    onClick={() => setActivePassengerIndex(idx)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      activePassengerIndex === idx 
                        ? 'border-airline-500 bg-airline-50/20 shadow-sm' 
                        : 'border-slate-200/60 hover:bg-slate-50/30'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Passenger #{idx + 1}</span>
                      {passengers.length > 1 && (
                        <button 
                          type="button" 
                          onClick={(e) => { e.stopPropagation(); removePassenger(idx); }}
                          className="p-1 text-slate-400 hover:text-red-500 rounded-lg hover:bg-slate-100"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xxs font-bold uppercase text-slate-500">Passenger Full Name</label>
                        <div className="relative">
                          <input 
                            required
                            type="text" 
                            placeholder="Enter passenger name"
                            value={passenger.passengerName}
                            onChange={(e) => handleNameChange(idx, e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-airline-500 outline-none pl-8"
                          />
                          <User className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xxs font-bold uppercase text-slate-500">Selected Seat</label>
                        <div className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-600 font-bold min-h-[34px] flex items-center justify-between">
                          <span>{passenger.seatNumber || 'No seat selected'}</span>
                          <span className="text-[10px] text-airline-600 bg-airline-50 px-2 py-0.5 rounded font-bold uppercase">Click selector map</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Price Calculations & Submission block */}
            <div className="flex justify-between items-center bg-slate-100/70 border border-slate-200/40 p-6 rounded-2xl">
              <div>
                <span className="text-xs text-slate-400 block font-medium">Aggregate Total</span>
                <span className="text-2xl font-extrabold text-slate-800">${(flight.price * passengers.length).toFixed(2)}</span>
                <span className="text-[10px] text-slate-400 block font-medium">({passengers.length} passenger tickets)</span>
              </div>
              <button 
                onClick={handleSubmit}
                disabled={bookingLoading}
                className="bg-airline-600 hover:bg-airline-700 disabled:bg-airline-400 text-white font-bold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center space-x-2"
              >
                <span>{bookingLoading ? 'Processing...' : 'Confirm Flight Booking'}</span>
              </button>
            </div>
          </div>

          {/* RIGHT: Visual Seat Selector Grid */}
          <div className="glass-panel p-6 rounded-3xl shadow-sm border border-slate-200/50 space-y-6">
            <div className="text-center pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-slate-800 text-sm">Select Seat</h3>
              <p className="text-[10px] text-slate-400 font-medium">
                Choose seat for <span className="text-airline-600 font-bold">Passenger #{activePassengerIndex + 1}</span>
              </p>
            </div>

            {/* Cabin Map Visual Indicator */}
            <div className="space-y-6">
              {/* Cabin layout header */}
              <div className="bg-slate-100 rounded-xl py-1 px-3 text-center text-xxs font-bold text-slate-400 uppercase tracking-widest">
                Front of Aircraft
              </div>

              {/* Grid map */}
              <div className="flex flex-col space-y-1.5 items-center">
                {rows.map((row) => (
                  <div key={row} className="flex items-center space-x-1.5 text-xs">
                    {/* Left half: A B C */}
                    {cols.slice(0, 3).map((col) => {
                      const seat = `${row}${col}`;
                      const isOccupied = occupiedSeats.has(seat);
                      const isSelectedBySelf = passengers[activePassengerIndex].seatNumber === seat;
                      const isSelectedByOtherInGroup = passengers.some((p, i) => i !== activePassengerIndex && p.seatNumber === seat);
                      
                      let seatClass = 'bg-slate-100 hover:bg-airline-100 text-slate-600 border border-slate-200 hover:border-airline-300';
                      if (isOccupied) seatClass = 'bg-slate-200 text-slate-400 cursor-not-allowed';
                      else if (isSelectedBySelf) seatClass = 'bg-airline-600 text-white border border-airline-700';
                      else if (isSelectedByOtherInGroup) seatClass = 'bg-airline-100 text-airline-600 border border-airline-200 cursor-not-allowed';

                      return (
                        <button
                          key={col}
                          type="button"
                          disabled={isOccupied}
                          onClick={() => selectSeat(seat)}
                          className={`w-7 h-7 rounded flex items-center justify-center font-bold text-[10px] transition-all scale-95 ${seatClass}`}
                        >
                          {col}
                        </button>
                      );
                    })}

                    {/* Row Number Aisle */}
                    <div className="w-6 text-center text-[10px] font-bold text-slate-300 select-none">
                      {row}
                    </div>

                    {/* Right half: D E F */}
                    {cols.slice(3, 6).map((col) => {
                      const seat = `${row}${col}`;
                      const isOccupied = occupiedSeats.has(seat);
                      const isSelectedBySelf = passengers[activePassengerIndex].seatNumber === seat;
                      const isSelectedByOtherInGroup = passengers.some((p, i) => i !== activePassengerIndex && p.seatNumber === seat);
                      
                      let seatClass = 'bg-slate-100 hover:bg-airline-100 text-slate-600 border border-slate-200 hover:border-airline-300';
                      if (isOccupied) seatClass = 'bg-slate-200 text-slate-400 cursor-not-allowed';
                      else if (isSelectedBySelf) seatClass = 'bg-airline-600 text-white border border-airline-700';
                      else if (isSelectedByOtherInGroup) seatClass = 'bg-airline-100 text-airline-600 border border-airline-200 cursor-not-allowed';

                      return (
                        <button
                          key={col}
                          type="button"
                          disabled={isOccupied}
                          onClick={() => selectSeat(seat)}
                          className={`w-7 h-7 rounded flex items-center justify-center font-bold text-[10px] transition-all scale-95 ${seatClass}`}
                        >
                          {col}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>

              {/* Cabin Aisle footer */}
              <div className="bg-slate-100 rounded-xl py-1 px-3 text-center text-xxs font-bold text-slate-400 uppercase tracking-widest">
                Rear of Aircraft
              </div>

              {/* Legend map */}
              <div className="grid grid-cols-3 gap-2 pt-4 border-t border-slate-100 text-[10px] font-semibold text-slate-500">
                <div className="flex items-center space-x-1.5">
                  <div className="w-3.5 h-3.5 bg-slate-100 border border-slate-200 rounded"></div>
                  <span>Available</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <div className="w-3.5 h-3.5 bg-slate-200 rounded"></div>
                  <span>Occupied</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <div className="w-3.5 h-3.5 bg-airline-600 rounded"></div>
                  <span>Selected</span>
                </div>
              </div>

            </div>
          </div>

        </div>
      )}

    </div>
  );
};

export default Booking;
