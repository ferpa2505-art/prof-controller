import { View, StyleSheet } from 'react-native';
import { ThemedView } from '@components/ThemedView';
import { ThemedText } from '@components/ThemedText';
import { spacing } from '@constants/colors';

export default function ProfileScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText variant="heading">Perfil</ThemedText>
      <ThemedText variant="body" color="textSecondary">
        Em breve você poderá gerenciar seu perfil aqui.
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
