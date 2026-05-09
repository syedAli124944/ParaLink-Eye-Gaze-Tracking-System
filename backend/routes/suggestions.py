"""
Suggestions Route
===================
GET /suggestions — Returns smart suggestions based on user history.
"""

from fastapi import APIRouter
from services.history_service import get_suggestions

router = APIRouter()


@router.get("/suggestions")
async def suggestions():
    """Get action suggestions based on usage frequency."""
    return {
        "suggestions": get_suggestions(limit=5),
    }
