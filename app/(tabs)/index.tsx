import { View, ScrollView, StyleSheet } from 'react-native';
import { ThemedView } from '@components/ThemedView';
import { ThemedText } from '@components/ThemedText';
import { Button } from '@components/Button';
import { colors, spacing, radius } from '@constants/colors';

export default function HomeScreen() {
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ padding: spacing.lg }}
    >
      <ThemedView style={styles.container}>
        {/* Saudação */}
        <View style={styles.greeting}>
          <ThemedText variant="title" color="primary">
            Olá! 👋
          </ThemedText>
          <ThemedText variant="body" color="textSecondary" style={{ marginTop: spacing.sm }}>
            Bem-vindo ao seu acompanhamento de saúde
          </ThemedText>
        </View>

        {/* Card de Resumo do Dia */}
        <ThemedView variant="surface" style={styles.card}>
          <ThemedText variant="subheading" color="text">
            Resumo de Hoje
          </ThemedText>
          
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <ThemedText variant="heading" color="primary">
                0
              </ThemedText>
              <ThemedText variant="small" color="textSecondary">
                kcal
              </ThemedText>
            </View>
            
            <View style={styles.statItem}>
              <ThemedText variant="heading" color="accent">
                0
              </ThemedText>
              <ThemedText variant="small" color="textSecondary">
                g proteína
              </ThemedText>
            </View>
            
            <View style={styles.statItem}>
              <ThemedText variant="heading" color="secondary">
                0
              </ThemedText>
              <ThemedText variant="small" color="textSecondary">
                ml água
              </ThemedText>
            </View>
          </View>
        </ThemedView>

        {/* Card de Peso */}
        <ThemedView variant="surface" style={styles.card}>
          <ThemedText variant="subheading" color="text">
            Seu Peso
          </ThemedText>
          <ThemedText variant="heading" color="primary" style={{ marginVertical: spacing.md }}>
            -- kg
          </ThemedText>
          <ThemedText variant="small" color="textSecondary">
            Última pesagem: --
          </ThemedText>
        </ThemedView>

        {/* CTA Onboarding */}
        <Button
          label="Começar Configuração"
          variant="primary"
          size="lg"
          onPress={() => {}}
          style={{ marginTop: spacing.xl }}
        />

        {/* Status */}
        <View style={styles.status}>
          <ThemedText variant="caption" color="textSecondary">
            v0.1.0 • Fase 1 de Desenvolvimento
          </ThemedText>
        </View>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  greeting: {
    marginBottom: spacing['2xl'],
  },
  card: {
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderRadius: radius.lg,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: spacing.md,
  },
  statItem: {
    alignItems: 'center',
  },
  status: {
    marginTop: spacing['2xl'],
    alignItems: 'center',
  },
});
