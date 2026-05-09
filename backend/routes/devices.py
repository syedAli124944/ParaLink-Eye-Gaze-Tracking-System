"""
Devices Route
===============
GET /devices/status — Returns current state of all IoT devices.
"""

from fastapi import APIRouter
from services.iot_service import get_all_device_states
from services.serial_service import serial_service
from config import IOT_ENABLED

router = APIRouter()

@router.get("/devices/status")
async def device_status():
    """Get the current ON/OFF state of all smart home devices and hardware status."""
    serial_status = serial_service.get_status()
    
    return {
        "iot_enabled": IOT_ENABLED,
        "esp32_connected": serial_status.get("is_connected", False),
        "esp32_port": serial_status.get("port"),
        "devices": get_all_device_states(),
    }
