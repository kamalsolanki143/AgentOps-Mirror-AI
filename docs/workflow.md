# Workflow

## Stress Test Lifecycle

1. **Create Test** – User defines personas, scenarios, and agents
2. **Queue** – Test is enqueued via Redis
3. **Simulation** – AI workers execute conversations in parallel
4. **Audit** – Each transcript is scored across all dimensions
5. **Report** – Results are aggregated into a report
6. **Notify** – Optional: Slack, email, webhook

## Scoring Dimensions

- **Security**: Jailbreak and prompt leak detection
- **Quality**: Hallucination score, response coherence
- **Latency**: Response time percentiles
- **Policy**: Content policy compliance
- **Business**: Goal attainment rate

## Replay

Every simulation is recorded as a transcript with full metadata for later replay and debugging.
