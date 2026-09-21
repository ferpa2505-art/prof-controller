// src/theme/colors.ts
// Sistema de cores Levia — App de Saúde e Emagrecimento
// Paleta: Sálvia (primária) + Pêssego (secundária) + Lavanda (acento)
// Premium, acolhedor, não-clínico. Versão: 1.0.0

export type ColorToken =
  | 'primary'
  | 'secondary'
  | 'accent'
  | 'success'
  | 'warning'
  | 'info'
  | 'error';

/**
 * ESCALA TONAL COMPLETA
 * Cada cor tem tons 50-900, com 500 como base
 */
export const palette = {
  // Primária — Sálvia (Saúde, Natureza, Calma)
  salvia: {
    50: '#F1F5F3',
    100: '#E0EBE5',
    200: '#C2D7CC',
    300: '#A3C3B3',
    400: '#85AF9A',
    500: '#6FA58E', // ← base
    600: '#5A8E78',
    700: '#457862',
    800: '#30624C',
    900: '#1A4236',
  },

  // Secundária — Pêssego (Calor Humano, Energia Gentil)
  peach: {
    50: '#FEF7F0',
    100: '#FCE8D9',
    200: '#F9D0B3',
    300: '#F6B88D',
    400: '#F59E0B', // ← proteína, energia
    500: '#F4A983', // ← base
    600: '#E88C4F',
    700: '#D67A2F',
    800: '#A85C1F',
    900: '#7A400F',
  },

  // Acento — Lavanda (Premium, Celebração)
  lavender: {
    50: '#F9F6FC',
    100: '#F3EAF8',
    200: '#E7DFF0',
    300: '#D5BEED',
    400: '#BF9FE5',
    500: '#B7A6E0', // ← base
    600: '#9B7DD1',
    700: '#7F54C2',
    800: '#6341A0',
    900: '#47287E',
  },

  // Neutros Quentes — Marfim/Off-white
  neutral: {
    50: '#FFFCFB',
    100: '#FBF8F3', // ← bg principal (light)
    200: '#F5F0E8',
    300: '#EEEBE5',
    400: '#D1CCC3',
    500: '#B8B1A7',
    600: '#8B8578',
    700: '#5E5A54',
    800: '#2E3A35', // ← texto principal (verde escuro)
    900: '#1A1F1C',
  },

  // Semânticas
  semantic: {
    success: '#10B981',    // Meta atingida
    warning: '#F59E0B',    // Atenção, perto do limite
    info: '#3B82F6',       // Informação
    error: '#EF4444',      // Erros técnicos somente
  },
} as const;

/**
 * TEMA CLARO
 * Cores para modo light. Fundos claros, textos escuros.
 */
export const lightTheme = {
  // Fundos
  background: palette.neutral[100],      // #FBF8F3
  surface: '#FFFFFF',
  surfaceElevated: palette.neutral[200], // #F5F0E8

  // Textos
  textPrimary: palette.neutral[800],     // #2E3A35 (verde escuro)
  textSecondary: palette.neutral[600],   // #8B8578
  textDisabled: palette.neutral[400],    // #D1CCC3

  // Borders
  border: palette.neutral[300],          // #EEEBE5
  divider: palette.neutral[200],         // #F5F0E8

  // Primária (Sálvia)
  primary: palette.salvia[500],          // #6FA58E
  primaryHover: palette.salvia[600],     // #5A8E78
  primaryActive: palette.salvia[700],    // #457862
  onPrimary: '#FFFFFF',

  // Secundária (Pêssego)
  secondary: palette.peach[500],         // #F4A983
  secondaryHover: palette.peach[600],    // #E88C4F
  secondaryActive: palette.peach[700],   // #D67A2F
  onSecondary: '#FFFFFF',

  // Acento (Lavanda)
  accent: palette.lavender[500],         // #B7A6E0
  accentHover: palette.lavender[600],    // #9B7DD1
  onAccent: '#FFFFFF',

  // Semânticas
  success: palette.semantic.success,     // #10B981
  warning: palette.semantic.warning,     // #F59E0B
  info: palette.semantic.info,           // #3B82F6
  error: palette.semantic.error,         // #EF4444

  // Gradientes
  premiumGradientStart: palette.lavender[500], // #B7A6E0
  premiumGradientEnd: palette.salvia[500],     // #6FA58E

  // Overlay
  overlay: 'rgba(0, 0, 0, 0.4)',

  // Dados (Gráficos e Anéis de Progresso)
  dataColors: {
    calories: palette.salvia[500],    // #6FA58E 🔥
    protein: palette.peach[400],      // #F59E0B 🍗
    carbs: '#F3A049',                 // 🌾 Ouro
    fat: '#A78BFA',                   // 🥑 Roxo suave
    fiber: '#34D399',                 // 🥬 Verde
    water: '#60A5FA',                 // 💧 Azul
    weight: palette.neutral[800],     // 📊 Cinza
    steps: '#FBBF24',                 // 👟 Âmbar
  },
} as const;

