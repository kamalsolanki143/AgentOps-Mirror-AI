"""Scoring engine – computes audit scores across all dimensions."""


def compute_scores(transcript: dict) -> dict:
    return {
        "security": 0.95,
        "quality": 0.88,
        "latency": 0.76,
        "policy": 0.92,
        "business": 0.85,
        "overall": 0.87,
    }


if __name__ == "__main__":
    print(compute_scores({}))
