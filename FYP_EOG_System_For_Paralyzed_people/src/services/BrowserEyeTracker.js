/**
 * Browser-Based Eye Tracking Service
 * =====================================
 * Uses MediaPipe FaceLandmarker (JavaScript) to run eye tracking
 * entirely in the browser — no Python backend needed for tracking.
 *
 * Features:
 *   - Blink detection via Eye Aspect Ratio (EAR)
 *   - Long blink detection (eyes closed > 1 second)
 *   - Gaze direction estimation via iris tracking
 *   - Dwell-time selection (gaze stays in quadrant for N seconds)
 *
 * The backend is still used for ESP32/IoT device control and TTS.
 * This service ONLY handles the eye tracking part.
 *
 * MediaPipe Landmarks used:
 *   Left eye:  [362, 385, 387, 263, 373, 380]
 *   Right eye: [33, 160, 158, 133, 153, 144]
 *   Left iris:  [468, 469, 470, 471, 472]
 *   Right iris: [473, 474, 475, 476, 477]
 */

// Eye contour landmark indices (MediaPipe Face Mesh)
const LEFT_EYE = [362, 385, 387, 263, 373, 380];
const RIGHT_EYE = [33, 160, 158, 133, 153, 144];

// Iris center landmarks (requires refine_landmarks)
const LEFT_IRIS = [468, 469, 470, 471, 472];
const RIGHT_IRIS = [473, 474, 475, 476, 477];

// Eye corner landmarks for gaze calculation
const LEFT_EYE_INNER = 263;
const LEFT_EYE_OUTER = 362;
const RIGHT_EYE_INNER = 133;
const RIGHT_EYE_OUTER = 33;

// Vertical landmarks for gaze
const LEFT_EYE_TOP = 386;
const LEFT_EYE_BOTTOM = 374;
const RIGHT_EYE_TOP = 159;
const RIGHT_EYE_BOTTOM = 145;

// Detection thresholds
const EAR_THRESHOLD = 0.15; // Conservative threshold for maximum reliability
const BLINK_CONSEC_FRAMES = 2; // Requires 2 frames to be sure it's a blink
const BLINK_COOLDOWN_MS = 300; 
const LONG_BLINK_DURATION = 1.0;    // seconds
const GAZE_DWELL_TIME = 2.0;        // seconds

// Gaze quadrant → device mapping (matches backend config)
const GAZE_QUADRANT_MAP = {
  top_left: 'light',
  top_right: 'fan',
  bottom_left: 'tv',
  bottom_right: 'ac',
};


class BrowserEyeTracker {
  constructor() {
    this.isRunning = false;
    this.videoElement = null;
    this.stream = null;
    this.faceLandmarker = null;
    this.animFrameId = null;

    // Callbacks
    this.blinkCallbacks = [];
    this.longBlinkCallbacks = [];
    this.gazeCallbacks = [];
    this.dwellCallbacks = [];

    // Blink detection state
    this.blinkCounter = 0;
    this.totalBlinks = 0;
    this.lastBlinkTime = 0;
    this.currentEar = 0.0;
    this.faceDetected = false;

    // Long blink state
    this.eyesClosedStart = 0;
    this.isEyesClosed = false;
    this.longBlinkFired = false;

    // Gaze tracking state
    this.gazeDirection = 'center';
    this.gazeX = 0.5;
    this.gazeY = 0.5;
    this.gazeQuadrant = null;

    // Dwell-time state
    this.dwellStart = 0;
    this.dwellQuadrant = null;
    this.dwellConfirmed = false;

    // Calibration
    this.calibrationData = {
      centerX: 0.5,
      centerY: 0.5,
      rangeX: 0.15,
      rangeY: 0.10,
    };

    // Frame counter for gaze
    this.frameCount = 0;
    this.gazeHistoryX = [];
    this.gazeHistoryY = [];
  }

  /**
   * Start the browser-based eye tracking
   */
  async start() {
    if (this.isRunning) {
      console.log('[EyeTracker] Already running');
      return { status: 'already_running' };
    }

    try {
      console.log('[EyeTracker] Starting browser-based eye tracking...');

      // 1. Load MediaPipe FaceLandmarker
      await this._loadFaceLandmarker();

      // 2. Open webcam
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' },
      });

      // 3. Create hidden video element for processing
      this.videoElement = document.createElement('video');
      this.videoElement.srcObject = this.stream;
      this.videoElement.setAttribute('playsinline', '');
      this.videoElement.muted = true;
      await this.videoElement.play();

      // 4. Reset state
      this._resetState();

      // 5. Start detection loop
      this.isRunning = true;
      this._detectionLoop();

