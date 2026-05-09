"""
TTS Service — Text-to-Speech Audio Generation
================================================
Uses Google Text-to-Speech (gTTS) to generate MP3 audio files.
Files are saved to the /audio folder and served as static files.
Includes auto-cleanup to prevent disk space issues.
"""

import os
import time
import glob
import hashlib
from gtts import gTTS

from config import AUDIO_DIR, MAX_AUDIO_FILES
from services.message_service import get_gtts_lang_code
from utils.logger import get_logger

logger = get_logger(__name__)


def ensure_audio_dir():
    """Create audio directory if it doesn't exist."""
    if not os.path.exists(AUDIO_DIR):
        os.makedirs(AUDIO_DIR)
        logger.info(f"Created audio directory: {AUDIO_DIR}")


def cleanup_old_audio_files():
    """
    Remove old audio files, keeping only the most recent MAX_AUDIO_FILES.
    Prevents the audio folder from growing indefinitely.
    """
    try:
        audio_files = glob.glob(os.path.join(AUDIO_DIR, "*.mp3"))
        if len(audio_files) > MAX_AUDIO_FILES:
            # Sort by modification time (oldest first)
            audio_files.sort(key=os.path.getmtime)
            files_to_delete = audio_files[:len(audio_files) - MAX_AUDIO_FILES]
            for f in files_to_delete:
                os.remove(f)
                logger.debug(f"Cleaned up old audio file: {f}")
            logger.info(f"Cleaned up {len(files_to_delete)} old audio files")
    except Exception as e:
        logger.error(f"Error cleaning up audio files: {e}")


def generate_audio(text: str, language: str = "en") -> str | None:
    """
    Generate an MP3 audio file from text using gTTS.

    Args:
        text: The text to convert to speech
        language: Language code ("en", "ur", "ar", "es", "fr", "de")

    Returns:
        Relative URL path to the generated audio file (e.g. "/audio/hungry_ur_1714567890.mp3")
        Returns None if generation fails.
    """
    ensure_audio_dir()

    try:
        # Build a consistent ASCII-only filename based on hash of text and language
        # This acts as a cache so repeated phrases are INSTANT instead of waiting for Google APIs!
        text_hash = hashlib.md5(f"{language}_{text}".encode('utf-8')).hexdigest()
        filename = f"tts_{language}_{text_hash}.mp3"
        filepath = os.path.join(AUDIO_DIR, filename)

        # If we already generated this exact phrase, return it immediately! (Zero latency)
        if os.path.exists(filepath):
            logger.debug(f"TTS Cache hit: {ascii(filename)}")
            # Touch the file to update its modification time so it isn't cleaned up
            os.utime(filepath, None)
            return f"/audio/{filename}"

        # Get gTTS-compatible language code
        gtts_lang = get_gtts_lang_code(language)

        logger.info(f"Generating TTS audio: text='{ascii(text[:50])}...', lang={gtts_lang}, file={ascii(filename)}")

        # Generate audio using gTTS
        tts = gTTS(text=text, lang=gtts_lang, slow=False)
        tts.save(filepath)

        logger.info(f"Audio file saved: {ascii(filepath)} ({os.path.getsize(filepath)} bytes)")

        # Cleanup old files
        cleanup_old_audio_files()

        # Return the URL path (relative to the server root)
        return f"/audio/{filename}"

    except Exception as e:
        logger.error(f"Failed to generate TTS audio: {e}")
        return None
