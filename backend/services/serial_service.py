"""
Serial Service — ESP32 USB Serial Communication (Phase 2)
============================================================
Manages serial connection to ESP32 via COM port (pyserial).
Sends single-character commands to control relays.

Command Map (configured in config.py):
  Light:  'A' = ON,  'a' = OFF   (GPIO 23)
  Fan:    'B' = ON,  'b' = OFF   (GPIO 22)
  TV:     'C' = ON,  'c' = OFF   (GPIO 21)
  AC:     'D' = ON,  'd' = OFF
  Router: 'E' = ON,  'e' = OFF
  All:    'Z' = ON,  'z' = OFF
"""

import threading
import time
from utils.logger import get_logger

logger = get_logger("serial-service")

# Try to import pyserial — graceful fallback if not installed
try:
    import serial
    import serial.tools.list_ports
    PYSERIAL_AVAILABLE = True
except ImportError:
    PYSERIAL_AVAILABLE = False
    logger.warning("pyserial not installed. Run: pip install pyserial")


class SerialService:
    """Thread-safe serial connection manager for ESP32 with auto-reconnect."""

    def __init__(self):
        self._connection = None
        self._lock = threading.Lock()
        self._is_connected = False
        self._port = None
        self._baud = 9600
        self._stop_monitor = threading.Event()
        self._monitor_thread = None

    def start_monitoring(self):
        """Start a background thread to maintain the serial connection."""
        if self._monitor_thread and self._monitor_thread.is_alive():
            return

        self._stop_monitor.clear()
        self._monitor_thread = threading.Thread(target=self._monitor_loop, daemon=True)
        self._monitor_thread.start()
        logger.info("Serial connection monitor started.")

    def stop_monitoring(self):
        """Stop the background monitor."""
        self._stop_monitor.set()
        if self._monitor_thread:
            self._monitor_thread.join(timeout=1.0)
        logger.info("Serial connection monitor stopped.")

    def _monitor_loop(self):
        """Background loop to check and restore connection."""
        while not self._stop_monitor.is_set():
            if not self._is_connected:
                # Try to auto-connect
                from config import SERIAL_PORT, SERIAL_BAUD
                # logger.debug("Monitor: Attempting auto-connect...")
                self.connect(port=SERIAL_PORT, baud=SERIAL_BAUD)
            
            # Check every 5 seconds
            time.sleep(5)

    # ──────────────────────────────────────────
    # Connection Management
    # ──────────────────────────────────────────

    def connect(self, port: str = "COM3", baud: int = 9600) -> dict:
        """
        Open a serial connection to the ESP32.
        Args:
            port: COM port name (e.g., "COM3") or "auto" for auto-detection.
            baud: Baud rate (default 9600).
        Returns: dict with status and message.
        """
        if not PYSERIAL_AVAILABLE:
            return {"status": "error", "message": "pyserial not installed. Run: pip install pyserial"}

        if self._is_connected:
            # Double check if the connection is REALLY open
            try:
                with self._lock:
                    if self._connection and self._connection.is_open:
                        return {"status": "already_connected", "message": f"Already connected to {self._port}", "port": self._port}
                    else:
                        self._is_connected = False
            except Exception:
                self._is_connected = False

        # Auto-detect COM port if requested
        if port.lower() == "auto":
            port = self._auto_detect_port()
            if not port:
                return {"status": "error", "message": "No ESP32/Arduino COM port found. Is it plugged in?"}

        try:
            logger.info(f"Connecting to serial port {port} at {baud} baud...")
            
            # Open the connection OUTSIDE the lock to prevent freezing the API
            new_conn = serial.Serial(
                port=port,
                baudrate=baud,
                timeout=1,
                write_timeout=1,
                dsrdtr=False,
                rtscts=False
            )
            
            # Disable DTR/RTS to prevent reset
            new_conn.dtr = False
            new_conn.rts = False
            
            with self._lock:
                self._connection = new_conn
                self._is_connected = True
                self._port = port
                self._baud = baud

            # Give ESP32 time to boot up
            time.sleep(2)

            logger.info(f"✅ Serial connected: {port} @ {baud} baud")
            return {"status": "connected", "message": f"Connected to {port}", "port": port}

        except serial.SerialException as e:
            logger.error(f"Serial connection failed on {port}: {e}")
            return {"status": "error", "message": f"Cannot open {port}: {str(e)}"}
        except Exception as e:
            logger.error(f"Unexpected serial error: {e}")
            return {"status": "error", "message": str(e)}

    def disconnect(self) -> dict:
        """Close the serial connection."""
        if not self._is_connected:
            return {"status": "already_disconnected", "message": "Not connected"}

        try:
            with self._lock:
                if self._connection and self._connection.is_open:
                    self._connection.close()
                self._is_connected = False
                port = self._port
                self._port = None
                self._connection = None

            logger.info(f"✅ Serial disconnected from {port}")
            return {"status": "disconnected", "message": f"Disconnected from {port}"}
        except Exception as e:
            logger.error(f"Error disconnecting serial: {e}")
            self._is_connected = False
            return {"status": "error", "message": str(e)}

    def send_command(self, command_char: str) -> dict:
        """
        Send a single character command to ESP32.
        Args:
            command_char: Single character (e.g., 'A' for light ON).
        Returns: dict with status.
        """
        if not self._is_connected or not self._connection:
            return {"status": "error", "message": "Serial not connected"}

        if not command_char or len(command_char) != 1:
            return {"status": "error", "message": f"Invalid command: '{command_char}' (must be single char)"}

        try:
            with self._lock:
                if not self._connection.is_open:
                    self._is_connected = False
                    return {"status": "error", "message": "Serial port is closed"}
                    
                self._connection.write(command_char.encode('utf-8'))
                self._connection.flush()

            logger.info(f"📡 Serial TX: '{command_char}' → {self._port}")
            return {"status": "sent", "command": command_char, "port": self._port}

        except serial.SerialTimeoutException:
            logger.error(f"Serial write timeout on {self._port}")
            return {"status": "error", "message": "Write timeout"}
        except serial.SerialException as e:
            logger.error(f"Serial write error: {e}")
            # Connection probably lost
            self._is_connected = False
            return {"status": "error", "message": f"Serial error: {str(e)}"}
        except Exception as e:
            logger.error(f"Unexpected serial write error: {e}")
            return {"status": "error", "message": str(e)}

    def read_response(self) -> str | None:
        """Read a line of response from ESP32 (non-blocking)."""
        if not self._is_connected or not self._connection:
            return None

        try:
            with self._lock:
                if self._connection.is_open and self._connection.in_waiting > 0:
                    # Read whatever is available
                    data = self._connection.read(self._connection.in_waiting).decode('utf-8', errors='ignore').strip()
                    if data:
                        logger.info(f"📡 Serial RX: '{data}'")
                        return data
        except Exception as e:
            logger.error(f"Serial read error: {e}")

        return None

    # ──────────────────────────────────────────
    # Status & Utilities
    # ──────────────────────────────────────────

    def get_status(self) -> dict:
        """Get current serial connection status."""
        return {
            "is_connected": self._is_connected,
            "port": self._port,
            "baud": self._baud,
            "pyserial_installed": PYSERIAL_AVAILABLE,
        }

    @staticmethod
    def list_ports() -> list[dict]:
        """List all available COM ports on the system."""
        if not PYSERIAL_AVAILABLE:
            return []

        ports = []
        for port_info in serial.tools.list_ports.comports():
            ports.append({
                "port": port_info.device,
                "description": port_info.description,
                "manufacturer": port_info.manufacturer or "Unknown",
            })
        return ports

    def _auto_detect_port(self) -> str | None:
        """
        Auto-detect the ESP32/Arduino COM port.
        Looks for common USB-to-Serial chip identifiers.
        """
        if not PYSERIAL_AVAILABLE:
            return None

        known_chips = ["CH340", "CP210", "FTDI", "USB Serial", "Silicon Labs", "Arduino", "ESP32"]

        for port_info in serial.tools.list_ports.comports():
            desc = (port_info.description or "").upper()
            mfg = (port_info.manufacturer or "").upper()

            for chip in known_chips:
                if chip.upper() in desc or chip.upper() in mfg:
                    logger.info(f"Auto-detected ESP32 port: {port_info.device} ({port_info.description})")
                    return port_info.device

        # Fallback: if only one port exists, use it!
        all_ports = list(serial.tools.list_ports.comports())
        if len(all_ports) == 1:
            logger.info(f"Auto-detect fallback: using only available port {all_ports[0].device}")
            return all_ports[0].device

        logger.warning(f"Auto-detect failed. Available ports: {[p.device for p in all_ports]}")
        return None


# Singleton instance
serial_service = SerialService()
