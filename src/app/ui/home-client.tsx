"use client";

import React, { useState } from "react";
import BookingModal from "@/components/BookingModal";
import { BenefitSummaryCard } from "@/components/BenefitSummaryCard";
import { HomeHero } from "./home/HomeHero";
import { HomeGiftForm } from "./home/HomeGiftForm";
import { HomeNavigationCards } from "./home/HomeNavigationCards";
import TestimonialsSection from "@/components/TestimonialsSection";

const HomeClient = () => {
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  return (
    <div className="selection:bg-[#f95700] selection:text-white w-full flex flex-col relative mb-5 lg:mb-0">
      {/* Background Ambience */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-[-10%] w-[50%] h-[50%] bg-[#f95700]/15 blur-[160px] rounded-full animate-float-slow" />
        <div
          className="absolute -bottom-[20%] left-[5%] w-[60%] h-[60%] bg-[#f95700]/25 blur-[160px] rounded-full animate-float"
          style={{ animationDelay: "-10s" }}
        />
      </div>

      {/* Main Content Container */}
      <div className="w-full max-w-350 mx-auto px-6 lg:px-12 relative z-10 flex-1 pt-8 pb-2 md:pt-12 md:pb-0">
        <div className="flex flex-col justify-between gap-2 lg:gap-12 lg:flex-row lg:items-center mb-1 lg:mb-0">
          <div className="flex-1 flex flex-col gap-2 lg:max-w-2xl">
            <HomeHero onBookingClick={() => setIsBookingOpen(true)} />
            <HomeGiftForm />
          </div>

          <div className="animate-in fade-in duration-1000 delay-500 shrink-0 origin-left lg:origin-right lg:w-auto w-full flex justify-center lg:justify-end slide-in-from-right-8 scale-90 lg:scale-100 mb-1 lg:mb-0">
            <BenefitSummaryCard onBookingClick={() => setIsBookingOpen(true)} />
          </div>
        </div>

        <div className="mt-1 pt-1 lg:mt-auto lg:pt-8">
          <HomeNavigationCards onBookingClick={() => setIsBookingOpen(true)} />
        </div>
      </div>

      {/* Testimonials Section */}
      <TestimonialsSection />

      {/* Booking Modal */}
      <BookingModal isOpen={isBookingOpen} onClose={() => setIsBookingOpen(false)} />
    </div>
  );
};

export default HomeClient;
