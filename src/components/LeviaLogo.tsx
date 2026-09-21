import { View, StyleSheet, ViewProps } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { colors } from '@constants/colors';

/**
 * Ícone da marca Levia
 * Pena em marfim com ponto em pêssego
 *
 * @param size - tamanho em pixels (padrão: 120)
 * @param variant - 'colored' (padrão), 'monochrome', 'outline'
 * @param colorOverride - sobrescrever cor (para variant='monochrome' e 'outline')
 */

interface LeviaLogoProps extends ViewProps {
  size?: number;
  variant?: 'colored' | 'monochrome' | 'outline';
  colorOverride?: string;
  isDark?: boolean;
}

// SVG da versão colorida (com fundo)
const svgColored = `
<svg viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="256" height="256" fill="#6FA58E" rx="0"/>
  <g>
    <path
      d="M 128 40 
         C 128 40, 110 60, 110 95 
         C 110 130, 120 150, 130 170 
         C 135 180, 140 185, 145 190 
         L 148 195 
         C 148 195, 145 185, 145 170 
         C 145 155, 150 140, 160 140 
         C 170 140, 175 155, 175 170 
         C 175 185, 172 195, 172 195 
         L 175 190 
         C 185 170, 195 150, 195 95 
         C 195 60, 177 40, 128 40 Z"
      fill="#FBF8F3"
      stroke="none"
    />
    <path
      d="M 128 50 Q 130 90, 128 150"
      stroke="#6FA58E"
      stroke-width="2.5"
      fill="none"
      stroke-linecap="round"
    />
    <path
      d="M 115 120 Q 105 125, 100 135"
      stroke="#6FA58E"
      stroke-width="2"
      fill="none"
      stroke-linecap="round"
      opacity="0.6"
    />
    <path
      d="M 141 125 Q 150 130, 158 140"
      stroke="#6FA58E"
      stroke-width="2"
      fill="none"
      stroke-linecap="round"
      opacity="0.6"
    />
  </g>
  <circle cx="165" cy="185" r="12" fill="#F59E0B" opacity="0.95"/>
  <circle cx="163" cy="182" r="3" fill="#FFFFFF" opacity="0.5"/>
</svg>
`;

// SVG da versão monocromática (branco)
const svgMonochrome = `
<svg viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg">
  <g>
    <path
      d="M 128 40 
         C 128 40, 110 60, 110 95 
         C 110 130, 120 150, 130 170 
         C 135 180, 140 185, 145 190 
         L 148 195 
         C 148 195, 145 185, 145 170 
         C 145 155, 150 140, 160 140 
         C 170 140, 175 155, 175 170 
         C 175 185, 172 195, 172 195 
         L 175 190 
         C 185 170, 195 150, 195 95 
         C 195 60, 177 40, 128 40 Z"
      fill="white"
      stroke="none"
    />
    <path
      d="M 128 50 Q 130 90, 128 150"
      stroke="#F5F0E8"
      stroke-width="2.5"
      fill="none"
      stroke-linecap="round"
    />
    <path
      d="M 115 120 Q 105 125, 100 135"
      stroke="#F5F0E8"
      stroke-width="2"
      fill="none"
      stroke-linecap="round"
      opacity="0.6"
    />
    <path
      d="M 141 125 Q 150 130, 158 140"
      stroke="#F5F0E8"
      stroke-width="2"
      fill="none"
      stroke-linecap="round"
      opacity="0.6"
    />
  </g>
  <circle cx="165" cy="185" r="12" fill="white" opacity="0.95"/>
</svg>
`;

// SVG da versão outline (apenas contorno)
const svgOutline = (color: string) => `
<svg viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg">
  <g>
    <path
      d="M 128 40 
         C 128 40, 110 60, 110 95 
         C 110 130, 120 150, 130 170 
         C 135 180, 140 185, 145 190 
         L 148 195 
         C 148 195, 145 185, 145 170 
         C 145 155, 150 140, 160 140 
         C 170 140, 175 155, 175 170 
         C 175 185, 172 195, 172 195 
         L 175 190 
         C 185 170, 195 150, 195 95 
         C 195 60, 177 40, 128 40 Z"
      fill="none"
      stroke="${color}"
      stroke-width="3"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <path
      d="M 128 50 Q 130 90, 128 150"
      stroke="${color}"
      stroke-width="2"
      fill="none"
      stroke-linecap="round"
    />
  </g>
  <circle 
    cx="165" 
    cy="185" 
    r="12" 
    fill="none"
    stroke="${color}" 
    stroke-width="2.5"
  />
</svg>
`;

export function LeviaLogo({
  size = 120,
  variant = 'colored',
  colorOverride,
  isDark = false,
  style,
  ...rest
}: LeviaLogoProps) {
  const styles = StyleSheet.create({
    container: {
      width: size,
      height: size,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });

  // Determinar qual SVG usar
  let svg = svgColored;
  
  if (variant === 'monochrome') {
    svg = svgMonochrome;
  } else if (variant === 'outline') {
    const outlineColor = colorOverride || colors.primary;
    svg = svgOutline(outlineColor);
  }

  return (
    <View style={[styles.container, style]} {...rest}>
      <SvgXml xml={svg} width={size} height={size} />
    </View>
  );
}

/**
 * Variante simplificada: apenas a pena (sem fundo)
 * Útil para casos onde você já tem fundo personalizado
 */
export function LeviaLogoIconOnly({
  size = 80,
  isDark = false,
  style,
  ...rest
}: Omit<LeviaLogoProps, 'variant'>) {
  const styles = StyleSheet.create({
    container: {
      width: size,
      height: size,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });

  return (
    <View style={[styles.container, style]} {...rest}>
      <SvgXml 
        xml={svgMonochrome} 
        width={size} 
        height={size} 
      />
    </View>
  );
}
