# Prompt Management

Prompts are stored in `ai/prompts/` organized by category:

```
prompts/
├── personas/       # Persona generation prompts
├── audit/          # Audit/scoring prompts
├── optimizer/      # Prompt optimization prompts
├── evaluator/      # Business goal evaluation prompts
└── reports/        # Report generation prompts
```

Each prompt file follows a standard format:

```yaml
name: hallucination-detector
version: 1.0
model: gpt-4o
temperature: 0.1
system: |
  You are a hallucination detector...
user: |
  Analyze the following response...
```

Prompts are version-controlled and loaded by the agents at runtime. Prompt changes are tracked alongside the regression engine.
