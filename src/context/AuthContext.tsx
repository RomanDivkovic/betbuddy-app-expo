import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { onAuthStateChange, signIn, signUp, logout, resetPassword } from '../services/firebaseService';

type AuthContextType = {
  currentUser: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<User>;
  signUp: (email: string, password: string, displayName: string) => Promise<User>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Add a small delay to ensure Firebase is fully initialized
    const setupAuth = async () => {
      try {
        const unsubscribe = onAuthStateChange((user) => {
          setCurrentUser(user);
          setLoading(false);
        });
        return unsubscribe;
      } catch (error) {
        console.error('Error setting up auth state listener:', error);
        setLoading(false);
        return () => {}; // Return empty unsubscribe function
      }
    };

    let unsubscribe: () => void;
    
    // Set up auth state listener with a small delay
    const timer = setTimeout(async () => {
      unsubscribe = await setupAuth();
    }, 100);

    return () => {
      clearTimeout(timer);
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  const value = {
    currentUser,
    loading,
    signIn,
    signUp,
    logout,
    resetPassword
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
