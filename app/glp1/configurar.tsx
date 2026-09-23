import { View, ScrollView, StyleSheet, Switch, Alert, TextInput } from 'react-native';
import { ThemedView } from '@components/ThemedView';
import { ThemedText } from '@components/ThemedText';
import { Button } from '@components/Button';
import { colors, spacing, radius } from '@constants/colors';
import { useGLP1 } from '@context/GLP1Context';
import { useState } from 'react';
import type { DoseGLP1 } from '../../src/types/glp1';

const DOSES_DISPONIVEIS: DoseGLP1[] = ['nao_usa', '0.25mg', '0.5mg', '1mg', '1.5mg', '2mg'];

export default function ConfigurarGLP1Screen() {
  const { estado, atualizarDose, atualizarMetaProteina, atualizarAlertasAtivos } = useGLP1();
  const [editar, setEditar] = useState(false);
  const [metaTemp, setMetaTemp] = useState(estado?.meta_proteina_g?.toString() ?? '');
  const [doseTemp, setDoseTemp] = useState(estado?.dose_atual ?? '1mg');
  const [alertasTemp, setAlertasTemp] = useState(estado?.alertas_ativos ?? true);

  const handleSalvarDose = async () => {
    try {
      await atualizarDose(doseTemp);
      Alert.alert('Sucesso', 'Dose de GLP-1 atualizada!');
      setEditar(false);
    } catch (erro) {
      Alert.alert('Erro', 'Não foi possível salvar a dose');
    }
  };

  const handleSalvarMeta = async () => {
    try {
      const meta = parseFloat(metaTemp);
      if (isNaN(meta) || meta <= 0) {
        Alert.alert('Erro', 'Meta de proteína deve ser um número válido');
        return;
      }
      await atualizarMetaProteina(meta);
      Alert.alert('Sucesso', 'Meta de proteína atualizada!');
      setEditar(false);
    } catch (erro) {
      Alert.alert('Erro', 'Não foi possível salvar a meta');
    }
  };

  const handleAlertasToggle = async (valor: boolean) => {
    try {
      setAlertasTemp(valor);
      await atualizarAlertasAtivos(valor);
    } catch (erro) {
      Alert.alert('Erro', 'Não foi possível atualizar alertas');
    }
  };

  if (!estado) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Carregando...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ padding: spacing.lg }}
    >
      <ThemedView style={styles.container}>
        <ThemedText variant="title" style={styles.title}>
          ⚙️ Configurações GLP-1
        </ThemedText>

        {/* Dose de GLP-1 */}
        <ThemedView variant="surface" style={styles.card}>
          <ThemedText variant="subheading" color="text">
            Dose de GLP-1
          </ThemedText>

          {editar ? (
            <View style={styles.doseSelector}>
              {DOSES_DISPONIVEIS.map((dose) => (
                <Button
                  key={dose}
                  label={dose}
                  variant={doseTemp === dose ? 'primary' : 'secondary'}
                  size="sm"
                  onPress={() => setDoseTemp(dose)}
                  style={styles.doseBotao}
                />
              ))}
            </View>
          ) : (
            <ThemedText variant="heading" color="primary" style={{ marginVertical: spacing.md }}>
              {estado.dose_atual}
            </ThemedText>
          )}

          <ThemedText variant="small" color="textSecondary" style={{ marginTop: spacing.md }}>
            Dose atual de seu medicamento GLP-1. Predefinida em 1mg - confirme ou ajuste.
          </ThemedText>

          {editar && (
            <Button
              label="Salvar Dose"
              variant="primary"
              size="md"
              onPress={handleSalvarDose}
              style={{ marginTop: spacing.md }}
            />
          )}
        </ThemedView>

        {/* Meta de Proteína */}
        <ThemedView variant="surface" style={styles.card}>
          <ThemedText variant="subheading" color="text">
            Meta de Proteína Diária
          </ThemedText>

          <ThemedText variant="heading" color="accent" style={{ marginVertical: spacing.md }}>
            {estado.meta_proteina_g ?? '--'} g/dia
          </ThemedText>

          {editar ? (
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Digite a meta em gramas"
                value={metaTemp}
                onChangeText={setMetaTemp}
                keyboardType="decimal-pad"
                placeholderTextColor={colors.textSecondary}
              />
              <Button
                label="Salvar Meta"
                variant="primary"
                size="md"
                onPress={handleSalvarMeta}
                style={{ marginTop: spacing.md }}
              />
            </View>
          ) : (
            <ThemedText variant="small" color="textSecondary">
              Baseado em sua peso ({estado.peso_atual_kg}kg): ~{estado.meta_proteina_g}g
              <ThemedText variant="small" color="textSecondary">
                {' '}(~1g por libra)
              </ThemedText>
            </ThemedText>
          )}
        </ThemedView>

        {/* Alertas */}
        <ThemedView variant="surface" style={styles.card}>
          <View style={styles.alertaHeader}>
            <ThemedText variant="subheading" color="text">
              Ativar Alertas
            </ThemedText>
            <Switch
              value={alertasTemp}
              onValueChange={handleAlertasToggle}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={alertasTemp ? colors.accent : colors.textSecondary}
            />
          </View>

          <ThemedText variant="small" color="textSecondary" style={{ marginTop: spacing.md }}>
            Quando ativados, você receberá alertas quando:
          </ThemedText>

          <View style={styles.alertaList}>
            <ThemedText variant="small" color="textSecondary">
              • Proteína diária &lt; meta E apetite baixo
            </ThemedText>
            <ThemedText variant="small" color="textSecondary">
              • Variação de peso &gt; 2kg em 7 dias
            </ThemedText>
          </View>
        </ThemedView>

        {/* Botão Editar */}
        {!editar && (
          <Button
            label="✏️ Editar Configurações"
            variant="secondary"
            size="lg"
            onPress={() => setEditar(true)}
            style={{ marginTop: spacing.xl }}
          />
        )}

        {editar && (
          <Button
            label="Cancelar"
            variant="secondary"
            size="lg"
            onPress={() => setEditar(false)}
            style={{ marginTop: spacing.lg }}
          />
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
  card: {
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderRadius: radius.lg,
  },
  doseSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginVertical: spacing.md,
  },
  doseBotao: {
    flex: 1,
    minWidth: '30%',
  },
  inputContainer: {
    marginVertical: spacing.md,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    fontSize: 16,
    color: colors.text,
  },
  alertaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  alertaList: {
    marginTop: spacing.md,
    gap: spacing.sm,
  },
});
