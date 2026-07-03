import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-primary-900 to-gray-900 text-white">
      <h1 className="text-5xl font-bold mb-4">AgentOps Mirror AI</h1>
      <p className="text-xl text-gray-300 mb-8 max-w-xl text-center">
        Stress-test, audit, and optimize your AI agents with persona-based simulations.
      </p>
      <div className="flex gap-4">
        <Link href="/login" className="bg-white text-gray-900 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition">
          Get Started
        </Link>
        <Link href="/register" className="border border-white px-6 py-3 rounded-lg font-medium hover:bg-white/10 transition">
          Register
        </Link>
      </div>
    </main>
  );
}
