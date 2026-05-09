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
      'data-eog-id': id,
      onMouseEnter: handleFocus,
      onMouseLeave: handleBlur,
      onFocus: handleFocus,
      onBlur: handleBlur,
      tabIndex: enabled && isEogEnabled ? 0 : -1,
    },
  };
}
