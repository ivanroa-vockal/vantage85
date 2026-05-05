import httpx
from typing import Optional
from app.core.config import settings


FIGMA_API_BASE = "https://api.figma.com/v1"


class FigmaService:
    def __init__(self):
        self.api_key = settings.FIGMA_API_KEY
        self.headers = {"X-Figma-Token": self.api_key}

    async def get_file(self, file_key: str) -> dict:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{FIGMA_API_BASE}/files/{file_key}",
                headers=self.headers,
            )
            response.raise_for_status()
            return response.json()

    async def get_file_nodes(self, file_key: str, node_ids: list[str]) -> dict:
        ids = ",".join(node_ids)
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{FIGMA_API_BASE}/files/{file_key}/nodes?ids={ids}",
                headers=self.headers,
            )
            response.raise_for_status()
            return response.json()

    async def get_images(self, file_key: str, node_ids: list[str], format: str = "png") -> dict:
        ids = ",".join(node_ids)
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{FIGMA_API_BASE}/images/{file_key}?ids={ids}&format={format}",
                headers=self.headers,
            )
            response.raise_for_status()
            return response.json()

    async def get_comments(self, file_key: str) -> dict:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{FIGMA_API_BASE}/files/{file_key}/comments",
                headers=self.headers,
            )
            response.raise_for_status()
            return response.json()

    async def get_projects_for_team(self, team_id: str) -> dict:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{FIGMA_API_BASE}/teams/{team_id}/projects",
                headers=self.headers,
            )
            response.raise_for_status()
            return response.json()

    async def get_project_files(self, project_id: str) -> dict:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{FIGMA_API_BASE}/projects/{project_id}/files",
                headers=self.headers,
            )
            response.raise_for_status()
            return response.json()

    async def get_components(self, file_key: str) -> dict:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{FIGMA_API_BASE}/files/{file_key}/components",
                headers=self.headers,
            )
            response.raise_for_status()
            return response.json()


figma_service = FigmaService()
