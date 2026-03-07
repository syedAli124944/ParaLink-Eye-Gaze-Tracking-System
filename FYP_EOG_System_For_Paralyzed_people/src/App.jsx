import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext.jsx';
import { EogProvider } from './contexts/EogContext.jsx';
import { Login } from './components/Login.jsx';
import { SignUp } from './components/SignUp.jsx';
import { WelcomeScreen } from './components/WelcomeScreen.jsx';
import { Sidebar } from './components/Sidebar.jsx';
import { Dashboard } from './components/Dashboard.jsx';
import { BlinkIndicator } from './components/BlinkIndicator.jsx';


function AppContent() {
  const { user, loading } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [currentPage, setCurrentPage] = useState('home');
  const [language, setLanguage] = useState('en');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  // User preference - sidebar hides when modals are open
  // To undo: Run in browser console: localStorage.setItem('hideSidebarOnModal', 'false')
  const [hideSidebarOnModal, setHideSidebarOnModal] = useState(true);

  useEffect(() => {
    if (user) {
      setShowWelcome(true);
      loadUserPreferences();
    }
  }, [user]);

  const loadUserPreferences = () => {
    // Load preferences from localStorage
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage) {
      setLanguage(savedLanguage);
    } else {
      localStorage.setItem('language', 'en');
    }
    
    // Load sidebar hiding preference
    const savedHideSidebarPref = localStorage.getItem('hideSidebarOnModal');
    if (savedHideSidebarPref !== null) {
      setHideSidebarOnModal(savedHideSidebarPref === 'true');
    } else {
      localStorage.setItem('hideSidebarOnModal', 'true');
    }
  };

  const handleLanguageChange = (newLanguage) => {
    setLanguage(newLanguage);

    localStorage.setItem('language', newLanguage);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-teal-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return isSignUp ? (
      <SignUp onToggleForm={() => setIsSignUp(false)} />
    ) : (
      <Login onToggleForm={() => setIsSignUp(true)} />
    );
  }

  if (showWelcome) {
    return <WelcomeScreen onComplete={() => setShowWelcome(false)} />;
  }

  return (
    <>
      <BlinkIndicator />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="lg:hidden fixed top-4 left-4 z-50 w-12 h-12 bg-teal-600 text-white rounded-xl shadow-lg flex items-center justify-center hover:bg-teal-700 transition-colors"
          aria-label="Toggle menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isSidebarOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>

        {/* Overlay backdrop for mobile */}
        {isSidebarOpen && (
          <div
            className="lg:hidden fixed inset-0 bg-black/50 z-40 animate-fade-in"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        <Sidebar
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          language={language}
          onLanguageChange={handleLanguageChange}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          hideOnModal={hideSidebarOnModal && isModalOpen}
        />
        <div className={`ml-0 transition-all duration-300 ${hideSidebarOnModal && isModalOpen ? '' : 'lg:ml-64'}`}>
          <Dashboard currentPage={currentPage} onModalStateChange={setIsModalOpen} />
        </div>
      </div>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <EogProvider>
        <AppContent />
      </EogProvider>
    </AuthProvider>
  );
}

export default App;
