import Layout from '../components/ui/Layout';
import Card from '../components/ui/Card';
import Alert from '../components/ui/Alert';

export default function FlightSearchPage() {
  return (
    <Layout>
      <h1 className="text-2xl font-bold text-primary mb-6">Flight Search Results</h1>
      <Alert type="info" className="mb-6">Flight search results will be displayed here in Phase 4.</Alert>

      {/* Placeholder flight cards */}
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="flex items-center justify-between p-6">
            <div>
              <p className="font-semibold text-primary">SKY-{100 + i}</p>
              <p className="text-sm text-muted">SkyLink Airlines</p>
            </div>
            <div className="text-center">
              <p className="font-medium">DEP → ARR</p>
              <p className="text-xs text-muted">Departure → Arrival</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted">Duration</p>
              <p className="font-medium">--h --m</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-primary">$---</p>
              <p className="text-xs text-success">Seats available</p>
            </div>
          </Card>
        ))}
      </div>
    </Layout>
  );
}
