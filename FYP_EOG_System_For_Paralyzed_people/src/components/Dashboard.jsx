import { useState } from 'react';
import { MessageCircle, Newspaper, AlertTriangle, Mail, MapPin, Clock, Lightbulb, Eye, Globe, Heart } from 'lucide-react';
import { CommunicationModal } from './CommunicationModal.jsx';
import { NewsModal } from './NewsModal.jsx';
import { EmergencyModal } from './EmergencyModal.jsx';
import { HomeAppliancesModal } from './HomeAppliancesModal.jsx';
import { useEogSelection } from '../hooks/useEogSelection.js';
import { useEog } from '../contexts/EogContext.jsx';

export function Dashboard({ currentPage, onModalStateChange }) {
  const [activeModal, setActiveModal] = useState(null);

  // Notify parent component when modal state changes
  const handleModalChange = (modalId) => {
    setActiveModal(modalId);
    if (onModalStateChange) {
      onModalStateChange(modalId !== null);
    }
  };

  const cards = [
    {
      id: 'communication',
      title: 'Communication',
      description: 'Express your feelings and needs',
      icon: MessageCircle,
      gradient: 'from-teal-400 to-cyan-500',
      hoverGradient: 'hover:from-teal-500 hover:to-cyan-600',
    },
    {
      id: 'news',
      title: 'News',
      description: 'Stay updated with latest information',
      icon: Newspaper,
      gradient: 'from-blue-400 to-indigo-500',
      hoverGradient: 'hover:from-blue-500 hover:to-indigo-600',
    },
    {
      id: 'home-appliances',
      title: 'Home Appliances',
      description: 'Control lights, fans, and other devices',
      icon: Lightbulb,
      gradient: 'from-purple-400 to-pink-500',
      hoverGradient: 'hover:from-purple-500 hover:to-pink-600',
    },
    {
      id: 'emergency',
      title: 'Emergency',
      description: 'Quick access to urgent help',
      icon: AlertTriangle,
      gradient: 'from-orange-400 to-red-500',
      hoverGradient: 'hover:from-orange-500 hover:to-red-600',
    },
  ];

  function CategoryCard({ card, index, onSelect }) {
    const Icon = card.icon;
    const { blinkCount } = useEog();
    
    const { isFocused, eogProps } = useEogSelection({
      id: `category-${card.id}`,
      label: card.title,
      onSelect,
    });

    return (
      <div
        {...eogProps}
        onClick={onSelect}
        className={`relative bg-gradient-to-br ${card.gradient} ${card.hoverGradient} rounded-3xl p-8 cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl ${
          isFocused ? 'ring-4 ring-white ring-offset-4 ring-offset-gray-100 scale-105' : ''
        } animate-fade-in`}
        style={{ animationDelay: `${index * 100}ms` }}
      >
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
            <Icon className="w-10 h-10 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-white">{card.title}</h3>
          <p className="text-white/90 text-sm">{card.description}</p>
        </div>
        
        {/* EOG Focus Indicator */}
        {isFocused && (
          <div className="absolute top-4 right-4 bg-white text-teal-600 px-3 py-1 rounded-full text-sm font-bold animate-pulse">
            {blinkCount}/3
          </div>
        )}
      </div>
    );
  }

  if (currentPage === 'contact') {
    return (
      <div className="p-8 max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Contact Us</h1>
        <p className="text-gray-600 mb-8">We're here to help you 24/7</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Emergency Hotline */}
          <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">Emergency Hotline</h3>
            </div>
            <p className="text-2xl font-bold text-red-600 mb-2">
              1-800-CARE-NOW
            </p>
            <p className="text-gray-600">Available 24/7 for urgent assistance</p>
          </div>

          {/* Email Support */}
          <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Mail className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">Email Support</h3>
            </div>
            <p className="text-xl font-semibold text-blue-600 mb-2">
              support@paralink.com
            </p>
            <p className="text-gray-600">Response within 24 hours</p>
          </div>

          {/* Address */}
          <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <MapPin className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">Visit Us</h3>
            </div>
            <p className="text-gray-700">
              123 Healthcare Ave<br />
              Medical City, MC 12345<br />
              United States
            </p>
          </div>

          {/* Operating Hours */}
          <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">Hours</h3>
            </div>
            <p className="text-gray-700">
              Mon-Fri: 9:00 AM - 6:00 PM<br />
              Saturday: 10:00 AM - 4:00 PM<br />
              Sunday: Closed<br />
              <span className="text-red-600 font-semibold">* Emergency line always open</span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (currentPage === 'about') {
    return (
      <div className="p-8 max-w-6xl mx-auto">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-teal-500 to-cyan-600 rounded-3xl p-12 shadow-2xl mb-8 text-white">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-4">About ParaLink</h1>
            <p className="text-xl text-teal-50 max-w-3xl mx-auto leading-relaxed">
              Empowering communication through innovation and accessibility
            </p>
          </div>
        </div>

        {/* Mission Section */}
        <div className="bg-white rounded-3xl p-10 shadow-xl mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-3">
            <Heart className="w-8 h-8 text-teal-500" />
            Our Mission
          </h2>
          <div className="space-y-4 text-gray-700 text-lg leading-relaxed">
            <p>
              ParaLink is a revolutionary communication platform designed specifically for
              individuals with limited mobility who use EOG (Electrooculography) technology.
            </p>
            <p>
              Our mission is to empower patients to express their emotions, needs, and communicate
              effectively with their caregivers and loved ones, fostering deeper connections and improving quality of life.
            </p>
            <p>
              Through intuitive design and accessibility-focused features, we're making
              communication easier and more meaningful for everyone.
            </p>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-2xl p-8 hover:shadow-lg transition-all">
            <div className="w-16 h-16 bg-teal-500 rounded-2xl flex items-center justify-center mb-4">
              <MessageCircle className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">Easy Communication</h3>
            <p className="text-gray-600">
              Express emotions and needs with simple, intuitive cards designed for quick access
            </p>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 hover:shadow-lg transition-all">
            <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center mb-4">
              <Eye className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">EOG Technology</h3>
            <p className="text-gray-600">
              Advanced eye-tracking and blink detection for hands-free interaction
            </p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 hover:shadow-lg transition-all">
            <div className="w-16 h-16 bg-purple-500 rounded-2xl flex items-center justify-center mb-4">
              <Globe className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">Multi-Language</h3>
            <p className="text-gray-600">
              Support for 6 languages with text-to-speech in every supported language
            </p>
          </div>
        </div>

        {/* Statistics */}
        <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-3xl p-10 shadow-xl">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Impact</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-5xl font-bold text-teal-600 mb-2">6</div>
              <div className="text-gray-600 font-medium">Languages Supported</div>
            </div>
            <div>
              <div className="text-5xl font-bold text-blue-600 mb-2">24/7</div>
              <div className="text-gray-600 font-medium">Available Anytime</div>
            </div>
            <div>
              <div className="text-5xl font-bold text-purple-600 mb-2">100%</div>
              <div className="text-gray-600 font-medium">Accessibility Focused</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold text-gray-800 mb-4 animate-fade-in">
          How can we help you today?
        </h1>
        <p className="text-xl text-gray-600 animate-fade-in-delay">
          Choose a category to get started
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
        {cards.map((card, index) => (
          <CategoryCard key={card.id} card={card} index={index} onSelect={() => handleModalChange(card.id)} />
        ))}
      </div>

      {activeModal === 'communication' && (
        <CommunicationModal onClose={() => handleModalChange(null)} />
      )}
      {activeModal === 'news' && (
        <NewsModal onClose={() => handleModalChange(null)} />
      )}
      {activeModal === 'home-appliances' && (
        <HomeAppliancesModal onClose={() => handleModalChange(null)} />
      )}
      {activeModal === 'emergency' && (
        <EmergencyModal onClose={() => handleModalChange(null)} />
      )}
    </div>
  );
}
