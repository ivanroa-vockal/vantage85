from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from app.services.figma_service import figma_service

router = APIRouter(prefix="/figma", tags=["figma"])


@router.get("/files/{file_key}")
async def get_figma_file(file_key: str):
    try:
        return await figma_service.get_file(file_key)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/files/{file_key}/nodes")
async def get_figma_nodes(file_key: str, ids: str = Query(..., description="Comma-separated node IDs")):
    try:
        node_ids = ids.split(",")
        return await figma_service.get_file_nodes(file_key, node_ids)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/files/{file_key}/images")
async def get_figma_images(
    file_key: str,
    ids: str = Query(..., description="Comma-separated node IDs"),
    format: str = Query("png", description="Image format: png, jpg, svg, pdf"),
):
    try:
        node_ids = ids.split(",")
        return await figma_service.get_images(file_key, node_ids, format)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/files/{file_key}/comments")
async def get_figma_comments(file_key: str):
    try:
        return await figma_service.get_comments(file_key)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/files/{file_key}/components")
async def get_figma_components(file_key: str):
    try:
        return await figma_service.get_components(file_key)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/teams/{team_id}/projects")
async def get_team_projects(team_id: str):
    try:
        return await figma_service.get_projects_for_team(team_id)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/projects/{project_id}/files")
async def get_project_files(project_id: str):
    try:
        return await figma_service.get_project_files(project_id)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
