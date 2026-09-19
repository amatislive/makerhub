import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { api, getStoredToken, setStoredToken, clearStoredToken } from '../api';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, workspaceName?: string) => Promise<void>;
  startGuestWorkspace: () => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    try {
      const token = getStoredToken();
      if (!token) {
        // Automatically initialize workspace session so user can immediately create items
        const res = await api.auth.guest();
        setStoredToken(res.token, res.user.id);
        setUser(res.user);
        return;
      }

      const res = await api.auth.me();
      if (res && res.user) {
        setUser(res.user);
        if (res.token) {
          setStoredToken(res.token, res.user.id);
        }
      } else {
        const guestRes = await api.auth.guest();
        setStoredToken(guestRes.token, guestRes.user.id);
        setUser(guestRes.user);
      }
    } catch {
      try {
        const guestRes = await api.auth.guest();
        setStoredToken(guestRes.token, guestRes.user.id);
        setUser(guestRes.user);
      } catch (err) {
        console.error('Failed to initialize session:', err);
        clearStoredToken();
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.auth.login({ email, password });
    setStoredToken(res.token, res.user.id);
    setUser(res.user);
  };

  const register = async (email: string, password: string, name: string, workspaceName?: string) => {
    const res = await api.auth.register({ email, password, name, workspaceName });
    setStoredToken(res.token, res.user.id);
    setUser(res.user);
  };

  const startGuestWorkspace = async () => {
    const res = await api.auth.guest();
    setStoredToken(res.token, res.user.id);
    setUser(res.user);
  };

  const logout = async () => {
    try {
      await api.auth.logout();
    } catch {
      // ignore
    }
    clearStoredToken();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        startGuestWorkspace,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
