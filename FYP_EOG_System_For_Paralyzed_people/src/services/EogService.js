/**
 * EOG Service — Handles blink detection for eye tracking
 * 
 * Supports two modes:
 * - Keyboard: Uses Spacebar to simulate blinks (demo/fallback)
 * - WebCam: Uses in-browser MediaPipe FaceLandmarker for real eye tracking
 *           (no Python backend needed for tracking — ESP32 backend still used for device control)
 */

import { browserEyeTracker } from './BrowserEyeTracker.js';

export class EogService {
  constructor() {
    this.blinkCount = 0;
    this.blinkTimeout = null;
    this.blinkCallbacks = [];
    this.selectionCallbacks = [];
    this.doubleBlinkCallbacks = []; // New
    this.isActive = false;
    this.BLINK_RESET_DELAY = 1500; // Reset blinks if inactive for 1.5s
    this.BLINKS_TO_SELECT = 3;
    this.DOUBLE_BLINK_THRESHOLD = 2;
    this.doubleBlinkPendingTimer = null;
    
    // Bind the handleKeyDown method
    this.handleKeyDown = this.handleKeyDown.bind(this);
    
    // WebCam mode state
    this.isWebcamStarted = false;
    this._webcamUnsubscribers = [];

    // Gaze tracking callbacks (forwarded from BrowserEyeTracker)
    this.gazeCallbacks = [];
    this.dwellCallbacks = [];
    this.longBlinkCallbacks = [];
  }

  /**
   * Start listening for blink events
   * @param {string} mode - 'keyboard' or 'webcam'
   */
  async startBlinkDetection(mode = 'keyboard') {
    if (this.isActive) {
      if (this.currentMode !== mode) {
        this.stopBlinkDetection();
      } else {
        return true;
      }
    }
    
    this.isActive = true;
    this.currentMode = mode;
    this.blinkCount = 0;

    if (mode === 'webcam') {
      return this.startWebcamMode();
    } else {
      this.startKeyboardMode();
      return true;
    }
  }

  /**
   * Start keyboard mode — Spacebar simulates blinks
   */
  startKeyboardMode() {
    window.addEventListener('keydown', this.handleKeyDown);
    console.log('EOG Service: Blink detection started (Keyboard mode: Press SPACEBAR)');
  }

  /**
   * Start WebCam mode — Uses browser-based MediaPipe eye tracking
   */
  async startWebcamMode() {
    console.log('EOG Service: Starting browser-based WebCam tracking...');
    
    try {
      const result = await browserEyeTracker.start();
      
      if (result.status === 'error') {
        console.error('EOG Service: Failed to start browser eye tracking:', result.message);
        console.log('EOG Service: Falling back to keyboard mode');
        this.startKeyboardMode();
        return false;
      }

      this.isWebcamStarted = true;

      // Subscribe to blink events from browser tracker
      const unsubBlink = browserEyeTracker.onBlink(() => {
        this.registerBlink();
      });
      this._webcamUnsubscribers.push(unsubBlink);

      // Forward gaze events
      const unsubGaze = browserEyeTracker.onGaze((data) => {
        this.gazeCallbacks.forEach(cb => cb(data));
      });
      this._webcamUnsubscribers.push(unsubGaze);

      // Forward dwell events
      const unsubDwell = browserEyeTracker.onDwellSelect((data) => {
        this.dwellCallbacks.forEach(cb => cb(data));
      });
      this._webcamUnsubscribers.push(unsubDwell);

      // Forward long blink events
      const unsubLongBlink = browserEyeTracker.onLongBlink((data) => {
        this.longBlinkCallbacks.forEach(cb => cb(data));
      });
      this._webcamUnsubscribers.push(unsubLongBlink);

      console.log('EOG Service: ✅ Browser webcam tracking active');
      return true;
    } catch (err) {
      console.error('EOG Service: Failed to start browser webcam:', err);
      this.startKeyboardMode();
      return false;
    }
  }

  /**
   * Stop listening for blink events
   */
  async stopBlinkDetection() {
    if (!this.isActive) return;

    const mode = this.currentMode;
    this.isActive = false;
    this.currentMode = null;
    
    if (mode === 'webcam') {
      this.stopWebcamMode();
    } else {
      window.removeEventListener('keydown', this.handleKeyDown);
    }
    
    this.resetBlinkCount();
    console.log('EOG Service: Blink detection stopped');
  }

  /**
   * Stop WebCam mode
   */
  stopWebcamMode() {
    // Unsubscribe all webcam callbacks
    this._webcamUnsubscribers.forEach(unsub => unsub());
    this._webcamUnsubscribers = [];

    // Stop browser eye tracker
    if (this.isWebcamStarted) {
      browserEyeTracker.stop();
      this.isWebcamStarted = false;
    }
  }

