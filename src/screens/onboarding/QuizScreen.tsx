import { View, ScrollView, StyleSheet } from 'react-native';
import { useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ThemedView } from '@components/ThemedView';
import { ThemedText } from '@components/ThemedText';
import { Button } from '@components/Button';
import { spacing, radius, colors } from '@constants/colors';
import { OnboardingStackParamList } from '../OnboardingStack';

type QuizScreenProps = NativeStackScreenProps<OnboardingStackParamList, 'Quiz'>;

interface QuizState {
  step: number;
}

export function QuizScreen({ navigation }: QuizScreenProps) {
  const [quiz, setQuiz] = useState<QuizState>({ step: 0 });

  const handleNext = () => {
    if (quiz.step < 7) {
      setQuiz(prev => ({ ...prev, step: prev.step + 1 }));
    } else {
      // Ir para resultado (placeholder)
      navigation.replace('Result', {
        calorieGoal: 2000,
        proteinGoal: 120,
        waterGoal: 2800,
      });
    }
  };

  const handleBack = () => {
    if (quiz.step > 0) {
      setQuiz(prev => ({ ...prev, step: prev.step - 1 }));
    }
  };

  return (
    <ScrollView 
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={styles.scrollContent}
    >
      <ThemedView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <ThemedText variant="heading" color="primary">
            Seu Perfil
          </ThemedText>
          <ThemedText 
            variant="body" 
            color="textSecondary"
            style={{ marginTop: spacing.sm }}
          >
            Etapa {quiz.step + 1} de 8
          </ThemedText>
        </View>

        {/* Barra de progresso */}
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill,
              { width: `${((quiz.step + 1) / 8) * 100}%` },
            ]}
          />
        </View>

        {/* Conteúdo */}
        <View style={styles.content}>
          <ThemedText variant="subheading" style={{ marginBottom: spacing.lg }}>
            Passo {quiz.step + 1}: Configuração de Perfil
          </ThemedText>
          <ThemedText variant="body" color="textSecondary">
            Complete todas as 8 etapas para calcular suas metas personalizadas.
          </ThemedText>
        </View>

        {/* Botões */}
        <View style={styles.buttons}>
          {quiz.step > 0 && (
            <Button
              label="← Voltar"
              variant="outline"
              onPress={handleBack}
              style={{ marginBottom: spacing.md }}
            />
          )}
          <Button
            label={quiz.step === 7 ? 'Calcular Metas' : 'Próximo →'}
            variant="primary"
            onPress={handleNext}
          />
        </View>
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
  progressBar: {
    height: 4,
    backgroundColor: colors.border,
    borderRadius: radius.full,
    marginBottom: spacing['2xl'],
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: radius.full,
  },
  content: {
    minHeight: 200,
    marginBottom: spacing['2xl'],
  },
  buttons: {
    marginTop: spacing['2xl'],
  },
});
