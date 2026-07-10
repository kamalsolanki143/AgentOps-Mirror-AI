"""
Queue Manager – schedules, queues, and processes simulation jobs sequentially or in batches.
"""

import asyncio
import logging
import uuid
from typing import Any, Callable, Dict, List, Optional
from simulation.async_runner.runner import AsyncSimulationRunner

logger = logging.getLogger("simulation.queue")


class SimulationJob:
    """Represents a queued simulation execution job."""

    def __init__(
        self,
        job_id: str,
        personas: List[Any],
        scenario: Dict[str, Any],
        target_agent: Any,
        config: Dict[str, Any]
    ) -> None:
        self.job_id = job_id
        self.personas = personas
        self.scenario = scenario
        self.target_agent = target_agent
        self.config = config
        
        self.status = "queued"  # queued, running, completed, failed
        self.result: Optional[Dict[str, Any]] = None
        self.error: Optional[str] = None


class SimulationQueueManager:
    """
    Manages background simulation tasks using an async task queue.
    """

    def __init__(self, concurrency_limit: int = 5) -> None:
        self.concurrency_limit = concurrency_limit
        self.queue: asyncio.Queue = asyncio.Queue()
        self.jobs: Dict[str, SimulationJob] = {}
        self.worker_task: Optional[asyncio.Task] = None
        self.is_running = False

    def enqueue_job(
        self,
        personas: List[Any],
        scenario: Dict[str, Any],
        target_agent: Any,
        config: Optional[Dict[str, Any]] = None
    ) -> str:
        """Enqueues a new stress test job."""
        job_id = str(uuid.uuid4())
        job = SimulationJob(
            job_id=job_id,
            personas=personas,
            scenario=scenario,
            target_agent=target_agent,
            config=config or {}
        )
        self.jobs[job_id] = job
        self.queue.put_nowait(job_id)
        logger.info(f"Enqueued simulation job: {job_id} ({len(personas)} personas)")
        return job_id

    def get_job_status(self, job_id: str) -> Dict[str, Any]:
        """Gets status and results for a job ID."""
        job = self.jobs.get(job_id)
        if not job:
            return {"status": "not_found"}
        
        return {
            "job_id": job.job_id,
            "status": job.status,
            "result": job.result,
            "error": job.error
        }

    async def start(self) -> None:
        """Starts the background queue processor worker."""
        if self.is_running:
            return
        
        self.is_running = True
        self.worker_task = asyncio.create_task(self._worker())
        logger.info("Simulation queue processor worker started")

    async def stop(self) -> None:
        """Stops the queue processor worker."""
        self.is_running = False
        if self.worker_task:
            self.worker_task.cancel()
            try:
                await self.worker_task
            except asyncio.CancelledError:
                pass
        logger.info("Simulation queue processor worker stopped")

    async def _worker(self) -> None:
        """Internal queue processor loop."""
        while self.is_running:
            try:
                # Wait for next job
                job_id = await self.queue.get()
                job = self.jobs.get(job_id)
                
                if not job:
                    self.queue.task_done()
                    continue

                job.status = "running"
                logger.info(f"Processing simulation job {job_id}...")

                try:
                    runner = AsyncSimulationRunner(
                        concurrency_limit=job.config.get("concurrency_limit", self.concurrency_limit),
                        max_retries=job.config.get("max_retries", 2),
                        turn_timeout=job.config.get("turn_timeout", 10.0),
                        max_turns=job.config.get("max_turns", 4)
                    )
                    
                    # Run the batch simulation
                    result = await runner.run_batch(
                        personas=job.personas,
                        scenario=job.scenario,
                        target_agent=job.target_agent
                    )
                    
                    job.result = result
                    job.status = "completed"
                    logger.info(f"Successfully completed simulation job {job_id}")
                    
                except Exception as e:
                    job.status = "failed"
                    job.error = str(e)
                    logger.error(f"Job {job_id} failed with error: {e}")
                
                self.queue.task_done()

            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"Queue worker encountered error: {e}")
                await asyncio.sleep(1.0)
