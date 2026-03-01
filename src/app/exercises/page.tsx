"use client";

import React from "react";
import Link from "next/link";

export default function ExercisesPage() {
  return (
    <main className="min-h-screen pt-24 pb-12 px-4 bg-[#0a0a0a] text-white">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
          Упражнения
        </h1>
        <p className="text-gray-400 text-lg mb-12 max-w-2xl mx-auto">
          Этот раздел находится в стадии разработки. Скоро здесь появится библиотека упражнений с
          правильной техникой выполнения и видео.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
          <div className="glass-card p-8 rounded-3xl border border-white/10">
            <h3 className="text-xl font-semibold mb-3">Что здесь будет?</h3>
            <ul className="space-y-2 text-gray-400">
              <li>• Видео с техникой выполнения</li>
              <li>• Разбор типичных ошибок</li>
              <li>• Рекомендации по весам и повторам</li>
              <li>• Альтернативные упражнения</li>
            </ul>
          </div>

          <div className="glass-card p-8 rounded-3xl border border-white/10 flex flex-col justify-center items-center text-center">
            <span className="text-4xl mb-4">🏗️</span>
            <p className="text-gray-300">Работаем над контентом!</p>
          </div>
        </div>

        <div className="mt-16">
          <Link
            href="/"
            className="inline-block bg-white text-black px-8 py-3 rounded-full font-semibold hover:bg-gray-200 transition-all"
          >
            На главную
          </Link>
        </div>
      </div>

      <style jsx>{`
        .glass-card {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
        }
      `}</style>
    </main>
  );
}
