import Layout from '../components/ui/Layout';
import Card from '../components/ui/Card';
import Alert from '../components/ui/Alert';

export default function UserDashboardPage() {
  return (
    <Layout>
      <h1 className="text-2xl font-bold text-primary mb-6">My Dashboard</h1>
      <Alert type="info" className="mb-6">Dashboard data will be loaded in Phase 4.</Alert>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card className="p-6 text-center">
          <p className="text-sm text-muted">Total Bookings</p>
          <p className="text-3xl font-bold text-primary">--</p>
        </Card>
        <Card className="p-6 text-center">
          <p className="text-sm text-muted">Upcoming Flights</p>
          <p className="text-3xl font-bold text-accent">--</p>
        </Card>
        <Card className="p-6 text-center">
          <p className="text-sm text-muted">Cancelled</p>
          <p className="text-3xl font-bold text-danger">--</p>
        </Card>
      </div>

      {/* Recent Bookings */}
      <h2 className="text-xl font-semibold text-primary mb-4">Recent Bookings</h2>
      <Card className="p-6">
        <p className="text-muted text-center py-8">Your bookings will appear here once you book a flight.</p>
      </Card>
    </Layout>
  );
}
