import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';

import { DocumentProvider } from './src/context/DocumentContext';
import { ThemeProvider, useAppTheme } from './src/context/ThemeContext';
import { AppNavigator } from './src/navigation/AppNavigator';

function AppContent() {
  const { colors, isDark } = useAppTheme();
  const navigationTheme = {
    ...DefaultTheme,
    dark: isDark,
    colors: {
      ...DefaultTheme.colors,
      background: colors.background,
      card: colors.surface,
      text: colors.text,
      border: colors.border,
      primary: colors.primary,
    },
  };

  return (
    <DocumentProvider>
      <NavigationContainer theme={navigationTheme}>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <AppNavigator />
      </NavigationContainer>
    </DocumentProvider>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
