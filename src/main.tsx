import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { router } from "./presentation/router/router";

import { RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ToastProvider } from "./presentation/context/ToastContext";
import "/src/app.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5 minutos
      gcTime: 10 * 60 * 1000, // 10 minutos
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <RouterProvider router={router} />
        {/* Solo mostrar DevTools en desarrollo */}
        {import.meta.env.MODE === 'development' && (
          <ReactQueryDevtools initialIsOpen={false} />
        )}
      </ToastProvider>
    </QueryClientProvider>
  </StrictMode>
);