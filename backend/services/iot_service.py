"""
IoT Service — ESP32 Device Control (Phase 2)
================================================
Sends commands to ESP32 via Serial (USB) or HTTP (WiFi).
Transport mode is configured in config.py (IOT_MODE).

Serial Mode: Sends single-character commands via COM port (pyserial).
WiFi Mode:   Sends HTTP GET requests to ESP32 web server.

Tracks device state in-memory. Gracefully handles offline ESP32.
"""

import httpx
from config import (
    IOT_ENABLED, IOT_MODE,
    ESP32_IP, ESP32_PORT, ESP32_TIMEOUT,
    SERIAL_ENABLED, SERIAL_COMMANDS,
)
from utils.logger import get_logger

logger = get_logger(__name__)

# In-memory device state tracking
_device_states: dict[str, str] = {
    "light": "OFF",
    "fan": "OFF",
    "ac": "OFF",
    "tv": "OFF",
    "router": "OFF",
}

# Maps value commands to ESP32 HTTP endpoints and resulting state
DEVICE_COMMAND_MAP = {
    "light_on":      {"device": "light",  "endpoint": "/light/on",     "state": "ON"},
    "light_off":     {"device": "light",  "endpoint": "/light/off",    "state": "OFF"},
    "light_dim":     {"device": "light",  "endpoint": "/light/dim",    "state": "DIM"},
    "light_brighten":{"device": "light",  "endpoint": "/light/bright", "state": "BRIGHT"},
    "fan_on":        {"device": "fan",    "endpoint": "/fan/on",       "state": "ON"},
    "fan_off":       {"device": "fan",    "endpoint": "/fan/off",      "state": "OFF"},
    "fan_speed_up":  {"device": "fan",    "endpoint": "/fan/speedup",  "state": "HIGH"},
    "fan_speed_down":{"device": "fan",    "endpoint": "/fan/speeddown","state": "LOW"},
    "ac_on":         {"device": "ac",     "endpoint": "/ac/on",        "state": "ON"},
    "ac_off":        {"device": "ac",     "endpoint": "/ac/off",       "state": "OFF"},
    "ac_temp_up":    {"device": "ac",     "endpoint": "/ac/tempup",    "state": "WARM"},
    "ac_temp_down":  {"device": "ac",     "endpoint": "/ac/tempdown",  "state": "COOL"},
    "tv_on":         {"device": "tv",     "endpoint": "/tv/on",        "state": "ON"},
    "tv_off":        {"device": "tv",     "endpoint": "/tv/off",       "state": "OFF"},
    "tv_volume_up":  {"device": "tv",     "endpoint": "/tv/volup",     "state": "ON"},
    "tv_volume_down":{"device": "tv",     "endpoint": "/tv/voldown",   "state": "ON"},
    "router_on":     {"device": "router", "endpoint": "/router/on",    "state": "ON"},
    "router_off":    {"device": "router", "endpoint": "/router/off",   "state": "OFF"},
    "router_restart":{"device": "router", "endpoint": "/router/restart","state": "RESTARTING"},
}


