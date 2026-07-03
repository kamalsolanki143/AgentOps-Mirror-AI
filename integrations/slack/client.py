"""Slack integration – send alerts to channels."""

import httpx


class SlackClient:
    def __init__(self, bot_token: str):
        self.token = bot_token

    async def send_message(self, channel: str, text: str) -> dict:
        async with httpx.AsyncClient() as client:
            resp = await client.post(
                "https://slack.com/api/chat.postMessage",
                headers={"Authorization": f"Bearer {self.token}"},
                json={"channel": channel, "text": text},
            )
            return resp.json()
