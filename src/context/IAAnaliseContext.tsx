import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// TODO: Quando ProfileContext existir, importar e usar useProfile()
// import { useProfile } from './ProfileContext';

interface UsodiarioIA {
  data: string; // YYYY-MM-DD
  analises: number;
}

interface IAAnaliseContextType {
  analiseEmProgresso: boolean;
  usoDiario: UsodiarioIA | null;
  tentativasRestantes: number;
  erroUltimo: string | null;

  // Análise
  analisarPlato: (imageBase64: string) => Promise<AnalisePlato | null>;
  analisarReceita: (imageBase64: string) => Promise<AnaliseReceita | null>;

  // Utils
  obterUsoHoje: () => number;
  temTentativasRestantes: () => boolean;
  resetarUsoDaily: () => Promise<void>;
  limparErro: () => void;
}

export interface AlimentoAnalise {
  nome: string;
  quantidade: string;
  calorias: number;
  proteina: number;
  carbos: number;
  gordura: number;
}

export interface AnalisePlato {
  alimentos: AlimentoAnalise[];
  totalCalorias: number;
  totalProteina: number;
}

export interface AnaliseReceita {
  alimentos: AlimentoAnalise[];
  totalCalorias: number;
  totalProteina: number;
}

const IAAnaliseContext = createContext<IAAnaliseContextType | undefined>(undefined);

const CHAVE_USO_DIARIO = 'ia_uso_diario';
const LIMITE_DIARIO = 3;
const WORKER_URL = process.env.EXPO_PUBLIC_WORKER_URL || 'https://seu-worker.seu-subdomain.workers.dev';

