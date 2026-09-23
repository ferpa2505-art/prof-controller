import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  DoseGLP1,
  GLP1AperturaDiaria,
  GLP1RegistroPeso,
  GLP1State,
  GLP1Alerta,
} from '../types/glp1';

interface GLP1ContextType {
  estado: GLP1State | null;
  carregando: boolean;
  
  // Configurações
  atualizarDose: (novaDose: DoseGLP1) => Promise<void>;
  atualizarMetaProteina: (gramas: number) => Promise<void>;
  atualizarAlertasAtivos: (ativo: boolean) => Promise<void>;
  
  // Apetite
  registrarApetite: (
    nivelApetite: 'excelente' | 'bom' | 'regular' | 'baixo' | 'muito_baixo',
    proteina_consumida: number,
    anotacoes?: string
  ) => Promise<void>;
  obterApetiteHoje: () => GLP1AperturaDiaria | undefined;
  
  // Peso
  registrarPeso: (peso_kg: number, notas?: string) => Promise<void>;
  obterEvolutaoPeso: () => GLP1RegistroPeso[];
  
  // Alertas
  gerarAlertas: () => GLP1Alerta[];
  limparAlertas: () => Promise<void>;
  
  // Métodos de cálculo
  calcularMetaProteina: (peso_kg: number) => number;
}

const GLP1Context = createContext<GLP1ContextType | undefined>(undefined);

const CHAVE_ARMAZENAMENTO = 'glp1_estado';
const DEFAULT_DOSE: DoseGLP1 = '1mg';

const CONVERSAO_LIBRA_KG = 0.453592;

