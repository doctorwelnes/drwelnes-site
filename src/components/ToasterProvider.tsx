"use client";

import { Toaster } from "sonner";

export function ToasterProvider() {
  return (
    <Toaster
      position="bottom-right"
      closeButton
      toastOptions={{
        classNames: {
          toast: "!bg-[#13151a] !border-orange-500/30 !text-white font-sans rounded-2xl",
          title: "!text-white !font-semibold",
          description: "!text-zinc-400 text-xs font-medium",
          closeButton: "!text-zinc-500 hover:!text-white",
        },
        style: {
          background: "#13151a",
          border: "1px solid rgba(249, 87, 0, 0.3)",
          backdropFilter: "blur(16px)",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
          "--normal-bg": "#13151a",
          "--normal-text": "#ffffff",
          "--normal-border": "rgba(249, 87, 0, 0.3)",
        } as React.CSSProperties,
      }}
    />
  );
}
