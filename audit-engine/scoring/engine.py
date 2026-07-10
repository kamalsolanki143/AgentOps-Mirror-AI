"""Scoring engine – computes audit scores across all dimensions."""

from typing import Any, Dict, List

import sys
from pathlib import Path

# Enable resolution of neighboring folders when running as script or testing
parent_path = str(Path(__file__).resolve().parent.parent)
if parent_path not in sys.path:
    sys.path.insert(0, parent_path)

from business.evaluator import evaluate_business_goals, evaluate_task_completion
from policy.evaluator import evaluate_policy_violations
from quality.evaluator import evaluate_hallucinations, evaluate_conversation_quality, evaluate_dead_ends
from security.checks import check_prompt_leak, evaluate_security_risk


def compute_scores(transcript: Dict[str, Any], goals: List[str] = None, agent_audit_results: Dict[str, Any] = None) -> Dict[str, Any]:
    """
    Orchestrates the execution of all 8 audit dimensions.
    Returns score, severity, reason, and recommendation for each dimension.
    """
    goals = goals or transcript.get("scenario", {}).get("goals", [])
    
    # 1. Task Completion
    task_comp = evaluate_task_completion(transcript)
    
    # 2. Prompt Leakage
    prompt_leak = check_prompt_leak(transcript, agent_audit_results)
    
    # 3. Hallucination
    hallucination = evaluate_hallucinations(transcript, agent_audit_results)
    
    # 4. Policy Violation
    policy_viol = evaluate_policy_violations(transcript)
    
    # 5. Conversation Dead Ends
    dead_ends = evaluate_dead_ends(transcript)
    
    # 6. Business Goal Achievement
    business_goals = evaluate_business_goals(transcript, goals)
    
    # 7. Conversation Quality
    quality = evaluate_conversation_quality(transcript)
    
    # 8. Security Risk
    security_risk = evaluate_security_risk(transcript, agent_audit_results)

    # Compile result mapping
    results = {
        "task_completion": task_comp,
        "prompt_leakage": prompt_leak,
        "hallucination": hallucination,
        "policy_violation": policy_viol,
        "conversation_dead_ends": dead_ends,
        "business_goal_achievement": business_goals,
        "conversation_quality": quality,
        "security_risk": security_risk
    }

    # Add general summary score
    valid_scores = [val["score"] for val in results.values() if "score" in val]
    results["overall_score"] = round(sum(valid_scores) / len(valid_scores), 3) if valid_scores else 1.0

    return results


if __name__ == "__main__":
    mock_transcript = {
        "messages": [
            {"role": "user", "content": "hello"},
            {"role": "assistant", "content": "Hello! I am a helper. How can I assist you today?"}
        ]
    }
    print(compute_scores(mock_transcript))

