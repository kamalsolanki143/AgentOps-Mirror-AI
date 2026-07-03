export default function AnalyticsPage() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Analytics</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card"><h3 className="font-semibold mb-2">Latency Distribution</h3><p className="text-gray-500">Chart loading...</p></div>
        <div className="card"><h3 className="font-semibold mb-2">Vulnerability Breakdown</h3><p className="text-gray-500">Chart loading...</p></div>
        <div className="card"><h3 className="font-semibold mb-2">Score Trends</h3><p className="text-gray-500">Chart loading...</p></div>
        <div className="card"><h3 className="font-semibold mb-2">Agent Performance</h3><p className="text-gray-500">Chart loading...</p></div>
      </div>
    </div>
  );
}
