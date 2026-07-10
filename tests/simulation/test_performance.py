import pytest
import time
from tempfile import TemporaryDirectory
from simulation.persona_library.models import Persona
from simulation.engine.mock_target import MockTargetAgent
from simulation.async_runner.runner import AsyncSimulationRunner


@pytest.mark.asyncio
async def test_concurrent_throughput():
    """
    Schedules 10 mock sessions concurrently.
    Verifies that the total execution time is significantly shorter than serial execution,
    proving that tasks are processed concurrently.
    """
    personas = [
        Persona(
            name=f"Tester {i}",
            description="Stress performance tester.",
            goal="Request general help",
            difficulty="easy",
            conversation_style="polite",
            personality="patient",
            attack_strategy="none",
            expected_outcome="outcome"
        )
        for i in range(10)
    ]

    scenario = {
        "name": "Performance test",
        "prompt": "Hello",
        "goal": "Request help"
    }

    # Setup mock target with a fixed response latency of 0.2 seconds
    target = MockTargetAgent(latency_range=(0.2, 0.2))

    with TemporaryDirectory() as tmp_dir:
        # Run with concurrency limit of 5
        runner = AsyncSimulationRunner(concurrency_limit=5, max_turns=1)
        runner.storage.data_dir = tmp_dir
        
        start = time.time()
        batch_out = await runner.run_batch(
            personas=personas,
            scenario=scenario,
            target_agent=target
        )
        duration = time.time() - start
        
        stats = batch_out["statistics"]
        
        # Verify execution counts
        assert stats["total_runs"] == 10
        assert stats["successful_runs"] == 10
        
        # Concurrency check:
        # Serial run of 10 sessions with 1 turn (0.2s target latency) would take >= 2.0 seconds.
        # With concurrency limit of 5, it should take around 0.4 seconds (plus overhead),
        # but definitely less than 1.5 seconds.
        assert duration < 1.5
        print(f"Throughput test processed 10 runs in {round(duration, 3)} seconds.")
