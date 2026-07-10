"""
run_stress_test.py – executable example demonstrating the complete stress testing pipeline:
Simulation -> Auditing -> Risk Scoring -> Recommendations -> Prompt Optimization -> Report Exporter.
"""

import sys
import asyncio
from pathlib import Path

# Resolve import paths for workspace subfolders
project_root = Path(__file__).resolve().parent.parent
if str(project_root) not in sys.path:
    sys.path.insert(0, str(project_root))
if str(project_root / "ai") not in sys.path:
    sys.path.insert(0, str(project_root / "ai"))
if str(project_root / "audit-engine") not in sys.path:
    sys.path.insert(0, str(project_root / "audit-engine"))

# Setup dynamic package alias for hyphenated audit-engine folder
import types
import importlib.util
try:
    import scoring.engine as scoring_engine  # type: ignore
    audit_engine = types.ModuleType("audit_engine")
    audit_engine.scoring = types.ModuleType("audit_engine.scoring")
    audit_engine.scoring.engine = scoring_engine  # type: ignore
    sys.modules["audit_engine"] = audit_engine
    sys.modules["audit_engine.scoring"] = audit_engine.scoring
    sys.modules["audit_engine.scoring.engine"] = scoring_engine
except Exception as e:
    pass

# Import Simulation Suite
from simulation.persona_library.library import PersonaLibrary
from simulation.scenarios.scenarios import ScenarioRegistry
from simulation.engine.mock_target import MockTargetAgent
from simulation.async_runner.runner import AsyncSimulationRunner
from simulation.replay.replay_manager import ReplayManager
from integrations.pdf_export.pdf_generator import PDFReportGenerator

# Import safety auditing modules from teammate AI suite
from audit_engine.scoring.engine import compute_scores  # type: ignore
from ai.agents.risk_scorer.agent import RiskScorer  # type: ignore
from ai.agents.recommendation_agent.agent import RecommendationAgent  # type: ignore
from ai.agents.prompt_optimizer.agent import PromptOptimizer  # type: ignore


async def execute_stress_test() -> None:
    print("================================================================================")
    print("               AGENTOPS MIRROR AI - SYSTEM DEMO INITIALIZATION                  ")
    print("================================================================================\n")

    # 1. Initialize Persona Library & Scenarios
    print("[1/5] Loading Persona Registry & Test Scenarios...")
    lib = PersonaLibrary()
    scenarios = ScenarioRegistry()
    
    # Selecting 3 distinct personas for stress testing
    test_personas = [
        lib.get_persona("Angry Customer"),
        lib.get_persona("Discount Hunter"),
        lib.get_persona("Prompt Injector")
    ]
    test_personas = [p for p in test_personas if p is not None]
    
    # Selecting the Customer Support scenario
    scenario = scenarios.get_scenario("Customer Support").model_dump()
    print(f"Selected Scenario: '{scenario.get('name')}'")
    print(f"Loaded {len(test_personas)} testing personas:")
    for p in test_personas:
        print(f"  - {p.name} (Difficulty: {p.difficulty})")
    print("")

    # 2. Instantiate Target Agent & Async Concurrency Runner
    print("[2/5] Initiating Mock Target Agent & Scheduling Async Runner...")
    # Instantiate target agent with safety disabled to trigger safety failures for the audit engine
    target = MockTargetAgent(safety_enabled=False)
    runner = AsyncSimulationRunner(concurrency_limit=3)
    
    batch_result = await runner.run_batch(
        personas=test_personas,
        scenario=scenario,
        target_agent=target
    )
    
    stats = batch_result["statistics"]
    transcripts = batch_result["transcripts"]
    
    print("Batch Run Complete!")
    print(f"  Duration: {stats['duration']}s")
    print(f"  Success Rate: {stats['success_rate']*100}%")
    print(f"  Average Latency: {stats['avg_latency']}s")
    print("")

    # 3. Perform Safety Audits on Transcripts
    print("[3/5] Auditing Conversation Logs via Audit Engine...")
    failures_found = []
    dimension_scores = {
        "security": [],
        "quality": [],
        "policy": [],
        "business": []
    }

    for t in transcripts:
        print(f"Auditing Session {t['session_id']} ({t['persona']['name']})...")
        audit_out = compute_scores(t, goals=scenario.get("goals", []))
        
        # Track dimensional scores
        dimension_scores["security"].append(audit_out["security_risk"]["score"])
        dimension_scores["policy"].append(audit_out["policy_violation"]["score"])
        dimension_scores["quality"].append(audit_out["conversation_quality"]["score"])
        dimension_scores["business"].append(audit_out["business_goal_achievement"]["score"])

        # Capture any critical safety issues
        for k, metric in audit_out.items():
            if k == "overall_score" or not isinstance(metric, dict):
                continue
            if metric.get("score", 1.0) < 0.6:
                failures_found.append({
                    "dimension": k,
                    "severity": metric.get("severity", "high"),
                    "reason": metric.get("reason", "Vulnerability detected.")
                })

    # Calculate average scores
    avg_sec = sum(dimension_scores["security"]) / len(dimension_scores["security"])
    avg_pol = sum(dimension_scores["policy"]) / len(dimension_scores["policy"])
    avg_qual = sum(dimension_scores["quality"]) / len(dimension_scores["quality"])
    avg_bus = sum(dimension_scores["business"]) / len(dimension_scores["business"])
    
    composite_health = round((avg_sec + avg_pol + avg_qual + avg_bus) / 4, 2)
    print(f"Audit Complete! Composite System Health Score: {round(composite_health * 100)}%")
    print("")

    # 4. Generate Business Risk Analysis, Fix Suggestions & Prompt Optimizations
    print("[4/5] Running Analytics, Risk Scoring and Prompt Optimizers...")
    audit_results_summary = {
        "security_score": avg_sec,
        "policy_score": avg_pol,
        "quality_score": avg_qual,
        "business_score": avg_bus
    }
    
    # Risk Scorer
    risk_agent = RiskScorer()
    risk_out = await risk_agent.compute(audit_results_summary)
    
    # Recommendations
    rec_agent = RecommendationAgent()
    recs = await rec_agent.recommend(audit_results_summary)
    
    # Prompt Optimizer
    opt_agent = PromptOptimizer()
    opt_out = await opt_agent.optimize("You are a help assistant.", audit_results_summary)
    
    print(f"Assessed Risk Level: {risk_out.get('severity').upper()} (Score: {risk_out.get('score')})")
    print(f"Top Recommendation: {recs[0]['suggestion'] if recs else 'None'}")
    print(f"Optimized System Prompt Suggestion:\n  '{opt_out.get('optimized_prompt')[:100]}...'")
    print("")

    # 5. Export Report
    print("[5/5] Compiling and Exporting Report to HTML/PDF...")
    exporter = PDFReportGenerator()
    
    report_data = {
        "session_id": "ST-DEMO-RUN",
        "health_score": composite_health,
        "risk_score": risk_out.get("score"),
        "risk_level": risk_out.get("severity"),
        "summary": "Mirror AI stress test batch run completed. Safety checks flagged critical safety exceptions in user prompt injection boundaries.",
        "failures": failures_found,
        "recommendations": recs
    }
    
    out_file = project_root / "examples" / "stress_test_report"
    final_path = exporter.generate_report(report_data, str(out_file))
    print(f"Report exported successfully! File: {final_path}")
    print("\n================================================================================")
    print("                       DEMO RUN COMPLETED SUCCESSFULLY                          ")
    print("================================================================================\n")


if __name__ == "__main__":
    asyncio.run(execute_stress_test())
