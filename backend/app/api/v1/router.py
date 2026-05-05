from fastapi import APIRouter
from app.api.v1.endpoints import figma

api_router = APIRouter()

api_router.include_router(figma.router)
