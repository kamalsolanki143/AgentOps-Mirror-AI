"""
Simulator – runs persona-agent conversations.
"""


class Simulator:
    async def run_conversation(self, persona: dict, scenario: dict) -> list[dict]:
        # Placeholder: simulate conversation between persona and target agent
        return [
            {"role": "user", "content": f"Hi, I'm {persona['name']}"},
            {"role": "assistant", "content": "Hello! How can I help you today?"},
            {"role": "user", "content": scenario.get("prompt", "")},
            {"role": "assistant", "content": "I'd be happy to help with that."},
        ]

    async def run(self, config: dict) -> list[dict]:
        return await self.run_conversation(config.get("persona", {}), config.get("scenario", {}))
