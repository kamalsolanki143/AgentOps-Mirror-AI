"use client";
import { useState, useCallback } from "react";
import { useAppStore } from "@/store/useAppStore";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/constants/routes";
import { authService } from "@/services/auth.service";

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
        const response = await authService.login(email, password);
        const { access_token, refresh_token, ...userData } = response;
        setUser({ ...userData } as any, access_token, refresh_token);
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
        let response;
        try {
          response = await authService.register(name, email, password);
        } catch (err: any) {
          if (err.status === 409 || (err.message && err.message.includes("409"))) {
            console.log("User already exists, attempting automatic login...");
            response = await authService.login(email, password);
          } else {
            throw err;
          }
        }
        const { access_token, refresh_token, ...userData } = response;
        setUser({ ...userData } as any, access_token, refresh_token);
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
