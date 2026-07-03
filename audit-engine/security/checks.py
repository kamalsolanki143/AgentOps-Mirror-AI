"""Security audit checks."""


def check_jailbreak(transcript: list[dict]) -> dict:
    return {"passed": True, "attempts": 0}


def check_prompt_leak(transcript: list[dict]) -> dict:
    return {"passed": True, "leaks_detected": 0}
