import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_BASE_URL } from '@/lib/api';

interface User {
  email: string;
  name?: string;
}

interface AuthContextType {
  user: User | null;
  profile: any | null;
  isAdmin: boolean;
  loading: boolean;
  setUser: (user: User | null) => void;
  setProfile: (profile: any) => void;
  setIsAdmin: (isAdmin: boolean) => void;
  logout: () => void;
  checkSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkSession = async () => {
    try {
      // First try localStorage — set after login, works cross-origin
      const stored = localStorage.getItem('auth');
      if (stored) {
        const { user: u, isAdmin: a, profile: p } = JSON.parse(stored);
        setUser(u);
        setIsAdmin(a || false);
        setProfile(p || null);
        setLoading(false);
        return;
      }
      // Fallback: cookie-based check (same-origin / dev)
      const response = await fetch(`${API_BASE_URL}/api/auth/me`, { credentials: 'include' });
      if (response.ok) {
        const sessionData = await response.json();
        setUser(sessionData.user);
        setProfile(sessionData.profile);
        setIsAdmin(sessionData.isAdmin || false);
      }
    } catch (error) {
      console.error("Auth check failed", error);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('auth');
    setUser(null);
    setProfile(null);
    setIsAdmin(false);
    fetch(`${API_BASE_URL}/api/auth/logout`, { method: 'POST', credentials: 'include' }).catch(() => {});
  };

  // Check session on mount
  useEffect(() => {
    checkSession();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isAdmin,
        loading,
        setUser,
        setProfile,
        setIsAdmin,
        logout,
        checkSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
