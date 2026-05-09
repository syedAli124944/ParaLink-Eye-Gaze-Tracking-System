import { useEffect, useState } from 'react';
import { eogService } from '../services/EogService';
import { useEog } from '../contexts/EogContext';

export function GazeCursor() {
  const [position, setPosition] = useState({ x: 0.5, y: 0.5 });
  const [blinkProgress, setBlinkProgress] = useState(0);
  const { isEogEnabled, eogMode } = useEog();

  useEffect(() => {
    if (!isEogEnabled || eogMode !== 'webcam') return;

    // Listen to gaze updates
    const unsubGaze = eogService.onGaze((data) => {
      // Use smooth movement or direct mapping
      setPosition({ x: data.gaze_x, y: data.gaze_y });
    });

    // Listen to blink count for visual feedback
    const unsubBlink = eogService.onBlink(() => {
      const count = eogService.getBlinkCount();
      setBlinkProgress(count);
    });

    // Listen for selection to pulse the cursor
    const unsubSelect = eogService.onSelection(() => {
      setBlinkProgress(0);
      const cursor = document.getElementById('gaze-cursor-inner');
      if (cursor) {
        cursor.classList.add('scale-150', 'bg-red-500');
        setTimeout(() => {
          cursor.classList.remove('scale-150', 'bg-red-500');
        }, 300);
      }
    });

    return () => {
      unsubGaze();
      unsubBlink();
      unsubSelect();
    };
  }, [isEogEnabled, eogMode]);

  if (!isEogEnabled || eogMode !== 'webcam') return null;

  // Map 0-1 range to screen percentage
  const left = `${position.x * 100}%`;
  const top = `${position.y * 100}%`;

  return (
    <div 
      className="fixed pointer-events-none z-[9999] transition-transform duration-300 ease-out"
      style={{ 
        left: 0, 
        top: 0, 
        transform: `translate3d(${position.x * 100}vw, ${position.y * 100}vh, 0) translate(-50%, -50%)` 
      }}
    >
      {/* Outer Ring - showing progress to selection */}
      <div className="relative flex items-center justify-center w-12 h-12">
        <svg className="absolute w-full h-full -rotate-90">
          <circle
            cx="24"
            cy="24"
            r="20"
            fill="none"
            stroke="white"
            strokeWidth="2"
            className="opacity-20"
          />
          <circle
            cx="24"
            cy="24"
            r="20"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            strokeDasharray="125.6"
            strokeDashoffset={125.6 - (125.6 * (blinkProgress / 3))}
            className="text-teal-400 transition-all duration-300"
          />
        </svg>

        {/* Center Point */}
        <div 
          id="gaze-cursor-inner"
          className="w-4 h-4 bg-teal-500 rounded-full border-2 border-white shadow-lg transition-transform duration-200"
        />
      </div>
      
      {/* Direction Label (Optional) */}
      <div className="absolute top-14 left-1/2 -translate-x-1/2 whitespace-nowrap bg-black/50 text-white text-[8px] px-2 py-0.5 rounded-full font-bold uppercase tracking-tighter">
        Tracking
      </div>
    </div>
  );
}
