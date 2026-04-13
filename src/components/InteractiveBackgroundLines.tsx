"use client";

import React, { useEffect, useState, useRef } from "react";

export function InteractiveBackgroundLines() {
  const [offset, setOffset] = useState(0);
  const requestRef = useRef<number>(null);

  // Animation for the ECG "flow"
  useEffect(() => {
    const animate = () => {
      setOffset((prev) => (prev + 0.8) % 2000);
      requestRef.current = requestAnimationFrame(animate);
    };
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  // Corrected repeatable path building
  const getSegment = (startX: number) => {
    return `L${startX + 40},50 C${startX + 45},50 ${startX + 48},42 ${startX + 50},42 C${startX + 52},42 ${startX + 55},50 ${startX + 60},50 L${startX + 75},50 L${startX + 78},65 L${startX + 85},10 L${startX + 92},90 L${startX + 95},50 L${startX + 110},50 C${startX + 115},50 ${startX + 120},38 ${startX + 130},38 C${startX + 140},38 ${startX + 145},50 ${startX + 150},50 L${startX + 250},50`;
  };

  let pathD = "M0,50";
  for (let i = 0; i < 15; i++) {
    pathD += getSegment(i * 250);
  }

  return (
    <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.15] overflow-hidden">
      <svg className="w-full h-full" viewBox="0 0 2000 100" preserveAspectRatio="none">
        {/* ECG Line 1 (Main) */}
        <path
          d={pathD}
          stroke="#f95700"
          strokeWidth="0.8"
          fill="transparent"
          style={{
            transform: `translateX(${-offset}px)`,
            filter: "drop-shadow(0 0 4px rgba(249,87,0,0.3))",
          }}
        />

        {/* ECG Line 2 (Delayed/Ghost) */}
        <path
          d={pathD}
          stroke="white"
          strokeWidth="0.3"
          fill="transparent"
          className="opacity-20"
          style={{
            transform: `translate(${-offset - 100}px, 20px)`,
          }}
        />
      </svg>
    </div>
  );
}
