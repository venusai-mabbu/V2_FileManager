import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Appearance, ColorSchemeName } from 'react-native';
import { Colors } from '../constants/Colors';
import { loadSettings, saveSettings } from '../utils/storage';

type Theme = 'light' | 'dark' | 'auto';

interface ThemeContextType {
  theme: Theme;
  currentScheme: ColorSchemeName;
  colors: typeof Colors.light;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>('light');
  const [currentScheme, setCurrentScheme] = useState<ColorSchemeName>(
    Appearance.getColorScheme()
  );

  const getActiveScheme = (): ColorSchemeName => {
    if (theme === 'auto') {
      return currentScheme;
    }
    return theme;
  };

  const colors = getActiveScheme() === 'dark' ? Colors.dark : Colors.light;

  const setTheme = async (newTheme: Theme) => {
    setThemeState(newTheme);
    try {
      const settings = await loadSettings();
      await saveSettings({ ...settings, theme: newTheme });
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const settings = await loadSettings();
        setThemeState(settings.theme);
      } catch (error) {
        console.error('Error loading theme:', error);
      }
    };

    loadTheme();

    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setCurrentScheme(colorScheme);
    });

    return () => subscription?.remove();
  }, []);

  const value: ThemeContextType = {
    theme,
    currentScheme: getActiveScheme(),
    colors,
    setTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};