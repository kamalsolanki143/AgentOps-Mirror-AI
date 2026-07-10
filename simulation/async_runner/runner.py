"""
Async Runner – schedules and executes multiple concurrent simulation runs.
Provides semaphore-based concurrency limiting, retries, and aggregates runs statistics.
"""

import asyncio
import logging
import time
from typing import Any, Dict, List, Optional
from simulation.persona_library.models import Persona
from simulation.engine.session import SimulationSession
from simulation.transcripts.storage import TranscriptStorage

logger = logging.getLogger("simulation.async_runner")


class AsyncSimulationRunner:
    """
    Schedules and runs multiple simulation sessions concurrently.
    Provides throttling, retries, and computes aggregate metrics.
    """

    def __init__(
        self,
        concurrency_limit: int = 5,
        max_retries: int = 2,
        turn_timeout: float = 10.0,
        max_turns: int = 4
    ) -> None:
        self.concurrency_limit = concurrency_limit
        self.max_retries = max_retries
        self.turn_timeout = turn_timeout
        self.max_turns = max_turns
        
        self.semaphore = asyncio.Semaphore(concurrency_limit)
        self.storage = TranscriptStorage()

    async def run_single_session_with_retries(
        self,
        persona: Persona,
        scenario: Dict[str, Any],
        target_agent: Any
    ) -> Dict[str, Any]:
        """
        Executes a single persona simulation with N retries on failure.
        Protects execution with a concurrency semaphore.
        """
        async with self.semaphore:
            attempt = 0
            transcript = {}
            
            while attempt <= self.max_retries:
                session = SimulationSession(
                    persona=persona,
                    scenario=scenario,
                    target_agent=target_agent,
                    max_turns=self.max_turns,
                    turn_timeout=self.turn_timeout
                )
                
                transcript = await session.run()
                
                # If run was successful or a terminal error (like safety policy block), stop
                if transcript.get("success", False):
                    break
                
                # Check if it was an internal agent exception (worth retrying)
                reason = transcript.get("failure_reason", "")
                if "Internal Server Error" in reason or "Agent exception" in reason:
                    attempt += 1
                    if attempt <= self.max_retries:
                        logger.warning(
                            f"Retrying session {session.session_id} due to transient failure: {reason}. Attempt {attempt}"
                        )
                        # Backoff delay before retry
                        await asyncio.sleep(1.0 * attempt)
                else:
                    # Timeout or formatting errors don't get retried
                    break
            
            # Persist transcript
            self.storage.save_transcript(transcript)
            return transcript

    async def run_batch(
        self,
        personas: List[Persona],
        scenario: Dict[str, Any],
        target_agent: Any
    ) -> Dict[str, Any]:
        """
        Executes a collection of personas concurrently.
        """
        start_time = time.time()
        logger.info(f"Scheduling concurrent execution for {len(personas)} personas")
        
        tasks = [
            self.run_single_session_with_retries(p, scenario, target_agent)
            for p in personas
        ]
        
        # Run all concurrently
        transcripts = await asyncio.gather(*tasks)
        duration = time.time() - start_time
        
        # Compute aggregate statistics
        total_runs = len(transcripts)
        successful_runs = sum(1 for t in transcripts if t.get("success", False))
        failed_runs = total_runs - successful_runs
        
        all_latencies = []
        for t in transcripts:
            all_latencies.extend(t.get("metrics", {}).get("latencies", []))
            
        avg_latency = sum(all_latencies) / len(all_latencies) if all_latencies else 0.0
        
        # Collect failure categories
        failures = []
        for t in transcripts:
            if not t.get("success", False):
                failures.append({
                    "persona": t.get("persona", {}).get("name", "Unknown"),
                    "session_id": t.get("session_id"),
                    "reason": t.get("failure_reason", "Unknown failure")
                })

        stats = {
            "total_runs": total_runs,
            "success_rate": round(successful_runs / total_runs, 2) if total_runs else 1.0,
            "successful_runs": successful_runs,
            "failed_runs": failed_runs,
            "avg_latency": round(avg_latency, 3),
            "duration": round(duration, 3),
            "failures": failures
        }
        
        logger.info(
            f"Batch run completed in {stats['duration']}s. Success Rate: {stats['success_rate']*100}%"
        )
        return {
            "transcripts": transcripts,
            "statistics": stats
        }
