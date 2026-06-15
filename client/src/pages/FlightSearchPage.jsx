import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../services/api';
import Layout from '../components/ui/Layout';
import Card from '../components/ui/Card';
import Alert from '../components/ui/Alert';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';

export default function FlightSearchPage() {
  const [searchParams] = useSearchParams();
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const from = searchParams.get('from') || '';
  const to = searchParams.get('to') || '';
  const date = searchParams.get('date') || '';

  useEffect(() => {
    const fetchFlights = async () => {
      setLoading(true);
      setError('');
      try {
        const query = new URLSearchParams();
        if (from) query.set('from', from);
        if (to) query.set('to', to);
        if (date) query.set('date', date);

        const { data } = await api.get(`/flights/search?${query.toString()}`);
        setFlights(data);
      } catch (err) {
        setError('Failed to fetch flights. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchFlights();
  }, [from, to, date]);

  return (
    <Layout>
      <h1 className="text-2xl font-bold text-primary mb-6">Flight Search Results</h1>

      {loading ? (
        <div className="flex justify-center my-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : error ? (
        <Alert type="error" className="mb-6">{error}</Alert>
      ) : flights.length === 0 ? (
        <Alert type="info" className="mb-6">No flights found matching your search criteria.</Alert>
      ) : (
        <div className="space-y-4">
          {flights.map((flight) => (
            <Card key={flight._id} className="flex flex-col md:flex-row items-center justify-between p-6 gap-4">
              <div className="w-full md:w-auto text-center md:text-left">
                <p className="font-semibold text-primary">{flight.flightNumber}</p>
                <p className="text-sm text-muted">{flight.airline}</p>
              </div>
              <div className="flex w-full md:w-auto items-center justify-between md:justify-center gap-8">
                <div className="text-center">
                  <p className="font-medium">{flight.departureAirport}</p>
                  <p className="text-xs text-muted">
                    {new Date(flight.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <div className="text-muted text-lg">✈️</div>
                <div className="text-center">
                  <p className="font-medium">{flight.arrivalAirport}</p>
                  <p className="text-xs text-muted">
                    {new Date(flight.arrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
              <div className="w-full md:w-auto flex items-center justify-between md:flex-col md:items-end gap-2">
                <div className="text-left md:text-right">
                  <p className="text-lg font-bold text-primary">${flight.price}</p>
                  <p className={`text-xs ${flight.availableSeats > 0 ? 'text-success' : 'text-danger'}`}>
                    {flight.availableSeats} seats available
                  </p>
                </div>
                <Link to={`/flights/${flight._id}`}>
                  <Button variant="primary">View Details</Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </Layout>
  );
}
