import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { ThemedView } from '@components/ThemedView';
import { ThemedText } from '@components/ThemedText';
import { Button } from '@components/Button';
import { colors, spacing, radius } from '@constants/colors';
import { useGLP1 } from '@context/GLP1Context';
import { useRouter } from 'expo-router';

export default function GLP1DashboardScreen() {
  const { estado, gerarAlertas } = useGLP1();
  const router = useRouter();

  if (!estado) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Carregando...</ThemedText>
      </ThemedView>
    );
  }

  const alertas = gerarAlertas();
  const pesoInicial = estado.peso_inicial_kg;
  const pesoAtual = estado.peso_atual_kg;
  const perdaPeso = (pesoInicial - pesoAtual).toFixed(1);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ padding: spacing.lg }}
    >
      <ThemedView style={styles.container}>
        <ThemedText variant="title" style={styles.title}>
          💪 Escudo Muscular GLP-1
        </ThemedText>

        {/* Alertas */}
        {alertas.length > 0 && (
          <ThemedView style={[styles.alertaContainer, { backgroundColor: '#FFF5E6' }]}>
            <ThemedText variant="subheading" color="text" style={{ color: '#D97706' }}>
              ⚠️ Alertas Ativos
            </ThemedText>
            {alertas.map((alerta) => (
              <ThemedText key={alerta.id} variant="small" style={{ color: '#D97706', marginTop: spacing.sm }}>
                • {alerta.mensagem}
              </ThemedText>
            ))}
          </ThemedView>
        )}

        {/* Dose Atual */}
        <ThemedView variant="surface" style={styles.card}>
          <ThemedText variant="body" color="textSecondary">
            Dose Atual
          </ThemedText>
          <ThemedText variant="heading" color="primary" style={{ marginVertical: spacing.md }}>
            {estado.dose_atual}
          </ThemedText>
          <Button
            label="⚙️ Configurar"
            variant="secondary"
            size="sm"
            onPress={() => router.push('/glp1/configurar')}
          />
        </ThemedView>

        {/* Meta de Proteína */}
        <ThemedView variant="surface" style={styles.card}>
          <ThemedText variant="body" color="textSecondary">
            Meta de Proteína Diária
          </ThemedText>
          <ThemedText variant="heading" color="accent" style={{ marginVertical: spacing.md }}>
            {estado.meta_proteina_g ?? '--'} g/dia
          </ThemedText>
          <ThemedText variant="small" color="textSecondary">
            Baseado em seu peso de {estado.peso_atual_kg}kg
          </ThemedText>
        </ThemedView>

        {/* Evolução de Peso */}
        <ThemedView variant="surface" style={styles.card}>
          <ThemedText variant="subheading" color="text" style={{ marginBottom: spacing.md }}>
            📊 Evolução
          </ThemedText>

          <View style={styles.metricasGrid}>
            <View style={styles.metricaItem}>
              <ThemedText variant="small" color="textSecondary">
                Peso Inicial
              </ThemedText>
              <ThemedText variant="heading" color="primary">
                {pesoInicial}kg
              </ThemedText>
            </View>

            <View style={styles.metricaItem}>
              <ThemedText variant="small" color="textSecondary">
                Peso Atual
              </ThemedText>
              <ThemedText variant="heading" color="accent">
                {pesoAtual}kg
              </ThemedText>
            </View>

            <View style={styles.metricaItem}>
              <ThemedText variant="small" color="textSecondary">
                Perda de Peso
              </ThemedText>
              <ThemedText variant="heading" color={parseFloat(perdaPeso) > 0 ? 'primary' : 'textSecondary'}>
                {parseFloat(perdaPeso) > 0 ? '-' : ''}{Math.abs(parseFloat(perdaPeso))}kg
              </ThemedText>
            </View>
          </View>

          <Button
            label="📈 Ver Histórico"
            variant="secondary"
            size="sm"
            onPress={() => router.push('/glp1/evoucao-peso')}
            style={{ marginTop: spacing.md }}
          />
        </ThemedView>

        {/* Registrar Apetite */}
        <ThemedView variant="surface" style={styles.card}>
          <ThemedText variant="subheading" color="text">
            🍽️ Apetite Diário
          </ThemedText>

          <ThemedText variant="small" color="textSecondary" style={{ marginTop: spacing.md }}>
            Registre seu nível de apetite e proteína consumida para monitorar seu progresso com GLP-1.
          </ThemedText>

          <Button
            label="Registrar Apetite Hoje"
            variant="primary"
            size="md"
            onPress={() => router.push('/glp1/registrar-apetite')}
            style={{ marginTop: spacing.md }}
          />
        </ThemedView>

        {/* Informações */}
        <ThemedView variant="surface" style={[styles.card, { borderWidth: 1, borderColor: colors.border }]}>
          <ThemedText variant="small" color="textSecondary">
            💡 Dica: Mantenha uma ingestão consistente de proteína mesmo com redução de apetite. Alimentos pequenos e frequentes podem ajudar.
          </ThemedText>
        </ThemedView>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    marginBottom: spacing['2xl'],
  },
  alertaContainer: {
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderRadius: radius.lg,
    borderLeftWidth: 4,
    borderLeftColor: '#D97706',
  },
  card: {
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderRadius: radius.lg,
  },
  metricasGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.md,
  },
  metricaItem: {
    alignItems: 'center',
  },
});
