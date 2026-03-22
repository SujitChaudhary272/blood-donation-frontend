import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const THEME_STORAGE_KEY = 'bloodlife-theme';
const ThemeContext = createContext(null);
const THEME_COLOR_META_SELECTOR = 'meta[name="theme-color"]';

const getInitialTheme = () => {
  const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
  if (savedTheme === 'light' || savedTheme === 'dark') {
    return savedTheme;
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_STORAGE_KEY, theme);

    const themeColorMeta = document.querySelector(THEME_COLOR_META_SELECTOR);
    if (themeColorMeta) {
      themeColorMeta.setAttribute('content', theme === 'dark' ? '#020617' : '#dc2626');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((currentTheme) => (currentTheme === 'dark' ? 'light' : 'dark'));
  };

  const value = useMemo(
    () => ({
      theme,
      isDarkMode: theme === 'dark',
      toggleTheme
    }),
    [theme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }

  return context;
};
