import { useState } from 'react';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.jsx';

export function Login({ onToggleForm }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error } = await signIn(email, password);

    if (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-blue-50 to-cyan-50 flex items-center justify-center p-6">
      <div className="w-full max-w-lg animate-fade-in">
        <div className="bg-white rounded-3xl shadow-2xl p-10 transition-all duration-300 hover:shadow-3xl">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-2xl mb-6 animate-bounce-slow">
              <LogIn className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4x1 font-bold text-gray-800 mb-3">Welcome Back</h1>
            <p className="text-gray-600 text-lg">Sign in to continue your journey</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="email" className="block signupTextFonts text-sm font-medium text-gray-800">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-teal-400 focus:ring-4 focus:ring-teal-100 transition-all duration-300 outline-none text-lg"
                placeholder="you@example.com"
                required
              />
            </div>

            <div className="space-y-2 mt-4">
              <label htmlFor="password" className="block signupTextFonts text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-teal-400 focus:ring-4 focus:ring-teal-100 transition-all duration-300 outline-none text-lg pr-12"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border-2 border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm animate-shake">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-teal-400 to-cyan-500 text-white py-3 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-7 text-center">
            <p className="text-gray-600 text-base">
              Don't have an account?{' '}
              <button
                onClick={onToggleForm}
                className="text-teal-500 font-semibold hover:text-teal-600 hover:underline transition-all"
              >
                Sign Up
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