  /**
   * Handle keyboard events (keyboard mode)
   */
  handleKeyDown(event) {
    if (event.code === 'Space' && !event.repeat) {
      event.preventDefault();
      this.registerBlink();
    }
  }

  /**
   * Register a single blink
   */
  registerBlink() {
    if (!this.isActive) return;

    // Clear any pending double-blink if a 3rd blink comes fast
    if (this.doubleBlinkPendingTimer) {
      clearTimeout(this.doubleBlinkPendingTimer);
      this.doubleBlinkPendingTimer = null;
    }

    this.blinkCount++;
    console.log(`EOG Service: Blink registered (${this.blinkCount}/${this.BLINKS_TO_SELECT})`);

    // Notify blink callbacks
    this.blinkCallbacks.forEach(callback => callback(this.blinkCount));

    // Reset total count timeout
    if (this.blinkTimeout) {
      clearTimeout(this.blinkTimeout);
    }
    this.blinkTimeout = setTimeout(() => {
      this.resetBlinkCount();
    }, this.BLINK_RESET_DELAY);

    // 2 blinks -> Wait 800ms. If no 3rd blink, trigger DoubleBlink (Close/Back).
    // 3 blinks -> Trigger Selection (Select).
    if (this.blinkCount === this.DOUBLE_BLINK_THRESHOLD) {
      this.doubleBlinkPendingTimer = setTimeout(() => {
        this.triggerDoubleBlink();
      }, 800); 
    } else if (this.blinkCount >= this.BLINKS_TO_SELECT) {
      this.triggerSelection();
    }
  }

  /**
   * Trigger double blink (2 blinks + pause)
   */
  triggerDoubleBlink() {
    console.log('EOG Service: Double-Blink triggered (Close/Back Action)');
    this.doubleBlinkCallbacks.forEach(callback => callback());
    this.resetBlinkCount();
  }

  /**
   * Trigger selection (3 blinks reached)
   */
  triggerSelection() {
    console.log('EOG Service: Selection triggered!');
    this.selectionCallbacks.forEach(callback => callback());
    this.resetBlinkCount();
  }

  /**
   * Reset blink count
   */
  resetBlinkCount() {
    if (this.blinkTimeout) {
      clearTimeout(this.blinkTimeout);
      this.blinkTimeout = null;
    }
    if (this.doubleBlinkPendingTimer) {
      clearTimeout(this.doubleBlinkPendingTimer);
      this.doubleBlinkPendingTimer = null;
    }
    this.blinkCount = 0;
  }

  /**
   * Register callback for blink events
   */
  onBlink(callback) {
    this.blinkCallbacks.push(callback);
    return () => {
      this.blinkCallbacks = this.blinkCallbacks.filter(cb => cb !== callback);
    };
  }

  /**
   * Register callback for selection events (3 blinks)
   */
  onSelection(callback) {
    this.selectionCallbacks.push(callback);
    return () => {
      this.selectionCallbacks = this.selectionCallbacks.filter(cb => cb !== callback);
    };
  }

  onDoubleBlink(callback) {
    this.doubleBlinkCallbacks.push(callback);
    return () => {
      this.doubleBlinkCallbacks = this.doubleBlinkCallbacks.filter(cb => cb !== callback);
    };
  }

  /**
   * Get current blink count
   */
  getBlinkCount() {
    return this.blinkCount;
  }

  /**
   * Check if service is active
   */
  isBlinkDetectionActive() {
    return this.isActive;
  }

  /**
   * Manual blink trigger (for testing)
   */
  triggerBlink() {
    this.registerBlink();
  }

  // ── Gaze event callbacks ──

  /**
   * Register callback for gaze direction updates
   */
  onGaze(callback) {
    this.gazeCallbacks.push(callback);
    return () => {
      this.gazeCallbacks = this.gazeCallbacks.filter(cb => cb !== callback);
    };
  }

  /**
   * Register callback for dwell-time selection events
   */
  onDwellSelect(callback) {
    this.dwellCallbacks.push(callback);
    return () => {
      this.dwellCallbacks = this.dwellCallbacks.filter(cb => cb !== callback);
    };
  }

  /**
   * Register callback for long blink events
   */
  onLongBlink(callback) {
    this.longBlinkCallbacks.push(callback);
    return () => {
      this.longBlinkCallbacks = this.longBlinkCallbacks.filter(cb => cb !== callback);
    };
  }

  /**
   * Get current gaze data
   */
  getGazeData() {
    if (this.currentMode === 'webcam') {
      return browserEyeTracker.getStatus();
    }
    return {
      x: 0.5,
      y: 0.5,
      direction: 'center',
      quadrant: null,
    };
  }
}

// Singleton instance
export const eogService = new EogService();