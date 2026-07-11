"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { personasService } from "@/services/personas.service";
import { PageHeader } from "@/components/common/PageHeader";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { ROUTES } from "@/constants/routes";
import { PERSONA_DIFFICULTY_COLORS } from "@/constants/personaTypes";
import type { Persona, PersonaCategory } from "@/types/persona.types";
import Link from "next/link";
import { Search, AlertCircle, RefreshCw } from "lucide-react";
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
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<PersonaCategory | "all">("all");

  const fetchPersonas = () => {
    setLoading(true);
    setError(null);
    personasService.list()
      .then((d) => {
        setPersonas(d.personas || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading personas:", err);
        setError("Failed to load personas from backend API. Please make sure the backend is running and healthy.");
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchPersonas();
  }, []);

  const filtered = personas.filter((p) => {
    const matchQ = (p.name || "").toLowerCase().includes(query.toLowerCase()) || 
                   (p.description || "").toLowerCase().includes(query.toLowerCase());
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
                "px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer",
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
            <div key={i} className="h-56 rounded-2xl bg-[#F3F4F6] animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <Card className="p-8 border-red-200 bg-red-50/30 text-center max-w-xl mx-auto my-12">
          <div className="flex flex-col items-center gap-3">
            <AlertCircle className="w-12 h-12 text-red-500" />
            <h3 className="text-base font-semibold text-ink">API Connection Error</h3>
            <p className="text-sm text-ink-muted">{error}</p>
            <button 
              onClick={fetchPersonas}
              className="mt-2 inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-primary rounded-lg hover:bg-primary/95 transition-all cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Try Again
            </button>
          </div>
        </Card>
      ) : filtered.length === 0 ? (
        <Card className="p-12 text-center max-w-md mx-auto my-12">
          <div className="text-4xl mb-3">🔍</div>
          <h3 className="text-sm font-semibold text-ink mb-1">No personas found</h3>
          <p className="text-xs text-ink-muted leading-relaxed">
            We couldn&apos;t find any personas matching your filters or search query.
          </p>
        </Card>
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
                <Card hover className="p-5 h-full flex flex-col relative overflow-hidden">
                  {/* Status Badge in top right */}
                  <div className="absolute top-4 right-4">
                    <Badge
                      variant={persona.isActive ? "primary" : "default"}
                      size="sm"
                      dot
                    >
                      {persona.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>

                  {/* Icon & Name Header */}
                  <div className="flex items-center gap-3 mb-3 pr-16">
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
                      <div className="flex items-center gap-1 mt-0.5">
                        <span
                          className="inline-block text-3xs font-extrabold px-1.5 py-0.5 rounded-md capitalize"
                          style={{
                            color: PERSONA_DIFFICULTY_COLORS[persona.difficulty],
                            backgroundColor: `${PERSONA_DIFFICULTY_COLORS[persona.difficulty]}18`,
                          }}
                        >
                          {persona.difficulty}
                        </span>
                        <Badge variant="ghost" size="sm" className="text-3xs uppercase tracking-wider py-0 px-1 border-gray-200">
                          {CATEGORY_LABELS[persona.category] || persona.category}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-ink-muted leading-relaxed flex-1 line-clamp-3 mb-3">
                    {persona.description}
                  </p>

                  {/* Tags */}
                  {persona.tags && persona.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {persona.tags.map((tag) => (
                        <Badge key={tag} variant="default" size="sm" className="text-3xs px-1 py-0 text-ink-muted border-none bg-gray-100">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Catch Rate Footer */}
                  <div className="mt-auto pt-3 border-t border-[#F3F4F6]">
                    <div className="flex items-center justify-between">
                      <span className="text-2xs text-ink-muted font-medium">Issue catch rate</span>
                      <span className="text-xs font-bold font-mono text-primary">
                        {persona.successRate ?? 0}%
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

