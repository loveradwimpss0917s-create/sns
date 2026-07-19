import { QueryClient } from "@tanstack/react-query";

/** Shared React Query client. Kept lenient offline: cached data serves the UI
 * even when a fetch fails, which matters for a PWA meant to work offline. */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
