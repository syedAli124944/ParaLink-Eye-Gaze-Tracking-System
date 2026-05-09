"""
Select Route — Main API Endpoint
====================================
POST /select — Handles user selections from the frontend.
Processes communication emotions, device commands, and emergencies.
Generates TTS audio and optionally sends IoT commands.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from services import message_service, tts_service, history_service, iot_service
from utils.logger import get_logger

logger = get_logger(__name__)
router = APIRouter()


class SelectRequest(BaseModel):
    """Request body for the /select endpoint."""
    type: str = Field(..., description="Type: 'communication', 'device', or 'emergency'")
    value: str = Field(..., description="Action ID, e.g. 'hungry', 'light_on', 'nurse'")
    language: str = Field(default="en", description="Language code: en, ur, ar, es, fr, de")


class SelectResponse(BaseModel):
    """Response body for the /select endpoint."""
    message: str
    translated_message: str
    audio_url: str | None = None
    device_status: str | None = None
    esp32_response: str | None = None
    type: str


@router.post("/select", response_model=SelectResponse)
async def handle_selection(request: SelectRequest):
    """
    Main API — Process a user selection from the frontend.

    Flow:
    1. Convert value to natural language message
    2. Generate TTS audio file
    3. If device type, send command to ESP32
    4. Store in history
    5. Return response with message + audio URL + device status
    """
    logger.info(f"━━━ SELECT REQUEST ━━━ type={request.type}, value={request.value}, lang={request.language}")

    # Validate type
    valid_types = ["communication", "device", "emergency"]
    if request.type not in valid_types:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid type '{request.type}'. Must be one of: {valid_types}"
        )

    # Step 1: Convert to natural language message
    msg_result = message_service.get_message(request.type, request.value, request.language)
    english_msg = msg_result["message"]
    translated_msg = msg_result["translated_message"]

    logger.info(f"Message: '{english_msg}' → Translated: '{translated_msg}'")

    # Step 2: Generate TTS audio
    audio_url = tts_service.generate_audio(translated_msg, request.language)
    if audio_url:
        logger.info(f"Audio generated: {audio_url}")
    else:
        logger.warning("Audio generation failed, frontend will use browser TTS as fallback")

    # Step 3: Handle device commands (IoT)
    device_status = None
    esp32_response = None
    if request.type == "device":
        iot_result = await iot_service.send_device_command(request.value)
        device_status = iot_result["device_status"]
        esp32_response = iot_result["esp32_response"]
        logger.info(f"Device: {device_status}, ESP32: {esp32_response}")

    # Step 4: Store in history
    history_service.add_to_history(request.type, request.value, english_msg)

    # Step 5: Build and return response
    response = SelectResponse(
        message=english_msg,
        translated_message=translated_msg,
        audio_url=audio_url,
        device_status=device_status,
        esp32_response=esp32_response,
        type=request.type,
    )

    logger.info(f"━━━ SELECT RESPONSE ━━━ message='{english_msg}', audio={audio_url is not None}")

    return response


@router.get("/test-serial")
async def test_serial():
    """Diagnostic endpoint to test ESP32 serial communication directly via browser."""
    logger.info("━━━ DIAGNOSTIC TEST: /test-serial ━━━")
    
    # Send 'B' directly to serial (Fan ON)
    from services.serial_service import serial_service
    import time
    
    status = serial_service.get_status()
    if not status["is_connected"]:
        return {"error": "Serial port is disconnected. Please check USB."}
        
    result = serial_service.send_command('B')
    if result["status"] == "sent":
        time.sleep(0.3)
        ack_lines = []
        while True:
            line = serial_service.read_response()
            if not line: break
            ack_lines.append(line)
            
        ack_str = " | ".join(ack_lines) if ack_lines else "No reply from ESP32"
        return {"success": True, "message": "Command 'B' (Fan ON) sent!", "esp32_reply": ack_str}
    else:
        return {"success": False, "error": result["message"]}
