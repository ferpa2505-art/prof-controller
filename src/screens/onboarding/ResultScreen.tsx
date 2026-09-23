import { View, StyleSheet, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ThemedView } from '@components/ThemedView';
import { ThemedText } from '@components/ThemedText';
import { Button } from '@components/Button';
import { spacing, radius, colors } from '@constants/colors';
import { OnboardingStackParamList } from '../OnboardingStack';

type ResultScreenProps = NativeStackScreenProps<OnboardingStackParamList, 'Result'>;

export function ResultScreen({ route, navigation }: ResultScreenProps) {
  const { calorieGoal, proteinGoal, waterGoal } = route.params;

  return (
    <ScrollView 
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={styles.scrollContent}
    >
      <ThemedView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <ThemedText variant="title" color="success" style={{ marginBottom: spacing.md }}>
            ✓ Suas Metas Calculadas!
          </ThemedText>
          <ThemedText variant="body" color="textSecondary">
            Com base em seu perfil, aqui estão suas metas diárias
          </ThemedText>
        </View>

        {/* Cards de Metas */}
        <View style={styles.goalsGrid}>
          {/* Calorias */}
          <ThemedView variant="surface" style={styles.goalCard}>
            <ThemedText variant="heading" style={{ fontSize: 32, marginBottom: spacing.md }}>
              🔥
            </ThemedText>
            <ThemedText variant="heading" color="primary" style={styles.goalValue}>
              {calorieGoal.toLocaleString('pt-BR')}
            </ThemedText>
            <ThemedText variant="body" color="textSecondary">
              kcal/dia
            </ThemedText>
          </ThemedView>

          {/* Proteína */}
          <ThemedView variant="surface" style={styles.goalCard}>
            <ThemedText variant="heading" style={{ fontSize: 32, marginBottom: spacing.md }}>
              🍗
            </ThemedText>
            <ThemedText 
              variant="heading" 
              style={[
                styles.goalValue,
                { color: colors.accent }
              ]}
            >
              {proteinGoal.toLocaleString('pt-BR')}
            </ThemedText>
            <ThemedText variant="body" color="textSecondary">
              g/dia
            </ThemedText>
          </ThemedView>

          {/* Água */}
          <ThemedView variant="surface" style={styles.goalCard}>
            <ThemedText variant="heading" style={{ fontSize: 32, marginBottom: spacing.md }}>
              💧
            </ThemedText>
            <ThemedText 
              variant="heading" 
              style={[
                styles.goalValue,
                { color: colors.primary }
              ]}
            >
              {(waterGoal / 1000).toFixed(1)}
            </ThemedText>
            <ThemedText variant="body" color="textSecondary">
              L/dia
            </ThemedText>
          </ThemedView>
        </View>

        {/* Info Box */}
        <ThemedView variant="surface" style={styles.infoBox}>
          <ThemedText variant="body" color="primary" style={{ marginBottom: spacing.sm }}>
            ℹ️ Sobre suas metas
          </ThemedText>
          <ThemedText variant="small" color="textSecondary">
            Estas metas foram calculadas e seguem diretrizes nutricionais de segurança.
          </ThemedText>
        </ThemedView>

        {/* CTA */}
        <Button
          label="Vamos começar! 🚀"
          variant="primary"
          size="lg"
          onPress={() => {
            // TODO: Navegar para home
            navigation.getParent()?.goBack();
          }}
          style={{ marginTop: spacing['2xl'] }}
        />
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    paddingBottom: spacing.xl,
  },
  container: {
    flex: 1,
    padding: spacing.lg,
  },
  header: {
    marginBottom: spacing['2xl'],
  },
  goalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: spacing['2xl'],
    gap: spacing.md,
  },
  goalCard: {
    flex: 1,
    minWidth: '48%',
    padding: spacing.lg,
    borderRadius: radius.lg,
    alignItems: 'center',
  },
  goalValue: {
    marginBottom: spacing.xs,
  },
  infoBox: {
    padding: spacing.lg,
    borderRadius: radius.lg,
    marginBottom: spacing.lg,
  },
});
