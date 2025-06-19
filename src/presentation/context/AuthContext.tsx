import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@/core/entities/user.entity';
import { useProfile } from '../hooks';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [isCheckingToken, setIsCheckingToken] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    console.log('Token from localStorage:', storedToken); // Debug
    setToken(storedToken);
    setIsCheckingToken(false);
  }, []);

  // Solo ejecutar useProfile cuando tengamos el token
  const { queryProfile } = useProfile(token || '');

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    window.location.href = '/auth/login';
  };

  const value: AuthContextType = {
    user: queryProfile.data || null,
    token,
    isAuthenticated: !!token && !!queryProfile.data,
    isLoading: isCheckingToken || (!!token && queryProfile.isLoading),
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};