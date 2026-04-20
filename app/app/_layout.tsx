import { useEffect } from 'react';
import { AppState } from 'react-native';
import 'expo-dev-client';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '../src/i18n';
import { initializeNativeMIDIBridge } from '../src/services/midi/nativeMIDI';
import { useUserStore } from '../src/stores/userStore';
import { syncQueue } from '../src/offline/syncQueue';

const queryClient = new QueryClient();

export default function RootLayout() {
  useEffect(() => {
    void initializeNativeMIDIBridge();
    useUserStore.getState().hydrate();
    // Drain anything that piled up while the app was offline / closed.
    void syncQueue.flush();

    // Flush again every time the app returns to the foreground — the
    // user may have come back online during the meantime.
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active' && useUserStore.getState().isLoggedIn) {
        void syncQueue.flush();
      }
    });
    return () => sub.remove();
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
