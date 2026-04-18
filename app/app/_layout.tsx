import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '../src/i18n';

const queryClient = new QueryClient();

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#1A1A2E' },
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="game/[songId]" />
        <Stack.Screen name="game/result" />
        <Stack.Screen name="course/[courseId]" />
        <Stack.Screen name="course/lesson/[lessonId]" />
        <Stack.Screen name="midi/connect" />
        <Stack.Screen name="auth/login" />
        <Stack.Screen name="auth/register" />
        <Stack.Screen name="onboarding" />
      </Stack>
      <StatusBar style="light" />
    </QueryClientProvider>
  );
}
