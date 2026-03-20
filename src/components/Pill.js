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
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#efe5d7',
  },
  successPill: {
    backgroundColor: '#dceddf',
  },
  accentPill: {
    backgroundColor: colors.accentSoft,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6c584c',
  },
  successLabel: {
    color: colors.success,
  },
  accentLabel: {
    color: colors.accent,
  },
});
