import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SplashScreen } from './onboarding/SplashScreen';
import { QuizScreen } from './onboarding/QuizScreen';
import { ResultScreen } from './onboarding/ResultScreen';
import { colors } from '@constants/colors';

export type OnboardingStackParamList = {
  Splash: undefined;
  Quiz: undefined;
  Result: {
    calorieGoal: number;
    proteinGoal: number;
    waterGoal: number;
  };
};

const Stack = createNativeStackNavigator<OnboardingStackParamList>();

export function OnboardingStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen 
        name="Splash" 
        component={SplashScreen}
      />
      <Stack.Screen 
        name="Quiz" 
        component={QuizScreen}
      />
      <Stack.Screen 
        name="Result" 
        component={ResultScreen}
      />
    </Stack.Navigator>
  );
}
