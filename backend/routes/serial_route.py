"""
Serial Route — ESP32 COM Port Management (Phase 2)
=====================================================
REST endpoints for serial connection to ESP32.

Endpoints:
  POST /serial/connect     — Connect to COM port
  POST /serial/disconnect  — Disconnect
  GET  /serial/status      — Connection status
  GET  /serial/ports       — List available COM ports
  POST /serial/send        — Send raw command (testing)
"""

from fastapi import APIRouter
from pydantic import BaseModel, Field
from services.serial_service import serial_service
from config import SERIAL_PORT, SERIAL_BAUD, SERIAL_COMMANDS
from utils.logger import get_logger

logger = get_logger("serial-route")
router = APIRouter(prefix="/serial")


class ConnectRequest(BaseModel):
    """Request body for /serial/connect."""
    port: str = Field(default="auto", description="COM port name or 'auto' for auto-detection")
    baud: int = Field(default=9600, description="Baud rate")


class SendRequest(BaseModel):
    """Request body for /serial/send."""
    command: str = Field(..., description="Single character command to send")


@router.post("/connect")
async def connect_serial(request: ConnectRequest = None):
    """Connect to ESP32 via serial COM port."""
    port = request.port if request else SERIAL_PORT
    baud = request.baud if request else SERIAL_BAUD

    result = serial_service.connect(port=port, baud=baud)
    return result


@router.post("/disconnect")
async def disconnect_serial():
    """Disconnect from ESP32 serial port."""
    result = serial_service.disconnect()
    return result


@router.get("/status")
async def serial_status():
    """Get current serial connection status."""
    return serial_service.get_status()


@router.get("/ports")
async def list_serial_ports():
    """List all available COM ports on this machine."""
    ports = serial_service.list_ports()
    return {"ports": ports, "count": len(ports)}


@router.post("/send")
async def send_serial_command(request: SendRequest):
    """Send a raw single-character command to ESP32 (for testing)."""
    result = serial_service.send_command(request.command)
    return result


@router.get("/commands")
async def list_serial_commands():
    """List all configured serial command mappings."""
    return {
        "commands": SERIAL_COMMANDS,
        "note": "Uppercase = ON, lowercase = OFF",
    }
