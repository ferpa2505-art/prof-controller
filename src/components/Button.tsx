import { Pressable, Text, StyleSheet, PressableProps } from 'react-native';
import { colors, spacing, radius } from '@constants/colors';

export interface ButtonProps extends PressableProps {
  label: string;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

export function Button({
  label,
  variant = 'primary',
  size = 'md',
  ...rest
}: ButtonProps) {
  const styles = StyleSheet.create({
    base: {
      borderRadius: radius.lg,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: size === 'sm' ? spacing.sm : size === 'lg' ? spacing.lg : spacing.md,
      paddingHorizontal: spacing.lg,
    },
    primary: {
      backgroundColor: colors.primary,
    },
    secondary: {
      backgroundColor: colors.accent,
    },
    outline: {
      backgroundColor: 'transparent',
      borderWidth: 2,
      borderColor: colors.primary,
    },
  });

  const textColor =
    variant === 'outline' ? colors.primary : colors.background;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        { opacity: pressed ? 0.7 : 1 },
      ]}
      {...rest}
    >
      <Text
        style={{
          color: textColor,
          fontWeight: '600',
          fontSize: 16,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
