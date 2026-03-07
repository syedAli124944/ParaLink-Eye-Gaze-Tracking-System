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
      // Start EOG service
      eogService.startBlinkDetection();

      // Subscribe to blink events
      const unsubscribeBlink = eogService.onBlink(() => {
        setBlinkCount(eogService.getBlinkCount());
      });

      // Subscribe to selection events
      const unsubscribeSelection = eogService.onSelection(() => {
        // Selection will be handled by individual components
        // This just resets the blink count
        setBlinkCount(0);
      });

      return () => {
        unsubscribeBlink();
        unsubscribeSelection();
        eogService.stopBlinkDetection();
      };
    } else {
      eogService.stopBlinkDetection();
      setBlinkCount(0);
    }
  }, [isEogEnabled]);

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
