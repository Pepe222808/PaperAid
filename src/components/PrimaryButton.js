import { Pressable, StyleSheet, Text } from 'react-native';

import { useAppTheme } from '../context/ThemeContext';

export function PrimaryButton({ label, onPress, variant = 'primary', compact = false }) {
  const { colors } = useAppTheme();
  const styles = createStyles(colors);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        compact ? styles.compact : null,
        variant === 'secondary' ? styles.secondary : styles.primary,
        pressed ? styles.pressed : null,
      ]}
    >
      <Text
        style={[
          styles.text,
          variant === 'secondary' ? styles.secondaryText : styles.primaryText,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
  button: {
    minHeight: 54,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  compact: {
    minHeight: 44,
  },
  primary: {
    backgroundColor: colors.primary,
  },
  secondary: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pressed: {
    opacity: 0.88,
  },
  text: {
    fontSize: 15,
    fontWeight: '800',
  },
  primaryText: {
    color: '#fffaf2',
  },
  secondaryText: {
    color: colors.text,
  },
});
