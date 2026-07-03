"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { HealthRing } from "@/components/charts/HealthRing";
import { Logo } from "@/components/common/Logo";
import { Button } from "@/components/ui/Button";
import { ROUTES } from "@/constants/routes";
import { ArrowRight, Zap, Shield, Brain, AlertTriangle } from "lucide-react";
import { BUILT_IN_PERSONAS } from "@/constants/personaTypes";
import { cn } from "@/utils/cn";

// 9-step workflow
const WORKFLOW_STEPS = [
  { n: "01", title: "Connect Agent", desc: "Link via REST API, WebSocket, OpenAI, LangChain, Rasa, or custom endpoint" },
  { n: "02", title: "Select Personas", desc: "AI recommends the best adversarial persona mix for your agent's domain" },
  { n: "03", title: "Configure Test", desc: "Set difficulty, conversation count, timeout, and scenario parameters" },
  { n: "04", title: "Launch Simulation", desc: "20–50 AI personas run parallel conversations against your agent" },
  { n: "05", title: "Live Scoring", desc: "AI audit engine evaluates every message for 6 reliability dimensions" },
  { n: "06", title: "Risk Detection", desc: "Hallucinations, security leaks, jailbreaks, and UX failures flagged in real time" },
  { n: "07", title: "Generate Report", desc: "Business-risk-ranked breakdown with exact message excerpts and fixes" },
  { n: "08", title: "Auto-Optimize", desc: "AI suggests and applies prompt improvements targeting detected failures" },
  { n: "09", title: "Regression Compare", desc: "Re-test and track improvement across versions with health score history" },
];

