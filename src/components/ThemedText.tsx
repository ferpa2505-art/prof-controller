import { Text, TextProps, StyleSheet } from 'react-native';
import { colors, typography } from '@constants/colors';

export interface ThemedTextProps extends TextProps {
  variant?: 'title' | 'heading' | 'subheading' | 'body' | 'small' | 'caption';
  color?: keyof typeof colors;
}

export function ThemedText({
  style,
  variant = 'body',
  color = 'text',
  ...rest
}: ThemedTextProps) {
  const styles = StyleSheet.create({
    title: {
      fontSize: typography.size['3xl'],
      fontWeight: typography.weight.bold,
    },
    heading: {
      fontSize: typography.size['2xl'],
      fontWeight: typography.weight.semibold,
    },
    subheading: {
      fontSize: typography.size.lg,
      fontWeight: typography.weight.semibold,
    },
    body: {
      fontSize: typography.size.base,
      fontWeight: typography.weight.regular,
    },
    small: {
      fontSize: typography.size.sm,
      fontWeight: typography.weight.regular,
    },
    caption: {
      fontSize: typography.size.xs,
      fontWeight: typography.weight.regular,
    },
  });

  return (
    <Text
      style={[
        styles[variant],
        { color: colors[color] },
        style,
      ]}
      {...rest}
    />
  );
}
