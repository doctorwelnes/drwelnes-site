"use client";

import { usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import TopNavClient from "../app/ui/top-nav-client";
import MobileNavBar from "@/components/MobileNavBar";
import { PageTransition } from "@/components/PageTransition";
import { useState, useEffect } from "react";

export default function MainLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#0c0d10] text-white selection:bg-orange-500/30">
      <div className="relative flex flex-col w-full max-w-full font-sans">
        <header className="sticky top-0 z-[95] border-b border-white/5 bg-[#0c0d10]/80 backdrop-blur-xl shrink-0 overflow-hidden">
          {/* Mobile orange glow - top right corner */}
          <div className="md:hidden absolute -top-10 right-0 w-32 h-32 bg-[#f95700]/20 blur-[60px] rounded-full pointer-events-none" />

          {/* Bottom orange glow */}
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange-500/40 to-transparent" />
          <div className="absolute bottom-0 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-orange-400/20 to-transparent blur-sm" />

          <div className="mx-auto flex items-center justify-between gap-4 py-2 md:py-4 max-w-7xl px-6 md:px-8">
            <Link href="/" className="flex items-center gap-3 group relative z-10">
              <div className="relative">
                <Image
                  src="/logo-new.png"
                  alt="Dr.Welnes"
                  width={40}
                  height={40}
                  className="h-10 w-10 rounded-xl object-contain shadow-2xl transition-transform group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-orange-500/20 blur-lg rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="text-xl font-black tracking-tighter uppercase italic">
                Dr.<span className="text-orange-500">Welnes</span>
              </div>
            </Link>

            <div className="flex items-center gap-4 relative z-10">
              <div className="hidden md:flex items-center gap-4 min-h-[40px]">
                {mounted ? <TopNavClient /> : <div className="w-[100px] h-[36px]" />}
              </div>
            </div>
          </div>
        </header>

        {/* Bottom Navigation for Mobile */}
        <div className="md:hidden">
          <MobileNavBar />
        </div>

        <main
          className={`mx-auto flex flex-col flex-1 w-full max-w-7xl px-6 md:px-8 pb-20 md:pb-8 ${pathname === "/" ? "py-0" : "py-8 md:py-12"}`}
        >
          <PageTransition>{children}</PageTransition>
        </main>
      </div>
    </div>
  );
}
