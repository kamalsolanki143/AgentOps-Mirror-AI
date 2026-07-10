# AgentOps Mirror AI – AI Pipeline & Audit Engine Architecture

This document provides a technical guide to the modular AI stress-testing and safety auditing pipeline.

---

## 1. Core Architecture

The platform runs an autonomous pipeline to stress-test conversational agents before production. The pipeline is designed around a multi-agent framework orchestrated via **LangGraph**.

```
    ┌──────────────────────┐
    │  Orchestrator Graph  │
    └──────────┬───────────┘
               │
     ┌─────────▼─────────┐
     │ Persona Generator │
     └─────────┬─────────┘
               │
        ┌──────▼──────┐
        │  Simulator  │ ◀───▶ [ Target Agent under test ]
        └──────┬──────┘
               │
     ┌─────────▼─────────┐
     │   Transcript      │
     │   Collector       │
     └─────────┬─────────┘
               │
        ┌──────▼──────┐
        │Audit Engine │ (Concurrent checks)
        └──────┬──────┘
               ├──────────────────────┬──────────────────────┐
        ┌──────▼──────┐        ┌──────▼──────┐        ┌──────▼──────┐
        │ Risk Scorer │        │ Optimizer   │        │ Regression  │
        └──────┬──────┘        └──────┬──────┘        └──────┬──────┘
               └──────────────────────┼──────────────────────┘
                                      │
                            ┌─────────▼─────────┐
                            │ Report Generator  │
                            └───────────────────┘
```

---

## 2. Agent Catalog

Each agent is completely independent, modular, and fully asynchronous.

*   **PersonaGeneratorAgent** (`ai/agents/persona_generator/agent.py`): Creates realistic user profiles (including adversarial traits, goals, communication styles) using OpenAI templates.
*   **Simulator** (`ai/agents/simulator/agent.py`): Performs multi-turn dialogue runs between the generated persona and the target agent. Supports REST, callable handlers, and fallback testing targets.
*   **TranscriptCollector** (`ai/agents/transcript_collector/agent.py`): Standardizes and validates dialogue exchanges.
*   **AuditEngine** (`ai/agents/audit_engine/agent.py`): Orchestrates all detector evaluations concurrently.
*   **HallucinationDetector** (`ai/agents/hallucination_detector/agent.py`): Conducts semantic checks against facts to detect hallucinations.
*   **PromptLeakDetector** (`ai/agents/prompt_leak_detector/agent.py`): Identifies if the target leaked system prompts.
*   **JailbreakDetector** (`ai/agents/jailbreak_detector/agent.py`): Evaluates user messages for system bypass attempts.
*   **BusinessGoalEvaluator** (`ai/agents/business_goal_evaluator/agent.py`): Grades dialogue progress against specified KPIs.
*   **RiskScoringAgent** (`ai/agents/risk_scorer/agent.py`): Computes composite business risk indicators.
*   **PromptOptimizerAgent** (`ai/agents/prompt_optimizer/agent.py`): Diagnoses prompt failures and outputs optimized variations.
*   **RegressionAgent** (`ai/agents/regression_engine/agent.py`): Tracks performance deltas against a reference baseline run (Regression Shield).
*   **ReportGenerator** (`ai/agents/report_generator/agent.py`): Compiles final test report summaries.
*   **RecommendationAgent** (`ai/agents/recommendation_agent/agent.py`): Generates remediation checklists based on vulnerabilities.
*   **AnalyticsAgent** (`ai/agents/analytics_agent/agent.py`): Computes trends and latency metrics across multiple historical runs.

---

## 3. Audit Engine Metrics

The **Audit Engine** (`audit-engine/`) computes scores across 8 critical compliance dimensions:

1.  **Task Completion**: Verifies if the target resolved the user's inquiry by analyzing dialogue closure.
2.  **Prompt Leakage**: Detects instruction leakage.
3.  **Hallucination**: Identifies unsupported claims.
4.  **Policy Violation**: Scans for toxicity, competitor mentions, and out-of-domain restrictions.
5.  **Conversation Dead Ends**: Checks for loop states and repeating replies.
6.  **Business Goal Achievement**: Measures KPI checklist attainment.
7.  **Conversation Quality**: Scores vocabulary, politeness, and response length coherence.
8.  **Security Risk**: Computes general vulnerability rating from prompt leak and jailbreak scores.

Each check returns:
*   `score`: `0.0` (failed/vulnerable) to `1.0` (safe/passed).
*   `severity`: `"none"`, `"low"`, `"medium"`, `"high"`, `"critical"`.
*   `reason`: Text explanation of the metric outcome.
*   `recommendation`: Actions to take to remediate issues.

---

## 4. Prompts & Customization

Prompt rules are managed as YAML files in the `ai/prompts/` directory to separate parameters and templates from core code:
*   `personas/generate.yaml`
*   `audit/hallucination.yaml`
*   `audit/jailbreak.yaml`
*   `audit/prompt-leak.yaml`
*   `optimizer/optimize.yaml`
*   `evaluator/business-goal.yaml`
*   `reports/generate.yaml`

---

## 5. Dual Execution Mode

To support disconnected or local environments, the system features a **Dual Execution Mode**:
1.  **Production Mode**: Communicates asynchronously with the OpenAI Chat API when `OPENAI_API_KEY` is present.
2.  **Heuristic Fallback Mode**: Uses regex scans and keyword matching to simulate safety failures and evaluations deterministically.
