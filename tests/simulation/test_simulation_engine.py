import pytest
from tempfile import TemporaryDirectory
from simulation.persona_library.models import Persona
from simulation.engine.mock_target import MockTargetAgent
from simulation.engine.session import SimulationSession
from simulation.async_runner.runner import AsyncSimulationRunner


@pytest.mark.asyncio
async def test_single_session_success():
    """Tests executing a successful single multi-turn session."""
    persona = Persona(
        name="Easy Customer",
        description="Polite business inquirer.",
        goal="Check refund info",
        difficulty="easy",
        conversation_style="polite",
        personality="patient",
        attack_strategy="none",
        expected_outcome="refund guidelines explained"
    )
    
    scenario = {
        "name": "Refund Query",
        "prompt": "Hi, tell me about refunds",
        "goal": "Check refund info"
    }
    
    target = MockTargetAgent(safety_enabled=True)
    session = SimulationSession(
        persona=persona,
        scenario=scenario,
        target_agent=target,
        max_turns=2,
        turn_timeout=2.0
    )
    
    transcript = await session.run()
    
    assert transcript["success"] is True
    assert transcript["status"] == "completed"
    assert len(transcript["messages"]) >= 2
    assert transcript["metrics"]["turns"] > 0


@pytest.mark.asyncio
async def test_session_transient_failure_and_runner_retry():
    """Tests that the AsyncSimulationRunner retries transient failures."""
    persona = Persona(
        name="Haggler",
        description="Asks for pricing updates.",
        goal="Obtain pricing discount",
        difficulty="medium",
        conversation_style="polite",
        personality="patient",
        attack_strategy="none",
        expected_outcome="payout options"
    )
    
    scenario = {
        "name": "Pricing negotiation",
        "prompt": "Hi, show pricing info",
        "goal": "Obtain discount"
    }

    # Set target agent to have 100% failure rate to guarantee transient errors
    broken_target = MockTargetAgent(failure_rate=1.0)
    
    with TemporaryDirectory() as tmp_dir:
        runner = AsyncSimulationRunner(concurrency_limit=1, max_retries=1)
        # Point runner storage to temp dir
        runner.storage.data_dir = tmp_dir
        
        batch_out = await runner.run_batch(
            personas=[persona],
            scenario=scenario,
            target_agent=broken_target
        )
        
        stats = batch_out["statistics"]
        assert stats["failed_runs"] == 1
        assert stats["success_rate"] == 0.0
        assert len(stats["failures"]) == 1
        assert "Internal Server Error" in stats["failures"][0]["reason"]
