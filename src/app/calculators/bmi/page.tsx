"use client";

import { useState } from "react";

export default function BmiPage() {
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [result, setResult] = useState<string | null>(null);

  const calculate = () => {
    const h = Number(height),
      w = Number(weight);
    if (!h || !w) {
      setResult("Заполните все поля.");
      return;
    }
    const bmi = w / (h / 100) ** 2;
    let cat = "";
    if (bmi < 16) cat = "Выраженный дефицит массы";
    else if (bmi < 18.5) cat = "Недостаточная масса тела";
    else if (bmi < 25) cat = "Норма";
    else if (bmi < 30) cat = "Предожирение";
    else if (bmi < 35) cat = "Ожирение I степени";
    else if (bmi < 40) cat = "Ожирение II степени";
    else cat = "Ожирение III степени";
    setResult(`BMI: ${bmi.toFixed(1)}\nКатегория: ${cat}`);
  };

  return (
    <main>
      <section className="card p-6 border-zinc-200/90 shadow-lg">
        <h1 className="m-0 text-[28px] leading-[1.15] tracking-[-0.03em] font-bold">
          Индекс массы тела
        </h1>
        <p className="mt-2 text-muted leading-relaxed">Калькулятор BMI по формуле ВОЗ.</p>
      </section>
      <section className="card p-5 mt-4">
        <h2 className="mb-3 text-lg font-bold">Калькулятор</h2>
        <div className="grid gap-2 max-w-[520px]">
          <label>
            Рост (см)
            <br />
            <input
              type="number"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              className="w-full p-2.5 border border-zinc-200 rounded-xl"
            />
          </label>
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
          <button type="button" onClick={calculate} className="btn max-w-[220px]">
            Посчитать
          </button>
          {result && <div className="mt-2 whitespace-pre-line leading-relaxed">{result}</div>}
        </div>
      </section>
    </main>
  );
}
