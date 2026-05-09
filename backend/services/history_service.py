"""
History Service — In-Memory Action Storage
=============================================
Stores user actions in a Python list (no database).
Provides history retrieval and frequency-based suggestions.
"""

from datetime import datetime, timezone
from collections import Counter
from config import HISTORY_LIMIT
from utils.logger import get_logger

logger = get_logger(__name__)

# In-memory storage
_history: list[dict] = []


def add_to_history(action_type: str, value: str, message: str) -> None:
    """Add an action to the history."""
    entry = {
        "type": action_type,
        "value": value,
        "message": message,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
    _history.append(entry)
    if len(_history) > HISTORY_LIMIT:
        _history.pop(0)
    logger.info(f"History added: type={action_type}, value={value} (total: {len(_history)})")


def get_history() -> list[dict]:
    """Get the full history (most recent first)."""
    return list(reversed(_history))


def get_suggestions(limit: int = 5) -> list[str]:
    """Get smart suggestions based on frequency of recent actions."""
    if not _history:
        return ["hungry", "thirsty", "pain", "light_on", "fan_on"]
    value_counts = Counter(entry["value"] for entry in _history)
    most_common = value_counts.most_common(limit)
    return [value for value, count in most_common]


def clear_history() -> None:
    """Clear all history."""
    _history.clear()
    logger.info("History cleared")


def get_history_count() -> int:
    """Get the current number of history entries."""
    return len(_history)
