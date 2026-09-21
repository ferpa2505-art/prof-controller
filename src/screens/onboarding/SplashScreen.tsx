import { View, StyleSheet, Animated, Easing } from 'react-native';
import { useEffect, useRef } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LeviaLogo } from '@components/LeviaLogo';
import { ThemedText } from '@components/ThemedText';
import { lightTheme } from '@theme/colors';
import { OnboardingStackParamList } from '../OnboardingStack';

type SplashScreenProps = NativeStackScreenProps<OnboardingStackParamList, 'Splash'>;

export function SplashScreen({ navigation }: SplashScreenProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const translateYAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    // Animação de entrada
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(translateYAnim, {
        toValue: 0,
        duration: 800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    // Navegar para Quiz após 3 segundos
    const timer = setTimeout(() => {
      navigation.replace('Quiz');
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigation, fadeAnim, scaleAnim, translateYAnim]);

  return (
    <View style={styles.container}>
      {/* Gradiente de fundo (Sálvia degradado) */}
      <View style={styles.background} />

      {/* Conteúdo animado */}
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [
              { scale: scaleAnim },
              { translateY: translateYAnim },
            ],
          },
        ]}
      >
        {/* Logo */}
        <View style={styles.logoContainer}>
          <LeviaLogo 
            size={240} 
            variant="colored"
          />
        </View>

        {/* Texto principal */}
        <ThemedText 
          variant="title" 
          color="textPrimary"
          style={styles.mainText}
        >
          Bem-vindo à Levia
        </ThemedText>

        {/* Tagline */}
        <ThemedText 
          variant="body" 
          color="textSecondary"
          style={styles.tagline}
        >
          Mais leve a cada dia
        </ThemedText>
      </Animated.View>

      {/* Texto no rodapé */}
      <View style={styles.footer}>
        <ThemedText 
          variant="caption" 
          color="textSecondary"
        >
          Carregando...
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: lightTheme.primary, // Sálvia como fundo
    justifyContent: 'center',
    alignItems: 'center',
  },
  background: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: lightTheme.primary,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  logoContainer: {
    marginBottom: 32,
  },
  mainText: {
    textAlign: 'center',
    marginBottom: 12,
    color: lightTheme.onPrimary,
  },
  tagline: {
    textAlign: 'center',
    fontSize: 16,
    fontStyle: 'italic',
    color: lightTheme.onPrimary,
    opacity: 0.9,
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    alignItems: 'center',
  },
});
