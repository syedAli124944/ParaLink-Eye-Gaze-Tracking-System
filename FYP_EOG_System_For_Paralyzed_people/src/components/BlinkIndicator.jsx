import { useEog } from '../contexts/EogContext.jsx';
import { Eye } from 'lucide-react';

export function BlinkIndicator() {
  const { blinkCount, isEogEnabled } = useEog();

  if (!isEogEnabled) return null;

  return (
    <div className="fixed top-6 right-6 z-50 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl p-4 border-2 border-teal-400">
        {/* EOG Status */}
        <div className="flex items-center gap-2 mb-3">
          <Eye className="w-5 h-5 text-teal-600" />
          <span className="text-sm font-semibold text-gray-700">
            EOG Active (⌨️ Keyboard)
          </span>
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
        <div className="mt-3 pt-3 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
              <>Hover & press <span className="text-teal-600 font-semibold">SPACE</span></>
          </p>
        </div>
      </div>
    </div>
  );
}
