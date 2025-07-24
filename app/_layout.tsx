import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { ThemeProvider } from '@/context/ThemeContext';
import { FileSystemProvider } from '@/context/FileSystemContext';
import { SettingsProvider } from '@/context/SettingsContext';

export default function RootLayout() {
  useFrameworkReady();

  return (
    <ThemeProvider>
      <SettingsProvider>
        <FileSystemProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="+not-found" />
          </Stack>
          <StatusBar style="auto" />
        </FileSystemProvider>
      </SettingsProvider>
    </ThemeProvider>
  );
}