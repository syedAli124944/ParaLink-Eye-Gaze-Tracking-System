import { useState } from 'react';
import { X, Phone, AlertCircle, User, Pill, Zap, Shield } from 'lucide-react';
import { sendSelection } from '../services/ApiService.js';
import { useEog } from '../contexts/EogContext.jsx';
import { ttsService } from '../services/TtsService.js';
import { useDoubleBlink } from '../hooks/useDoubleBlink.js';

const emergencyOptions = [
  {
    id: 'call-15',
    label: 'Call 15',
    description: 'Immediate emergency response',
    icon: Phone,
    color: 'from-red-500 to-rose-600',
    hoverColor: 'hover:from-red-600 hover:to-rose-700',
    priority: 'critical',
  },
  {
    id: 'nurse',
    label: 'Call Nurse',
    description: 'Request immediate assistance',
    icon: User,
    color: 'from-orange-400 to-red-500',
    hoverColor: 'hover:from-orange-500 hover:to-red-600',
    priority: 'high',
  },
  {
    id: 'medical-alert',
    label: 'Medical Alert',
    description: 'Report health concern',
    icon: AlertCircle,
    color: 'from-yellow-400 to-orange-500',
    hoverColor: 'hover:from-yellow-500 hover:to-orange-600',
    priority: 'high',
  },
  {
    id: 'medication',
    label: 'Medication Needed',
    description: 'Request medication assistance',
    icon: Pill,
    color: 'from-teal-400 to-cyan-500',
    hoverColor: 'hover:from-teal-500 hover:to-cyan-600',
    priority: 'medium',
  },
  {
    id: 'discomfort',
    label: 'Severe Discomfort',
    description: 'Report pain or discomfort',
    icon: Zap,
    color: 'from-purple-400 to-pink-500',
    hoverColor: 'hover:from-purple-500 hover:to-pink-600',
    priority: 'high',
  },
  {
    id: 'security',
    label: 'Security Alert',
    description: 'Report security concern',
    icon: Shield,
    color: 'from-blue-400 to-indigo-500',
    hoverColor: 'hover:from-blue-500 hover:to-indigo-600',
    priority: 'high',
  },
];

import { useEogSelection } from '../hooks/useEogSelection.js';

export function EmergencyModal({ onClose }) {
  useDoubleBlink(onClose);
  const { language, blinkCount } = useEog();
  const [successMessage, setSuccessMessage] = useState(null);

  const handleEmergencyClick = (option) => {
    console.log('Emergency triggered:', option.label);
    ttsService.speak(`Emergency! ${option.label}`, language);
    setSuccessMessage(`🚨 Sending alert: ${option.label}...`);
    setTimeout(() => setSuccessMessage(null), 3000);

    sendSelection('emergency', option.id, language)
      .catch(error => {
        console.warn('Backend unavailable:', error.message);
        setSuccessMessage(`🚨 Alert: ${option.label} (offline mode)`);
        setTimeout(() => setSuccessMessage(null), 3000);
      });
  };

  const { eogProps: closeButtonProps } = useEogSelection({
    id: 'emergency-close',
    label: 'Close Emergency',
    onSelect: onClose,
  });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4 animate-fade-in">
      <div className="bg-white rounded-2xl sm:rounded-3xl max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto hide-scrollbar shadow-2xl">
        <div className="sticky top-0 bg-gradient-to-r from-red-500 to-rose-600 text-white p-4 sm:p-6 rounded-t-2xl sm:rounded-t-3xl flex justify-between items-center z-10">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-lg sm:rounded-xl flex items-center justify-center">
              <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold">Emergency</h2>
          </div>
          <button
            {...closeButtonProps}
            onClick={onClose}
            className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 hover:bg-white/30 rounded-lg sm:rounded-xl flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* Success Toast */}
        {successMessage && (
          <div className="fixed inset-x-0 top-6 z-[9999] flex justify-center pointer-events-none">
            <div className="bg-red-600 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 border-2 border-white/20 backdrop-blur-md max-w-md toast-slide-down">
              <span className="font-bold tracking-wide text-sm">{successMessage}</span>
            </div>
          </div>
        )}

        <div className="p-3 sm:p-4 md:p-6">
          <div className="bg-red-50 border-2 border-red-200 rounded-lg sm:rounded-xl p-3 sm:p-4 mb-4 sm:mb-6">
            <p className="text-red-800 font-medium text-center text-xs sm:text-sm md:text-base">
              These buttons will alert staff immediately. Use only when necessary.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {emergencyOptions.map((option, index) => (
              <EmergencyButton key={option.id} option={option} index={index} onSelect={() => handleEmergencyClick(option)} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function EmergencyButton({ option, index, onSelect }) {
  const Icon = option.icon;
  const { blinkCount } = useEog();
  const { isFocused, eogProps } = useEogSelection({
    id: `emergency-${option.id}`,
    label: option.label,
    onSelect,
  });

  return (
    <button
      {...eogProps}
      onClick={onSelect}
      className={`relative bg-gradient-to-br ${option.color} ${option.hoverColor} rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 text-left animate-slide-up ${
        isFocused ? 'ring-4 ring-white ring-offset-2 scale-105' : ''
      }`}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="flex items-start gap-3 sm:gap-4">
        <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/20 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
          <Icon className="w-6 h-6 sm:w-7 sm:h-7" />
        </div>
        <div className="flex-1">
          <h3 className="text-base sm:text-lg md:text-xl font-bold mb-1">{option.label}</h3>
          <p className="text-white/90 text-xs sm:text-sm">{option.description}</p>
          {option.priority === 'critical' && (
            <span className="inline-block mt-1 sm:mt-2 bg-white/20 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs font-bold">
              CRITICAL
            </span>
          )}
        </div>
      </div>
      {isFocused && (
        <div className="absolute top-2 right-2 bg-white text-red-600 px-2 py-0.5 rounded-full text-xs font-bold animate-pulse">
          {blinkCount}/3
        </div>
      )}
    </button>
  );
}