/**
 * TEMA ESCURO
 * Cores para modo dark. Cores dessaturadas, fundos profundos, textos claros.
 */
export const darkTheme = {
  // Fundos
  background: palette.neutral[900],      // #1A1F1C (preto-verde)
  surface: palette.neutral[800],         // #2E3A35 (verde escuro)
  surfaceElevated: '#3A4240',

  // Textos
  textPrimary: palette.neutral[100],     // #FBF8F3
  textSecondary: palette.neutral[500],   // #B8B1A7
  textDisabled: palette.neutral[700],    // #5E5A54

  // Borders
  border: '#3A4240',
  divider: palette.neutral[800],         // #2E3A35

  // Primária (Sálvia — mais clara para contraste)
  primary: palette.salvia[400],          // #85AF9A
  primaryHover: palette.salvia[300],     // #A3C3B3
  primaryActive: palette.salvia[500],    // #6FA58E
  onPrimary: palette.neutral[900],       // #1A1F1C

  // Secundária (Pêssego — mais clara)
  secondary: palette.peach[300],         // #F6B88D
  secondaryHover: palette.peach[200],    // #F9D0B3
  secondaryActive: palette.peach[400],   // #F59E0B
  onSecondary: palette.neutral[900],     // #1A1F1C

  // Acento (Lavanda — muito mais claro)
  accent: palette.lavender[200],         // #E7DFF0
  accentHover: palette.lavender[100],    // #F3EAF8
  onAccent: palette.lavender[900],       // #47287E

  // Semânticas
  success: '#34D399',                    // Verde mais claro
  warning: '#FBBF24',                    // Âmbar mais claro
  info: '#60A5FA',                       // Azul mais claro
  error: '#F87171',                      // Vermelho mais claro

  // Gradientes
  premiumGradientStart: palette.lavender[200], // #E7DFF0
  premiumGradientEnd: palette.salvia[400],     // #85AF9A

  // Overlay
  overlay: 'rgba(0, 0, 0, 0.6)',

  // Dados (Cores ajustadas para dark)
  dataColors: {
    calories: palette.salvia[400],     // #85AF9A
    protein: palette.peach[300],       // #F6B88D
    carbs: '#F9D0B3',                  // Ouro mais claro
    fat: '#DDD6FE',                    // Roxo muito claro
    fiber: '#6EE7B7',                  // Verde mais claro
    water: '#7DD3FC',                  // Azul mais claro
    weight: palette.neutral[200],      // #F5F0E8
    steps: '#FCD34D',                  // Âmbar mais claro
  },
} as const;

/**
 * Helper: Obter cor baseada no tema (claro/escuro)
 * @example getThemeColor('primary', isDark) → '#6FA58E' (light) ou '#85AF9A' (dark)
 */
export function getThemeColor(
  token: keyof typeof lightTheme,
  isDark: boolean
) {
  return isDark ? (darkTheme[token] as any) : (lightTheme[token] as any);
}

