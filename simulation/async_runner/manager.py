"""Async runner manager – manages distributed simulation execution via Celery."""

from celery import Celery

app = Celery("simulation", broker="redis://localhost:6379/0")


@app.task
def run_simulation_task(persona_id: int, scenario_id: int):
    return {"persona_id": persona_id, "scenario_id": scenario_id, "status": "completed"}
