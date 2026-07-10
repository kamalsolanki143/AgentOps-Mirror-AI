from app.models.user import User
from app.models.agent import Agent
from app.models.persona import Persona
from app.models.stress_test_run import StressTestRun
from app.models.conversation import Conversation
from app.models.finding import Finding
from app.models.risk_score import RiskScore
from app.models.report import Report
from app.models.integration import Integration
from app.models.audit_log import AuditLog


def test_user_model():
    user = User(id=1, name="Test", email="test@test.com", hashed_password="hash", role="user", is_active=True)
    assert user.name == "Test"
    assert user.role == "user"
    assert user.is_active is True


def test_agent_model():
    agent = Agent(id=1, user_id=1, name="Test Agent", model_type="openai", status="active")
    assert agent.name == "Test Agent"
    assert agent.status == "active"


def test_persona_model():
    p = Persona(id=1, user_id=1, name="Test Persona", difficulty="medium")
    assert p.name == "Test Persona"
    assert p.difficulty == "medium"


def test_stress_test_run_model():
    run = StressTestRun(id=1, user_id=1, status="queued", progress=0)
    assert run.status == "queued"
    assert run.progress == 0


def test_conversation_model():
    conv = Conversation(id=1, stress_test_run_id=1, persona_id=1, status="in_progress")
    assert conv.status == "in_progress"


def test_finding_model():
    f = Finding(id=1, stress_test_run_id=1, finding_type="hallucination", title="Test", severity="medium")
    assert f.severity == "medium"


def test_risk_score_model():
    rs = RiskScore(id=1, stress_test_run_id=1, category="security", score=0.85)
    assert rs.score == 0.85


def test_report_model():
    r = Report(id=1, user_id=1, stress_test_run_id=1, title="Test Report", status="generating")
    assert r.status == "generating"


def test_integration_model():
    i = Integration(id=1, user_id=1, name="Slack", integration_type="slack", enabled=False)
    assert i.enabled is False


def test_audit_log_model():
    a = AuditLog(id=1, user_id=1, action="login")
    assert a.action == "login"
