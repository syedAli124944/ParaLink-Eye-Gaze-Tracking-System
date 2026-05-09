"""
Centralized Logging Setup
===========================
Provides a consistent logger for all backend modules.
Usage:
    from utils.logger import get_logger
    logger = get_logger(__name__)
    logger.info("Server started")
"""

import logging
import sys
from config import LOG_LEVEL, LOG_FORMAT


def get_logger(name: str) -> logging.Logger:
    """
    Create and return a configured logger instance.

    Args:
        name: Module name (usually __name__)

    Returns:
        Configured logging.Logger instance
    """
    logger = logging.getLogger(name)

    # Only add handler if logger doesn't already have one (prevents duplicates)
    if not logger.handlers:
        handler = logging.StreamHandler(sys.stdout)
        handler.setFormatter(logging.Formatter(LOG_FORMAT))
        logger.addHandler(handler)

    logger.setLevel(getattr(logging, LOG_LEVEL, logging.INFO))
    return logger
