import type { Metadata } from "next";
import Image from "next/image";
import "./globals.css";
import { Providers } from "./providers";
import TopNavClient from "./ui/top-nav-client";

export const metadata: Metadata = {
  title: "Dr.Welnes",
  description: "Fitness app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body
        className="antialiased"
      >
        <Providers>
          <div className="min-h-dvh bg-zinc-50 text-zinc-900">
            <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white">
              <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
                <div className="flex items-center gap-2">
                  <Image src="/logo.png" alt="Dr.Welnes" width={32} height={32} className="h-8 w-8 rounded-lg" />
                  <div className="font-semibold">Dr.Welnes</div>
                </div>
                <TopNavClient />
              </div>
            </header>

            <div className="mx-auto max-w-5xl px-4 py-6">{children}</div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
