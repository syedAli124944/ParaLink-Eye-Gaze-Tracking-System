import { X, Lightbulb, Fan, Tv, Wind, Wifi, Power } from 'lucide-react';
import { useEogSelection } from '../hooks/useEogSelection.js';
import { useEog } from '../contexts/EogContext.jsx';
import { ttsService } from '../services/TtsService.js';

export function HomeAppliancesModal({ onClose }) {
  const { blinkCount } = useEog();

  const appliances = [
    {
      id: 'lights',
      name: 'Lights',
      icon: Lightbulb,
      gradient: 'from-yellow-400 to-orange-400',
      hoverGradient: 'hover:from-yellow-500 hover:to-orange-500',
      states: ['Turn On', 'Turn Off', 'Dim', 'Brighten'],
    },
    {
      id: 'fan',
      name: 'Fan',
      icon: Fan,
      gradient: 'from-blue-400 to-cyan-400',
      hoverGradient: 'hover:from-blue-500 hover:to-cyan-500',
      states: ['Turn On', 'Turn Off', 'Speed Up', 'Speed Down'],
    },
    {
      id: 'ac',
      name: 'Air Conditioner',
      icon: Wind,
      gradient: 'from-cyan-400 to-blue-500',
      hoverGradient: 'hover:from-cyan-500 hover:to-blue-600',
      states: ['Turn On', 'Turn Off', 'Increase Temp', 'Decrease Temp'],
    },
    {
      id: 'tv',
      name: 'Television',
      icon: Tv,
      gradient: 'from-purple-400 to-pink-500',
      hoverGradient: 'hover:from-purple-500 hover:to-pink-600',
      states: ['Turn On', 'Turn Off', 'Volume Up', 'Volume Down'],
    },
    {
      id: 'router',
      name: 'WiFi Router',
      icon: Wifi,
      gradient: 'from-green-400 to-teal-500',
      hoverGradient: 'hover:from-green-500 hover:to-teal-600',
      states: ['Turn On', 'Turn Off', 'Restart'],
    },
    {
      id: 'all',
      name: 'All Devices',
      icon: Power,
      gradient: 'from-red-400 to-orange-500',
      hoverGradient: 'hover:from-red-500 hover:to-orange-600',
      states: ['Turn All On', 'Turn All Off'],
    },
  ];

  function ApplianceCard({ card, index }) {
    const Icon = card.icon;
    
    const handleSelect = () => {
      ttsService.speak(card.name);
    };

    const { isFocused, eogProps } = useEogSelection({
      id: `appliance-${card.id}`,
      label: card.name,
      onSelect: handleSelect,
    });

    return (
      <div
        {...eogProps}
        onClick={handleSelect}
        className={`relative bg-gradient-to-br ${card.gradient} ${card.hoverGradient} rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 cursor-pointer transform transition-all duration-300 hover:scale-105 ${
          isFocused ? 'ring-2 sm:ring-4 ring-white ring-offset-1 sm:ring-offset-2 scale-105' : ''
        }`}
        style={{ animationDelay: `${index * 50}ms` }}
      >
        <div className="flex flex-col items-center text-center space-y-2 sm:space-y-3">
          <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-white/20 rounded-lg sm:rounded-xl flex items-center justify-center backdrop-blur-sm">
            <Icon className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" />
          </div>
          <h3 className="text-base sm:text-lg md:text-xl font-bold text-white">{card.name}</h3>
          <div className="text-xs sm:text-xs text-white/80 space-y-0.5 sm:space-y-1">
            {card.states.map((state, idx) => (
              <div key={idx}>{state}</div>
            ))}
          </div>
        </div>
        
        {/* EOG Focus Indicator */}
        {isFocused && (
          <div className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-white text-blue-600 px-2 py-0.5 sm:py-1 rounded-full text-xs font-bold animate-pulse">
            {blinkCount}/3
          </div>
        )}
      </div>
    );
  }

  const { eogProps: closeButtonProps } = useEogSelection({
    id: 'home-appliances-close',
    label: 'Close',
    onSelect: onClose,
  });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4 animate-fade-in">
      <div className="bg-white rounded-2xl sm:rounded-3xl max-w-6xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto hide-scrollbar shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4 sm:p-6 rounded-t-2xl sm:rounded-t-3xl flex justify-between items-center z-10">
          <div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold">Home Appliances</h2>
            <p className="text-white/90 mt-1 text-xs sm:text-sm">Control your home devices</p>
          </div>
          <button
            {...closeButtonProps}
            onClick={onClose}
            className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 hover:bg-white/30 rounded-lg sm:rounded-xl flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-3 sm:p-4 md:p-6">
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6">
            {appliances.map((card, index) => (
              <ApplianceCard key={card.id} card={card} index={index} />
            ))}
          </div>

          {/* Instructions */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 mt-4 sm:mt-6">
            <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-3 sm:mb-4">How to use:</h3>
            <div className="space-y-2 sm:space-y-3">
              <div className="flex items-start gap-2 sm:gap-3">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs sm:text-base font-bold flex-shrink-0">
                  1
                </div>
                <p className="text-gray-700 pt-0.5 sm:pt-1 text-xs sm:text-sm md:text-base">Select an appliance by looking at it or clicking on it</p>
              </div>
              <div className="flex items-start gap-2 sm:gap-3">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs sm:text-base font-bold flex-shrink-0">
                  2
                </div>
                <p className="text-gray-700 pt-0.5 sm:pt-1 text-xs sm:text-sm md:text-base">The system will announce the device name</p>
              </div>
              <div className="flex items-start gap-2 sm:gap-3">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs sm:text-base font-bold flex-shrink-0">
                  3
                </div>
                <p className="text-gray-700 pt-0.5 sm:pt-1 text-xs sm:text-sm md:text-base">Blink three times to confirm and control the device</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
