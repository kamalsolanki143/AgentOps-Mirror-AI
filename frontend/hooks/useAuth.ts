"use client";
import { useState, useCallback } from "react";
import { useAppStore } from "@/store/useAppStore";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/constants/routes";

// Mock user for demo
const MOCK_USER = {
  id: "user-001",
  name: "Muskan Yeshminali",
  email: "muskan@agentops.ai",
  role: "admin" as const,
  orgName: "AgentOps Demo",
  avatarUrl: undefined,
};

export function useAuth() {
  const { user, isAuthenticated, setUser, clearAuth } = useAppStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const login = useCallback(
    async (email: string, password: string) => {
      setLoading(true);
      setError(null);
      try {
        // Simulate API call
        await new Promise((r) => setTimeout(r, 800));
        if (password.length < 6) {
          throw new Error("Invalid credentials");
        }
        const mockToken = `mock-jwt-${Date.now()}`;
        setUser({ ...MOCK_USER, email }, mockToken);
        router.push(ROUTES.DASHBOARD);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Login failed");
      } finally {
        setLoading(false);
      }
    },
    [setUser, router]
  );

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      setLoading(true);
      setError(null);
      try {
        await new Promise((r) => setTimeout(r, 1000));
        if (password.length < 6) {
          throw new Error("Password must be at least 6 characters");
        }
        const mockToken = `mock-jwt-${Date.now()}`;
        setUser({ ...MOCK_USER, name, email }, mockToken);
        router.push(ROUTES.DASHBOARD);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Registration failed");
      } finally {
        setLoading(false);
      }
    },
    [setUser, router]
  );

  const logout = useCallback(() => {
    clearAuth();
    router.push(ROUTES.LOGIN);
  }, [clearAuth, router]);

  return { user, isAuthenticated, loading, error, login, register, logout };
}
