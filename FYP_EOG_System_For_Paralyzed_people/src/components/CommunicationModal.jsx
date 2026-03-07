import { X } from 'lucide-react';
import { useEogSelection } from '../hooks/useEogSelection.js';
import { useEog } from '../contexts/EogContext.jsx';
import { ttsService } from '../services/TtsService.js';

const emotions = [
  {
    id: 'pain',
    label: 'Pain',
    emoji: '😣',
    color: 'from-red-400 to-rose-500',
    hoverColor: 'hover:from-red-500 hover:to-rose-600',
  },
  {
    id: 'happy',
    label: 'Happy',
    emoji: '😊',
    color: 'from-yellow-400 to-orange-500',
    hoverColor: 'hover:from-yellow-500 hover:to-orange-600',
  },
  {
    id: 'sad',
    label: 'Sad',
    emoji: '😢',
    color: 'from-blue-400 to-cyan-500',
    hoverColor: 'hover:from-blue-500 hover:to-cyan-600',
  },
  {
    id: 'hungry',
    label: 'Hungry',
    emoji: '🍽️',
    color: 'from-green-400 to-emerald-500',
    hoverColor: 'hover:from-green-500 hover:to-emerald-600',
  },
  {
    id: 'washroom',
    label: 'Washroom',
    emoji: '🚻',
    color: 'from-teal-400 to-cyan-500',
    hoverColor: 'hover:from-teal-500 hover:to-cyan-600',
  },
  {
    id: 'tired',
    label: 'Tired',
    emoji: '😴',
    color: 'from-indigo-400 to-blue-500',
    hoverColor: 'hover:from-indigo-500 hover:to-blue-600',
  },
  {
    id: 'thirsty',
    label: 'Thirsty',
    emoji: '💧',
    color: 'from-sky-400 to-blue-500',
    hoverColor: 'hover:from-sky-500 hover:to-blue-600',
  },
  {
    id: 'cold',
    label: 'Cold',
    emoji: '🥶',
    color: 'from-cyan-400 to-teal-500',
    hoverColor: 'hover:from-cyan-500 hover:to-teal-600',
  },
  {
    id: 'hot',
    label: 'Hot',
    emoji: '🥵',
    color: 'from-orange-400 to-red-500',
    hoverColor: 'hover:from-orange-500 hover:to-red-600',
  },
];

function EmotionCard({ emotion, index }) {
  const { blinkCount } = useEog();
  
  const handleSelect = () => {
    // Speak immediately when clicking
    console.log('Emotion selected:', emotion.label);
    
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance();
      utterance.text = emotion.label === 'Pain' ? 'I am in pain' :
                       emotion.label === 'Happy' ? 'I am happy' :
                       emotion.label === 'Sad' ? 'I am sad' :
                       emotion.label === 'Hungry' ? 'I am hungry' :
                       emotion.label === 'Washroom' ? 'I need the washroom' :
                       emotion.label === 'Tired' ? 'I am tired' :
                       emotion.label === 'Thirsty' ? 'I am thirsty' :
                       emotion.label === 'Cold' ? 'I am cold' :
                       emotion.label === 'Hot' ? 'I am hot' : emotion.label;
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      utterance.volume = 1;
      
      console.log('Speaking:', utterance.text);
      window.speechSynthesis.speak(utterance);
    }
  };
  
  const { isFocused, eogProps } = useEogSelection({
    id: `emotion-${emotion.id}`,
    label: emotion.label,
    onSelect: handleSelect,
  });

  return (
    <button
      {...eogProps}
      onClick={handleSelect}
      className={`relative bg-gradient-to-br ${emotion.color} ${emotion.hoverColor} rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 animate-slide-up ${
        isFocused ? 'ring-2 sm:ring-4 ring-white ring-offset-1 sm:ring-offset-2 scale-105' : ''
      }`}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="text-4xl sm:text-5xl md:text-6xl mb-2 sm:mb-3 md:mb-4">{emotion.emoji}</div>
      <div className="text-base sm:text-lg md:text-xl font-bold">{emotion.label}</div>
      
      {/* EOG Focus Indicator */}
      {isFocused && (
        <div className="absolute top-2 right-2 sm:top-4 sm:right-4 bg-white text-teal-600 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm font-bold animate-pulse">
          {blinkCount}/3
        </div>
      )}
    </button>
  );
}

export function CommunicationModal({ onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4 animate-fade-in">
      <div className="bg-white rounded-2xl sm:rounded-3xl max-w-6xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto hide-scrollbar shadow-2xl">
        <div className="sticky top-0 bg-gradient-to-r from-teal-500 to-cyan-600 text-white p-4 sm:p-6 rounded-t-2xl sm:rounded-t-3xl flex justify-between items-center z-10">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold">Communication</h2>
          <button
            onClick={onClose}
            className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 hover:bg-white/30 rounded-lg sm:rounded-xl flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        <div className="p-3 sm:p-4 md:p-6">
          <p className="text-gray-600 text-center mb-4 sm:mb-6 text-sm sm:text-base md:text-lg">
            Select how you're feeling or what you need
          </p>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3 md:gap-4">
            {emotions.map((emotion, index) => (
              <EmotionCard key={emotion.id} emotion={emotion} index={index} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
