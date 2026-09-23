export type DoseGLP1 = 'nao_usa' | '0.25mg' | '0.5mg' | '1mg' | '1.5mg' | '2mg';

export interface GLP1AperturaDiaria {
  data: string; // YYYY-MM-DD
  nivelApetite: 'excelente' | 'bom' | 'regular' | 'baixo' | 'muito_baixo';
  proteina_consumida: number; // em gramas
  anotacoes?: string;
}

export interface GLP1RegistroPeso {
  data: string; // YYYY-MM-DD
  peso_kg: number;
  etapa_dose: DoseGLP1;
  notas?: string;
}

export interface GLP1State {
  peso_inicial_kg: number; // Capturado na onboarding
  peso_atual_kg: number;
  altura_cm?: number;
  dose_atual: DoseGLP1; // Predefinição: '1mg'
  meta_proteina_g?: number; // Calculada automaticamente (0.8-1.2g por libra)
  historico_apetite: GLP1AperturaDiaria[];
  historico_peso: GLP1RegistroPeso[];
  alertas_ativos: boolean; // Se deve mostrar alertas
}

export interface GLP1Alerta {
  id: string;
  data: string; // YYYY-MM-DD
  tipo: 'proteina_baixa' | 'apetite_baixo' | 'peso_oscilacao';
  mensagem: string;
  proteina_consumida?: number;
  meta_proteina?: number;
  nivelApetite?: string;
}
