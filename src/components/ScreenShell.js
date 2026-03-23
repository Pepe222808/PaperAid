import { Platform, Pressable, SafeAreaView, StatusBar, StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '../context/ThemeContext';

export function ScreenShell({
  title,
  subtitle,
  rightAccessory = null,
  children,
  headerColor = null,
}) {
  const { colors, isDark, toggleTheme } = useAppTheme();
  const styles = createStyles(colors);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={[styles.header, headerColor ? { backgroundColor: headerColor } : null]}>
        <View style={styles.headerCopy}>
          <View style={styles.titleRow}>
            {typeof title === 'string' ? null : title.leading}
            <Text style={[styles.title, typeof title === 'string' ? null : title.textStyle]}>
              {typeof title === 'string' ? title : title.text}
            </Text>
          </View>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
        {rightAccessory ? (
          rightAccessory
        ) : (
          <Pressable style={styles.themeToggle} onPress={toggleTheme}>
            <Text style={styles.themeToggleText}>{isDark ? '\u2600' : '\u263E'}</Text>
          </Pressable>
        )}
      </View>
      <View style={styles.content}>{children}</View>
    </SafeAreaView>
  );
}

const createStyles = (colors) => {
  const topInset = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) : 0;

  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      backgroundColor: colors.primary,
      paddingHorizontal: 18,
      paddingTop: 10 + topInset,
      paddingBottom: 16,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      minHeight: 104,
    },
    headerCopy: {
      flex: 1,
      paddingRight: 12,
    },
    title: {
      fontSize: 24,
      fontWeight: '800',
      color: '#ffffff',
      letterSpacing: -0.4,
    },
    titleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    subtitle: {
      fontSize: 13,
      color: 'rgba(255,255,255,0.94)',
      marginTop: 4,
    },
    themeToggle: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: 'rgba(255,255,255,0.2)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    themeToggleText: {
      color: '#ffffff',
      fontSize: 18,
      fontWeight: '700',
    },
    content: {
      flex: 1,
      paddingTop: 10,
    },
  });
};
