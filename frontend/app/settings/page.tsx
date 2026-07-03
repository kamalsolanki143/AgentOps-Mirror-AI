export default function SettingsPage() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>
      <div className="card max-w-2xl">
        <h2 className="text-xl font-semibold mb-4">Profile</h2>
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input type="text" className="input" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input type="email" className="input" />
          </div>
          <button type="submit" className="btn-primary">Save</button>
        </form>
      </div>
    </div>
  );
}
