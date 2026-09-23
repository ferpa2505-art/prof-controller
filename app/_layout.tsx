import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { colors } from '@constants/colors';
import { GLP1Provider } from '@context/GLP1Context';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [pesoInicial, setPesoInicial] = useState<number | undefined>(85);

  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <GLP1Provider pesoInicial_kg={pesoInicial}>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: colors.background,
          },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="glp1" options={{ headerShown: false }} />
      </Stack>
    </GLP1Provider>
  );
}
