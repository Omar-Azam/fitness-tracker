import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const TOKEN_STORAGE_KEY = 'fitness_token';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_STORAGE_KEY));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Sync theme with user preferences or default to dark
  useEffect(() => {
    const theme = user?.preferences?.theme || localStorage.getItem('fitness_theme') || 'dark';
    if (theme === 'light') {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
      localStorage.setItem('fitness_theme', 'light');
    } else {
      document.documentElement.classList.remove('light');
      document.documentElement.classList.add('dark');
      localStorage.setItem('fitness_theme', 'dark');
    }
  }, [user?.preferences?.theme]);

  // Fetch current user details on load if token exists
  const checkAuth = useCallback(async () => {
    const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (!storedToken) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const response = await api.get('/auth/me');
      setUser(response.data.user);
      setToken(storedToken);
    } catch (err) {
      console.warn('[Auth] Session check failed or expired:', err.message);
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      setUser(null);
      setToken(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Register user
  const register = async (userData) => {
    setError(null);
    try {
      const response = await api.post('/auth/register', userData);
      const { token: newToken, user: newUser } = response.data;

      localStorage.setItem(TOKEN_STORAGE_KEY, newToken);
      setToken(newToken);
      setUser(newUser);

      return { success: true, user: newUser };
    } catch (err) {
      const msg = err.message || 'Registration failed';
      setError(msg);
      throw new Error(msg);
    }
  };

  // Login user
  const login = async (credentials) => {
    setError(null);
    try {
      const response = await api.post('/auth/login', credentials);
      const { token: newToken, user: newUser } = response.data;

      localStorage.setItem(TOKEN_STORAGE_KEY, newToken);
      setToken(newToken);
      setUser(newUser);

      return { success: true, user: newUser };
    } catch (err) {
      const msg = err.message || 'Login failed';
      setError(msg);
      throw new Error(msg);
    }
  };

  // Logout user
  const logout = () => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    setToken(null);
    setUser(null);
    setError(null);
  };

  // Update user profile
  const updateProfile = async (profileData) => {
    setError(null);
    try {
      const response = await api.put('/auth/profile', profileData);
      const updatedUser = response.data.user;
      setUser(updatedUser);
      return { success: true, user: updatedUser };
    } catch (err) {
      const msg = err.message || 'Failed to update profile';
      setError(msg);
      throw new Error(msg);
    }
  };

  const value = {
    user,
    token,
    loading,
    error,
    login,
    register,
    logout,
    updateProfile,
    checkAuth,
    isAuthenticated: Boolean(user),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
