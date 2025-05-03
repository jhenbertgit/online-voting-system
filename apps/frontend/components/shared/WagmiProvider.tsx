"use client";

import { WagmiProvider as WAGMIProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";
import type { JSX } from "react";
import { config } from "@/lib/wagmi/config";

const queryClient = new QueryClient();

/**
 * WagmiProvider wraps the app with wagmi and TanStack Query providers.
 * @param {object} props - Component props.
 * @param {ReactNode} props.children - React children nodes.
 * @returns {JSX.Element} The provider-wrapped children.
 */
export function WagmiProvider({
  children,
}: {
  children: ReactNode;
}): JSX.Element {
  return (
    <WAGMIProvider config={config}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WAGMIProvider>
  );
}
