import datetime
from pydantic import BaseModel


class IntegrationCreate(BaseModel):
    name: str
    integration_type: str
    config_json: str | None = None


class IntegrationUpdate(BaseModel):
    name: str | None = None
    config_json: str | None = None
    enabled: bool | None = None


class IntegrationResponse(BaseModel):
    id: int
    user_id: int
    name: str
    integration_type: str
    config_json: str | None
    enabled: bool
    created_at: datetime.datetime
    updated_at: datetime.datetime

    model_config = {"from_attributes": True}
