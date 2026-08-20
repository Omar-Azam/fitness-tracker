import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const TOKEN_STORAGE_KEY = 'fitness_token';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_STORAGE_KEY));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Sync theme with user preferences if available
  useEffect(() => {
    if (user?.preferences?.theme) {
      const userTheme = user.preferences.theme;
      const currentStored = localStorage.getItem('fitness_theme');
      if (userTheme !== currentStored) {
        localStorage.setItem('fitness_theme', userTheme);
        window.dispatchEvent(new Event('themechange'));
      }
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

  // Upload user profile picture
  const uploadProfilePicture = async (file) => {
    setError(null);
    try {
      const formData = new FormData();
      formData.append('picture', file);

      const response = await api.put('/auth/profile/picture', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const updatedUser = response.data.user;
      setUser(updatedUser);
      return {
        success: true,
        user: updatedUser,
        profilePicture: response.data.profilePicture,
      };
    } catch (err) {
      const msg = err.message || 'Failed to upload profile picture';
      setError(msg);
      throw new Error(msg);
    }
  };

  const value = {
    user,
    setUser,
    token,
    loading,
    error,
    login,
    register,
    logout,
    updateProfile,
    uploadProfilePicture,
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