export function IAAnaliseProvider({ children }: { children: React.ReactNode }) {
  const [analiseEmProgresso, setAnaliseEmProgresso] = useState(false);
  const [usoDiario, setUsoDiario] = useState<UsodiarioIA | null>(null);
  const [tentativasRestantes, setTentativasRestantes] = useState(LIMITE_DIARIO);
  const [erroUltimo, setErroUltimo] = useState<string | null>(null);
  
  // TODO: Integrar com ProfileContext quando estiver disponível
  // Por enquanto, usar userId placeholder (email/ID do usuário)
  const userIdPlaceholder = 'user_' + new Date().getTime();

  useEffect(() => {
    carregarUsoHoje();
  }, []);

  const carregarUsoHoje = async () => {
    try {
      const dados = await AsyncStorage.getItem(CHAVE_USO_DIARIO);
      if (dados) {
        const parsedDados = JSON.parse(dados) as UsodiarioIA;
        const hoje = new Date().toISOString().split('T')[0];

        if (parsedDados.data === hoje) {
          setUsoDiario(parsedDados);
          setTentativasRestantes(Math.max(0, LIMITE_DIARIO - parsedDados.analises));
        } else {
          // Novo dia
          await resetarUsoDaily();
        }
      } else {
        // Primeira vez
        const novoUso: UsodiarioIA = {
          data: new Date().toISOString().split('T')[0],
          analises: 0,
        };
        setUsoDiario(novoUso);
        setTentativasRestantes(LIMITE_DIARIO);
      }
    } catch (erro) {
      console.error('Erro ao carregar uso diário:', erro);
    }
  };

  const incrementarUso = async () => {
    const hoje = new Date().toISOString().split('T')[0];
    const novoUso: UsodiarioIA = {
      data: hoje,
      analises: (usoDiario?.analises ?? 0) + 1,
    };
    setUsoDiario(novoUso);
    setTentativasRestantes(Math.max(0, LIMITE_DIARIO - novoUso.analises));
    await AsyncStorage.setItem(CHAVE_USO_DIARIO, JSON.stringify(novoUso));
  };

  const analisarPlato = async (imageBase64: string): Promise<AnalisePlato | null> => {
    if (!temTentativasRestantes()) {
      const mensagem = 'Limite diário (3/dia) atingido. Tente amanhã ou pague para mais análises.';
      setErroUltimo(mensagem);
      console.warn(mensagem);
      return null;
    }

    try {
      setAnaliseEmProgresso(true);
      setErroUltimo(null);

      // Usar userId (será integrado com ProfileContext)
      const userId = userIdPlaceholder;

      const response = await fetch(WORKER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          imageBase64,
          tipo: 'prato',
        }),
      });

      if (!response.ok) {
        let mensagemErro = `Erro HTTP ${response.status}`;
        try {
          const erro = await response.json();
          mensagemErro = erro.erro || erro.message || mensagemErro;
        } catch {
          const texto = await response.text();
          mensagemErro = texto || mensagemErro;
        }
        
        setErroUltimo(mensagemErro);
        console.error('Erro da API:', mensagemErro);
        return null;
      }

      const resultado = await response.json();

      if (resultado.sucesso) {
        await incrementarUso();
        return {
          alimentos: resultado.alimentos || [],
          totalCalorias: resultado.totalCalorias || 0,
          totalProteina: resultado.totalProteina || 0,
        };
      } else {
        const mensagem = resultado.erro || 'Erro desconhecido na análise';
        setErroUltimo(mensagem);
        console.error('Erro na análise:', mensagem);
        return null;
      }
    } catch (erro) {
      const mensagem = erro instanceof Error ? erro.message : String(erro);
      setErroUltimo(mensagem);
      console.error('Erro ao analisar prato:', erro);
      return null;
    } finally {
      setAnaliseEmProgresso(false);
    }
  };

  const analisarReceita = async (imageBase64: string): Promise<AnaliseReceita | null> => {
    if (!temTentativasRestantes()) {
      const mensagem = 'Limite diário (3/dia) atingido. Tente amanhã ou pague para mais análises.';
      setErroUltimo(mensagem);
      console.warn(mensagem);
      return null;
    }

    try {
      setAnaliseEmProgresso(true);
      setErroUltimo(null);

      // Usar userId (será integrado com ProfileContext)
      const userId = userIdPlaceholder;

      const response = await fetch(WORKER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          imageBase64,
          tipo: 'receita',
        }),
      });

      if (!response.ok) {
        let mensagemErro = `Erro HTTP ${response.status}`;
        try {
          const erro = await response.json();
          mensagemErro = erro.erro || erro.message || mensagemErro;
        } catch {
          const texto = await response.text();
          mensagemErro = texto || mensagemErro;
        }
        
        setErroUltimo(mensagemErro);
        console.error('Erro da API:', mensagemErro);
        return null;
      }

      const resultado = await response.json();

      if (resultado.sucesso) {
        await incrementarUso();
        return {
          alimentos: resultado.alimentos || [],
          totalCalorias: resultado.totalCalorias || 0,
          totalProteina: resultado.totalProteina || 0,
        };
      } else {
        const mensagem = resultado.erro || 'Erro desconhecido na análise';
        setErroUltimo(mensagem);
        console.error('Erro na análise:', mensagem);
        return null;
      }
    } catch (erro) {
      const mensagem = erro instanceof Error ? erro.message : String(erro);
      setErroUltimo(mensagem);
      console.error('Erro ao analisar receita:', erro);
      return null;
    } finally {
      setAnaliseEmProgresso(false);
    }
  };

  const obterUsoHoje = (): number => {
    const hoje = new Date().toISOString().split('T')[0];
    if (usoDiario?.data === hoje) {
      return usoDiario.analises;
    }
    return 0;
  };

  const temTentativasRestantes = (): boolean => {
    return tentativasRestantes > 0;
  };

  const resetarUsoDaily = async () => {
    const novoUso: UsodiarioIA = {
      data: new Date().toISOString().split('T')[0],
      analises: 0,
    };
    setUsoDiario(novoUso);
    setTentativasRestantes(LIMITE_DIARIO);
    await AsyncStorage.setItem(CHAVE_USO_DIARIO, JSON.stringify(novoUso));
  };

  const limparErro = () => {
    setErroUltimo(null);
  };

  const value: IAAnaliseContextType = {
    analiseEmProgresso,
    usoDiario,
    tentativasRestantes,
    erroUltimo,
    analisarPlato,
    analisarReceita,
    obterUsoHoje,
    temTentativasRestantes,
    resetarUsoDaily,
    limparErro,
  };

  return <IAAnaliseContext.Provider value={value}>{children}</IAAnaliseContext.Provider>;
}

export function useIAAnalise() {
  const context = useContext(IAAnaliseContext);
  if (!context) {
    throw new Error('useIAAnalise deve ser usado dentro de IAAnaliseProvider');
  }
  return context;
}
