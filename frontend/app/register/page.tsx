import type { Metadata } from "next";
import { AuthForm } from "@/components/forms/AuthForm";
import { Logo } from "@/components/common/Logo";

export const metadata: Metadata = {
  title: "Create Account",
};

export default function RegisterPage() {
  return (
    <div className="min-h-dvh bg-bg-base flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-8">
          <Logo size="lg" href="/" />
        </div>

        <div className="bg-bg-surface rounded-3xl border border-[#E5E7EB] shadow-card p-8">
          <div className="mb-6 text-center">
            <h1 className="text-xl font-bold font-display text-ink mb-1">
              Create your account
            </h1>
            <p className="text-sm text-ink-muted">
              Start testing your AI agents for free
            </p>
          </div>

          <AuthForm mode="register" />
        </div>
      </div>
    </div>
  );
}
