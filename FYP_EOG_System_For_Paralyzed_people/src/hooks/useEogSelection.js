import { useEffect, useCallback } from 'react';
import { useEog } from '../contexts/EogContext.jsx';
import { eogService } from '../services/EogService.js';
import { ttsService } from '../services/TtsService.js';

export function useEogSelection({
  id,
  label,
  onSelect,
  enabled = true,
}) {
  const { focusedItem, setFocusedItem, isEogEnabled, language } = useEog();
  
  const isFocused = focusedItem === id && isEogEnabled && enabled;

  const handleFocus = useCallback(() => {
    if (isEogEnabled && enabled) {
      setFocusedItem(id);
    }
  }, [id, isEogEnabled, enabled, setFocusedItem]);

  const handleBlur = useCallback(() => {
    if (focusedItem === id) {
      setFocusedItem(null);
    }
  }, [id, focusedItem, setFocusedItem]);

  useEffect(() => {
    if (!isFocused || !enabled) return;

    // Subscribe to selection events when this item is focused
    const unsubscribe = eogService.onSelection(() => {
      console.log(`EOG Selection: ${label}`);
      
      // Speak immediately
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance();
        utterance.text = label === 'Pain' ? 'I am in pain' :
                         label === 'Happy' ? 'I am happy' :
                         label === 'Sad' ? 'I am sad' :
                         label === 'Hungry' ? 'I am hungry' :
                         label === 'Washroom' ? 'I need the washroom' :
                         label === 'Tired' ? 'I am tired' :
                         label === 'Thirsty' ? 'I am thirsty' :
                         label === 'Cold' ? 'I am cold' :
                         label === 'Hot' ? 'I am hot' : label;
        utterance.lang = 'en-US';
        utterance.rate = 0.9;
        utterance.volume = 1;
        
        console.log('EOG Speaking:', utterance.text);
        window.speechSynthesis.speak(utterance);
      }
      
      // Call the selection callback
      onSelect();
      
      // Clear focus
      setFocusedItem(null);
    });

    return unsubscribe;
  }, [isFocused, enabled, label, language, onSelect, setFocusedItem]);

  return {
    isFocused,
    handleFocus,
    handleBlur,
    eogProps: {
      onMouseEnter: handleFocus,
      onMouseLeave: handleBlur,
      onFocus: handleFocus,
      onBlur: handleBlur,
      tabIndex: enabled && isEogEnabled ? 0 : -1,
    },
  };
}
