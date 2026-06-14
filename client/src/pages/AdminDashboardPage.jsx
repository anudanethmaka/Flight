import Layout from '../components/ui/Layout';
import Card from '../components/ui/Card';
import Alert from '../components/ui/Alert';

export default function AdminDashboardPage() {
  return (
    <Layout>
      <h1 className="text-2xl font-bold text-primary mb-6">Admin Dashboard</h1>
      <Alert type="info" className="mb-6">Admin functionality will be implemented in Phase 3.</Alert>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="p-6 text-center">
          <p className="text-sm text-muted">Total Users</p>
          <p className="text-3xl font-bold text-primary">--</p>
        </Card>
        <Card className="p-6 text-center">
          <p className="text-sm text-muted">Total Flights</p>
          <p className="text-3xl font-bold text-primary">--</p>
        </Card>
        <Card className="p-6 text-center">
          <p className="text-sm text-muted">Total Bookings</p>
          <p className="text-3xl font-bold text-accent">--</p>
        </Card>
        <Card className="p-6 text-center">
          <p className="text-sm text-muted">Revenue</p>
          <p className="text-3xl font-bold text-success">$--</p>
        </Card>
      </div>

      {/* Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h2 className="text-xl font-semibold text-primary mb-4">Flights Management</h2>
          <Card className="p-6">
            <p className="text-muted text-center py-8">Flight management table will be here.</p>
          </Card>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-primary mb-4">Users</h2>
          <Card className="p-6">
            <p className="text-muted text-center py-8">Users table will be here.</p>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
