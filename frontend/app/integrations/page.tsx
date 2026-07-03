export default function IntegrationsPage() {
  const integrations = [
    { name: "GitHub", desc: "Create issues from audit findings" },
    { name: "Jira", desc: "Sync reports with Jira tickets" },
    { name: "Slack", desc: "Send alerts to Slack channels" },
    { name: "Teams", desc: "Post updates to Microsoft Teams" },
    { name: "Email", desc: "Email report summaries" },
    { name: "Webhook", desc: "Custom webhook notifications" },
  ];

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Integrations</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {integrations.map((i) => (
          <div key={i.name} className="card">
            <h3 className="font-semibold text-lg">{i.name}</h3>
            <p className="text-gray-500 text-sm mt-1">{i.desc}</p>
            <button className="btn-primary mt-4 text-sm">Configure</button>
          </div>
        ))}
      </div>
    </div>
  );
}
