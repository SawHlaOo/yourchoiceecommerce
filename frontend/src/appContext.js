import { createContext, useContext } from 'react';
import { QueryClient } from '@tanstack/react-query';

export const AppContext = createContext(null);
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 60_000,
    },
  },
});

export function useApp() {
  return useContext(AppContext);
}
