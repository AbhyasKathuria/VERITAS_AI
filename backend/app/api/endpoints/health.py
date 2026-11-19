from fastapi import APIRouter
from datetime import datetime
import torch
from backend.app.schemas.schemas import HealthResponse
from backend.app.core.config import settings

router = APIRouter()

@router.get("/health", response_model=HealthResponse)
def get_health():
    return HealthResponse(
        status="healthy",
        project=settings.PROJECT_NAME,
        environment=settings.ENVIRONMENT,
        version="1.0.0",
        torch_available=True,
        cuda_available=torch.cuda.is_available(),
        timestamp=datetime.utcnow()
    )
