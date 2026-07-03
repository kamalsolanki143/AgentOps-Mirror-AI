"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { stressTestService } from "@/services/stressTest.service";
import { personasService } from "@/services/personas.service";
import { ROUTES } from "@/constants/routes";
import { useEffect } from "react";
import type { Persona } from "@/types/persona.types";
import { Zap, Globe, Link2, MessageSquare, Code2, Bot } from "lucide-react";
import { cn } from "@/utils/cn";

const CONNECTOR_OPTIONS = [
  { id: "rest_api", label: "REST API", icon: Globe, desc: "HTTP endpoint" },
  { id: "websocket", label: "WebSocket", icon: Link2, desc: "Real-time WS" },
  { id: "openai", label: "OpenAI", icon: Bot, desc: "GPT-4 / Assistants" },
  { id: "langchain", label: "LangChain", icon: Code2, desc: "LangChain chains" },
  { id: "rasa", label: "Rasa", icon: MessageSquare, desc: "Rasa NLU/Core" },
  { id: "botpress", label: "Botpress", icon: Bot, desc: "Botpress cloud" },
  { id: "dialogflow", label: "Dialogflow", icon: MessageSquare, desc: "Google DF" },
  { id: "custom", label: "Custom", icon: Code2, desc: "Custom webhook" },
];

const DIFFICULTY_OPTIONS = [
  { value: "easy", label: "Easy", color: "bg-risk-low/20 text-[#5A9A7E] border-risk-low/30" },
  { value: "medium", label: "Medium", color: "bg-risk-medium-bg text-risk-medium border-risk-medium/30" },
  { value: "hard", label: "Hard", color: "bg-risk-critical-bg text-risk-critical border-risk-critical/30" },
  { value: "extreme", label: "Extreme", color: "bg-primary/10 text-primary border-primary/20" },
];

export default function StressTestLaunchPage() {
  const router = useRouter();
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [selectedConnector, setSelectedConnector] = useState("rest_api");
  const [selectedPersonas, setSelectedPersonas] = useState<string[]>([]);
  const [endpoint, setEndpoint] = useState("");
  const [difficulty, setDifficulty] = useState("hard");
  const [launching, setLaunching] = useState(false);

  useEffect(() => {
    personasService.list().then((data) => {
      setPersonas(data.personas);
      // Default to first 6 personas selected
      setSelectedPersonas(data.personas.slice(0, 6).map((p) => p.id));
    });
  }, []);

  const togglePersona = (id: string) => {
    setSelectedPersonas((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const handleLaunch = async () => {
    setLaunching(true);
    try {
      const { runId } = await stressTestService.launch({
        agentId: "agent-001",
        selectedPersonaIds: selectedPersonas,
        difficulty: difficulty as "easy" | "medium" | "hard" | "extreme",
        conversationsPerPersona: 3,
        timeoutMs: 30000,
      });
      router.push(ROUTES.STRESS_TEST_RUN(runId));
    } catch {
      setLaunching(false);
    }
  };

  return (
    <div className="page-container max-w-4xl">
      <PageHeader
        title="Launch Stress Test"
        subtitle="Configure your agent connection, select adversarial personas, and start testing"
        breadcrumb={[{ label: "Stress Tests", href: ROUTES.STRESS_TEST }, { label: "New Run" }]}
      />

      <div className="space-y-6">
        {/* Step 1: Connector */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-primary text-white text-xs font-bold font-display flex items-center justify-center">1</span>
              <h2 className="text-base font-semibold font-display text-ink">Connect Your Agent</h2>
            </div>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              {CONNECTOR_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                const active = selectedConnector === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => setSelectedConnector(opt.id)}
                    className={cn(
                      "flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 text-center transition-all",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1",
                      active
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-[#E5E7EB] hover:border-primary/40 text-ink-muted hover:text-ink"
                    )}
                  >
                    <Icon className={cn("w-5 h-5", active ? "text-primary" : "text-ink-muted")} />
                    <span className="text-xs font-medium">{opt.label}</span>
                    <span className="text-2xs text-ink-muted">{opt.desc}</span>
                  </button>
                );
              })}
            </div>
            <Input
              label="Agent Endpoint URL"
              placeholder="https://your-agent.example.com/chat"
              value={endpoint}
              onChange={(e) => setEndpoint(e.target.value)}
              hint="The URL your agent accepts POST requests at"
              leftIcon={<Globe className="w-4 h-4" />}
            />
          </CardBody>
        </Card>

        {/* Step 2: Personas */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-primary text-white text-xs font-bold font-display flex items-center justify-center">2</span>
                <h2 className="text-base font-semibold font-display text-ink">Select Personas</h2>
              </div>
              <span className="text-xs text-ink-muted">
                {selectedPersonas.length} of {personas.length} selected
              </span>
            </div>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {personas.map((persona) => {
                const selected = selectedPersonas.includes(persona.id);
                return (
                  <button
                    key={persona.id}
                    onClick={() => togglePersona(persona.id)}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1",
                      selected
                        ? "border-primary bg-primary/5"
                        : "border-[#E5E7EB] hover:border-primary/30"
                    )}
                  >
                    <span
                      className="w-9 h-9 rounded-full flex items-center justify-center text-xl flex-shrink-0"
                      style={{ backgroundColor: `${persona.color}20` }}
                    >
                      {persona.emoji}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-ink truncate">
                          {persona.name}
                        </span>
                        <Badge
                          size="sm"
                          variant={
                            persona.difficulty === "extreme" ? "primary" :
                            persona.difficulty === "high" ? "risk" : "default"
                          }
                        >
                          {persona.difficulty}
                        </Badge>
                      </div>
                      <p className="text-xs text-ink-muted truncate mt-0.5">
                        {persona.goal.description}
                      </p>
                    </div>
                    <div
                      className={cn(
                        "w-4 h-4 rounded flex-shrink-0 border-2 transition-all",
                        selected ? "bg-primary border-primary" : "border-[#D1D5DB]"
                      )}
                    >
                      {selected && (
                        <svg viewBox="0 0 16 16" fill="none" className="text-white">
                          <path d="M3 8l3.5 3.5L13 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </CardBody>
        </Card>

        {/* Step 3: Difficulty */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-primary text-white text-xs font-bold font-display flex items-center justify-center">3</span>
              <h2 className="text-base font-semibold font-display text-ink">Test Difficulty</h2>
            </div>
          </CardHeader>
          <CardBody>
            <div className="flex gap-3 flex-wrap">
              {DIFFICULTY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setDifficulty(opt.value)}
                  className={cn(
                    "px-4 py-2 rounded-xl border-2 text-sm font-medium transition-all",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1",
                    difficulty === opt.value
                      ? opt.color + " border-opacity-100"
                      : "border-[#E5E7EB] text-ink-muted hover:border-primary/30"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </CardBody>
        </Card>

        {/* Launch CTA */}
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary">Save as Template</Button>
          <Button
            variant="gradient"
            size="lg"
            loading={launching}
            disabled={selectedPersonas.length === 0}
            onClick={handleLaunch}
            leftIcon={<Zap className="w-5 h-5" />}
          >
            {launching ? "Launching…" : "Launch Stress Test"}
          </Button>
        </div>
      </div>
    </div>
  );
}
