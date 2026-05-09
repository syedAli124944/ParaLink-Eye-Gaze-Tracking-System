"""
History Route
===============
GET /history — Returns recent action history.
"""

from fastapi import APIRouter
from services.history_service import get_history

router = APIRouter()


@router.get("/history")
async def history():
    """Get recent action history (most recent first)."""
    return {
        "history": get_history(),
    }
