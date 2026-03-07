/**
 * EOG Service - Handles blink detection for eye tracking
 * 
 * Supports two modes:
 * - Keyboard: Uses Spacebar to simulate blinks (demo/fallback)
 */

export class EogService {
  constructor() {
    this.blinkCount = 0;
    this.blinkTimeout = null;
    this.blinkCallbacks = [];
    this.selectionCallbacks = [];
    this.isActive = false;
    this.BLINK_RESET_DELAY = 2000; // Reset after 2 seconds of no blinks
    this.BLINKS_TO_SELECT = 3; // for blinkins selectiorn
    
    // Bind the handleKeyDown method to this instance
    this.handleKeyDown = this.handleKeyDown.bind(this);
  }

  /**
   * Start listening for blink events
   */
  async startBlinkDetection() {
    if (this.isActive) return true;
    
    this.isActive = true;
    this.blinkCount = 0;

    // Start keyboard mode
    this.startKeyboardMode();
    return true;
  }

  /**
   * Start keyboard mode
   */
  startKeyboardMode() {
    window.addEventListener('keydown', this.handleKeyDown);
    console.log('EOG Service: Blink detection started (Keyboard mode: Press SPACEBAR to blink)');
  }

  /**
   * Stop listening for blink events
   */
  stopBlinkDetection() {
    if (!this.isActive) return;

    this.isActive = false;
    
    // Stop keyboard listener
    window.removeEventListener('keydown', this.handleKeyDown);
    
    this.resetBlinkCount();
    console.log('EOG Service: Blink detection stopped');
  }

  /**
   * Handle keyboard events secondd modee (keyboard mode)
   */
  handleKeyDown(event) {
    if (event.code === 'Space' && !event.repeat) {
      event.preventDefault();
      this.registerBlink();
    }
  }

  /**
   * Register a single blink only (called by keyboard)
   */
  registerBlink() {
    if (!this.isActive) return;

    this.blinkCount++;
    console.log(`EOG Service: Blink registered (${this.blinkCount}/${this.BLINKS_TO_SELECT})`);

    // Notifyingt blink callbacks
    this.blinkCallbacks.forEach(callback => callback());

    // Reset timeisout
    if (this.blinkTimeout) {
      clearTimeout(this.blinkTimeout);
    }
    this.blinkTimeout = setTimeout(() => {
      this.resetBlinkCount();
    }, this.BLINK_RESET_DELAY);

    // Check if selection threshold reached means 3 blinks reached so it select the users emotion ,,, on user denamds
    if (this.blinkCount >= this.BLINKS_TO_SELECT) {
      this.triggerSelection();
    }
  }

  /**
   * Trigger selection (3 blinks reached)
   */
  triggerSelection() {
    console.log('EOG Service: Selection triggered!');
    
    // Notify selection callbacks
    this.selectionCallbacks.forEach(callback => callback());
    
    // Reset blink count after selection
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
    this.blinkCount = 0;
  }

  /**
   * Register callback for blink events
   */
  onBlink(callback) {
    this.blinkCallbacks.push(callback);
    
    // Return unsubscribe function
    return () => {
      this.blinkCallbacks = this.blinkCallbacks.filter(cb => cb !== callback);
    };
  }

  /**
   * Register callback for selection events (3 blinks)
   */
  onSelection(callback) {
    this.selectionCallbacks.push(callback);
    
    // Return unsubscribe function
    return () => {
      this.selectionCallbacks = this.selectionCallbacks.filter(cb => cb !== callback);
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
}

// Singleton instance
export const eogService = new EogService();

//the name SingleSton refers to => only one copy of that used object in whole APP , like EOGService , it is effieient , used for central services 
// (API calls, eye tracking data ) , 
// mainly Memmory EFFICIENT   