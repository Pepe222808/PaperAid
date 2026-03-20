import { StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '../context/ThemeContext';

export function SectionCard({ title, subtitle, accent = false, children }) {
  const { colors } = useAppTheme();
  const styles = createStyles(colors);

  return (
    <View style={[styles.card, accent ? styles.cardAccent : null]}>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      <View style={styles.body}>{children}</View>
    </View>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 18,
    shadowColor: colors.shadow,
    shadowOpacity: 1,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 2,
  },
  cardAccent: {
    backgroundColor: colors.surfaceStrong,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: colors.muted,
    marginTop: 6,
    lineHeight: 20,
  },
  body: {
    marginTop: 18,
    gap: 14,
  },
});
