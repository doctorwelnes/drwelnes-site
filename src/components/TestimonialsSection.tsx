"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

const TESTIMONIALS = [
  { id: 1, image: "/uploads/testimonials/client-1.JPG" },
  { id: 2, image: "/uploads/testimonials/client-2.JPG" },
  { id: 3, image: "/uploads/testimonials/client-3.JPG" },
  { id: 4, image: "/uploads/testimonials/client-4.JPG" },
  { id: 5, image: "/uploads/testimonials/client-5.JPG" },
  { id: 6, image: "/uploads/testimonials/client-6.JPG" },
];

export default function TestimonialsSection() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % TESTIMONIALS.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
  };

  return (
    <section className="md:hidden w-full pt-2 pb-8 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#f95700]/5 to-transparent" />

      <div className="max-w-md mx-auto px-6 relative z-10">
        <div className="text-center mb-4">
          <h2 className="font-black italic text-white text-2xl uppercase tracking-tighter mb-1">
            Результаты клиентов
          </h2>
        </div>

        {/* Slider Container */}
        <div className="relative">
          {/* Navigation Buttons */}
          <button
            onClick={prevSlide}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 z-20 w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-[#f95700] hover:border-[#f95700] transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 z-20 w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-[#f95700] hover:border-[#f95700] transition-all"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Slides */}
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {TESTIMONIALS.map((testimonial) => (
                <div key={testimonial.id} className="w-full flex-shrink-0 px-4">
                  <div className="relative h-56 overflow-hidden rounded-3xl border border-white/10">
                    <Image
                      src={testimonial.image}
                      alt="Результат"
                      fill
                      className="object-cover"
                      sizes="100vw"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center gap-2 mt-6">
            {TESTIMONIALS.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentIndex ? "bg-[#f95700] w-6" : "bg-white/30"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
