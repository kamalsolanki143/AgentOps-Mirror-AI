"use client";
import { use, useEffect, useState } from "react";
import { personasService } from "@/services/personas.service";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardBody } from "@/components/ui/Card";
import { HealthRing } from "@/components/charts/HealthRing";
import { Badge } from "@/components/ui/Badge";
import { ROUTES } from "@/constants/routes";
import { PERSONA_DIFFICULTY_COLORS } from "@/constants/personaTypes";
import type { Persona } from "@/types/persona.types";

interface PersonaDetailPageProps {
  params: Promise<{ personaId: string }>;
}

export default function PersonaDetailPage({ params }: PersonaDetailPageProps) {
  const { personaId } = use(params);
  const [persona, setPersona] = useState<Persona | null>(null);

  useEffect(() => {
    personasService.getById(personaId).then(setPersona);
  }, [personaId]);

  if (!persona) return null;

  return (
    <div className="page-container max-w-3xl">
      <PageHeader
        title={persona.name}
        breadcrumb={[{ label: "Personas", href: ROUTES.PERSONAS }, { label: persona.name }]}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left: avatar + stats */}
        <div className="space-y-4">
          <Card className="p-6 flex flex-col items-center text-center">
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center text-5xl mb-4"
              style={{ backgroundColor: `${persona.color}18` }}
            >
              {persona.emoji}
            </div>
            <h2 className="text-base font-bold font-display text-ink">{persona.name}</h2>
            <span
              className="text-xs font-bold px-2 py-0.5 rounded-md mt-1"
              style={{
                color: PERSONA_DIFFICULTY_COLORS[persona.difficulty],
                backgroundColor: `${PERSONA_DIFFICULTY_COLORS[persona.difficulty]}18`,
              }}
            >
              {persona.difficulty} difficulty
            </span>

            <div className="mt-5 w-full border-t border-[#E5E7EB] pt-4">
              <p className="text-xs text-ink-muted mb-1">Issue catch rate</p>
              <HealthRing score={persona.successRate ?? 0} size="md" gradientId={`persona-ring-${personaId}`} label="catch rate" />
            </div>
          </Card>
        </div>

        {/* Right: details */}
        <div className="md:col-span-2 space-y-4">
          <Card>
            <CardBody>
              <h3 className="text-sm font-semibold font-display text-ink mb-2">Personality</h3>
              <p className="text-sm text-ink-muted leading-relaxed">{persona.personality}</p>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <h3 className="text-sm font-semibold font-display text-ink mb-2">Goal</h3>
              <p className="text-sm text-ink-muted leading-relaxed mb-3">{persona.goal.description}</p>
              <div className="bg-[#F9FAFB] rounded-xl p-3 border border-[#E5E7EB]">
                <p className="text-2xs text-ink-muted font-medium uppercase tracking-wide mb-1">Success Criteria</p>
                <p className="text-xs text-ink leading-relaxed">{persona.goal.successCriteria}</p>
              </div>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <h3 className="text-sm font-semibold font-display text-ink mb-2">Sample Opening Message</h3>
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
                <p className="text-sm text-ink font-mono leading-relaxed italic">
                  &ldquo;{persona.sampleOpener}&rdquo;
                </p>
              </div>
            </CardBody>
          </Card>
          {persona.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {persona.tags.map((tag) => (
                <Badge key={tag} variant="default" size="sm">{tag}</Badge>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
