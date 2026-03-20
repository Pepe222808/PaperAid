import { Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '../context/ThemeContext';

export function ScreenShell({ title, subtitle, rightAccessory = null, children }) {
  const { colors, isDark, toggleTheme } = useAppTheme();
  const styles = createStyles(colors);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View style={styles.headerCopy}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
        {rightAccessory ? rightAccessory : (
          <Pressable style={styles.themeToggle} onPress={toggleTheme}>
            <Text style={styles.themeToggleText}>{isDark ? '☀' : '☾'}</Text>
          </Pressable>
        )}
      </View>
      <View style={styles.content}>{children}</View>
    </SafeAreaView>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 26,
    paddingBottom: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerCopy: {
    flex: 1,
    paddingRight: 12,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.7,
  },
  subtitle: {
    fontSize: 14,
    color: colors.muted,
    marginTop: 4,
  },
  themeToggle: {
    width: 44,
    height: 44,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.canvas,
    alignItems: 'center',
    justifyContent: 'center',
  },
  themeToggleText: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '700',
  },
  content: {
    flex: 1,
  },
});
