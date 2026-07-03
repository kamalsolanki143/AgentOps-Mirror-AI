"use client";
import { useState } from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/utils/cn";

interface Integration {
  id: string;
  name: string;
  description: string;
  emoji: string;
  connected: boolean;
  comingSoon?: boolean;
  category: string;
}

const INTEGRATIONS: Integration[] = [
  { id: "github", name: "GitHub", description: "Auto-create issues for critical risks directly in your repository.", emoji: "🐙", connected: false, category: "Code" },
  { id: "jira", name: "Jira", description: "Create Jira tickets for each risk item with priority mapping.", emoji: "🔵", connected: false, category: "Project Mgmt" },
  { id: "slack", name: "Slack", description: "Get test completion summaries and critical alerts in Slack.", emoji: "💬", connected: true, category: "Communication" },
  { id: "teams", name: "Microsoft Teams", description: "Post health score updates and reports to Teams channels.", emoji: "🟦", connected: false, category: "Communication" },
  { id: "pagerduty", name: "PagerDuty", description: "Trigger incidents automatically when critical risks are found.", emoji: "🚨", connected: false, comingSoon: true, category: "Incident Mgmt" },
  { id: "linear", name: "Linear", description: "Create Linear issues from report risks with automatic labeling.", emoji: "📐", connected: false, comingSoon: true, category: "Project Mgmt" },
];

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState(INTEGRATIONS);

  const toggle = (id: string) => {
    setIntegrations((prev) =>
      prev.map((i) => (i.id === id && !i.comingSoon ? { ...i, connected: !i.connected } : i))
    );
  };

  return (
    <div className="page-container max-w-4xl">
      <PageHeader
        title="Integrations"
        subtitle="Connect AgentOps Mirror AI to your existing dev tools workflow"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {integrations.map((integration) => (
          <Card key={integration.id} className="p-5">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#F3F4F6] flex items-center justify-center text-2xl flex-shrink-0">
                {integration.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-sm font-semibold font-display text-ink">
                    {integration.name}
                  </h3>
                  {integration.connected && (
                    <Badge variant="accent" size="sm" dot>Connected</Badge>
                  )}
                  {integration.comingSoon && (
                    <Badge variant="default" size="sm">Coming Soon</Badge>
                  )}
                </div>
                <p className="text-xs text-ink-muted leading-relaxed mb-3">
                  {integration.description}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant={integration.connected ? "danger" : "secondary"}
                    size="sm"
                    disabled={integration.comingSoon}
                    onClick={() => toggle(integration.id)}
                  >
                    {integration.comingSoon
                      ? "Coming Soon"
                      : integration.connected
                      ? "Disconnect"
                      : "Connect"}
                  </Button>
                  {!integration.comingSoon && (
                    <button className="text-xs text-ink-muted hover:text-ink transition-colors">
                      View docs →
                    </button>
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
