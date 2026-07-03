"""
Persona Generator – creates diverse user personas for simulation.
"""

from pydantic import BaseModel


class Persona(BaseModel):
    name: str
    age: int
    occupation: str
    traits: list[str]
    background: str
    communication_style: str


class PersonaGenerator:
    async def generate(self, count: int = 1) -> list[Persona]:
        # Placeholder: call LLM to generate personas
        return [
            Persona(
                name="Alex",
                age=28,
                occupation="Software Engineer",
                traits=["curious", "technical", "impatient"],
                background="Works at a tech startup",
                communication_style="direct and concise",
            )
        ]

    async def run(self, config: dict) -> list[dict]:
        personas = await self.generate(config.get("count", 1))
        return [p.model_dump() for p in personas]
