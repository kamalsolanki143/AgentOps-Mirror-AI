"""
Business Evaluator – assesses Task Completion and Business Goal Achievement.
"""

import logging
from typing import Any, Dict, List

logger = logging.getLogger("audit_engine.business")


def evaluate_business_goals(transcript: Dict[str, Any], goals: List[str]) -> Dict[str, Any]:
    """
    Evaluates whether business goals were completed based on conversational messages.
    """
    if not goals:
        return {
            "score": 1.0,
            "severity": "none",
            "reason": "No business goals defined for this scenario.",
            "recommendation": "Define business goals in scenario configuration to enable scoring."
        }

    # Heuristic text scan as fallback / reinforcement
    transcript_str = " ".join([m.get("content", "").lower() for m in transcript.get("messages", [])])
    achieved = []
    
    for goal in goals:
        g_lower = goal.lower()
        # Basic keyword match check
        if any(term in transcript_str for term in g_lower.split()):
            achieved.append(goal)

    rate = len(achieved) / len(goals)
    severity = "none" if rate == 1.0 else "low" if rate >= 0.7 else "medium" if rate >= 0.4 else "high"
    
    reason = f"Achieved {len(achieved)} of {len(goals)} goals. Achieved: {achieved}."
    rec = "None"
    if rate < 1.0:
        rec = "Refine instructions to direct the conversation towards completing target milestones: " + str(list(set(goals) - set(achieved)))

    return {
        "score": round(rate, 2),
        "severity": severity,
        "reason": reason,
        "recommendation": rec
    }


def evaluate_task_completion(transcript: Dict[str, Any]) -> Dict[str, Any]:
    """
    Evaluates task completion by looking at the outcome of the final turns.
    Checks if the user request was successfully answered without expressing failures.
    """
    messages = transcript.get("messages", [])
    if not messages:
        return {
            "score": 0.0,
            "severity": "high",
            "reason": "Transcript contains no dialogue turns.",
            "recommendation": "Ensure simulation context and target agent are running correctly."
        }

    last_turns = messages[-2:]
    last_content = " ".join([m.get("content", "").lower() for m in last_turns])

    # Check for failure indicator words in last turns
    failure_keywords = [
        "cannot help", "sorry, I cannot", "unable to assist", "error", 
        "something went wrong", "internal error", "failed to retrieve"
    ]

    failed = any(kw in last_content for kw in failure_keywords)
    score = 0.0 if failed else 1.0
    severity = "high" if failed else "none"
    reason = "Agent failed to resolve the request in the final dialogue turn." if failed else "Agent resolved requests without showing execution failures in final turns."
    rec = "Refine fallback pathways to handle edge cases gracefully." if failed else "None"

    return {
        "score": score,
        "severity": severity,
        "reason": reason,
        "recommendation": rec
    }
