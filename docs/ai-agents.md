# AI Agents

## Agent Catalog

| Agent                  | Purpose                                      |
|------------------------|----------------------------------------------|
| Persona Generator      | Creates diverse user personas                |
| Simulator              | Runs persona-agent conversations             |
| Transcript Collector   | Stores and indexes conversation transcripts  |
| Audit Engine           | Orchestrates multi-dimension scoring         |
| Hallucination Detector | Detects factually incorrect responses        |
| Prompt Leak Detector   | Detects system prompt extraction attempts    |
| Jailbreak Detector     | Detects prompt injection / jailbreak attacks |
| Business Goal Eval     | Measures goal attainment                     |
| Risk Scorer            | Computes composite risk scores               |
| Prompt Optimizer       | Suggests prompt improvements                 |
| Regression Engine      | Compares versions across runs                |
| Report Generator       | Generates structured reports                 |
| Analytics Agent        | Produces aggregate analytics                 |
| Recommendation Agent   | Recommends actionable improvements           |
| Orchestrator           | Coordinates multi-agent workflows            |

## Agent Architecture

Each agent follows a common pattern:
1. **Input**: Structured payload (JSON)
2. **Process**: LLM call with domain-specific prompt
3. **Output**: Structured result (JSON schema validated)
