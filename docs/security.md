# Security

## Vulnerability Detection

AgentOps Mirror AI detects the following vulnerability classes:

### Hallucination
Responses that contain factually incorrect or fabricated information.

### Prompt Leak
Attempts to extract the system prompt from the AI agent.

### Jailbreak
Malicious inputs designed to bypass safety constraints.

## Mitigation Strategies

1. **Input Sanitization** – Strip prompt injection patterns
2. **Output Verification** – Validate responses against ground truth
3. **Rate Limiting** – Prevent brute-force attacks
4. **Audit Logging** – All interactions are logged for forensic analysis

## Reporting

See [SECURITY.md](../SECURITY.md) for our vulnerability disclosure policy.
