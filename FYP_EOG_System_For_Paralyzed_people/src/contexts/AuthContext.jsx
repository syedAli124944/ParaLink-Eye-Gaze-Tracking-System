import { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Always start with no user - login page will always show
    // If you i to remember logged-in users, uncomment the lines 13,14,15,16,17 beloww:
    
    // const storedUser = localStorage.getItem('user');
    // if (storedUser) {
    //   setUser(JSON.parse(storedUser));
    // }
    
    setLoading(false);
  }, []);

  const signUp = async (email, _password) => {
    try {
      // Mock sign up - just create a user locally
      const newUser = {
        id: Date.now().toString(),
        email,
      };
      setUser(newUser);
      localStorage.setItem('user', JSON.stringify(newUser));
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const signIn = async (email, _password) => {
    try {
      // Mock sign in - just create a user locally
      const newUser = {
        id: Date.now().toString(),
        email,
      };
      setUser(newUser);
      localStorage.setItem('user', JSON.stringify(newUser));
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const signOut = async () => {
    setUser(null);
    localStorage.removeItem('user');
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
