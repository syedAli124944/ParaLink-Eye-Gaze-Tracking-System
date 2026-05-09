import serial
import serial.tools.list_ports
import time

def test_esp32():
    print("--- ESP32 Serial Connection Test ---")
    
    # 1. List all ports
    ports = list(serial.tools.list_ports.comports())
    print(f"Found {len(ports)} ports:")
    for p in ports:
        print(f" - {p.device}: {p.description}")

    if not ports:
        print("ERROR: No serial ports found. Is the ESP32 plugged in?")
        return

    # 2. Pick the first one (usually COM3 for you)
    port = ports[0].device
    baud = 9600
    
    print(f"\nAttempting to connect to {port} at {baud} baud...")
    
    try:
        # Open connection
        ser = serial.Serial(port, baud, timeout=1, dsrdtr=True, rtscts=True)
        time.sleep(2) # Wait for boot
        print(f"✅ Successfully opened {port}")
        
        # 3. Test command (Light ON = 'A')
        print("Sending command 'A' (Light ON)...")
        ser.write(b'A')
        ser.flush()
        
        # 4. Wait for response
        time.sleep(1)
        if ser.in_waiting > 0:
            resp = ser.readline().decode('utf-8').strip()
            print(f"📡 ESP32 responded: {resp}")
        else:
            print("⚠️ No response from ESP32, but command was sent.")

        # 5. Test command (Light OFF = 'a')
        print("Sending command 'a' (Light OFF) in 2 seconds...")
        time.sleep(2)
        ser.write(b'a')
        ser.flush()
        
        print("Done. Closing connection.")
        ser.close()

    except Exception as e:
        print(f"❌ ERROR: {str(e)}")

if __name__ == "__main__":
    test_esp32()
