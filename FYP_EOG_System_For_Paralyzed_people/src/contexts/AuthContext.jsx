import { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Use sessionStorage: first visit shows login, reload preserves session,
    // closing the browser/tab logs out automatically.
    const storedUser = sessionStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const signUp = async (email, _password) => {
    try {
      const newUser = {
        id: Date.now().toString(),
        email,
      };
      setUser(newUser);
      sessionStorage.setItem('user', JSON.stringify(newUser));
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const signIn = async (email, _password) => {
    try {
      const newUser = {
        id: Date.now().toString(),
        email,
      };
      setUser(newUser);
      sessionStorage.setItem('user', JSON.stringify(newUser));
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const signOut = async () => {
    setUser(null);
    sessionStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