async def send_device_command(value: str) -> dict:
    """
    Send a command to the ESP32 and update device state.
    Automatically selects Serial or WiFi transport based on config.
    Returns: dict with device_status and esp32_response.
    """
    value_lower = value.lower().strip()

    # Handle "all" commands
    if value_lower == "all_on":
        return await _handle_all_devices("ON")
    elif value_lower == "all_off":
        return await _handle_all_devices("OFF")

    # Look up the command
    if value_lower not in DEVICE_COMMAND_MAP:
        logger.warning(f"Unknown device command: {value_lower}")
        return {"device_status": "UNKNOWN", "esp32_response": "Unknown command"}

    cmd = DEVICE_COMMAND_MAP[value_lower]
    device = cmd["device"]
    new_state = cmd["state"]

    # Update in-memory state
    _device_states[device] = new_state

    # Send to ESP32 based on configured transport mode
    esp32_response = "IoT disabled (simulated)"

    logger.info(f"DEBUG FLAGS: IOT_ENABLED={IOT_ENABLED}, SERIAL_ENABLED={SERIAL_ENABLED}, IOT_MODE={IOT_MODE}")

    if IOT_ENABLED or SERIAL_ENABLED:
        if IOT_MODE == "serial" and SERIAL_ENABLED:
            logger.info("DEBUG: Calling _send_via_serial")
            esp32_response = _send_via_serial(value_lower)
        elif IOT_MODE == "wifi" and IOT_ENABLED:
            esp32_response = await _send_to_esp32(cmd["endpoint"])
        else:
            esp32_response = "Transport not configured"
    else:
        logger.info("DEBUG: Both IOT_ENABLED and SERIAL_ENABLED are false!")

    logger.info(f"Device command: {device} to {new_state} (Response: {esp32_response})")

    return {
        "device_status": new_state,
        "esp32_response": esp32_response,
    }


async def _handle_all_devices(state: str) -> dict:
    """Turn all devices ON or OFF."""
    action = "on" if state == "ON" else "off"
    responses = []

    for device in ["light", "fan", "ac", "tv", "router"]:
        _device_states[device] = state

        if IOT_MODE == "serial" and SERIAL_ENABLED:
            cmd_key = f"all_{action}"
            resp = _send_via_serial(cmd_key)
            responses.append(resp)
            break  # "Z" or "z" handles all at once on ESP32 side
        elif IOT_MODE == "wifi" and IOT_ENABLED:
            resp = await _send_to_esp32(f"/{device}/{action}")
            responses.append(f"{device}: {resp}")

    if not responses:
        responses = ["IoT disabled (all simulated)"]

    logger.info(f"All devices set to {state}")

    return {
        "device_status": state,
        "esp32_response": "; ".join(responses),
    }


def _send_via_serial(command_key: str) -> str:
    """Send a command to ESP32 via USB Serial."""
    from services.serial_service import serial_service

    # Look up the serial character for this command
    serial_char = SERIAL_COMMANDS.get(command_key)
    if not serial_char:
        logger.warning(f"No serial command mapped for: {command_key}")
        return f"No serial mapping for '{command_key}'"

    result = serial_service.send_command(serial_char)

    if result["status"] == "sent":
        # Wait a tiny bit for the ESP32 to process and reply
        import time
        time.sleep(0.3)
        
        # Read the acknowledgment from ESP32
        ack_lines = []
        while True:
            line = serial_service.read_response()
            if not line:
                break
            ack_lines.append(line)
            
        if ack_lines:
            ack_str = " | ".join(ack_lines)
            return f"Serial OK: sent '{serial_char}' | ESP32 replied: '{ack_str}'"
        else:
            return f"Serial OK: sent '{serial_char}' | No reply from ESP32"
    else:
        return f"Serial error: {result['message']}"


async def _send_to_esp32(endpoint: str) -> str:
    """Send an HTTP GET request to the ESP32 (WiFi mode)."""
    url = f"http://{ESP32_IP}:{ESP32_PORT}{endpoint}"

    try:
        async with httpx.AsyncClient(timeout=ESP32_TIMEOUT) as client:
            response = await client.get(url)
            logger.info(f"ESP32 response from {url}: {response.status_code}")
            return f"OK ({response.status_code})"
    except httpx.ConnectError:
        logger.error(f"ESP32 connection failed: {url} — Is ESP32 powered on and connected to WiFi?")
        return "Connection failed"
    except httpx.TimeoutException:
        logger.error(f"ESP32 timeout: {url}")
        return "Timeout"
    except Exception as e:
        logger.error(f"ESP32 error: {e}")
        return f"Error: {str(e)}"


def get_all_device_states() -> dict:
    """Get the current state of all devices."""
    return dict(_device_states)


def get_device_state(device: str) -> str:
    """Get the state of a specific device."""
    return _device_states.get(device.lower(), "UNKNOWN")
