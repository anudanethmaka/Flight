import Layout from '../components/ui/Layout';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Alert from '../components/ui/Alert';

export default function BookingPage() {
  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-primary mb-6">Book Flight</h1>
        <Alert type="info" className="mb-6">Booking functionality will be implemented in Phase 4.</Alert>

        <Card className="p-8 mb-6">
          <h2 className="text-lg font-semibold text-primary mb-4">Passenger Details</h2>
          <Input label="Passenger Name" placeholder="Full name as on ID" />
          <Input label="Age" type="number" placeholder="Age" />
        </Card>

        <Card className="p-8 mb-6">
          <h2 className="text-lg font-semibold text-primary mb-4">Seat Selection</h2>
          <p className="text-muted text-sm mb-4">Seat map will be displayed here.</p>
          <div className="grid grid-cols-6 gap-2">
            {Array.from({ length: 18 }, (_, i) => (
              <div
                key={i}
                className={`h-10 rounded-md flex items-center justify-center text-xs font-medium ${
                  i % 5 === 0
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-100 text-primary hover:bg-primary hover:text-white cursor-pointer transition-colors'
                }`}
              >
                {String.fromCharCode(65 + Math.floor(i / 6))}{(i % 6) + 1}
              </div>
            ))}
          </div>
        </Card>

        <Button className="w-full py-3 text-lg">Confirm Booking</Button>
      </div>
    </Layout>
  );
}
