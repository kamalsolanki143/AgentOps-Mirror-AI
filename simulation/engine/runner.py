"""Simulation engine – orchestrates conversation simulations at scale."""

from typing import AsyncGenerator
import asyncio


class SimulationEngine:
    def __init__(self, max_concurrent: int = 10):
        self.max_concurrent = max_concurrent
        self.semaphore = asyncio.Semaphore(max_concurrent)

    async def run_single(self, persona: dict, scenario: dict) -> dict:
        async with self.semaphore:
            # Placeholder: invoke simulator agent
            await asyncio.sleep(0.1)
            return {"persona": persona["name"], "status": "completed", "turns": 5}

    async def run_batch(self, personas: list[dict], scenario: dict) -> AsyncGenerator[dict, None]:
        tasks = [self.run_single(p, scenario) for p in personas]
        for result in asyncio.as_completed(tasks):
            yield await result
