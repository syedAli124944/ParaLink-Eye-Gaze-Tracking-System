"""
ParaLink Backend Configuration
================================
Central configuration file for all backend settings.
Change these values to match your setup.
"""

import os

# ──────────────────────────────────────────────
# Server Settings
# ──────────────────────────────────────────────
HOST = "0.0.0.0"
PORT = 8000

# ──────────────────────────────────────────────
# CORS - Frontend Origins
# ──────────────────────────────────────────────
CORS_ORIGINS = [
    "http://localhost:5173",   # Vite dev server
    "http://localhost:3000",   # Alternative dev server
    "http://127.0.0.1:5173",
    "http://127.0.0.1:3000",
]

# ──────────────────────────────────────────────
# Audio / TTS Settings
# ──────────────────────────────────────────────
AUDIO_DIR = os.path.join(os.path.dirname(__file__), "audio")
MAX_AUDIO_FILES = 50  # Auto-cleanup: keep only last N audio files

# ──────────────────────────────────────────────
# History Settings
# ──────────────────────────────────────────────
HISTORY_LIMIT = 20  # Maximum number of history entries to store

# ──────────────────────────────────────────────
# IoT / ESP32 Settings
# ──────────────────────────────────────────────
IOT_ENABLED = False              # Set to True when ESP32 is connected
ESP32_IP = "192.168.1.100"       # Change to your ESP32's IP address
ESP32_PORT = 80                  # ESP32 HTTP server port
ESP32_TIMEOUT = 5                # Seconds to wait for ESP32 response

# IoT transport mode: "wifi" (HTTP) or "serial" (USB COM port)
IOT_MODE = "serial"              # ← Change to "wifi" for wireless ESP32

# ──────────────────────────────────────────────
# Serial / COM Port Settings (Phase 2)
# ──────────────────────────────────────────────
SERIAL_ENABLED = True            # Set to True when ESP32 is connected via USB
SERIAL_PORT = "auto"             # Automatically detect the ESP32 COM port
SERIAL_BAUD = 9600               # Baud rate (must match ESP32 Serial.begin())
SERIAL_TIMEOUT = 1               # Read timeout in seconds

# Serial command mapping — single characters sent to ESP32
# Uppercase = ON, Lowercase = OFF
SERIAL_COMMANDS = {
    "light_on":       "A",
    "light_off":      "a",
    "fan_on":         "B",
    "fan_off":        "b",
    "tv_on":          "C",
    "tv_off":         "c",
    "ac_on":          "D",
    "ac_off":         "d",
    "router_on":      "E",
    "router_off":     "e",
    "all_on":         "Z",
    "all_off":        "z",
    # Extended commands for speed/dim/temp
    "light_dim":      "1",
    "light_brighten":  "2",
    "fan_speed_up":   "3",
    "fan_speed_down":  "4",
    "ac_temp_up":     "5",
    "ac_temp_down":    "6",
    "tv_volume_up":   "7",
    "tv_volume_down":  "8",
    "router_restart":  "9",
}

# ──────────────────────────────────────────────
# Gaze Tracking Settings (Phase 2)
# ──────────────────────────────────────────────
GAZE_DWELL_TIME = 2.0            # Seconds to dwell before selecting a quadrant
LONG_BLINK_DURATION = 1.0        # Seconds of closed eyes = "long blink" (confirm)
GAZE_QUADRANT_MAP = {
    "top_left":     "light",      # GPIO 23 — Bulb
    "top_right":    "fan",        # GPIO 22 — Fan
    "bottom_left":  "tv",         # GPIO 21 — TV
    "bottom_right": "emergency",  # GPIO 19 — Emergency
}

# ──────────────────────────────────────────────
# Logging
# ──────────────────────────────────────────────
LOG_LEVEL = "INFO"
LOG_FORMAT = "%(asctime)s | %(levelname)-8s | %(name)-20s | %(message)s"
