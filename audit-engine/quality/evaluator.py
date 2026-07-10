"""
Quality Evaluator – checks Conversation Quality, Dead Ends, and Hallucinations.
"""

import logging
from typing import Any, Dict

logger = logging.getLogger("audit_engine.quality")


def evaluate_hallucinations(transcript: Dict[str, Any], audit_results: Dict[str, Any] = None) -> Dict[str, Any]:
    """
    Evaluates hallucination scores using detector agent results or fallback heuristic checks.
    """
    if audit_results and "hallucination_details" in audit_results:
        details = audit_results["hallucination_details"]
        return {
            "score": details.get("score", 1.0),
            "severity": details.get("severity", "none"),
            "reason": details.get("reason", "No hallucinations detected."),
            "recommendation": details.get("recommendation", "None")
        }

    # Heuristic fallback if not provided
    messages = transcript.get("messages", [])
    agent_responses = [m.get("content", "") for m in messages if m.get("role") == "assistant"]
    
    hallucination_triggers = [
        "100% uptime", "unsupported product capability", 
        "no security breach ever occurred", "complete database access"
    ]
    
    found = []
    for resp in agent_responses:
        for trig in hallucination_triggers:
            if trig in resp.lower():
                found.append(trig)
                
    if found:
        return {
            "score": 0.5,
            "severity": "medium",
            "reason": f"Agent made claims triggering factual verification warnings: {found}.",
            "recommendation": "Configure grounding lookup filters and reduce model temperature."
        }
        
    return {
        "score": 1.0,
        "severity": "none",
        "reason": "No factual abnormalities detected.",
        "recommendation": "None"
    }


def evaluate_conversation_quality(transcript: Dict[str, Any]) -> Dict[str, Any]:
    """
    Assesses linguistic parameters such as length, politeness, and consistency.
    """
    messages = transcript.get("messages", [])
    if not messages:
        return {
            "score": 0.0,
            "severity": "high",
            "reason": "No dialogue turns to assess quality.",
            "recommendation": "Verify simulation runs correctly."
        }

    agent_messages = [m for m in messages if m.get("role") == "assistant"]
    if not agent_messages:
        return {
            "score": 1.0,
            "severity": "none",
            "reason": "No agent messages to evaluate quality.",
            "recommendation": "None"
        }

    # Standard metrics: Avg length of response, politeness indicators
    polite_keywords = ["please", "thank you", "welcome", "happy to help", "how can i"]
    polite_turns = 0
    total_len = 0
    
    for m in agent_messages:
        content = m.get("content", "").lower()
        total_len += len(content)
        if any(kw in content for kw in polite_keywords):
            polite_turns += 1

    politeness_rate = polite_turns / len(agent_messages)
    avg_length = total_len / len(agent_messages)

    # Coherence score deduction for extremely short or long responses
    length_score = 1.0
    if avg_length < 10 or avg_length > 500:
        length_score = 0.7

    quality_score = round((politeness_rate * 0.4) + (length_score * 0.6), 2)
    severity = "none" if quality_score >= 0.8 else "low" if quality_score >= 0.6 else "medium"

    return {
        "score": quality_score,
        "severity": severity,
        "reason": f"Conversation quality scored at {quality_score}. Avg Response Length: {round(avg_length)} chars. Politeness index: {round(politeness_rate * 100)}%.",
        "recommendation": "None" if severity == "none" else "Provide response formatting guidelines to avoid overly verbose/concise turns."
    }


def evaluate_dead_ends(transcript: Dict[str, Any]) -> Dict[str, Any]:
    """
    Identifies conversation dead ends, repetitive loops, and stuck cycles.
    """
    messages = transcript.get("messages", [])
    agent_responses = [m.get("content", "").strip() for m in messages if m.get("role") == "assistant"]

    if len(agent_responses) < 2:
        return {
            "score": 1.0,
            "severity": "none",
            "reason": "No repetitive patterns observed.",
            "recommendation": "None"
        }

    # Count duplicates to detect loop cycles
    unique_responses = set(agent_responses)
    repetition_ratio = 1.0 - (len(unique_responses) / len(agent_responses))

    # Deduct score if repetitive ratio is high
    dead_end_detected = False
    reasons = []
    
    if repetition_ratio > 0.3:
        dead_end_detected = True
        reasons.append(f"High repetition detected (ratio: {round(repetition_ratio * 100)}%)")

    # Check for dead-end statements
    dead_end_keywords = ["i am stuck", "loop", "i don't understand", "please try again later"]
    for resp in agent_responses:
        if any(kw in resp.lower() for kw in dead_end_keywords):
            dead_end_detected = True
            reasons.append("Agent explicitly stated a stuck state.")
            break

    score = 0.3 if dead_end_detected else 1.0
    severity = "high" if score == 0.3 else "none"
    reason = " | ".join(reasons) if dead_end_detected else "No conversation dead ends or loops detected."
    rec = "Implement circular loop detection in session context and prompt fallback states." if dead_end_detected else "None"

    return {
        "score": score,
        "severity": severity,
        "reason": reason,
        "recommendation": rec
    }
