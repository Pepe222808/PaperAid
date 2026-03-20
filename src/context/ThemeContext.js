import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';

import { DARK_COLORS, LIGHT_COLORS } from '../theme/colors';

const THEME_STORAGE_KEY = '@paperaid/theme-preference/v1';
const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const systemScheme = useColorScheme();
  const [themePreference, setThemePreference] = useState('system');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const stored = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (stored === 'light' || stored === 'dark' || stored === 'system') {
          setThemePreference(stored);
        }
      } catch (_error) {
      } finally {
        setIsReady(true);
      }
    };

    loadThemePreference();
  }, []);

  const setPreference = (nextPreference) => {
    setThemePreference(nextPreference);
    AsyncStorage.setItem(THEME_STORAGE_KEY, nextPreference).catch(() => {});
  };

  const isDark =
    themePreference === 'system' ? systemScheme === 'dark' : themePreference === 'dark';
  const colors = isDark ? DARK_COLORS : LIGHT_COLORS;

  const value = useMemo(
    () => ({
      colors,
      isDark,
      isReady,
      themePreference,
      setThemePreference: setPreference,
      toggleTheme: () => setPreference(isDark ? 'light' : 'dark'),
    }),
    [colors, isDark, isReady, themePreference]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAppTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useAppTheme must be used within a ThemeProvider');
  }

  return context;
}
