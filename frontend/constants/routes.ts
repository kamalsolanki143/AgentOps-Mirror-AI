// ── App Routes ────────────────────────────────────────────────────────────

export const ROUTES = {
  // Public
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",

  // App
  DASHBOARD: "/dashboard",

  // Stress Test
  STRESS_TEST: "/stress-test",
  STRESS_TEST_RUN: (runId: string) => `/stress-test/${runId}`,

  // Personas
  PERSONAS: "/personas",
  PERSONA_DETAIL: (personaId: string) => `/personas/${personaId}`,

  // Reports
  REPORTS: "/reports",
  REPORT_DETAIL: (reportId: string) => `/reports/${reportId}`,

  // Replay
  REPLAY: (conversationId: string) => `/replay/${conversationId}`,

  // Analytics
  ANALYTICS: "/analytics",

  // Settings & Integrations
  SETTINGS: "/settings",
  INTEGRATIONS: "/integrations",
} as const;

// Nav items for sidebar
export const NAV_ITEMS = [
  {
    label: "Dashboard",
    href: ROUTES.DASHBOARD,
    icon: "LayoutDashboard",
  },
  {
    label: "Stress Tests",
    href: ROUTES.STRESS_TEST,
    icon: "Zap",
  },
  {
    label: "Personas",
    href: ROUTES.PERSONAS,
    icon: "Users",
  },
  {
    label: "Reports",
    href: ROUTES.REPORTS,
    icon: "FileText",
  },
  {
    label: "Analytics",
    href: ROUTES.ANALYTICS,
    icon: "BarChart2",
  },
  {
    label: "Integrations",
    href: ROUTES.INTEGRATIONS,
    icon: "Plug",
  },
  {
    label: "Settings",
    href: ROUTES.SETTINGS,
    icon: "Settings",
  },
] as const;
