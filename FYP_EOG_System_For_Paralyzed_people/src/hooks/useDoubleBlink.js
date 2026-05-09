import { useEffect } from 'react';
import { eogService } from '../services/EogService.js';

/**
 * Custom hook to listen for double-blink events
 * Useful for "Back" or "Close" actions in modals
 */
export function useDoubleBlink(onDoubleBlink) {
  useEffect(() => {
    if (!onDoubleBlink) return;

    // Protection: Don't allow closing for the first 1.2s after opening
    // This prevents the 'Open-then-Instantly-Close' bug if the user 
    // was in the middle of a blink sequence.
    const mountTime = Date.now();

    const unsubscribe = eogService.onDoubleBlink(() => {
      const timeSinceMount = Date.now() - mountTime;
      // Protection: Don't allow closing for the first 500ms after opening
      if (timeSinceMount < 500) {
        console.log('Hook: Double-Blink ignored (too soon after opening)');
        return;
      }
      
      console.log('Hook: Double-Blink event captured');
      onDoubleBlink();
    });

    return unsubscribe;
  }, [onDoubleBlink]);
}
