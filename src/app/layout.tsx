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
          <div className="min-h-screen bg-[radial-gradient(1200px_600px_at_20%_-10%,#dbeafe_0%,rgba(219,234,254,0)_55%),radial-gradient(900px_520px_at_90%_0%,#fce7f3_0%,rgba(252,231,243,0)_55%),#ffffff] text-zinc-900">
            <header className="sticky top-0 z-40 border-b border-zinc-200/70 bg-white/72 backdrop-blur-md">
              <div className="mx-auto flex max-w-[980px] items-center justify-between gap-4 px-5 py-3">
                <div className="flex items-center gap-2.5">
                  <Image src="/logo.png" alt="Dr.Welnes" width={34} height={34} className="h-[34px] w-[34px] rounded-linear object-cover shadow-sm" style={{ borderRadius: '10px' }} />
                  <div className="text-[17px] font-bold tracking-tight">Dr.Welnes</div>
                </div>
                <div className="hidden sm:block">
                  <TopNavClient />
                </div>
                <button type="button" className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 bg-white/90 text-xl shadow-sm sm:hidden">
                  ☰
                </button>
              </div>
            </header>

            <div className="mx-auto max-w-[980px] px-5 py-7">{children}</div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
