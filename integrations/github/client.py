"""GitHub integration – create issues from audit findings."""

import httpx


class GitHubClient:
    def __init__(self, token: str, repo: str):
        self.token = token
        self.repo = repo
        self.base_url = f"https://api.github.com/repos/{repo}"

    async def create_issue(self, title: str, body: str) -> dict:
        async with httpx.AsyncClient() as client:
            resp = await client.post(
                f"{self.base_url}/issues",
                headers={"Authorization": f"Bearer {self.token}"},
                json={"title": title, "body": body},
            )
            return resp.json()
