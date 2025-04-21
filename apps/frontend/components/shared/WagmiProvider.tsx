"use client";

import { WagmiProvider as WAGMIProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";
import { config } from "@/lib/wagmi/config";

const queryClient = new QueryClient();

export function WagmiProvider({ children }: { children: ReactNode }) {
  return (
    <WAGMIProvider config={config}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WAGMIProvider>
  );
}
