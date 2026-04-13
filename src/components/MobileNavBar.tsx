"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Utensils,
  Dumbbell,
  User,
  BookOpen,
  Calculator,
  MoreHorizontal,
  X,
  Info,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function MobileNavBar() {
  const pathname = usePathname();
  const { status } = useSession();
  const isAuthed = status === "authenticated";
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname?.startsWith(href);
  };

  const navItems = [
    { href: "/", icon: Home, label: "главная" },
    { href: "/recipes", icon: Utensils, label: "питание" },
    { href: "/exercises", icon: Dumbbell, label: "тренинг" },
    { href: "/calculators", icon: Calculator, label: "кальк" },
    { label: "меню", icon: MoreHorizontal, onClick: () => setIsMenuOpen(!isMenuOpen) },
  ];

  const menuLinks = [
    { href: "/theory", icon: BookOpen, label: "Теория" },
    { href: "/about", icon: Info, label: "О проекте" },
    { href: isAuthed ? "/dashboard" : "/login", icon: User, label: isAuthed ? "Профиль" : "Войти" },
  ];

  return (
    <>
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[150] flex items-end justify-center px-2 pb-20"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsMenuOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 100, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 100, scale: 0.9 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 25,
                mass: 0.8,
              }}
              className="relative w-full max-w-md bg-[#16181d] border border-white/10 rounded-[32px] p-4 shadow-2xl"
            >
              <div className="grid grid-cols-3 gap-2">
                {menuLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMenuOpen(false)}
                    className="flex flex-col items-center justify-center p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f95700]"
                    aria-label={link.label}
                  >
                    <link.icon
                      className={`w-5 h-5 mb-1 ${isActive(link.href) ? "text-[#f95700]" : "text-zinc-400"}`}
                    />
                    <span className="text-[9px] font-black uppercase tracking-tight text-white">
                      {link.label}
                    </span>
                  </Link>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="fixed bottom-0 left-0 right-0 z-[200] px-2 pb-2 pointer-events-none">
        <nav className="mx-auto w-full max-w-[calc(100vw-16px)] bg-[#16181d]/85 backdrop-blur-2xl border border-white/10 rounded-[28px] shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center justify-between p-1 pointer-events-auto">
          {navItems.map((item, idx) => {
            if (!item.href && item.onClick) {
              // Custom Action (Menu)
              return (
                <button
                  key={idx}
                  onClick={item.onClick}
                  className="flex-1 flex flex-col items-center justify-center gap-1 group py-2 outline-none focus-visible:ring-2 focus-visible:ring-[#f95700] rounded-xl"
                  aria-label={isMenuOpen ? "Закрыть меню" : "Открыть меню"}
                  aria-expanded={isMenuOpen}
                >
                  <div
                    className={`relative p-1.5 rounded-2xl transition-all ${isMenuOpen ? "text-[#f95700]" : "text-zinc-500 group-hover:text-white"}`}
                  >
                    {isMenuOpen ? <X className="w-5 h-5" /> : <item.icon className="w-5 h-5" />}
                  </div>
                </button>
              );
            }

            const Icon = item.icon;
            const active = isActive(item.href || "");

            return (
              <Link
                key={item.href}
                href={item.href || ""}
                className="flex-1 flex flex-col items-center justify-center gap-1 group py-2 focus-visible:ring-2 focus-visible:ring-[#f95700] rounded-xl outline-none"
                aria-label={item.label}
                aria-current={active ? "page" : undefined}
              >
                <div
                  className={`relative p-2 rounded-2xl transition-all ${active ? "text-[#f95700]" : "text-zinc-500 group-hover:text-white"}`}
                >
                  <Icon
                    className={`w-5 h-5 transition-transform ${active ? "scale-110" : "scale-100"}`}
                  />
                  {active && (
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#f95700] rounded-full shadow-[0_0_10px_#f95700]" />
                  )}
                </div>
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
}
