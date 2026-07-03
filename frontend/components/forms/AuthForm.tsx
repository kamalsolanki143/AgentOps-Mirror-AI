"use client";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

import Link from "next/link";
import { Mail, Lock, User } from "lucide-react";

interface AuthFormProps {
  mode: "login" | "register";
}

export function AuthForm({ mode }: AuthFormProps) {
  const { login, register, loading, error } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("demo@agentops.ai");
  const [password, setPassword] = useState("demo1234");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "login") {
      await login(email, password);
    } else {
      await register(name, email, password);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full" noValidate>
      {mode === "register" && (
        <Input
          label="Full Name"
          type="text"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          leftIcon={<User className="w-4 h-4" />}
          autoComplete="name"
        />
      )}
      <Input
        label="Email"
        type="email"
        placeholder="you@company.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        leftIcon={<Mail className="w-4 h-4" />}
        autoComplete="email"
      />
      <Input
        label="Password"
        type="password"
        placeholder="••••••••"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        leftIcon={<Lock className="w-4 h-4" />}
        autoComplete={mode === "login" ? "current-password" : "new-password"}
        error={error ?? undefined}
      />

      <Button
        type="submit"
        variant="gradient"
        size="lg"
        loading={loading}
        className="w-full"
      >
        {mode === "login" ? "Sign In" : "Create Account"}
      </Button>

      <p className="text-center text-xs text-ink-muted">
        {mode === "login" ? (
          <>Don&apos;t have an account?{" "}
            <Link href="/register" className="text-primary font-medium hover:underline">
              Sign up
            </Link>
          </>
        ) : (
          <>Already have an account?{" "}
            <Link href="/login" className="text-primary font-medium hover:underline">
              Sign in
            </Link>
          </>
        )}
      </p>
    </form>
  );
}
