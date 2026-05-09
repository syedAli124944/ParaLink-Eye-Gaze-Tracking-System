"""
Health Check Route
====================
GET /health — Returns server status and configuration info.
"""

from fastapi import APIRouter
from datetime import datetime, timezone
from config import IOT_ENABLED
from services.history_service import get_history_count

router = APIRouter()


@router.get("/health")
async def health_check():
    """Check if the backend server is running and healthy."""
    return {
        "status": "running",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "iot_enabled": IOT_ENABLED,
        "history_count": get_history_count(),
    }
