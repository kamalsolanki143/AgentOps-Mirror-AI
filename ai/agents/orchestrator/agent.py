"""
Orchestrator Agent – coordinates multi-agent simulation and audit workflows.
Dispatches tasks to specialized agents and aggregates results.
"""

import asyncio
from typing import Any


class OrchestratorAgent:
    def __init__(self):
        self.agents = {}

    def register_agent(self, name: str, agent: Any):
        self.agents[name] = agent

    async def run_simulation(self, config: dict) -> dict:
        pipeline = [
            "persona_generator",
            "simulator",
            "transcript_collector",
            "audit_engine",
            "report_generator",
        ]
        results = {}
        for step in pipeline:
            agent = self.agents.get(step)
            if agent:
                results[step] = await agent.run(config)
        return results

    async def run_audit(self, transcript: dict) -> dict:
        audit_tasks = [
            "hallucination_detector",
            "prompt_leak_detector",
            "jailbreak_detector",
            "business_goal_evaluator",
            "risk_scorer",
        ]
        results = await asyncio.gather(
            *(self.agents[name].run(transcript) for name in audit_tasks if name in self.agents)
        )
        return dict(zip(audit_tasks, results))
