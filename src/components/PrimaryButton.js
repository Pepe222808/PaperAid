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
    minHeight: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  compact: {
    minHeight: 40,
  },
  primary: {
    backgroundColor: colors.primary,
  },
  secondary: {
    backgroundColor: colors.canvas,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pressed: {
    opacity: 0.9,
  },
  text: {
    fontSize: 17,
    fontWeight: '800',
  },
  primaryText: {
    color: '#ffffff',
  },
  secondaryText: {
    color: colors.text,
  },
});
