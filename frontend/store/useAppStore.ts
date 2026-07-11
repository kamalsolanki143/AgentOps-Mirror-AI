import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Agent } from "@/types/agent.types";
import type { StressTestRun } from "@/types/run.types";

// ── User Session ──────────────────────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: "admin" | "developer" | "viewer";
  orgName?: string;
}

// ── App Store ─────────────────────────────────────────────────────────────

interface AppState {
  // Auth
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;

  // Active context
  activeAgent: Agent | null;
  activeRun: StressTestRun | null;

  // UI state
  sidebarCollapsed: boolean;

  // Actions — Auth
  setUser: (user: User, token: string, refreshToken?: string) => void;
  clearAuth: () => void;

  // Actions — Context
  setActiveAgent: (agent: Agent | null) => void;
  setActiveRun: (run: StressTestRun | null) => void;

  // Actions — UI
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Initial state
      user: null,
      token: null,
      isAuthenticated: false,
      activeAgent: null,
      activeRun: null,
      sidebarCollapsed: false,

      // Auth actions
      setUser: (user, token, refreshToken) => {
        // Also write token to localStorage for apiClient + cookie for middleware
        if (typeof window !== "undefined") {
          localStorage.setItem("agentops_token", token);
          document.cookie = `agentops_token=${token}; path=/; max-age=${60 * 60 * 24 * 7}`;
          if (refreshToken) {
            localStorage.setItem("agentops_refresh_token", refreshToken);
            document.cookie = `agentops_refresh_token=${refreshToken}; path=/; max-age=${60 * 60 * 24 * 7}`;
          }
        }
        set({ user, token, isAuthenticated: true });
      },

      clearAuth: () => {
        if (typeof window !== "undefined") {
          localStorage.removeItem("agentops_token");
          localStorage.removeItem("agentops_refresh_token");
          document.cookie = "agentops_token=; path=/; max-age=0";
          document.cookie = "agentops_refresh_token=; path=/; max-age=0";
        }
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          activeAgent: null,
          activeRun: null,
        });
      },

      // Context actions
      setActiveAgent: (agent) => set({ activeAgent: agent }),
      setActiveRun: (run) => set({ activeRun: run }),

      // UI actions
      toggleSidebar: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
    }),
    {
      name: "agentops-store",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        sidebarCollapsed: state.sidebarCollapsed,
      }),
    }
  )
);
