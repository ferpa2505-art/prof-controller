import { View, StyleSheet } from 'react-native';
import { ThemedView } from '@components/ThemedView';
import { ThemedText } from '@components/ThemedText';
import { spacing } from '@constants/colors';

export default function JournalScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText variant="heading">Diário Alimentar</ThemedText>
      <ThemedText variant="body" color="textSecondary">
        Em breve você poderá registrar suas refeições aqui.
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
