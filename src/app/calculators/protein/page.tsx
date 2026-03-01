"use client";

import { useState } from "react";

export default function ProteinPage() {
  const [weight, setWeight] = useState("");
  const [goal, setGoal] = useState("maintain");
  const [result, setResult] = useState<string | null>(null);

  const calculate = () => {
    const w = Number(weight);
    if (!w) {
      setResult("Введите вес.");
      return;
    }
    const ranges: Record<string, [number, number, string]> = {
      lose: [1.6, 2.2, "Снижение веса"],
      maintain: [1.2, 1.6, "Поддержание"],
      gain: [1.6, 2.2, "Набор мышечной массы"],
      athlete: [1.8, 2.5, "Спортсмен (интенсивные тренировки)"],
    };
    const [lo, hi, label] = ranges[goal] ?? ranges.maintain;
    setResult(
      `${label}\nНорма белка: ${Math.round(w * lo)}–${Math.round(w * hi)} г/день\n(${lo}–${hi} г на 1 кг массы тела)`,
    );
  };

  return (
    <main>
      <section className="card p-6 border-zinc-200/90 shadow-lg">
        <h1 className="m-0 text-[28px] leading-[1.15] tracking-[-0.03em] font-bold">Норма белка</h1>
        <p className="mt-2 text-muted leading-relaxed">
          Расчёт индивидуальной нормы белка в зависимости от целей.
        </p>
      </section>
      <section className="card p-5 mt-4">
        <h2 className="mb-3 text-lg font-bold">Калькулятор</h2>
        <div className="grid gap-2 max-w-[520px]">
          <label>
            Вес (кг)
            <br />
            <input
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="w-full p-2.5 border border-zinc-200 rounded-xl"
            />
          </label>
          <label>
            Цель
            <br />
            <select
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              className="w-full p-2.5 border border-zinc-200 rounded-xl"
            >
              <option value="lose">Снижение веса</option>
              <option value="maintain">Поддержание</option>
              <option value="gain">Набор мышечной массы</option>
              <option value="athlete">Спортсмен</option>
            </select>
          </label>
          <button type="button" onClick={calculate} className="btn max-w-[220px]">
            Посчитать
          </button>
          {result && <div className="mt-2 whitespace-pre-line leading-relaxed">{result}</div>}
        </div>
      </section>
    </main>
  );
}
