"use client";

import { useState } from "react";

export default function OneRmPage() {
  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("");
  const [result, setResult] = useState<string | null>(null);

  const calculate = () => {
    const w = Number(weight),
      r = Number(reps);
    if (!w || !r || r < 1) {
      setResult("Заполните все поля.");
      return;
    }
    if (r === 1) {
      setResult(`1RM: ${w} кг (вы уже ввели одноповторный максимум)`);
      return;
    }
    const epley = Math.round(w * (1 + r / 30));
    const brzycki = Math.round(w * (36 / (37 - r)));
    const lander = Math.round((w * 100) / (101.3 - 2.67123 * r));
    const avg = Math.round((epley + brzycki + lander) / 3);
    setResult(`Среднее: ${avg} кг\nЭпли: ${epley} кг\nБжицки: ${brzycki} кг\nЛэндер: ${lander} кг`);
  };

  return (
    <main>
      <section className="card p-6 border-zinc-200/90 shadow-lg">
        <h1 className="m-0 text-[28px] leading-[1.15] tracking-[-0.03em] font-bold">
          Разовый максимум (1RM)
        </h1>
        <p className="mt-2 text-muted leading-relaxed">
          Расчёт одноповторного максимума по формулам Эпли, Бжицки и Лэндера.
        </p>
      </section>
      <section className="card p-5 mt-4">
        <h2 className="mb-3 text-lg font-bold">Калькулятор</h2>
        <div className="grid gap-2 max-w-[520px]">
          <label>
            Вес отягощения (кг)
            <br />
            <input
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="w-full p-2.5 border border-zinc-200 rounded-xl"
            />
          </label>
          <label>
            Количество повторений
            <br />
            <input
              type="number"
              value={reps}
              onChange={(e) => setReps(e.target.value)}
              className="w-full p-2.5 border border-zinc-200 rounded-xl"
            />
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
