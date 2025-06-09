import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { router } from "./presentation/router/router";

import { RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "/src/app.css";

const queryClientProvider = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClientProvider}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>
);
