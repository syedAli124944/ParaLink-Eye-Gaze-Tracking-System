import { useEffect, useRef, useState } from 'react';
import { useEog } from '../contexts/EogContext.jsx';
import { Eye, Move } from 'lucide-react';

export function BlinkIndicator() {
  const { blinkCount, isEogEnabled, eogMode } = useEog();
  
  // Dragging state
  const [position, setPosition] = useState({ x: window.innerWidth - 260, y: 24 });
  const [isDragging, setIsDragging] = useState(false);
  const offsetRef = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e) => {
    if (e.button !== 0) return; // Only left click
    setIsDragging(true);
    offsetRef.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y
    };
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging) return;
      const newX = e.clientX - offsetRef.current.x;
      const newY = e.clientY - offsetRef.current.y;
      
      // Keep within bounds
      const boundedX = Math.max(0, Math.min(newX, window.innerWidth - 240));
      const boundedY = Math.max(0, Math.min(newY, window.innerHeight - 150));
      
      setPosition({ x: boundedX, y: boundedY });
    };

    const handleMouseUp = () => setIsDragging(false);

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  if (!isEogEnabled) return null;

  return (
    <div 
      className={`fixed z-50 animate-fade-in ${isDragging ? 'cursor-grabbing' : ''}`}
      style={{ left: `${position.x}px`, top: `${position.y}px`, transition: isDragging ? 'none' : 'all 0.1s ease-out' }}
    >
      <div className="bg-white rounded-2xl shadow-2xl p-4 border-2 border-teal-400 min-w-[200px]">
        {/* Header with Drag Handle */}
        <div 
          onMouseDown={handleMouseDown}
          className="flex items-center justify-between gap-2 mb-3 cursor-grab active:cursor-grabbing pb-2 border-b border-gray-100"
        >
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-teal-600" />
            <span className="text-sm font-semibold text-gray-700">
              {eogMode === 'webcam' ? '📷 WebCam' : '⌨️ Keyboard'}
            </span>
          </div>
          <Move className="w-4 h-4 text-gray-300" />
        </div>

        {/* Blink Counter */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-600">Blinks:</span>
          <div className="flex gap-1">
            {[1, 2, 3].map((index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index <= blinkCount
                    ? 'bg-teal-500 scale-110 blink-pulse'
                    : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-3">
          <p className="text-xs text-gray-500 text-center">
            {eogMode === 'webcam' ? (
              <>Simply <span className="text-teal-600 font-semibold">BLINK</span> your eyes</>
            ) : (
              <>Hover & press <span className="text-teal-600 font-semibold">SPACE</span></>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
