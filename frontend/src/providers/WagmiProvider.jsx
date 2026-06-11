"use client";

import { WagmiProvider as WagmiProviderBase } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createWagmiConfig } from "@/lib/wagmiConfig";
import { useState } from "react";

export default function WagmiProvider({ children }) {
  const [config] = useState(() => createWagmiConfig());
  const [queryClient] = useState(() => new QueryClient());

  return (
    <WagmiProviderBase config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProviderBase>
  );
}