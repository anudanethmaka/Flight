import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plane, Calendar, Search, MapPin, Sparkles, Shield, Award } from 'lucide-react';

const Landing: React.FC = () => {
  const navigate = useNavigate();
  const [departure, setDeparture] = useState('');
  const [arrival, setArrival] = useState('');
  const [date, setDate] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (departure) params.append('departure', departure);
    if (arrival) params.append('arrival', arrival);
    if (date) params.append('date', date);
    navigate(`/flights?${params.toString()}`);
  };

  const destinations = [
    { name: 'London, UK', code: 'LHR', image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=600&auto=format&fit=crop', price: '$620' },
    { name: 'Singapore', code: 'SIN', image: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=600&auto=format&fit=crop', price: '$350' },
    { name: 'Tokyo, Japan', code: 'HND', image: 'https://images.unsplash.com/photo-1540959733332-eab4deceeaf7?w=600&auto=format&fit=crop', price: '$450' }
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      {/* Hero Header Banner */}
      <div className="relative bg-gradient-to-r from-airline-900 via-airline-800 to-airline-600 text-white py-32 px-6 overflow-hidden rounded-b-[40px] shadow-lg">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.1),transparent_50%)]"></div>
        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-6">
          <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md border border-white/20 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider text-airline-200">
            <Sparkles className="h-3.5 w-3.5 text-airline-300" />
            <span>Welcome to the future of air travel</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight">
            Connect Globally, Fly Seamlessly
          </h1>
          <p className="text-lg md:text-xl text-airline-100 max-w-2xl mx-auto font-light leading-relaxed">
            Search and book tickets dynamically across five-star global routes with SkyLink's microservice-powered platform.
          </p>
        </div>
      </div>

      {/* Flight Booking / Search Widget Container */}
      <div className="max-w-5xl mx-auto -mt-16 px-6">
        <form 
          onSubmit={handleSearch}
          className="glass-panel p-8 rounded-3xl shadow-xl border border-white/50 flex flex-col md:flex-row gap-4 items-end"
        >
          {/* Departure Airport */}
          <div className="flex-1 w-full space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center space-x-1">
              <MapPin className="h-3 w-3 text-airline-500" />
              <span>From</span>
            </label>
            <div className="relative">
              <input 
                type="text" 
                placeholder="Departure Airport (e.g. CMB)"
                value={departure}
                onChange={(e) => setDeparture(e.target.value)}
                className="w-full bg-white/80 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-airline-500 focus:border-transparent transition-all shadow-sm pl-10"
              />
              <MapPin className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
            </div>
          </div>

          {/* Arrival Airport */}
          <div className="flex-1 w-full space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center space-x-1">
              <MapPin className="h-3 w-3 text-airline-500" />
              <span>To</span>
            </label>
            <div className="relative">
              <input 
                type="text" 
                placeholder="Arrival Airport (e.g. SIN)"
                value={arrival}
                onChange={(e) => setArrival(e.target.value)}
                className="w-full bg-white/80 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-airline-500 focus:border-transparent transition-all shadow-sm pl-10"
              />
              <MapPin className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
            </div>
          </div>

          {/* Departure Date */}
          <div className="flex-1 w-full space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center space-x-1">
              <Calendar className="h-3 w-3 text-airline-500" />
              <span>Date</span>
            </label>
            <div className="relative">
              <input 
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-white/80 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-airline-500 focus:border-transparent transition-all shadow-sm pl-10"
              />
              <Calendar className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
            </div>
          </div>

          {/* Submit Search button */}
          <button 
            type="submit"
            className="w-full md:w-auto bg-airline-600 hover:bg-airline-700 text-white font-bold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center space-x-2 h-[46px]"
          >
            <Search className="h-5 w-5" />
            <span>Search</span>
          </button>
        </form>
      </div>

      {/* Core Features */}
      <div className="max-w-5xl mx-auto px-6 mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
        <div className="glass-card p-6 flex flex-col items-center space-y-3">
          <div className="p-3 bg-blue-100 text-airline-600 rounded-2xl">
            <Shield className="h-6 w-6" />
          </div>
          <h3 className="font-bold text-slate-800 text-base">Secure Bookings</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Stateless role-based JWT validation protects all transactional and booking steps.
          </p>
        </div>
        <div className="glass-card p-6 flex flex-col items-center space-y-3">
          <div className="p-3 bg-green-100 text-green-600 rounded-2xl">
            <Award className="h-6 w-6" />
          </div>
          <h3 className="font-bold text-slate-800 text-base">Elite Seating</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Choose standard or premium cabin seats dynamically during confirmation.
          </p>
        </div>
        <div className="glass-card p-6 flex flex-col items-center space-y-3">
          <div className="p-3 bg-purple-100 text-purple-600 rounded-2xl">
            <Plane className="h-6 w-6 transform rotate-45" />
          </div>
          <h3 className="font-bold text-slate-800 text-base">Live Updates</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Simulated email dispatch alerts you instantly on delay or cancellation events.
          </p>
        </div>
      </div>

      {/* Destination Promos */}
      <div className="max-w-5xl mx-auto px-6 mt-24 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800">Popular Destinations</h2>
          <p className="text-sm text-slate-500">Explore our most booked routes at premium rates</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {destinations.map((dest, i) => (
            <div 
              key={i} 
              onClick={() => {
                setArrival(dest.code);
                // scroll to top where the widget is
                window.scrollTo({ top: 150, behavior: 'smooth' });
              }}
              className="group cursor-pointer rounded-2xl overflow-hidden shadow-sm hover:shadow-md border border-slate-200/60 bg-white transition-all duration-300"
            >
              <div className="h-48 overflow-hidden relative">
                <img 
                  src={dest.image} 
                  alt={dest.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                />
                <span className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-airline-600 shadow-sm">
                  {dest.price}
                </span>
              </div>
              <div className="p-4 flex justify-between items-center bg-white">
                <div>
                  <h4 className="font-bold text-slate-800 text-sm group-hover:text-airline-600 transition-colors">{dest.name}</h4>
                  <span className="text-xs text-slate-400 font-semibold">{dest.code} Airport</span>
                </div>
                <div className="p-2 bg-slate-50 group-hover:bg-airline-50 rounded-full transition-colors text-slate-400 group-hover:text-airline-600">
                  <Plane className="h-4 w-4 transform rotate-45" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Landing;
