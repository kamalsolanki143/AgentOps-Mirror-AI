"use client";
import { motion } from "framer-motion";
import { useAgents } from "@/hooks/useAgents";
import { PageHeader } from "@/components/common/PageHeader";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { AgentSummaryCard } from "@/components/dashboard/AgentSummaryCard";
import { StatStrip } from "@/components/dashboard/StatStrip";
import { LiveFeed } from "@/components/dashboard/LiveFeed";
import { Button } from "@/components/ui/Button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { ROUTES } from "@/constants/routes";
import type { Metadata } from "next";

import type { Variants } from "framer-motion";

const container: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const item: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } },
};

export default function DashboardPage() {
  const { agents, loading } = useAgents();

  return (
    <div className="page-container">
      <PageHeader
        title="Dashboard"
        subtitle="Agent health overview and recent test activity"
        action={
          <Link href={ROUTES.STRESS_TEST}>
            <Button variant="gradient" leftIcon={<Plus className="w-4 h-4" />}>
              New Stress Test
            </Button>
          </Link>
        }
      />

      {/* Stat strip */}
      <StatStrip />

      {/* Main grid */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Agents grid */}
        <div className="lg:col-span-2">
          <h2 className="text-base font-semibold font-display text-ink mb-4">
            Connected Agents
          </h2>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : (
            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 sm:grid-cols-2 gap-4"
            >
              {agents.map((agent) => (
                <motion.div key={agent.id} variants={item}>
                  <AgentSummaryCard agent={agent} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>

        {/* Live feed */}
        <div className="lg:col-span-1">
          <h2 className="text-base font-semibold font-display text-ink mb-4">
            Recent Activity
          </h2>
          <LiveFeed />
        </div>
      </div>
    </div>
  );
}
