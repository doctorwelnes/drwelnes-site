"use client";

import { SessionProvider } from "next-auth/react";
import { SWRConfig } from "swr";
import { ToasterProvider } from "@/components/ToasterProvider";
import { CommandMenu } from "@/components/CommandMenu";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig
      value={{
        revalidateOnFocus: true,
        revalidateOnReconnect: true,
        shouldRetryOnError: false,
        dedupingInterval: 5000,
      }}
    >
      <SessionProvider>
        {children}
        <ToasterProvider />
        <CommandMenu />
      </SessionProvider>
    </SWRConfig>
  );
}
