import { StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '../context/ThemeContext';

export function Pill({ label, tone = 'default' }) {
  const { colors } = useAppTheme();
  const styles = createStyles(colors);

  return (
    <View
      style={[
        styles.pill,
        tone === 'success' ? styles.successPill : null,
        tone === 'accent' ? styles.accentPill : null,
      ]}
    >
      <Text
        style={[
          styles.label,
          tone === 'success' ? styles.successLabel : null,
          tone === 'accent' ? styles.accentLabel : null,
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
  pill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 9999,
    borderWidth: 0,
    backgroundColor: colors.accentSoft,
  },
  successPill: {
    backgroundColor: colors.accentSoft,
    borderColor: 'transparent',
  },
  accentPill: {
    backgroundColor: colors.accentSoft,
    borderColor: 'transparent',
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.accent,
  },
  successLabel: {
    color: colors.success,
  },
  accentLabel: {
    color: colors.accent,
  },
});
