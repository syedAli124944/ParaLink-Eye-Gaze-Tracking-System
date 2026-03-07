import { useEffect, useState } from 'react';
import { Heart } from 'lucide-react';

export function WelcomeScreen({ onComplete }) {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false);
      setTimeout(onComplete, 500);
    }, 3000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 bg-gradient-to-br from-teal-400 via-cyan-400 to-blue-400 flex items-center justify-center z-50 transition-opacity duration-500 ${
        show ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div className="text-center animate-fade-in-scale">
        <div className="inline-flex items-center justify-center w-24 h-24 bg-white rounded-full mb-8 animate-pulse-slow shadow-2xl">
          <Heart className="w-12 h-12 text-teal-500 animate-heartbeat" />
        </div>
        <h1 className="text-6xl font-bold text-white mb-4 animate-slide-up">
          Welcome!
        </h1>
        <p className="text-2xl text-white/90 animate-slide-up-delay">
          We're here to help you communicate
        </p>
      </div>
    </div>
  );
}
