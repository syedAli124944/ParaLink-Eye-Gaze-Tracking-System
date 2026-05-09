from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from services import tts_service
from utils.logger import get_logger

logger = get_logger(__name__)
router = APIRouter()

class TTSRequest(BaseModel):
    text: str = Field(..., description="Text to convert to speech")
    language: str = Field(default="en", description="Language code")

class TTSResponse(BaseModel):
    audio_url: str

@router.post("/tts", response_model=TTSResponse)
async def generate_tts(request: TTSRequest):
    """
    Generate Text-to-Speech audio using Google TTS (gTTS).
    This is used by the frontend as a highly reliable fallback when 
    the browser's native SpeechSynthesis lacks language packs (e.g. Urdu, Arabic).
    """
    logger.info(f"Generating generic TTS for text: '{ascii(request.text[:30])}...' in {request.language}")
    
    audio_url = tts_service.generate_audio(request.text, request.language)
    
    if not audio_url:
        raise HTTPException(status_code=500, detail="Failed to generate TTS audio")
        
    return TTSResponse(audio_url=audio_url)
