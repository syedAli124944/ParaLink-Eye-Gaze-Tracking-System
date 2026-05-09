import { Home, Mail, Info, Globe, LogOut, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useEog } from '../contexts/EogContext.jsx';
import { useEogSelection } from '../hooks/useEogSelection.js';

const languages = [
  { code: 'en', name: 'English' },
  { code: 'ur', name: 'Urdu (اردو)' },
  { code: 'ar', name: 'Arabic (العربية)' },
  { code: 'es', name: 'Spanish (Español)' },
  { code: 'fr', name: 'French (Français)' },
  { code: 'de', name: 'German (Deutsch)' },
];

export function Sidebar({ currentPage, onPageChange, language, onLanguageChange, isOpen, onClose, hideOnModal = false }) {
  const { signOut } = useAuth();
  const { isEogEnabled, setEogEnabled, setLanguage, eogMode, setEogMode, blinkCount } = useEog();
  
  const menuItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'contact', label: 'Contact', icon: Mail },
    { id: 'about', label: 'About', icon: Info },
  ];

  function SidebarButton({ item }) {
    const Icon = item.icon;
    const { isFocused, eogProps } = useEogSelection({
      id: `sidebar-${item.id}`,
      label: item.label,
      onSelect: () => handlePageChange(item.id),
    });

    return (
      <button
        {...eogProps}
        onClick={() => handlePageChange(item.id)}
        className={`w-full flex items-center justify-between px-3 sm:px-4 py-2 sm:py-3 rounded-xl transition-all duration-300 transform hover:scale-105 ${
          currentPage === item.id
            ? 'bg-white text-teal-600 shadow-lg'
            : 'hover:bg-white/10 text-white'
        } ${isFocused ? 'ring-2 ring-white scale-105' : ''}`}
      >
        <div className="flex items-center space-x-2 sm:space-x-3">
          <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="font-medium text-sm sm:text-base">{item.label}</span>
        </div>
        {isFocused && (
          <span className="text-[10px] bg-teal-500 text-white px-1.5 py-0.5 rounded-full font-bold animate-pulse">
            {blinkCount}/3
          </span>
        )}
      </button>
    );
  }

  const { isFocused: isSignOutFocused, eogProps: signOutEogProps } = useEogSelection({
    id: 'sidebar-signout',
    label: 'Sign Out',
    onSelect: signOut,
  });

  const handleLanguageChange = (newLang) => {
    onLanguageChange(newLang);
    setLanguage(newLang);
  };

  const handlePageChange = (pageId) => {
    onPageChange(pageId);
    if (onClose) onClose(); // Close sidebar on mobile after navigation
  };

  return (
    <div className={`sidebar-container w-64 bg-gradient-to-b from-teal-600 to-cyan-700 text-white h-screen fixed left-0 top-0 shadow-2xl flex flex-col z-50 transition-transform duration-300 ${
      hideOnModal ? '-translate-x-full' : (isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0')
    }`}>
      <div className="p-4 sm:p-6 border-b border-white/20">
        <div className="flex items-center space-x-2 sm:space-x-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-xl flex items-center justify-center">
            <Globe className="w-6 h-6 sm:w-7 sm:h-7 text-teal-600" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold">ParaLink</h2>
            <p className="text-xs text-white/80">Communication Portal</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3 sm:p-4 space-y-2">
        {menuItems.map((item) => (
          <SidebarButton key={item.id} item={item} />
        ))}

        {/* EOG Toggle */}
        <div className="pt-3 sm:pt-4 border-t border-white/20 mt-3 sm:mt-4">
        {/* --------- */}
          <button
            onClick={() => setEogEnabled(!isEogEnabled)}
            className={`w-full flex items-center justify-between px-3 sm:px-4 py-2 sm:py-3 rounded-xl transition-all duration-300 transform hover:scale-105 ${
              isEogEnabled
                ? 'bg-white text-teal-600 shadow-lg'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            <div className="flex items-center space-x-2 sm:space-x-3">
              {isEogEnabled ? (
                <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
              ) : (
                <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" />
              )}
              <span className="font-medium text-sm sm:text-base">EOG Mode</span>
            </div>
            <div className={`w-10 h-6 rounded-full transition-colors ${
              isEogEnabled ? 'bg-teal-600' : 'bg-gray-400'
            }`}>
              <div className={`w-4 h-4 bg-white rounded-full mt-1 transition-transform ${
                isEogEnabled ? 'translate-x-5' : 'translate-x-1'
              }`} />
            </div>
          </button>
        </div>

        {/* Keyboard Mode Selector */}
        {isEogEnabled && (
          <div className="pt-3 sm:pt-4">
            <label className="block text-xs sm:text-sm font-medium mb-2 px-2">Input Mode</label>
            <div className="space-y-2">
              <button
                onClick={() => setEogMode('keyboard')}
                className={`w-full flex items-center px-3 sm:px-4 py-2 rounded-xl transition-all text-sm ${
                  eogMode === 'keyboard'
                    ? 'bg-white text-teal-600 shadow-md'
                    : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
              >
                <div className="flex-1 text-left">⌨️ Keyboard (Spacebar)</div>
              </button>
              
              <button
                onClick={() => setEogMode('webcam')}
                className={`w-full flex items-center px-3 sm:px-4 py-2 rounded-xl transition-all text-sm ${
                  eogMode === 'webcam'
                    ? 'bg-white text-teal-600 shadow-md'
                    : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
              >
                <div className="flex-1 text-left">📷 WebCam Tracking</div>
              </button>
            </div>
          </div>
        )}

        <div className="pt-3 sm:pt-4">
          <label className="block text-xs sm:text-sm font-medium mb-2 px-2">Voice Language</label>
          <select
            value={language}
            onChange={(e) => handleLanguageChange(e.target.value)}
            className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-xl bg-white/10 border-2 border-white/20 focus:border-white focus:ring-4 focus:ring-white/20 transition-all duration-300 outline-none cursor-pointer hover:bg-white/20 text-sm"
          >
            {languages.map((lang) => (
              <option key={lang.code} value={lang.code} className="bg-gray-800">
                {lang.name}
              </option>
            ))}
          </select>
        </div>
      </nav>

      <div className="p-3 sm:p-4 border-t border-white/20">
      
      {/* ----- sign out button ------------*/}
        <button
          {...signOutEogProps}
          onClick={signOut}
          className={`w-full flex items-center justify-center space-x-2 sm:space-x-3 px-3 sm:px-4 py-2 sm:py-3 rounded-xl bg-red-500 hover:bg-red-600 transition-all duration-300 transform hover:scale-105 shadow-lg text-sm sm:text-base ${
            isSignOutFocused ? 'ring-4 ring-white ring-offset-2 scale-110' : ''
          }`}
        >
          <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="font-medium">Sign Out</span>
          {isSignOutFocused && (
            <span className="ml-2 bg-white text-red-600 px-2 py-0.5 rounded-full text-xs font-bold animate-pulse">
              {blinkCount}/3
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
