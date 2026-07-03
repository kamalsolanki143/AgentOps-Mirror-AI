"""Webhook integration – send payloads to custom endpoints."""

import httpx


class WebhookClient:
    def __init__(self, url: str):
        self.url = url

    async def send(self, payload: dict) -> dict:
        async with httpx.AsyncClient() as client:
            resp = await client.post(self.url, json=payload)
            return {"status": resp.status_code}
