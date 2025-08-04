import { Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from '../contexts/ThemeContext';
import { ToastProvider } from '../components/Toast';
import { TextReaderSettingsProvider } from '../hooks/useTextReaderSettings';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <ToastProvider>
          <TextReaderSettingsProvider>
            <QueryClientProvider client={queryClient}>
              <Stack
                screenOptions={{
                  headerShown: false,
                }}
              >
                <Stack.Screen 
                  name="(tabs)" 
                  options={{ 
                    headerShown: false,
                  }} 
                />
                <Stack.Screen 
                  name="text/[ref]" 
                  options={{ 
                    headerShown: false,
                  }} 
                />
                <Stack.Screen 
                  name="toc" 
                  options={{ 
                    headerShown: false,
                  }} 
                />
              </Stack>
            </QueryClientProvider>
          </TextReaderSettingsProvider>
        </ToastProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}