export function GLP1Provider({ children, pesoInicial_kg }: { children: React.ReactNode; pesoInicial_kg?: number }) {
  const [estado, setEstado] = useState<GLP1State | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    carregarEstado(pesoInicial_kg);
  }, [pesoInicial_kg]);

  const carregarEstado = async (peso?: number) => {
    try {
      const dados = await AsyncStorage.getItem(CHAVE_ARMAZENAMENTO);
      if (dados) {
        setEstado(JSON.parse(dados));
      } else if (peso) {
        const novoEstado: GLP1State = {
          peso_inicial_kg: peso,
          peso_atual_kg: peso,
          dose_atual: DEFAULT_DOSE,
          meta_proteina_g: calcularMetaProteinaHelper(peso),
          historico_apetite: [],
          historico_peso: [
            {
              data: new Date().toISOString().split('T')[0],
              peso_kg: peso,
              etapa_dose: DEFAULT_DOSE,
            },
          ],
          alertas_ativos: true,
        };
        setEstado(novoEstado);
        await AsyncStorage.setItem(CHAVE_ARMAZENAMENTO, JSON.stringify(novoEstado));
      }
    } catch (erro) {
      console.error('Erro ao carregar GLP1Context:', erro);
    } finally {
      setCarregando(false);
    }
  };

  const salvarEstado = async (novoEstado: GLP1State) => {
    try {
      setEstado(novoEstado);
      await AsyncStorage.setItem(CHAVE_ARMAZENAMENTO, JSON.stringify(novoEstado));
    } catch (erro) {
      console.error('Erro ao salvar GLP1Context:', erro);
    }
  };

  const atualizarDose = async (novaDose: DoseGLP1) => {
    if (!estado) return;
    await salvarEstado({
      ...estado,
      dose_atual: novaDose,
    });
  };

  const atualizarMetaProteina = async (gramas: number) => {
    if (!estado) return;
    await salvarEstado({
      ...estado,
      meta_proteina_g: gramas,
    });
  };

  const atualizarAlertasAtivos = async (ativo: boolean) => {
    if (!estado) return;
    await salvarEstado({
      ...estado,
      alertas_ativos: ativo,
    });
  };

  const registrarApetite = async (
    nivelApetite: 'excelente' | 'bom' | 'regular' | 'baixo' | 'muito_baixo',
    proteina_consumida: number,
    anotacoes?: string
  ) => {
    if (!estado) return;

    const hoje = new Date().toISOString().split('T')[0];
    const novaApertura: GLP1AperturaDiaria = {
      data: hoje,
      nivelApetite,
      proteina_consumida,
      anotacoes,
    };

    const historico_atualizado = estado.historico_apetite.filter((a) => a.data !== hoje);
    historico_atualizado.push(novaApertura);

    await salvarEstado({
      ...estado,
      historico_apetite: historico_atualizado.sort((a, b) =>
        new Date(b.data).getTime() - new Date(a.data).getTime()
      ),
    });
  };

  const obterApetiteHoje = (): GLP1AperturaDiaria | undefined => {
    if (!estado) return undefined;
    const hoje = new Date().toISOString().split('T')[0];
    return estado.historico_apetite.find((a) => a.data === hoje);
  };

  const registrarPeso = async (peso_kg: number, notas?: string) => {
    if (!estado) return;

    const hoje = new Date().toISOString().split('T')[0];
    const novoPeso: GLP1RegistroPeso = {
      data: hoje,
      peso_kg,
      etapa_dose: estado.dose_atual,
      notas,
    };

    const historico_atualizado = estado.historico_peso.filter((p) => p.data !== hoje);
    historico_atualizado.push(novoPeso);

    await salvarEstado({
      ...estado,
      peso_atual_kg: peso_kg,
      historico_peso: historico_atualizado.sort((a, b) =>
        new Date(b.data).getTime() - new Date(a.data).getTime()
      ),
    });
  };

  const obterEvolutaoPeso = (): GLP1RegistroPeso[] => {
    if (!estado) return [];
    return [...estado.historico_peso].sort((a, b) =>
      new Date(a.data).getTime() - new Date(b.data).getTime()
    );
  };

  const gerarAlertas = (): GLP1Alerta[] => {
    if (!estado || !estado.alertas_ativos) return [];

    const alertas: GLP1Alerta[] = [];
    const hoje = new Date().toISOString().split('T')[0];
    const apetiteHoje = obterApetiteHoje();

    // Alerta 1: Proteína baixa OU apetite baixo
    if (apetiteHoje) {
      const proteina_consumida = apetiteHoje.proteina_consumida;
      const meta = estado.meta_proteina_g || 0;
      const apetiteBaixo = ['baixo', 'muito_baixo'].includes(apetiteHoje.nivelApetite);

      if (proteina_consumida < meta && apetiteBaixo) {
        alertas.push({
          id: `alerta_proteina_${hoje}`,
          data: hoje,
          tipo: 'proteina_baixa',
          mensagem: `Proteína baixa (${proteina_consumida}g) com pouco apetite. Meta: ${meta}g`,
          proteina_consumida,
          meta_proteina: meta,
          nivelApetite: apetiteHoje.nivelApetite,
        });
      }
    }

    // Alerta 2: Oscilação de peso (> 2kg em 7 dias)
    if (estado.historico_peso.length > 1) {
      const hoje_index = estado.historico_peso.findIndex((p) => p.data === hoje);
      if (hoje_index >= 0) {
        const sete_dias_atras = new Date();
        sete_dias_atras.setDate(sete_dias_atras.getDate() - 7);
        const sete_dias_atras_str = sete_dias_atras.toISOString().split('T')[0];

        const peso_sete_dias = estado.historico_peso.find((p) => p.data <= sete_dias_atras_str);
        const peso_hoje = estado.historico_peso[0];

        if (peso_sete_dias) {
          const oscilacao = Math.abs(peso_hoje.peso_kg - peso_sete_dias.peso_kg);
          if (oscilacao > 2) {
            alertas.push({
              id: `alerta_oscilacao_${hoje}`,
              data: hoje,
              tipo: 'peso_oscilacao',
              mensagem: `Variação de ${oscilacao.toFixed(1)}kg nos últimos 7 dias`,
            });
          }
        }
      }
    }

    return alertas;
  };

  const limparAlertas = async () => {
    // Em um caso real, teríamos um campo de alertas visto/ignorado
    // Por enquanto, apenas resetamos. No futuro, adicionar dismissed_at
    return;
  };

  const calcularMetaProteina = (peso_kg: number): number => {
    const peso_libras = peso_kg / CONVERSAO_LIBRA_KG;
    // Meta média: 1g por libra (dentro do range 0.8-1.2g/lb)
    return Math.round(peso_libras * 1.0);
  };

  const value: GLP1ContextType = {
    estado,
    carregando,
    atualizarDose,
    atualizarMetaProteina,
    atualizarAlertasAtivos,
    registrarApetite,
    obterApetiteHoje,
    registrarPeso,
    obterEvolutaoPeso,
    gerarAlertas,
    limparAlertas,
    calcularMetaProteina,
  };

  return <GLP1Context.Provider value={value}>{children}</GLP1Context.Provider>;
}

const calcularMetaProteinaHelper = (peso_kg: number): number => {
  const peso_libras = peso_kg / CONVERSAO_LIBRA_KG;
  return Math.round(peso_libras * 1.0);
};

export function useGLP1() {
  const context = useContext(GLP1Context);
  if (!context) {
    throw new Error('useGLP1 deve ser usado dentro de GLP1Provider');
  }
  return context;
}
