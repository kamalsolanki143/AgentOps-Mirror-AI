import type { Metadata } from "next";
import { AuthForm } from "@/components/forms/AuthForm";
import { Logo } from "@/components/common/Logo";

export const metadata: Metadata = {
  title: "Sign In",
};

export default function LoginPage() {
  return (
    <div className="min-h-dvh bg-bg-base flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Logo size="lg" href="/" />
        </div>

        {/* Card */}
        <div className="bg-bg-surface rounded-3xl border border-[#E5E7EB] shadow-card p-8">
          <div className="mb-6 text-center">
            <h1 className="text-xl font-bold font-display text-ink mb-1">
              Welcome back
            </h1>
            <p className="text-sm text-ink-muted">
              Sign in to your AgentOps account
            </p>
          </div>

          <AuthForm mode="login" />

          <p className="text-center text-2xs text-ink-muted mt-6">
            Demo credentials pre-filled · any password ≥ 6 chars works
          </p>
        </div>
      </div>
    </div>
  );
}
