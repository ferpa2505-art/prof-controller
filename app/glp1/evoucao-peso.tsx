import { View, ScrollView, StyleSheet, Alert, TextInput } from 'react-native';
import { ThemedView } from '@components/ThemedView';
import { ThemedText } from '@components/ThemedText';
import { Button } from '@components/Button';
import { colors, spacing, radius } from '@constants/colors';
import { useGLP1 } from '@context/GLP1Context';
import { useState } from 'react';

export default function EvolucaoPesoScreen() {
  const { estado, registrarPeso, obterEvolutaoPeso } = useGLP1();
  const [pesoDigitado, setPesoDigitado] = useState('');
  const [notas, setNotas] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [modo, setModo] = useState<'view' | 'add'>('view');

  const historico = obterEvolutaoPeso();
  const pesoAtual = estado?.peso_atual_kg ?? 0;
  const pesoInicial = estado?.peso_inicial_kg ?? 0;
  const perdaPeso = (pesoInicial - pesoAtual).toFixed(1);

  const handleRegistrar = async () => {
    const peso = parseFloat(pesoDigitado);
    if (isNaN(peso) || peso <= 0) {
      Alert.alert('Erro', 'Digite um peso válido');
      return;
    }

    try {
      setCarregando(true);
      await registrarPeso(peso, notas);
      Alert.alert('Sucesso', 'Peso registrado!');
      setPesoDigitado('');
      setNotas('');
      setModo('view');
    } catch (erro) {
      Alert.alert('Erro', 'Não foi possível registrar o peso');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ padding: spacing.lg }}
    >
      <ThemedView style={styles.container}>
        <ThemedText variant="title" style={styles.title}>
          📊 Evolução de Peso
        </ThemedText>

        {/* Resumo */}
        <View style={styles.resumoGrid}>
          <ThemedView variant="surface" style={styles.resumoCard}>
            <ThemedText variant="small" color="textSecondary">
              Peso Atual
            </ThemedText>
            <ThemedText variant="heading" color="primary">
              {pesoAtual}kg
            </ThemedText>
          </ThemedView>

          <ThemedView variant="surface" style={styles.resumoCard}>
            <ThemedText variant="small" color="textSecondary">
              Peso Inicial
            </ThemedText>
            <ThemedText variant="heading" color="accent">
              {pesoInicial}kg
            </ThemedText>
          </ThemedView>

          <ThemedView variant="surface" style={[styles.resumoCard, { backgroundColor: colors.background }]}>
            <ThemedText variant="small" color="textSecondary">
              Perda de Peso
            </ThemedText>
            <ThemedText variant="heading" color={perdaPeso > '0' ? 'primary' : 'textSecondary'}>
              {perdaPeso > '0' ? '-' : ''}{Math.abs(parseFloat(perdaPeso))}kg
            </ThemedText>
          </ThemedView>
        </View>

        {/* Histórico */}
        <ThemedView variant="surface" style={styles.card}>
          <ThemedText variant="subheading" color="text">
            Histórico de Pesagens
          </ThemedText>

          {historico.length === 0 ? (
            <ThemedText variant="body" color="textSecondary" style={{ marginTop: spacing.md }}>
              Nenhuma pesagem registrada ainda
            </ThemedText>
          ) : (
            <View style={styles.historico}>
              {historico.slice(0, 10).map((entrada, idx) => {
                const diferenca =
                  historico[idx - 1] && historico[idx - 1].peso_kg - entrada.peso_kg;
                const sinal =
                  diferenca !== undefined
                    ? diferenca > 0
                      ? '-'
                      : diferenca < 0
                        ? '+'
                        : ''
                    : '';

                return (
                  <View key={entrada.data} style={styles.historicoItem}>
                    <View style={styles.historicoInfo}>
                      <ThemedText variant="body" color="text">
                        {new Date(entrada.data).toLocaleDateString('pt-BR')}
                      </ThemedText>
                      <ThemedText variant="small" color="textSecondary">
                        Dose: {entrada.etapa_dose}
                      </ThemedText>
                      {entrada.notas && (
                        <ThemedText variant="small" color="textSecondary">
                          {entrada.notas}
                        </ThemedText>
                      )}
                    </View>
                    <View style={styles.historicoValor}>
                      <ThemedText variant="heading" color="primary">
                        {entrada.peso_kg}kg
                      </ThemedText>
                      {diferenca !== undefined && (
                        <ThemedText
                          variant="small"
                          color={diferenca > 0 ? 'primary' : diferenca < 0 ? 'accent' : 'textSecondary'}
                        >
                          {sinal}{Math.abs(diferenca).toFixed(1)}kg
                        </ThemedText>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </ThemedView>

        {/* Registrar Novo Peso */}
        {modo === 'view' ? (
          <Button
            label="➕ Registrar Novo Peso"
            variant="primary"
            size="lg"
            onPress={() => setModo('add')}
            style={{ marginTop: spacing.xl }}
          />
        ) : (
          <ThemedView variant="surface" style={[styles.card, { marginTop: spacing.xl }]}>
            <ThemedText variant="subheading" color="text">
              Adicionar Pesagem
            </ThemedText>

            <TextInput
              style={styles.input}
              placeholder="Digite seu peso em kg (ex: 85.5)"
              value={pesoDigitado}
              onChangeText={setPesoDigitado}
              keyboardType="decimal-pad"
              placeholderTextColor={colors.textSecondary}
            />

            <TextInput
              style={[styles.input, styles.textarea]}
              placeholder="Notas (ex: Medida sem roupas pela manhã)"
              value={notas}
              onChangeText={setNotas}
              multiline
              placeholderTextColor={colors.textSecondary}
            />

            <View style={styles.botoesAcao}>
              <Button
                label="✓ Salvar"
                variant="primary"
                size="md"
                onPress={handleRegistrar}
                disabled={carregando}
                style={{ flex: 1 }}
              />
              <Button
                label="✕ Cancelar"
                variant="secondary"
                size="md"
                onPress={() => {
                  setModo('view');
                  setPesoDigitado('');
                  setNotas('');
                }}
                style={{ flex: 1, marginLeft: spacing.md }}
              />
            </View>
          </ThemedView>
        )}
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
  resumoGrid: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
    flexWrap: 'wrap',
  },
  resumoCard: {
    flex: 1,
    minWidth: '45%',
    padding: spacing.md,
    borderRadius: radius.md,
  },
  card: {
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderRadius: radius.lg,
  },
  historico: {
    marginTop: spacing.md,
    gap: spacing.md,
  },
  historicoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.background,
    borderRadius: radius.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  historicoInfo: {
    flex: 1,
  },
  historicoValor: {
    alignItems: 'flex-end',
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
    height: 80,
    textAlignVertical: 'top',
  },
  botoesAcao: {
    flexDirection: 'row',
    marginTop: spacing.lg,
  },
});
