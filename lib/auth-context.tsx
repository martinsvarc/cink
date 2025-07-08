'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthUser } from './auth';

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  authenticated: boolean;
  usersExist: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string; message?: string }>;
  register: (userData: { username: string; password: string; name?: string; email?: string }) => Promise<{ success: boolean; error?: string; message?: string; isFirstUser?: boolean }>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [usersExist, setUsersExist] = useState(false);

  // Check authentication status on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/check', {
        credentials: 'include',
      });
      
      const data = await response.json();
      
      setAuthenticated(data.authenticated);
      setUser(data.user);
      setUsersExist(data.usersExist);
    } catch (error) {
      console.error('Auth check failed:', error);
      setAuthenticated(false);
      setUser(null);
      setUsersExist(false);
    } finally {
      setLoading(false);
    }
  };

  const login = async (username: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
        credentials: 'include',
      });

      const data = await response.json();

      if (data.success) {
        setAuthenticated(true);
        setUser(data.user);
        return { success: true, message: data.message };
      } else {
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error('Login failed:', error);
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  const register = async (userData: { username: string; password: string; name?: string; email?: string }) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
        credentials: 'include',
      });

      const data = await response.json();

      if (data.success) {
        setAuthenticated(true);
        setUser(data.user);
        setUsersExist(true);
        return { 
          success: true, 
          message: data.message,
          isFirstUser: data.isFirstUser 
        };
      } else {
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error('Registration failed:', error);
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setAuthenticated(false);
      setUser(null);
    }
  };

  const value = {
    user,
    loading,
    authenticated,
    usersExist,
    login,
    register,
    logout,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
} 