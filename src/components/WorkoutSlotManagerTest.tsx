"use client";

import React, { useState, useEffect } from "react";
import { Calendar } from "lucide-react";

export default function WorkoutSlotManagerTest() {
  const [slots, setSlots] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleEveningPackage = () => {
    alert("Вечерний пакет работает!");
  };

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-white flex items-center gap-2">
        <Calendar className="w-5 h-5 text-orange-500" />
        Управление расписанием (ТЕСТ)
      </h2>
      
      <button
        onClick={handleEveningPackage}
        className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg font-medium hover:bg-purple-600 transition-colors"
      >
        <Calendar className="w-4 h-4" />
        Вечерний пакет (ТЕСТ)
      </button>

      {isLoading ? (
        <div className="text-center py-8">
          <p className="text-zinc-500">Загрузка...</p>
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-zinc-500">Компонент загружен успешно!</p>
        </div>
      )}
    </div>
  );
}
