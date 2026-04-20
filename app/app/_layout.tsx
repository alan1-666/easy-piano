import { useEffect } from 'react';
import 'expo-dev-client';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '../src/i18n';
import { initializeNativeMIDIBridge } from '../src/services/midi/nativeMIDI';

const queryClient = new QueryClient();

export default function RootLayout() {
  useEffect(() => {
    void initializeNativeMIDIBridge();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#F7F6F4' },
          orientation: 'portrait_up',
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="game/[songId]"
          options={{
            orientation: 'landscape',
          }}
        />
        <Stack.Screen
          name="game/result"
          options={{
            orientation: 'portrait_up',
          }}
        />
        <Stack.Screen name="course/[courseId]" />
        <Stack.Screen name="course/lesson/[lessonId]" />
        <Stack.Screen name="midi/connect" />
        <Stack.Screen name="auth/login" />
        <Stack.Screen name="auth/register" />
        <Stack.Screen name="onboarding" />
      </Stack>
      <StatusBar style="dark" />
    </QueryClientProvider>
  );
}
