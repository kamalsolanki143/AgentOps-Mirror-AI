"""Demo data setup script."""

import json

DEMO_PERSONAS = [
    {"name": "Alice", "age": 30, "occupation": "Designer"},
    {"name": "Bob", "age": 25, "occupation": "Student"},
    {"name": "Carol", "age": 40, "occupation": "Executive"},
]

if __name__ == "__main__":
    with open("personas.json", "w") as f:
        json.dump(DEMO_PERSONAS, f, indent=2)
    print("Demo data created!")
