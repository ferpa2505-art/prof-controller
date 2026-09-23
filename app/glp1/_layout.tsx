import { Stack } from 'expo-router';
import { colors } from '@constants/colors';

export default function GLP1Layout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTintColor: colors.primary,
        headerTitleStyle: {
          fontWeight: '600',
        },
      }}
    >
      <Stack.Screen 
        name="configurar" 
        options={{ title: 'Configurações GLP-1' }}
      />
      <Stack.Screen 
        name="registrar-apetite" 
        options={{ title: 'Registrar Apetite' }}
      />
      <Stack.Screen 
        name="evoucao-peso" 
        options={{ title: 'Evolução de Peso' }}
      />
    </Stack>
  );
}
