import Layout from '../components/ui/Layout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Alert from '../components/ui/Alert';

export default function FlightDetailsPage() {
  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-primary mb-6">Flight Details</h1>
        <Alert type="info" className="mb-6">Flight details will be loaded dynamically in Phase 4.</Alert>

        <Card className="p-8 mb-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <p className="text-sm text-muted">Flight Number</p>
              <p className="text-2xl font-bold text-primary">SKY-101</p>
            </div>
            <span className="bg-green-100 text-success px-3 py-1 rounded-full text-sm font-medium">Scheduled</span>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-muted">Departure</p>
              <p className="font-semibold">Airport A</p>
              <p className="text-sm text-muted">-- : -- AM</p>
            </div>
            <div>
              <p className="text-sm text-muted">Arrival</p>
              <p className="font-semibold">Airport B</p>
              <p className="text-sm text-muted">-- : -- PM</p>
            </div>
            <div>
              <p className="text-sm text-muted">Price</p>
              <p className="font-semibold text-xl">$---</p>
            </div>
            <div>
              <p className="text-sm text-muted">Available Seats</p>
              <p className="font-semibold text-xl">---</p>
            </div>
          </div>
        </Card>

        <Button className="w-full py-3 text-lg">Book This Flight</Button>
      </div>
    </Layout>
  );
}
