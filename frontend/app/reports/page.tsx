export default function ReportsPage() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Reports</h1>
      <button className="btn-primary mb-6">Generate Report</button>
      <div className="card">
        <p className="text-gray-500">No reports yet. Run a stress test to generate reports.</p>
      </div>
    </div>
  );
}
