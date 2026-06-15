import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import Layout from '../components/ui/Layout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Alert from '../components/ui/Alert';
import LoadingSpinner from '../components/ui/LoadingSpinner';

export default function FlightDetailsPage() {
  const { id } = useParams();
  const [flight, setFlight] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchFlight = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/flights/${id}`);
        setFlight(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch flight details');
      } finally {
        setLoading(false);
      }
    };
    fetchFlight();
  }, [id]);

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center my-12">
          <LoadingSpinner size="lg" />
        </div>
      </Layout>
    );
  }

  if (error || !flight) {
    return (
      <Layout>
        <div className="max-w-3xl mx-auto">
          <Alert type="error">{error || 'Flight not found'}</Alert>
          <div className="mt-4">
            <Link to="/flights">
              <Button variant="secondary">Back to Search</Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-primary">Flight Details</h1>
          <Link to="/flights">
            <Button variant="secondary">Back to Search</Button>
          </Link>
        </div>

        <Card className="p-8 mb-6">
          <div className="flex justify-between items-center mb-8 border-b pb-6">
            <div>
              <p className="text-sm text-muted">Flight Number</p>
              <p className="text-3xl font-bold text-primary">{flight.flightNumber}</p>
              <p className="text-md text-muted mt-1">{flight.airline}</p>
            </div>
            <span
              className={`px-4 py-1 rounded-full text-sm font-medium ${
                flight.status === 'Scheduled' ? 'bg-blue-100 text-blue-800' :
                flight.status === 'Delayed' ? 'bg-yellow-100 text-yellow-800' :
                flight.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                'bg-green-100 text-green-800'
              }`}
            >
              {flight.status}
            </span>
          </div>
          
          <div className="flex justify-between items-center mb-8 relative">
            <div className="text-center w-1/3">
              <p className="text-sm text-muted">Departure</p>
              <p className="font-bold text-2xl">{flight.departureAirport}</p>
              <p className="text-md text-muted mt-2">
                {new Date(flight.departureTime).toLocaleDateString()}
              </p>
              <p className="text-lg font-medium text-primary">
                {new Date(flight.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
            
            <div className="w-1/3 flex flex-col items-center">
              <div className="w-full border-t-2 border-dashed border-gray-300 relative mb-2">
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-2xl text-primary bg-white px-2">
                  ✈️
                </div>
              </div>
            </div>
            
            <div className="text-center w-1/3">
              <p className="text-sm text-muted">Arrival</p>
              <p className="font-bold text-2xl">{flight.arrivalAirport}</p>
              <p className="text-md text-muted mt-2">
                {new Date(flight.arrivalTime).toLocaleDateString()}
              </p>
              <p className="text-lg font-medium text-primary">
                {new Date(flight.arrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-6 flex justify-around">
            <div className="text-center">
              <p className="text-sm text-muted mb-1">Price per passenger</p>
              <p className="font-bold text-3xl text-primary">${flight.price}</p>
            </div>
            <div className="border-l border-gray-200"></div>
            <div className="text-center">
              <p className="text-sm text-muted mb-1">Available Seats</p>
              <p className={`font-bold text-3xl ${flight.availableSeats > 0 ? 'text-success' : 'text-danger'}`}>
                {flight.availableSeats} <span className="text-lg font-normal text-muted">/ {flight.totalSeats}</span>
              </p>
            </div>
          </div>
        </Card>

        {flight.availableSeats > 0 ? (
          <Link to={`/booking/${flight._id}`} className="block">
            <Button variant="accent" className="w-full py-4 text-xl shadow-lg hover:shadow-xl transition-shadow">
              Book This Flight
            </Button>
          </Link>
        ) : (
          <Alert type="warning" className="text-center">
            This flight is fully booked.
          </Alert>
        )}
      </div>
    </Layout>
  );
}
