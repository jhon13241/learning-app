import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, lightTheme, darkTheme, Theme } from '../constants/designSystem';

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
  setDarkMode: (isDark: boolean) => void;
  colors: typeof Colors;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'text_reader_settings'; // Use same key as text reader settings

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDark, setIsDarkState] = useState(false);

  // Get current theme
  const theme = isDark ? darkTheme : lightTheme;
  const colors = theme.colors;

  // Load theme preference from text reader settings
  useEffect(() => {
    const loadThemeMode = async () => {
      try {
        const storedSettings = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (storedSettings) {
          const settings = JSON.parse(storedSettings);
          setIsDarkState(settings.colorTheme === 'dark');
        }
      } catch (error) {
        console.error('Failed to load theme mode:', error);
      }
    };
    loadThemeMode();
  }, []);

  // Set dark mode and sync with text reader settings
  const setDarkMode = async (darkMode: boolean) => {
    try {
      setIsDarkState(darkMode);
      
      // Update text reader settings to keep them in sync
      const storedSettings = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      let settings = { colorTheme: 'light' };
      
      if (storedSettings) {
        settings = JSON.parse(storedSettings);
      }
      
      settings.colorTheme = darkMode ? 'dark' : 'light';
      await AsyncStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('Failed to save theme mode:', error);
    }
  };

  // Toggle theme
  const toggleTheme = () => {
    setDarkMode(!isDark);
  };

  return (
    <ThemeContext.Provider value={{
      theme,
      isDark,
      toggleTheme,
      setDarkMode,
      colors,
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};