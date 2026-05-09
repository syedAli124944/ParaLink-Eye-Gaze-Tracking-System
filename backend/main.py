"""
ParaLink Backend — Main Application
======================================
FastAPI server that powers the ParaLink Eye Gaze Tracking System.

Features:
  - AI Message Conversion (rule-based, 6 languages)
  - Text-to-Speech (gTTS)
  - IoT Device Control (ESP32 — optional)
  - In-Memory History & Suggestions
  - CORS enabled for React frontend

Run with:
  cd backend
  pip install -r requirements.txt
  uvicorn main:app --reload --host 0.0.0.0 --port 8000
"""

import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from config import CORS_ORIGINS, AUDIO_DIR, IOT_ENABLED, HOST, PORT, SERIAL_ENABLED, SERIAL_PORT, SERIAL_BAUD, IOT_MODE
from routes import health, select, suggestions, history, devices, serial_route, tts
from utils.logger import get_logger

logger = get_logger("paralink-backend")


# ──────────────────────────────────────────────
# Application Lifespan (startup / shutdown)
# ──────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Handles startup and shutdown events."""
    # ── STARTUP ──
    logger.info("=" * 60)
    logger.info("  ParaLink Backend Starting...")
    logger.info("=" * 60)

    # Create audio directory
    os.makedirs(AUDIO_DIR, exist_ok=True)
    logger.info(f"Audio directory ready: {AUDIO_DIR}")

    # Log configuration
    logger.info(f"CORS origins: {CORS_ORIGINS}")
    logger.info(f"IoT/ESP32 enabled: {IOT_ENABLED}")
    logger.info(f"IoT mode: {IOT_MODE}")
    logger.info(f"Serial enabled: {SERIAL_ENABLED}")
    logger.info(f"Server: http://{HOST}:{PORT}")
    logger.info(f"API docs: http://localhost:{PORT}/docs")
    logger.info("=" * 60)

    # Auto-connect to ESP32 via serial if enabled
    if SERIAL_ENABLED and IOT_MODE == "serial":
        from services.serial_service import serial_service
        result = serial_service.connect(port=SERIAL_PORT, baud=SERIAL_BAUD)
        logger.info(f"Serial auto-connect: {result['message']}")

    yield  # App is running

    # ── SHUTDOWN ──
    # Disconnect serial if connected
    if SERIAL_ENABLED:
        from services.serial_service import serial_service
        serial_service.disconnect()

    logger.info("ParaLink Backend shutting down...")


# ──────────────────────────────────────────────
# Create FastAPI App
# ──────────────────────────────────────────────
app = FastAPI(
    title="ParaLink Backend",
    description="Backend API for ParaLink Eye Gaze Tracking System for Paralyzed People",
    version="1.0.0",
    lifespan=lifespan,
)

# ──────────────────────────────────────────────
# CORS Middleware (allows frontend to call API)
# ──────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ──────────────────────────────────────────────
# Static Files (serve generated audio files)
# ──────────────────────────────────────────────
os.makedirs(AUDIO_DIR, exist_ok=True)
app.mount("/audio", StaticFiles(directory=AUDIO_DIR), name="audio")

# ──────────────────────────────────────────────
# Register API Routes
# ──────────────────────────────────────────────
app.include_router(health.router, tags=["Health"])
app.include_router(select.router, tags=["Selection"])
app.include_router(suggestions.router, tags=["Suggestions"])
app.include_router(history.router, tags=["History"])
app.include_router(devices.router, tags=["Devices"])
app.include_router(serial_route.router, tags=["Serial"])
app.include_router(tts.router, tags=["TTS"])


# ──────────────────────────────────────────────
# Serve React Frontend (Single Page Application)
# ──────────────────────────────────────────────
# Absolute path to the frontend build directory
FRONTEND_DIST_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "FYP_EOG_System_For_Paralyzed_people", "dist")

if os.path.exists(FRONTEND_DIST_DIR):
    logger.info(f"Frontend build found: {FRONTEND_DIST_DIR}. Serving it at /")
    
    # Mount the Vite assets folder
    assets_dir = os.path.join(FRONTEND_DIST_DIR, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    # Catch-all route to serve the React index.html for all non-API paths
    @app.get("/{full_path:path}", tags=["Frontend"])
    async def serve_frontend(full_path: str):
        # Let API docs pass through
        if full_path in ["docs", "openapi.json", "redoc"]:
            return {"error": "Use exact URL without trailing slash for docs"}
            
        file_path = os.path.join(FRONTEND_DIST_DIR, full_path)
        
        # If the requested file exists (e.g., vite.svg, favicon.ico), serve it
        if os.path.isfile(file_path):
            return FileResponse(file_path)
            
        # Otherwise, serve index.html (React Router handles the rest)
        return FileResponse(os.path.join(FRONTEND_DIST_DIR, "index.html"))
else:
    logger.warning("Frontend build NOT found. Only the API will be served.")
    @app.get("/", tags=["Root"])
    async def root():
        """Root endpoint — shows API info."""
        return {
            "name": "ParaLink Backend",
            "message": "API is running. To serve the frontend here, run 'npm run build' in the frontend folder.",
            "docs": "/docs",
        }


# ──────────────────────────────────────────────
# Run directly with: python main.py
# ──────────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host=HOST, port=PORT, reload=True)