const PAIN_CARDS = [
  {
    icon: Brain,
    color: "#FFB020",
    title: "Hallucination Blindspots",
    desc: "Your agent confidently cites policies that don't exist, codes that expired, and people who are fictional.",
  },
  {
    icon: Shield,
    color: "#FF5A5F",
    title: "Security Leaks",
    desc: "Prompt injection, PII extraction, and social engineering attacks that your testing suite never catches.",
  },
  {
    icon: AlertTriangle,
    color: "#6C5CE7",
    title: "Conversation Dead-Ends",
    desc: "Users stuck in loops, unanswered escalation requests, and edge cases that crash the experience.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-dvh bg-bg-base overflow-x-hidden">
      {/* Nav */}
      <header className="sticky top-0 z-50 bg-bg-base/80 backdrop-blur-md border-b border-[#E5E7EB]">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Logo size="md" href="/" />
          <div className="flex items-center gap-3">
            <Link href={ROUTES.LOGIN}>
              <Button variant="ghost" size="sm">Sign In</Button>
            </Link>
            <Link href={ROUTES.REGISTER}>
              <Button variant="gradient" size="sm">Get Started Free</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-24 text-center">
        {/* Overline */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-1.5 text-xs font-semibold mb-8 border border-primary/20"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          AI Agent Reliability Platform — Now in Beta
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-3xl sm:text-2xl font-bold font-display text-ink mb-6 leading-tight max-w-3xl mx-auto"
        >
          Your AI agent is live.
          <br />
          <span className="gradient-text">Is it actually reliable?</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-base text-ink-muted max-w-xl mx-auto mb-10 leading-relaxed"
        >
          AgentOps Mirror AI runs 20–50 adversarial AI personas against your chatbot or voice agent
          — then scores every conversation for hallucinations, security risks, and business goal failures.
          All in real time.
        </motion.p>

        {/* Live Health Ring hero */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.3, type: "spring" }}
          className="flex justify-center mb-10"
        >
          <div className="relative">
            {/* Glow */}
            <div className="absolute inset-0 rounded-full bg-gradient-signature opacity-20 blur-3xl scale-150" />
            <HealthRing
              score={94}
              size="lg"
              gradientId="hero-ring"
              label="Reliability Score"
              running={false}
            />
          </div>
        </motion.div>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
          className="flex flex-col sm:flex-row gap-3 justify-center"
        >
          <Link href={ROUTES.REGISTER}>
            <Button variant="gradient" size="lg" rightIcon={<ArrowRight className="w-4 h-4" />}>
              Start Free — No Credit Card
            </Button>
          </Link>
          <Link href={ROUTES.LOGIN}>
            <Button variant="secondary" size="lg">
              View Live Demo Dashboard
            </Button>
          </Link>
        </motion.div>
      </section>

      {/* Pain cards */}
      <section className="bg-bg-surface border-y border-[#E5E7EB] py-16">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-lg font-bold font-display text-center text-ink mb-3">
            The problems your current testing doesn&apos;t catch
          </h2>
          <p className="text-sm text-ink-muted text-center mb-10 max-w-xl mx-auto">
            Traditional QA doesn&apos;t cover what AI agents actually face in production.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PAIN_CARDS.map((card, i) => {
              const Icon = card.icon;
              return (
                <motion.div
                  key={card.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.4 }}
                >
                  <div className="rounded-2xl border border-[#E5E7EB] p-6 h-full bg-bg-base hover:shadow-card-hover transition-shadow duration-200">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                      style={{ backgroundColor: `${card.color}18` }}
                    >
                      <Icon style={{ color: card.color }} className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-semibold font-display text-ink mb-2">
                      {card.title}
                    </h3>
                    <p className="text-sm text-ink-muted leading-relaxed">{card.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works — 9 steps */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="text-lg font-bold font-display text-ink text-center mb-3">
          How it works
        </h2>
        <p className="text-sm text-ink-muted text-center mb-12 max-w-xl mx-auto">
          From agent connection to regression comparison — in 9 steps.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {WORKFLOW_STEPS.map((step, i) => (
            <motion.div
              key={step.n}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06, duration: 0.35 }}
              className="rounded-2xl border border-[#E5E7EB] p-5 bg-bg-surface hover:shadow-card transition-shadow"
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="text-lg font-bold font-mono gradient-text">{step.n}</span>
                <h3 className="text-sm font-semibold font-display text-ink">{step.title}</h3>
              </div>
              <p className="text-xs text-ink-muted leading-relaxed">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Persona showcase */}
      <section className="bg-bg-surface border-y border-[#E5E7EB] py-16">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-lg font-bold font-display text-ink text-center mb-3">
            8 built-in adversarial personas
          </h2>
          <p className="text-sm text-ink-muted text-center mb-10 max-w-lg mx-auto">
            Each persona is designed by AI reliability experts to expose a specific class of failure.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            {BUILT_IN_PERSONAS.map((persona) => (
              <motion.div
                key={persona.slug}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-2.5 px-4 py-2.5 rounded-full border border-[#E5E7EB] bg-bg-base hover:shadow-card transition-shadow cursor-default"
                style={{ borderColor: `${persona.color}40` }}
              >
                <span className="text-xl">{persona.emoji}</span>
                <span className="text-sm font-medium font-display text-ink">{persona.name}</span>
                <span
                  className="text-2xs font-bold px-1.5 py-0.5 rounded-md"
                  style={{ color: persona.color, backgroundColor: `${persona.color}18` }}
                >
                  {persona.difficulty}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <div className="inline-flex justify-center mb-8">
            <HealthRing score={94} size="md" gradientId="cta-ring" label="Your agent's score" />
          </div>
          <h2 className="text-xl font-bold font-display text-ink mb-4">
            Ready to find out what your agent is really doing?
          </h2>
          <p className="text-sm text-ink-muted mb-8 leading-relaxed">
            Connect your first agent in under 2 minutes. No code changes required.
          </p>
          <Link href={ROUTES.REGISTER}>
            <Button variant="gradient" size="lg" rightIcon={<Zap className="w-4 h-4" />}>
              Launch Your First Stress Test
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#E5E7EB] py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Logo size="sm" href="/" />
          <p className="text-xs text-ink-muted">
            © 2025 AgentOps Mirror AI. Built for AI reliability engineers.
          </p>
        </div>
      </footer>
    </div>
  );
}
