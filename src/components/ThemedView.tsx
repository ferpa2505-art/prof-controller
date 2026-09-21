import { View, ViewProps, StyleSheet } from 'react-native';
import { colors } from '@constants/colors';

export interface ThemedViewProps extends ViewProps {
  variant?: 'default' | 'surface';
}

export function ThemedView({
  style,
  variant = 'default',
  ...rest
}: ThemedViewProps) {
  const backgroundColor =
    variant === 'surface' ? colors.surface : colors.background;

  return (
    <View
      style={[{ backgroundColor }, style]}
      {...rest}
    />
  );
}
