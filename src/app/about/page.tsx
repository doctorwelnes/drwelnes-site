"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import BookingModal from "@/components/BookingModal";
import { BackgroundAmbience } from "@/components/BackgroundAmbience";

import { AboutHero } from "./components/AboutHero";
import { AboutPhilosophy } from "./components/AboutPhilosophy";
import { AboutTimeline } from "./components/AboutTimeline";
import { AboutMethodology } from "./components/AboutMethodology";
import { AboutValues } from "./components/AboutValues";
import { AboutCTA } from "./components/AboutCTA";

export default function AboutPage() {
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const scrollPositionRef = useRef(0);

  const handleOpenBooking = () => {
    scrollPositionRef.current = window.scrollY;
    setIsBookingOpen(true);
  };

  const handleCloseBooking = () => {
    setIsBookingOpen(false);
    setTimeout(() => {
      window.scrollTo(0, scrollPositionRef.current);
    }, 0);
  };

  return (
    <div className="flex flex-col relative selection:bg-[#f95700] selection:text-white overflow-x-hidden">
      <BackgroundAmbience />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 lg:py-16 relative z-10 w-full">
        {/* Header/Navigation */}
        <div className="mb-8 md:mb-12 animate-in fade-in slide-in-from-left-4 duration-700">
          <Link
            href="/"
            className="group inline-flex items-center gap-3 text-zinc-500 hover:text-[#f95700] transition-colors"
          >
            <div className="w-10 h-10 rounded-full border border-white/5 flex items-center justify-center group-hover:border-[#f95700]/30 transition-all bg-white/5 backdrop-blur-sm">
              <ArrowLeft className="w-5 h-5" />
            </div>
            <span className="text-sm font-black uppercase tracking-widest">На главную</span>
          </Link>
        </div>

        <AboutHero />
        <AboutPhilosophy />
        <AboutTimeline />
        <AboutMethodology />
        <AboutValues />
        <AboutCTA onOpenBooking={handleOpenBooking} />
      </div>

      <BookingModal isOpen={isBookingOpen} onClose={handleCloseBooking} />

      {/* Footer Meta */}
      <footer className="py-12 border-t border-white/5 text-center relative z-10">
        <p className="text-zinc-600 font-black uppercase tracking-[0.3em] text-[10px]">
          Dr.Welnes © — Science based transformation
        </p>
      </footer>
    </div>
  );
}
