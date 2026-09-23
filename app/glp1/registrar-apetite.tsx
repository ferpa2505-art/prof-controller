import { View, ScrollView, StyleSheet, Alert, TextInput } from 'react-native';
import { ThemedView } from '@components/ThemedView';
import { ThemedText } from '@components/ThemedText';
import { Button } from '@components/Button';
import { colors, spacing, radius } from '@constants/colors';
import { useGLP1 } from '@context/GLP1Context';
import { useState } from 'react';

const NIVEIS_APETITE = [
  { label: '😋 Excelente', value: 'excelente' },
  { label: '🙂 Bom', value: 'bom' },
  { label: '😐 Regular', value: 'regular' },
  { label: '😟 Baixo', value: 'baixo' },
  { label: '😢 Muito Baixo', value: 'muito_baixo' },
];

export default function RegistrarApetiteScreen() {
  const { estado, registrarApetite, obterApetiteHoje } = useGLP1();
  const [nivelSelecionado, setNivelSelecionado] = useState<string | null>(null);
  const [proteinaDigitada, setProteinaDigitada] = useState('');
  const [anotacoes, setAnotacoes] = useState('');
  const [carregando, setCarregando] = useState(false);

  const apetiteHoje = obterApetiteHoje();

  const handleRegistrar = async () => {
    if (!nivelSelecionado) {
      Alert.alert('Aviso', 'Selecione um nível de apetite');
      return;
    }

    const proteina = parseFloat(proteinaDigitada);
    if (isNaN(proteina) || proteina < 0) {
      Alert.alert('Erro', 'Digite uma quantidade válida de proteína');
      return;
    }

    try {
      setCarregando(true);
      await registrarApetite(
        nivelSelecionado as 'excelente' | 'bom' | 'regular' | 'baixo' | 'muito_baixo',
        proteina,
        anotacoes
      );
      Alert.alert('Sucesso', 'Apetite registrado para hoje!');
      setNivelSelecionado(null);
      setProteinaDigitada('');
      setAnotacoes('');
    } catch (erro) {
      Alert.alert('Erro', 'Não foi possível registrar o apetite');
    } finally {
      setCarregando(false);
    }
  };

  const diferenca = apetiteHoje
    ? (estado?.meta_proteina_g ?? 0) - apetiteHoje.proteina_consumida
    : null;
  const proteina_status =
    diferenca !== null ? (diferenca > 0 ? `Faltam ${Math.round(diferenca)}g` : 'Meta atingida! ✅') : '';

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ padding: spacing.lg }}
    >
      <ThemedView style={styles.container}>
        <ThemedText variant="title" style={styles.title}>
          🍽️ Registrar Apetite
        </ThemedText>

        {/* Resumo do Dia */}
        {apetiteHoje && (
          <ThemedView variant="surface" style={styles.resumoCard}>
            <ThemedText variant="subheading" color="text">
              Resumo de Hoje
            </ThemedText>

            <View style={styles.resumoItem}>
              <ThemedText variant="body" color="textSecondary">
                Nível de Apetite:
              </ThemedText>
              <ThemedText variant="heading" color="primary">
                {NIVEIS_APETITE.find((n) => n.value === apetiteHoje.nivelApetite)?.label}
              </ThemedText>
            </View>

            <View style={styles.resumoItem}>
              <ThemedText variant="body" color="textSecondary">
                Proteína Consumida:
              </ThemedText>
              <ThemedText variant="heading" color="accent">
                {apetiteHoje.proteina_consumida}g
              </ThemedText>
            </View>

            <View style={styles.resumoItem}>
              <ThemedText variant="body" color="textSecondary">
                {proteina_status}
              </ThemedText>
            </View>

            {apetiteHoje.anotacoes && (
              <ThemedText variant="small" color="textSecondary" style={{ marginTop: spacing.md }}>
                Notas: {apetiteHoje.anotacoes}
              </ThemedText>
            )}
          </ThemedView>
        )}

        {/* Seletor de Nível de Apetite */}
        <ThemedView variant="surface" style={styles.card}>
          <ThemedText variant="subheading" color="text">
            Como está seu apetite?
          </ThemedText>

          <View style={styles.apetiteGrid}>
            {NIVEIS_APETITE.map(({ label, value }) => (
              <Button
                key={value}
                label={label}
                variant={nivelSelecionado === value ? 'primary' : 'secondary'}
                size="md"
                onPress={() => setNivelSelecionado(value)}
                style={styles.apetiteBotao}
              />
            ))}
          </View>
        </ThemedView>

        {/* Proteína Consumida */}
        <ThemedView variant="surface" style={styles.card}>
          <ThemedText variant="subheading" color="text">
            Quanto de proteína você consumiu?
          </ThemedText>

          <ThemedText variant="small" color="textSecondary" style={{ marginTop: spacing.md }}>
            Meta diária: {estado?.meta_proteina_g ?? '--'}g
          </ThemedText>

          <TextInput
            style={styles.input}
            placeholder="Digite em gramas (ex: 150)"
            value={proteinaDigitada}
            onChangeText={setProteinaDigitada}
            keyboardType="decimal-pad"
            placeholderTextColor={colors.textSecondary}
          />
        </ThemedView>

        {/* Anotações Opcionais */}
        <ThemedView variant="surface" style={styles.card}>
          <ThemedText variant="subheading" color="text">
            Anotações (opcional)
          </ThemedText>

          <TextInput
            style={[styles.input, styles.textarea]}
            placeholder="Ex: Comeu pouco por causa de enjoo"
            value={anotacoes}
            onChangeText={setAnotacoes}
            multiline
            placeholderTextColor={colors.textSecondary}
          />
        </ThemedView>

        {/* Botão Registrar */}
        <Button
          label="✓ Registrar Apetite"
          variant="primary"
          size="lg"
          onPress={handleRegistrar}
          disabled={carregando}
          style={{ marginTop: spacing.xl }}
        />
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
  resumoCard: {
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  resumoItem: {
    marginBottom: spacing.md,
  },
  card: {
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderRadius: radius.lg,
  },
  apetiteGrid: {
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  apetiteBotao: {
    marginBottom: spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.md,
    fontSize: 16,
    color: colors.text,
  },
  textarea: {
    height: 100,
    textAlignVertical: 'top',
  },
});
