import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const ThemeContext = createContext(null);

export const THEME_STORAGE_KEY = 'fitness_theme';

export const ThemeProvider = ({ children }) => {
  // Read initial theme preference from localStorage or default to 'dark'
  const [theme, setThemeState] = useState(() => {
    return localStorage.getItem(THEME_STORAGE_KEY) || 'dark';
  });

  // Calculate resolved theme (light or dark)
  const getSystemTheme = useCallback(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'dark';
  }, []);

  const [resolvedTheme, setResolvedTheme] = useState(() => {
    const initial = localStorage.getItem(THEME_STORAGE_KEY) || 'dark';
    if (initial === 'system') {
      return typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
    }
    return initial;
  });

  // Apply resolved theme classes to <html>
  const applyTheme = useCallback((targetTheme) => {
    let active = targetTheme;
    if (targetTheme === 'system') {
      active = getSystemTheme();
    }

    setResolvedTheme(active);

    if (active === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
  }, [getSystemTheme]);

  // Set theme mode (light, dark, system)
  const setTheme = useCallback((newTheme) => {
    if (!['light', 'dark', 'system'].includes(newTheme)) return;
    setThemeState(newTheme);
    localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    applyTheme(newTheme);
  }, [applyTheme]);

  // Apply on mount and when theme state changes
  useEffect(() => {
    applyTheme(theme);
  }, [theme, applyTheme]);

  // Live listener for OS / browser prefers-color-scheme changes & storage events
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleMediaChange = (e) => {
      const currentTheme = localStorage.getItem(THEME_STORAGE_KEY) || 'dark';
      if (currentTheme === 'system') {
        const isDark = e.matches;
        const newResolved = isDark ? 'dark' : 'light';
        setResolvedTheme(newResolved);
        if (isDark) {
          document.documentElement.classList.add('dark');
          document.documentElement.classList.remove('light');
        } else {
          document.documentElement.classList.remove('dark');
          document.documentElement.classList.add('light');
        }
      }
    };

    const handleExternalThemeChange = () => {
      const updatedTheme = localStorage.getItem(THEME_STORAGE_KEY) || 'dark';
      setThemeState(updatedTheme);
      applyTheme(updatedTheme);
    };

    mediaQuery.addEventListener('change', handleMediaChange);
    window.addEventListener('themechange', handleExternalThemeChange);
    window.addEventListener('storage', handleExternalThemeChange);

    return () => {
      mediaQuery.removeEventListener('change', handleMediaChange);
      window.removeEventListener('themechange', handleExternalThemeChange);
      window.removeEventListener('storage', handleExternalThemeChange);
    };
  }, [applyTheme]);

  const value = {
    theme,
    resolvedTheme,
    isDark: resolvedTheme === 'dark',
    setTheme,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeContext;
