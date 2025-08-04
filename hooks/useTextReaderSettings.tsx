import React, { useState, useEffect, useContext, createContext, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TextReaderSettings } from '../components/TextReaderTools';

const SETTINGS_STORAGE_KEY = 'text_reader_settings';

const defaultSettings: TextReaderSettings = {
  language: 'bilingual',
  layout: 'stacked',
  colorTheme: 'light',
  fontSize: 'medium',
  showVowels: true,
};

interface TextReaderSettingsContextType {
  settings: TextReaderSettings;
  updateSettings: (newSettings: Partial<TextReaderSettings>) => Promise<void>;
  resetSettings: () => Promise<void>;
  isLoading: boolean;
  getFontSize: () => number;
  getHebrewFontSize: () => number;
  getLineHeight: () => number;
  getHebrewLineHeight: () => number;
  shouldShowHebrew: () => boolean;
  shouldShowEnglish: () => boolean;
  getThemeColors: () => any;
}

const TextReaderSettingsContext = createContext<TextReaderSettingsContextType | undefined>(undefined);

interface TextReaderSettingsProviderProps {
  children: React.ReactNode;
}

export const TextReaderSettingsProvider = ({ children }: TextReaderSettingsProviderProps) => {
  const [settings, setSettings] = useState<TextReaderSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const storedSettings = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
        if (storedSettings) {
          const parsedSettings = JSON.parse(storedSettings);
          setSettings({ ...defaultSettings, ...parsedSettings });
        }
      } catch (error) {
        console.error('Failed to load text reader settings:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadSettings();
  }, []);

  const updateSettings = useCallback(async (newSettings: Partial<TextReaderSettings>) => {
    try {
      const updatedSettings = { ...settings, ...newSettings };
      setSettings(updatedSettings);
      await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(updatedSettings));
    } catch (error) {
      console.error('Failed to save text reader settings:', error);
    }
  }, [settings]);

  const resetSettings = useCallback(async () => {
    try {
      setSettings(defaultSettings);
      await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(defaultSettings));
    } catch (error) {
      console.error('Failed to reset text reader settings:', error);
    }
  }, []);

  const getFontSize = useCallback(() => {
    switch (settings.fontSize) {
      case 'small': return 14;
      case 'medium': return 16;
      case 'large': return 18;
      default: return 16;
    }
  }, [settings.fontSize]);

  const getHebrewFontSize = useCallback(() => {
    switch (settings.fontSize) {
      case 'small': return 16;
      case 'medium': return 18;
      case 'large': return 20;
      default: return 18;
    }
  }, [settings.fontSize]);

  const getLineHeight = useCallback(() => {
    switch (settings.fontSize) {
      case 'small': return 22;
      case 'medium': return 26;
      case 'large': return 30;
      default: return 26;
    }
  }, [settings.fontSize]);

  const getHebrewLineHeight = useCallback(() => {
    switch (settings.fontSize) {
      case 'small': return 26;
      case 'medium': return 30;
      case 'large': return 34;
      default: return 30;
    }
  }, [settings.fontSize]);

  const shouldShowHebrew = useCallback(() => {
    return settings.language === 'hebrew' || settings.language === 'bilingual';
  }, [settings.language]);

  const shouldShowEnglish = useCallback(() => {
    return settings.language === 'english' || settings.language === 'bilingual';
  }, [settings.language]);

  const getThemeColors = useCallback(() => {
    if (settings.colorTheme === 'dark') {
      return {
        background: '#000000',
        cardBackground: '#111111',
        text: '#FFFFFF',
        secondaryText: '#CCCCCC',
        border: '#333333',
        accent: '#FFFFFF',
      };
    }
    return {
      background: '#f8f9fa',
      cardBackground: '#ffffff',
      text: '#2c3e50',
      secondaryText: '#7f8c8d',
      border: '#e1e8ed',
      accent: '#007AFF',
    };
  }, [settings.colorTheme]);

  const providerValue: TextReaderSettingsContextType = {
    settings,
    updateSettings,
    resetSettings,
    isLoading,
    getFontSize,
    getHebrewFontSize,
    getLineHeight,
    getHebrewLineHeight,
    shouldShowHebrew,
    shouldShowEnglish,
    getThemeColors
  };

  return (
    <TextReaderSettingsContext.Provider value={providerValue}>
      {children}
    </TextReaderSettingsContext.Provider>
  );
};

export const useTextReaderSettings = () => {
  const context = useContext(TextReaderSettingsContext);
  if (!context) throw new Error('useTextReaderSettings must be used within a TextReaderSettingsProvider');
  return context;
}; 