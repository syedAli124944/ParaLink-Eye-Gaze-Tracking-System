import { createContext, useContext, useEffect, useState } from 'react';
import { eogService } from '../services/EogService.js';
import { ttsService } from '../services/TtsService.js';

const EogContext = createContext(undefined);

export function EogProvider({ children }) {
  const [blinkCount, setBlinkCount] = useState(0);
  const [focusedItem, setFocusedItem] = useState(null);
  const [isEogEnabled, setIsEogEnabled] = useState(false);
  const [language, setLanguage] = useState('en');
  const [eogMode, setEogMode] = useState('keyboard');

  useEffect(() => {
    // Load saved language from localStorage
    const savedLanguage = localStorage.getItem('tts-language');
    if (savedLanguage) {
      setLanguage(savedLanguage);
      ttsService.setLanguage(savedLanguage);
    }
  }, []);

  useEffect(() => {
    if (isEogEnabled) {
      // Start EOG service with current mode
      eogService.startBlinkDetection(eogMode);

      // Subscribe to blink events
      const unsubscribeBlink = eogService.onBlink((count) => {
        setBlinkCount(count);
      });

      // Subscribe to selection events
      const unsubscribeSelection = eogService.onSelection(() => {
        // Selection will be handled by individual components
        // This just resets the blink count
        setBlinkCount(0);
      });

      // Subscribe to gaze events for hit-testing
      const unsubscribeGaze = eogService.onGaze((data) => {
        if (eogMode !== 'webcam') return;

        // Convert 0-1 coordinates to screen pixels
        const screenX = data.gaze_x * window.innerWidth;
        const screenY = data.gaze_y * window.innerHeight;

        // Find element at gaze position
        const element = document.elementFromPoint(screenX, screenY);
        if (element) {
          // Look for an element with an ID that matches our focusable items
          // We check the element itself and its parents
          const target = element.closest('[data-eog-id]');
          if (target) {
            const eogId = target.getAttribute('data-eog-id');
            if (eogId && eogId !== focusedItem) {
              setFocusedItem(eogId);
            }
          }
        }
      });

      return () => {
        unsubscribeBlink();
        unsubscribeSelection();
        unsubscribeGaze();
        eogService.stopBlinkDetection();
      };
    } else {
      eogService.stopBlinkDetection();
      setBlinkCount(0);
    }
  }, [isEogEnabled, eogMode]);

  const handleSetEogEnabled = (enabled) => {
    setIsEogEnabled(enabled);
    if (!enabled) {
      setFocusedItem(null);
    }
  };

  const handleSetLanguage = (newLanguage) => {
    setLanguage(newLanguage);
    ttsService.setLanguage(newLanguage);
    localStorage.setItem('tts-language', newLanguage);
    localStorage.setItem('language', newLanguage);
  };

  const triggerSelection = () => {
    eogService.triggerBlink();
    eogService.triggerBlink();
    eogService.triggerBlink();
    // eogService.triggerBlink();
  };

  return (
    <EogContext.Provider
      value={{
        blinkCount,
        focusedItem,
        isEogEnabled,
        language,
        eogMode,
        setFocusedItem,
        setEogEnabled: handleSetEogEnabled,
        setLanguage: handleSetLanguage,
        setEogMode,
        triggerSelection,
      }}
    >
      {children}
    </EogContext.Provider>
  );
}

export function useEog() {
  const context = useContext(EogContext);
  if (context === undefined) {
    throw new Error('useEog must be used within an EogProvider');
  }
  return context;
}
