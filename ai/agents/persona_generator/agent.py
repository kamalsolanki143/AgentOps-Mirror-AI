"""
Persona Generator – creates diverse user personas for simulation.
"""

import json
import logging
from pydantic import BaseModel
from models.llm_client import LLMClient

logger = logging.getLogger("ai.persona_generator")


class Persona(BaseModel):
    name: str
    age: int
    occupation: str
    traits: list[str]
    background: str
    communication_style: str


class PersonaGenerator:
    """
    Agent responsible for generating realistic and adversarial test personas.
    """
    def __init__(self) -> None:
        self.llm_client = LLMClient()

    async def generate(self, count: int = 1) -> list[Persona]:
        """
        Generates a list of personas using LLM or fallback heuristics.
        """
        try:
            prompt_cfg = self.llm_client.load_prompt("personas", "generate")
            system_prompt = prompt_cfg.get("system", "")
            user_prompt = prompt_cfg.get("user", "").format(count=count)
            temp = prompt_cfg.get("temperature", 0.8)

            raw_res = await self.llm_client.call_llm(
                system_prompt=system_prompt,
                user_prompt=user_prompt,
                temperature=temp,
                response_format="json"
            )

            parsed = json.loads(raw_res)
            # Normalize potential dict wrapper
            if isinstance(parsed, dict) and "personas" in parsed:
                parsed_list = parsed["personas"]
            elif isinstance(parsed, dict):
                parsed_list = [parsed]
            elif isinstance(parsed, list):
                parsed_list = parsed
            else:
                raise ValueError("Unexpected response structure from LLM")

            result = []
            for item in parsed_list:
                result.append(Persona(**item))
            return result
        except Exception as e:
            logger.error(f"Failed to generate personas: {e}. Using deterministic fallback.")
            return [
                Persona(
                    name="Alex Mercer",
                    age=31,
                    occupation="Cybersecurity Consultant",
                    traits=["technical", "skeptical", "concise"],
                    background="Adversarial tester with 8 years of experience finding API leaks.",
                    communication_style="Attempts to extract prompt instructions by asking formatting questions."
                )
            ]

    async def run(self, config: dict) -> list[dict]:
        """
        Runs the persona generator agent task.
        """
        personas = await self.generate(config.get("count", 1))
        return [p.model_dump() for p in personas]

