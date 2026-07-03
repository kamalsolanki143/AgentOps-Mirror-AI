"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { personasService } from "@/services/personas.service";
import { PageHeader } from "@/components/common/PageHeader";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { ROUTES } from "@/constants/routes";
import { PERSONA_DIFFICULTY_COLORS } from "@/constants/personaTypes";
import type { Persona, PersonaCategory } from "@/types/persona.types";
import Link from "next/link";
import { Search } from "lucide-react";
import { cn } from "@/utils/cn";

const CATEGORY_LABELS: Record<PersonaCategory, string> = {
  adversarial: "Adversarial",
  security: "Security",
  social_engineering: "Social Eng.",
  edge_case: "Edge Case",
  standard: "Standard",
};

export default function PersonasPage() {
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<PersonaCategory | "all">("all");

  useEffect(() => {
    personasService.list().then((d) => { setPersonas(d.personas); setLoading(false); });
  }, []);

  const filtered = personas.filter((p) => {
    const matchQ = p.name.toLowerCase().includes(query.toLowerCase()) || p.description.toLowerCase().includes(query.toLowerCase());
    const matchC = activeCategory === "all" || p.category === activeCategory;
    return matchQ && matchC;
  });

  const categories: Array<PersonaCategory | "all"> = ["all", "adversarial", "security", "social_engineering", "edge_case", "standard"];

  return (
    <div className="page-container">
      <PageHeader title="Personas" subtitle="Adversarial AI personas used to stress-test your agents" />

      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <Input
          placeholder="Search personas…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          leftIcon={<Search className="w-4 h-4" />}
          className="max-w-xs"
        />
        <div className="flex gap-2 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium border transition-all",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                activeCategory === cat
                  ? "bg-primary text-white border-primary"
                  : "bg-bg-surface text-ink-muted border-[#E5E7EB] hover:border-primary/40"
              )}
            >
              {cat === "all" ? "All" : CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-48 rounded-2xl bg-[#F3F4F6] animate-pulse" />
          ))}
        </div>
      ) : (
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
          initial="hidden"
          animate="show"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05 } } }}
        >
          {filtered.map((persona) => (
            <motion.div
              key={persona.id}
              variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}
            >
              <Link href={ROUTES.PERSONA_DETAIL(persona.id)} className="block">
                <Card hover className="p-5 h-full flex flex-col">
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                      style={{ backgroundColor: `${persona.color}18` }}
                    >
                      {persona.emoji}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold font-display text-ink truncate">
                        {persona.name}
                      </h3>
                      <span
                        className="inline-block text-2xs font-bold px-2 py-0.5 rounded-md mt-0.5"
                        style={{
                          color: PERSONA_DIFFICULTY_COLORS[persona.difficulty],
                          backgroundColor: `${PERSONA_DIFFICULTY_COLORS[persona.difficulty]}18`,
                        }}
                      >
                        {persona.difficulty}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-ink-muted leading-relaxed flex-1 line-clamp-3">
                    {persona.description}
                  </p>
                  <div className="mt-3 pt-3 border-t border-[#F3F4F6]">
                    <div className="flex items-center justify-between">
                      <span className="text-2xs text-ink-muted">Catch rate</span>
                      <span className="text-xs font-bold font-mono text-primary">
                        {persona.successRate}%
                      </span>
                    </div>
                  </div>
                </Card>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
