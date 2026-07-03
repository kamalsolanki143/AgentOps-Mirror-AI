export default function DashboardPage() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="card"><p className="text-gray-500 text-sm">Tests Run</p><p className="text-3xl font-bold">0</p></div>
        <div className="card"><p className="text-gray-500 text-sm">Personas</p><p className="text-3xl font-bold">0</p></div>
        <div className="card"><p className="text-gray-500 text-sm">Vulnerabilities</p><p className="text-3xl font-bold">0</p></div>
        <div className="card"><p className="text-gray-500 text-sm">Avg Score</p><p className="text-3xl font-bold">—</p></div>
      </div>
    </div>
  );
}