      console.log('[EyeTracker] ✅ Browser eye tracking started');
      return { status: 'started', message: 'Eye tracking started (in-browser)' };

    } catch (err) {
      console.error('[EyeTracker] Failed to start:', err);
      this.isRunning = false;
      return { status: 'error', message: err.message || 'Failed to start eye tracking' };
    }
  }

  /**
   * Stop eye tracking and release resources
   */
  stop() {
    if (!this.isRunning) return;

    console.log('[EyeTracker] Stopping...');
    this.isRunning = false;

    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }

    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }

    if (this.videoElement) {
      this.videoElement.srcObject = null;
      this.videoElement = null;
    }

    console.log('[EyeTracker] ✅ Stopped');
  }

  /**
   * Get the current video stream (for WebcamPreview to display)
   */
  getStream() {
    return this.stream;
  }

  /**
   * Get the video element (for WebcamPreview to attach)
   */
  getVideoElement() {
    return this.videoElement;
  }

  /**
   * Load MediaPipe FaceLandmarker from CDN
   */
  async _loadFaceLandmarker() {
    if (this.faceLandmarker) return;

    try {
      console.log('[EyeTracker] Loading MediaPipe Vision bundle...');
      // Dynamically import MediaPipe Vision from CDN
      const vision = await import(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/vision_bundle.mjs'
      );
      console.log('[EyeTracker] MediaPipe bundle imported');

      const { FaceLandmarker, FilesetResolver } = vision;

      console.log('[EyeTracker] Resolving WASM files...');
      const filesetResolver = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/wasm'
      );
      console.log('[EyeTracker] WASM files resolved');

      console.log('[EyeTracker] Creating FaceLandmarker instance...');
      this.faceLandmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
        baseOptions: {
          modelAssetPath:
            'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
          delegate: 'GPU',
        },
        outputFaceBlendshapes: false,
        runningMode: 'VIDEO',
        numFaces: 1,
      }).catch(async (err) => {
        console.warn('[EyeTracker] GPU acceleration failed, falling back to CPU:', err);
        return await FaceLandmarker.createFromOptions(filesetResolver, {
          baseOptions: {
            modelAssetPath:
              'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
            delegate: 'CPU',
          },
          outputFaceBlendshapes: false,
          runningMode: 'VIDEO',
          numFaces: 1,
        });
      });

      console.log('[EyeTracker] ✅ MediaPipe FaceLandmarker loaded successfully');
    } catch (err) {
      console.error('[EyeTracker] ❌ MediaPipe initialization failed:', err);
      throw err; // Rethrow to be caught by start()
    }
  }

  /**
   * Main detection loop using requestAnimationFrame
   */
  _detectionLoop() {
    if (!this.isRunning || !this.videoElement || !this.faceLandmarker) return;

    const video = this.videoElement;

    if (video.readyState >= 2) {
      const now = performance.now();
      const results = this.faceLandmarker.detectForVideo(video, now);

      if (results.faceLandmarks && results.faceLandmarks.length > 0) {
        this.faceDetected = true;
        const landmarks = results.faceLandmarks[0];
        const w = video.videoWidth;
        const h = video.videoHeight;

        // Blink detection via EAR
        const leftEar = this._calculateEar(landmarks, LEFT_EYE);
        const rightEar = this._calculateEar(landmarks, RIGHT_EYE);
        const avgEar = (leftEar + rightEar) / 2.0;
        this.currentEar = avgEar;

        // Short blink detection
        if (avgEar < EAR_THRESHOLD) {
          this.blinkCounter++;
        } else {
          if (this.blinkCounter >= BLINK_CONSEC_FRAMES) {
            const blinkTime = Date.now();
            if (blinkTime - this.lastBlinkTime > BLINK_COOLDOWN_MS) {
              if (!this.longBlinkFired) {
                this.totalBlinks++;
                this.lastBlinkTime = blinkTime;
                console.log(`[EyeTracker] 👁️ Blink detected #${this.totalBlinks}`);
                this._notifyBlink();
              }
            }
          }
          this.blinkCounter = 0;
        }

        // Long blink detection
        this._processLongBlink(avgEar);

        // Gaze direction (Process every frame for zero lag)
        this.frameCount++;
        
        // FIX: Balanced gaze lock (0.22)
        // Freezes cursor during blinks, but allows movement during normal gaze.
        if (avgEar > 0.22) {
          const [newGazeX, newGazeY, direction] = this._calculateGaze(landmarks);
          
          // Ultra-smooth (0.95) - Very stable, no jitter
          const smoothingX = 0.95;
          const smoothingY = 0.95; 
          
          const movementX = Math.abs(newGazeX - this.gazeX);
          const movementY = Math.abs(newGazeY - this.gazeY);
          const threshold = 0.003; 
          
          if (movementX > threshold || movementY > threshold) {
            this.gazeX = (this.gazeX * smoothingX) + (newGazeX * (1 - smoothingX));
            this.gazeY = (this.gazeY * smoothingY) + (newGazeY * (1 - smoothingY));
          }
          
          this.gazeDirection = direction;
          this.gazeQuadrant = this._getQuadrant(this.gazeX, this.gazeY);
          this._processDwell(this.gazeQuadrant);
          this._notifyGaze();
        }

      } else {
        this.faceDetected = false;
        this.blinkCounter = 0;
        this.isEyesClosed = false;
      }
    }

    this.animFrameId = requestAnimationFrame(() => this._detectionLoop());
  }

  /**
   * Calculate Eye Aspect Ratio (EAR) for one eye
   * EAR = (|p2-p6| + |p3-p5|) / (2 * |p1-p4|)
   */
  _calculateEar(landmarks, eyeIndices) {
    try {
      const pts = eyeIndices.map(i => landmarks[i]);

      const v1 = Math.hypot(pts[1].x - pts[5].x, pts[1].y - pts[5].y);
      const v2 = Math.hypot(pts[2].x - pts[4].x, pts[2].y - pts[4].y);
      const h = Math.hypot(pts[0].x - pts[3].x, pts[0].y - pts[3].y);

      if (h === 0) return 0;
      return (v1 + v2) / (2.0 * h);
    } catch {
      return 0.3; // Default "open" value on error
    }
  }

  /**
   * Calculate gaze direction using iris position relative to eye corners
   */
  _calculateGaze(landmarks) {
    try {
      // Iris centers
      const leftIrisX = LEFT_IRIS.reduce((sum, i) => sum + landmarks[i].x, 0) / LEFT_IRIS.length;
      const leftIrisY = LEFT_IRIS.reduce((sum, i) => sum + landmarks[i].y, 0) / LEFT_IRIS.length;
      const rightIrisX = RIGHT_IRIS.reduce((sum, i) => sum + landmarks[i].x, 0) / RIGHT_IRIS.length;
      const rightIrisY = RIGHT_IRIS.reduce((sum, i) => sum + landmarks[i].y, 0) / RIGHT_IRIS.length;

      // Horizontal gaze ratios
      const leftOuter = landmarks[LEFT_EYE_OUTER];
      const leftInner = landmarks[LEFT_EYE_INNER];
      const rightOuter = landmarks[RIGHT_EYE_OUTER];
      const rightInner = landmarks[RIGHT_EYE_INNER];

      const leftEyeW = Math.abs(leftInner.x - leftOuter.x);
      const rightEyeW = Math.abs(rightInner.x - rightOuter.x);

      // Enhanced Horizontal Gaze: Using iris position relative to stable eye corners
      // and compensating for head distance using eye-to-eye width
      const eyeToEyeDist = Math.abs(leftInner.x - rightInner.x) || 0.1;
      
      const leftRatio = leftEyeW > 0 ? (leftIrisX - leftOuter.x) / leftEyeW : 0.5;
      const rightRatio = rightEyeW > 0 ? (rightIrisX - rightOuter.x) / rightEyeW : 0.5;
      
      // Calculate raw horizontal gaze
      let rawGazeX = (leftRatio + rightRatio) / 2.0;
      
      // Reduced horizontal sensitivity for better control
      let gazeX = 0.5 + (rawGazeX - 0.5) * 1.6;

      // Vertical gaze: Using iris position relative to the stable nose bridge
      const noseBridge = landmarks[6]; // Stable point between eyes
      
      const avgIrisY = (leftIrisY + rightIrisY) / 2.0;
      
      // Ultra-low vertical sensitivity (lowered from 9.0 to 6.0)
      const verticalOffset = (avgIrisY - (noseBridge.y - 0.02)) / eyeToEyeDist;
      let gazeY = 0.5 - (verticalOffset * 6.0);
      
      // Clamp
      gazeX = Math.max(0, Math.min(1, gazeX));
      gazeY = Math.max(0, Math.min(1, gazeY));

      // Determine direction
      const { centerX: cx, centerY: cy, rangeX: rx, rangeY: ry } = this.calibrationData;

      const hDir = gazeX < cx - rx ? 'left' : gazeX > cx + rx ? 'right' : 'center';
      const vDir = gazeY < cy - ry ? 'up' : gazeY > cy + ry ? 'down' : 'center';

      let direction;
      if (hDir === 'center' && vDir === 'center') direction = 'center';
      else if (vDir === 'center') direction = hDir;
      else if (hDir === 'center') direction = vDir;
      else direction = `${vDir}_${hDir}`;

      return [gazeX, gazeY, direction];
    } catch (e) {
      console.error('[EyeTracker] Gaze error:', e);
      return [0.5, 0.5, 'center'];
    }
  }

  /**
   * Map gaze position to screen quadrant
   */
  _getQuadrant(gazeX, gazeY) {
    const { centerX: cx, centerY: cy } = this.calibrationData;

    if (Math.abs(gazeX - cx) < 0.05 && Math.abs(gazeY - cy) < 0.05) {
      return null; // Center zone
    }

    if (gazeY < cy) {
      return gazeX < cx ? 'top_left' : 'top_right';
    } else {
      return gazeX < cx ? 'bottom_left' : 'bottom_right';
    }
  }

  /**
   * Long blink detection
   */
  _processLongBlink(avgEar) {
    const now = Date.now() / 1000;

    if (avgEar < EAR_THRESHOLD) {
      if (!this.isEyesClosed) {
        this.isEyesClosed = true;
        this.eyesClosedStart = now;
        this.longBlinkFired = false;
      } else if (!this.longBlinkFired) {
        const elapsed = now - this.eyesClosedStart;
        if (elapsed >= LONG_BLINK_DURATION) {
          this.longBlinkFired = true;
          console.log(`[EyeTracker] 👁️ LONG BLINK (${elapsed.toFixed(1)}s)`);
          this._notifyLongBlink(this.dwellQuadrant);
        }
      }
    } else {
      this.isEyesClosed = false;
    }
  }

  /**
   * Dwell-time tracking
   */
  _processDwell(quadrant) {
    const now = Date.now() / 1000;

    if (quadrant === null) {
      this.dwellQuadrant = null;
      this.dwellStart = 0;
      this.dwellConfirmed = false;
      return;
    }

    if (quadrant !== this.dwellQuadrant) {
      this.dwellQuadrant = quadrant;
      this.dwellStart = now;
      this.dwellConfirmed = false;
    } else {
      const elapsed = now - this.dwellStart;
      if (elapsed >= GAZE_DWELL_TIME && !this.dwellConfirmed) {
        this.dwellConfirmed = true;
        const device = GAZE_QUADRANT_MAP[quadrant] || 'unknown';
        console.log(`[EyeTracker] 👁️ DWELL SELECT: ${quadrant} → ${device}`);
        this._notifyDwell(quadrant, device);
      }
    }
  }

  // ── Callback registration ──

  onBlink(callback) {
    this.blinkCallbacks.push(callback);
    return () => { this.blinkCallbacks = this.blinkCallbacks.filter(cb => cb !== callback); };
  }

  onLongBlink(callback) {
    this.longBlinkCallbacks.push(callback);
    return () => { this.longBlinkCallbacks = this.longBlinkCallbacks.filter(cb => cb !== callback); };
  }

  onGaze(callback) {
    this.gazeCallbacks.push(callback);
    return () => { this.gazeCallbacks = this.gazeCallbacks.filter(cb => cb !== callback); };
  }

  onDwellSelect(callback) {
    this.dwellCallbacks.push(callback);
    return () => { this.dwellCallbacks = this.dwellCallbacks.filter(cb => cb !== callback); };
  }

  // ── Notification helpers ──

  _notifyBlink() {
    this.blinkCallbacks.forEach(cb => {
      try { cb(this.totalBlinks); } catch (e) { console.error(e); }
    });
  }

  _notifyLongBlink(quadrant) {
    const device = GAZE_QUADRANT_MAP[quadrant] || 'none';
    this.longBlinkCallbacks.forEach(cb => {
      try { cb({ quadrant, device }); } catch (e) { console.error(e); }
    });
  }

  _notifyGaze() {
    const data = {
      gaze_x: this.gazeX,
      gaze_y: this.gazeY,
      direction: this.gazeDirection,
      quadrant: this.gazeQuadrant,
    };
    this.gazeCallbacks.forEach(cb => {
      try { cb(data); } catch (e) { console.error(e); }
    });
  }

  _notifyDwell(quadrant, device) {
    this.dwellCallbacks.forEach(cb => {
      try { cb({ quadrant, device }); } catch (e) { console.error(e); }
    });
  }

  /**
   * Get current status
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      faceDetected: this.faceDetected,
      totalBlinks: this.totalBlinks,
      currentEar: this.currentEar,
      gazeDirection: this.gazeDirection,
      gazeX: this.gazeX,
      gazeY: this.gazeY,
      gazeQuadrant: this.gazeQuadrant,
    };
  }

  /**
   * Reset all tracking state
   */
  _resetState() {
    this.blinkCounter = 0;
    this.totalBlinks = 0;
    this.lastBlinkTime = 0;
    this.currentEar = 0;
    this.faceDetected = false;
    this.eyesClosedStart = 0;
    this.isEyesClosed = false;
    this.longBlinkFired = false;
    this.gazeDirection = 'center';
    this.gazeX = 0.5;
    this.gazeY = 0.5;
    this.gazeQuadrant = null;
    this.dwellStart = 0;
    this.dwellQuadrant = null;
    this.dwellConfirmed = false;
    this.frameCount = 0;
  }
}

// Singleton instance
export const browserEyeTracker = new BrowserEyeTracker();
