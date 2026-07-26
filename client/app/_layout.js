import { Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <Stack>
        <Stack.Screen name="index" options={{ title: 'Swellmance' }} />
        <Stack.Screen name="home" options={{ title: 'Dashboard' }} />
        <Stack.Screen name="ai-matchmaker" options={{ title: 'AI Matchmaker' }} />
      </Stack>
    </QueryClientProvider>
  );
}
