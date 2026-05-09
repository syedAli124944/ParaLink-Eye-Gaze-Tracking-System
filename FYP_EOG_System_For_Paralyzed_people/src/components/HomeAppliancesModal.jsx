import { useState, useEffect, useCallback, useMemo } from 'react';
import { X, Lightbulb, Fan, Tv, Wind, Wifi, Power } from 'lucide-react';
import { useEogSelection } from '../hooks/useEogSelection.js';
import { useDoubleBlink } from '../hooks/useDoubleBlink.js';
import { useEog } from '../contexts/EogContext.jsx';
import { ttsService } from '../services/TtsService.js';
import { sendSelection, getDeviceStatus } from '../services/ApiService.js';

/**
 * Single Appliance Card Component
 */
function ApplianceCard({ card, index, deviceState, isSelected, onSelect, onExpand, blinkCount }) {
  const Icon = card.icon;
  
  // Blink (EOG) selection: triggers the toggle
  const handleBlinkSelect = () => {
    onSelect(card.id);
  };

  // Click: expands action buttons
  const handleClick = (e) => {
    e.stopPropagation();
    onExpand(card.id);
  };

  const { isFocused, eogProps } = useEogSelection({
    id: `appliance-${card.id}`,
    label: card.name,
    onSelect: handleBlinkSelect,
  });

  return (
    <div className="flex flex-col h-full space-y-2">
      <div
        {...eogProps}
        onClick={handleClick}
        className={`relative flex-1 flex flex-col justify-center bg-gradient-to-br ${card.gradient} ${card.hoverGradient} rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 cursor-pointer transform transition-all duration-300 hover:scale-105 ${
          isFocused ? 'ring-2 sm:ring-4 ring-white ring-offset-1 sm:ring-offset-2 scale-105 shadow-xl' : ''
        } ${isSelected ? 'ring-2 ring-white shadow-lg' : ''}`}
        style={{ animationDelay: `${index * 50}ms` }}
      >
        <div className="flex flex-col items-center text-center space-y-2 sm:space-y-3">
          <div className={`w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-lg sm:rounded-xl flex items-center justify-center backdrop-blur-sm ${
            deviceState === 'ON' ? 'bg-green-300/40' : 'bg-white/20'
          }`}>
            <Icon className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" />
          </div>
          <h3 className="text-base sm:text-lg md:text-xl font-bold text-white">{card.name}</h3>
          
          {card.gpio && (
            <span className="text-white/60 text-xs">{card.gpio}</span>
          )}

          {deviceState && (
            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
              deviceState === 'ON' ? 'bg-green-300 text-green-900' : 
              deviceState === 'OFF' ? 'bg-gray-300 text-gray-700' : 
              'bg-yellow-300 text-yellow-900'
            }`}>
              {deviceState}
            </span>
          )}
        </div>
        
        {isFocused && (
          <div className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-white text-blue-600 px-2 py-0.5 sm:py-1 rounded-full text-xs font-bold animate-pulse shadow-md z-20">
            {blinkCount}/3
          </div>
        )}
      </div>

      {/* Action Buttons — Show when appliance is selected */}
      {isSelected && card.actions && (
        <div className="grid grid-cols-2 gap-1 animate-fade-in mt-1">
          {card.actions.map((action) => (
            <ActionButton 
              key={action.value} 
              action={action} 
              onSelect={() => onSelect(action.value, true)} 
            />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Helper component for specific action buttons (Dim, Volume, etc)
 */
function ActionButton({ action, onSelect }) {
  const { isFocused, eogProps } = useEogSelection({
    id: `action-${action.value}`,
    label: action.label,
    onSelect: onSelect,
  });

  return (
    <button
      {...eogProps}
      onClick={(e) => { e.stopPropagation(); onSelect(); }}
      className={`px-2 py-1.5 bg-white border-2 rounded-lg text-[10px] sm:text-xs font-medium transition-all relative ${
        isFocused 
          ? 'border-teal-500 bg-teal-50 text-teal-700 ring-2 ring-teal-200 scale-105 z-10' 
          : 'border-gray-100 text-gray-600 hover:bg-gray-50'
      }`}
    >
      {action.label}
    </button>
  );
}

export function HomeAppliancesModal({ onClose }) {
  useDoubleBlink(onClose);
  
  const { blinkCount, language } = useEog();
  const [esp32Connected, setEsp32Connected] = useState(false);
  const [deviceStates, setDeviceStates] = useState({});
  const [successMessage, setSuccessMessage] = useState(null);
  const [selectedAppliance, setSelectedAppliance] = useState(null);

  const appliances = useMemo(() => [
    {
      id: 'light',
      name: 'Lights',
      icon: Lightbulb,
      gradient: 'from-yellow-400 to-orange-400',
      hoverGradient: 'hover:from-yellow-500 hover:to-orange-500',
      gpio: 'GPIO 23',
      actions: [
        { label: 'Turn On', value: 'light_on' },
        { label: 'Turn Off', value: 'light_off' },
        { label: 'Dim', value: 'light_dim' },
        { label: 'Brighten', value: 'light_brighten' },
      ],
    },
    {
      id: 'fan',
      name: 'Fan',
      icon: Fan,
      gradient: 'from-blue-400 to-cyan-400',
      hoverGradient: 'hover:from-blue-500 hover:to-cyan-500',
      gpio: 'GPIO 22',
      actions: [
        { label: 'Turn On', value: 'fan_on' },
        { label: 'Turn Off', value: 'fan_off' },
        { label: 'Speed Up', value: 'fan_speed_up' },
        { label: 'Speed Down', value: 'fan_speed_down' },
      ],
    },
    {
      id: 'tv',
      name: 'Television',
      icon: Tv,
      gradient: 'from-purple-400 to-pink-500',
      hoverGradient: 'hover:from-purple-500 hover:to-pink-600',
      gpio: 'GPIO 21',
      actions: [
        { label: 'Turn On', value: 'tv_on' },
        { label: 'Turn Off', value: 'tv_off' },
        { label: 'Volume Up', value: 'tv_volume_up' },
        { label: 'Volume Down', value: 'tv_volume_down' },
      ],
    },
    {
      id: 'ac',
      name: 'Air Conditioner',
      icon: Wind,
      gradient: 'from-cyan-400 to-blue-500',
      hoverGradient: 'hover:from-cyan-500 hover:to-blue-600',
      gpio: 'GPIO 19',
      actions: [
        { label: 'Turn On', value: 'ac_on' },
        { label: 'Turn Off', value: 'ac_off' },
        { label: 'Increase Temp', value: 'ac_temp_up' },
        { label: 'Decrease Temp', value: 'ac_temp_down' },
      ],
    },
    {
      id: 'router',
      name: 'WiFi Router',
      icon: Wifi,
      gradient: 'from-green-400 to-teal-500',
      hoverGradient: 'hover:from-green-500 hover:to-teal-600',
      actions: [
        { label: 'Turn On', value: 'router_on' },
        { label: 'Turn Off', value: 'router_off' },
        { label: 'Restart', value: 'router_restart' },
      ],
    },
    {
      id: 'all',
      name: 'All Devices',
      icon: Power,
      gradient: 'from-red-400 to-orange-500',
      hoverGradient: 'hover:from-red-500 hover:to-orange-600',
      actions: [
        { label: 'Turn All On', value: 'all_on' },
        { label: 'Turn All Off', value: 'all_off' },
      ],
    },
  ], []);

  const refreshStatus = useCallback(async () => {
    try {
      const data = await getDeviceStatus();
      if (data.devices) setDeviceStates(data.devices);
      if (data.esp32_connected !== undefined) {
        setEsp32Connected(data.esp32_connected);
      }
    } catch (err) {
      console.warn('Status poll failed:', err.message);
      // Don't set to false immediately on one failed poll, 
      // but keep last known state.
    }
  }, []);

  // Polling for status updates every 5 seconds
  useEffect(() => {
    refreshStatus();
    const interval = setInterval(refreshStatus, 5000);
    return () => clearInterval(interval);
  }, [refreshStatus]);

  const showToast = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleDeviceAction = useCallback((actionValue, isSubAction = false) => {
    // Determine the target device ID and the specific action
    let deviceId, action;
    
    if (actionValue.includes('_')) {
      const parts = actionValue.split('_');
      deviceId = parts[0];
      action = parts[1];
    } else {
      // Toggle logic for primary blink select
      deviceId = actionValue;
      const currentState = deviceStates[deviceId];
      action = currentState === 'ON' ? 'off' : 'on';
      actionValue = `${deviceId}_${action}`;
    }

    console.log(`Action: ${actionValue} on ${deviceId}`);
    
    // Feedback
    const speechLabel = actionValue.replace(/_/g, ' ');
    ttsService.speak(speechLabel, language);
    showToast(`Sending: ${speechLabel}...`);

    // Special Handling: All Devices
    if (deviceId === 'all') {
      const isTurnOn = action === 'on';
      const targets = ['light', 'fan', 'tv', 'ac', 'router'];
      const actionSuffix = isTurnOn ? '_on' : '_off';
      const newState = isTurnOn ? 'ON' : 'OFF';

      // Update UI optimistically
      const newStates = { all: newState };
      targets.forEach(t => { newStates[t] = newState; });
      setDeviceStates(prev => ({ ...prev, ...newStates }));

      // Send serial commands with staggered timing
      targets.forEach((t, i) => {
        setTimeout(() => {
          sendSelection('device', `${t}${actionSuffix}`, language).catch(e => console.error(e));
        }, i * 300);
      });
      return;
    }

    // Single device optimistic update
    if (action === 'on') setDeviceStates(prev => ({ ...prev, [deviceId]: 'ON' }));
    else if (action === 'off') setDeviceStates(prev => ({ ...prev, [deviceId]: 'OFF' }));

    // Send to backend
    sendSelection('device', actionValue, language)
      .then(response => {
        if (response.device_status) {
          setDeviceStates(prev => ({ ...prev, [deviceId]: response.device_status }));
        }
      })
      .catch(error => {
        console.warn('Action failed (offline):', error.message);
      });
      
    // Expand the card if it was a primary blink
    if (!isSubAction) {
      setSelectedAppliance(prev => (prev === deviceId ? null : deviceId));
    }
  }, [deviceStates, language]);

  const { eogProps: closeButtonProps } = useEogSelection({
    id: 'home-appliances-close',
    label: 'Close',
    onSelect: onClose,
  });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4 animate-fade-in">
      <div className="bg-white rounded-2xl sm:rounded-3xl max-w-6xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto hide-scrollbar shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4 sm:p-6 rounded-t-2xl sm:rounded-t-3xl flex justify-between items-center z-20 shadow-md">
          <div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold">Home Appliances</h2>
            <p className="text-white/90 text-xs sm:text-sm mt-1 flex items-center gap-2">
              Control your home devices • 
              <span className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-black/10 ${esp32Connected ? 'text-green-300' : 'text-red-300'}`}>
                <span className={`w-2 h-2 rounded-full ${esp32Connected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></span>
                ESP32 {esp32Connected ? 'Connected' : 'Disconnected'}
              </span>
            </p>
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
            <div className="bg-teal-600 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 border-2 border-white/20 backdrop-blur-md max-w-md toast-slide-down">
              <span className="text-xl">🚀</span>
              <span className="font-bold tracking-wide text-sm">{successMessage}</span>
              <span className="text-xl">✨</span>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="p-3 sm:p-4 md:p-6">
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6">
            {appliances.map((card, index) => (
              <ApplianceCard 
                key={card.id} 
                card={card} 
                index={index} 
                deviceState={deviceStates[card.id]}
                isSelected={selectedAppliance === card.id}
                onSelect={handleDeviceAction}
                onExpand={setSelectedAppliance}
                blinkCount={blinkCount}
              />
            ))}
          </div>

          {/* Instructions */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 mt-4 sm:mt-6 border border-blue-100">
            <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-3 sm:mb-4">How to use:</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 shadow-sm">1</div>
                <p className="text-gray-700 pt-1 text-xs sm:text-sm md:text-base">
                  <strong>Blink to Toggle:</strong> Focus on a device and blink 3× to toggle it ON/OFF directly.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 shadow-sm">2</div>
                <p className="text-gray-700 pt-1 text-xs sm:text-sm md:text-base">
                  <strong>Expand for More:</strong> The card will expand to show advanced controls (Dim, Speed, Volume) after a selection.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 shadow-sm">3</div>
                <p className="text-gray-700 pt-1 text-xs sm:text-sm md:text-base">
                  <strong>ESP32 Hardware:</strong> Commands are sent to the ESP32 via serial relay to control real-world appliances.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
