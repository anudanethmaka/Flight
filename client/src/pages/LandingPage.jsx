import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/ui/Layout';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

export default function LandingPage() {
  const navigate = useNavigate();
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [date, setDate] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (from) params.set('from', from);
    if (to) params.set('to', to);
    if (date) params.set('date', date);
    navigate(`/flights?${params.toString()}`);
  };

  return (
    <Layout>
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-primary-dark via-primary to-primary-light rounded-2xl p-12 text-white mb-12 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-10 w-64 h-64 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 left-10 w-48 h-48 bg-accent rounded-full blur-3xl" />
        </div>
        <div className="relative z-10">
          <h1 className="text-4xl font-bold mb-2">Fly with SkyLink</h1>
          <p className="text-lg text-blue-100 mb-8">Discover and book flights to your favorite destinations worldwide.</p>

          {/* Flight Search Form */}
          <form onSubmit={handleSearch} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 max-w-3xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-blue-100">From</label>
                <input
                  type="text"
                  placeholder="Departure city"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  className="w-full px-3 py-2 rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-blue-100">To</label>
                <input
                  type="text"
                  placeholder="Arrival city"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  className="w-full px-3 py-2 rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-blue-100">Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
            </div>
            <Button type="submit" variant="accent" className="w-full md:w-auto px-8 py-2.5 text-lg">
              🔍 Search Flights
            </Button>
          </form>
        </div>
      </div>

      {/* Features Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <Card className="text-center p-6">
          <div className="text-4xl mb-3">🌍</div>
          <h3 className="font-semibold text-lg text-primary mb-2">Global Destinations</h3>
          <p className="text-muted text-sm">Search flights to hundreds of destinations around the world.</p>
        </Card>
        <Card className="text-center p-6">
          <div className="text-4xl mb-3">💺</div>
          <h3 className="font-semibold text-lg text-primary mb-2">Seat Selection</h3>
          <p className="text-muted text-sm">Choose your preferred seat when booking your flight.</p>
        </Card>
        <Card className="text-center p-6">
          <div className="text-4xl mb-3">🔔</div>
          <h3 className="font-semibold text-lg text-primary mb-2">Real-time Updates</h3>
          <p className="text-muted text-sm">Get notified about flight delays, cancellations, and booking confirmations.</p>
        </Card>
      </div>

      {/* Chatbot Widget Placeholder — Dev 4 will implement ChatWidget here */}
      <div id="chatbot-placeholder" />
    </Layout>
  );
}