/**
 * MAPEAMENTO DE COMPONENTES
 * Referência pronta: qual cor em qual situação
 */
export const componentColors = {
  button: {
    primary: {
      background: (isDark: boolean) => getThemeColor('primary', isDark),
      text: (isDark: boolean) => getThemeColor('onPrimary', isDark),
      pressed: (isDark: boolean) => getThemeColor('primaryActive', isDark),
    },
    secondary: {
      background: (isDark: boolean) => getThemeColor('secondary', isDark),
      text: (isDark: boolean) => getThemeColor('onSecondary', isDark),
      pressed: (isDark: boolean) => getThemeColor('secondaryActive', isDark),
    },
    tertiary: {
      background: 'transparent',
      text: (isDark: boolean) => getThemeColor('primary', isDark),
      border: (isDark: boolean) => getThemeColor('primary', isDark),
    },
  },

  tab: {
    active: (isDark: boolean) => getThemeColor('primary', isDark),
    inactive: (isDark: boolean) => getThemeColor('textSecondary', isDark),
  },

  card: {
    background: (isDark: boolean) => getThemeColor('surface', isDark),
    border: (isDark: boolean) => getThemeColor('border', isDark),
  },

  progressRing: {
    calories: (isDark: boolean) =>
      isDark ? darkTheme.dataColors.calories : lightTheme.dataColors.calories,
    protein: (isDark: boolean) =>
      isDark ? darkTheme.dataColors.protein : lightTheme.dataColors.protein,
    water: (isDark: boolean) =>
      isDark ? darkTheme.dataColors.water : lightTheme.dataColors.water,
  },

  badge: {
    premium: {
      background: (isDark: boolean) => (isDark ? palette.lavender[100] : palette.lavender[50]),
      text: (isDark: boolean) => getThemeColor('accent', isDark),
    },
    glp1: {
      background: (isDark: boolean) => (isDark ? palette.peach[100] : palette.peach[50]),
      text: (isDark: boolean) => getThemeColor('secondary', isDark),
      icon: (isDark: boolean) => getThemeColor('secondary', isDark),
    },
  },

  notification: {
    success: {
      background: (isDark: boolean) => (isDark ? '#1F3A2F' : '#ECFDF5'),
      text: (isDark: boolean) => getThemeColor('success', isDark),
      icon: (isDark: boolean) => getThemeColor('success', isDark),
    },
    warning: {
      background: (isDark: boolean) => (isDark ? '#3F2F1F' : '#FFFBEB'),
      text: (isDark: boolean) => getThemeColor('warning', isDark),
      icon: (isDark: boolean) => getThemeColor('warning', isDark),
    },
    info: {
      background: (isDark: boolean) => (isDark ? '#1F2F3F' : '#EFF6FF'),
      text: (isDark: boolean) => getThemeColor('info', isDark),
      icon: (isDark: boolean) => getThemeColor('info', isDark),
    },
  },

  glp1Indicator: {
    background: (isDark: boolean) => (isDark ? palette.peach[100] : palette.peach[50]),
    icon: (isDark: boolean) => getThemeColor('secondary', isDark),
    text: (isDark: boolean) => getThemeColor('secondary', isDark),
  },
} as const;

export type Theme = typeof lightTheme;
export type ThemeKey = keyof Theme;

/**
 * RESUMO EXECUTIVO
 *
 * Primária: Sálvia #6FA58E (natural, sofisticado, saúde)
 * Secundária: Pêssego #F4A983 (quente, nutritivo, energia)
 * Acento: Lavanda #B7A6E0 (premium, celebração)
 * Neutros: Marfim #FBF8F3 + Verde #2E3A35 (acolhedor, não-clínico)
 *
 * Proporção 60-30-10:
 * - 60% neutros (fundos, textos)
 * - 30% primária (botões, abas, destaques)
 * - 10% acentos (chamadas pontuais)
 *
 * Acessibilidade: WCAG AA (alguns AAA), distinguível para daltonismo com ícones
 */
