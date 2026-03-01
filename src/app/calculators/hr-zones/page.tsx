"use client";

import { useState } from "react";

export default function HrZonesPage() {
  const [age, setAge] = useState("");
  const [restHr, setRestHr] = useState("");
  const [result, setResult] = useState<string | null>(null);

  const calculate = () => {
    const a = Number(age),
      rhr = Number(restHr);
    if (!a) {
      setResult("Заполните возраст.");
      return;
    }
    const maxHr = 220 - a;
    const hrr = maxHr - (rhr || 0);

    const zones = [
      { name: "Зона 1 — Восстановление", min: 0.5, max: 0.6 },
      { name: "Зона 2 — Жиросжигание", min: 0.6, max: 0.7 },
      { name: "Зона 3 — Аэробная", min: 0.7, max: 0.8 },
      { name: "Зона 4 — Анаэробная", min: 0.8, max: 0.9 },
      { name: "Зона 5 — Максимальная", min: 0.9, max: 1.0 },
    ];

    const lines = [`Максимальный пульс: ${maxHr} уд/мин`, ""];
    for (const z of zones) {
      const lo = rhr ? Math.round(hrr * z.min + rhr) : Math.round(maxHr * z.min);
      const hi = rhr ? Math.round(hrr * z.max + rhr) : Math.round(maxHr * z.max);
      lines.push(`${z.name}: ${lo}–${hi} уд/мин`);
    }
    setResult(lines.join("\n"));
  };

  return (
    <main>
      <section className="card p-6 border-zinc-200/90 shadow-lg">
        <h1 className="m-0 text-[28px] leading-[1.15] tracking-[-0.03em] font-bold">
          Пульсовые зоны
        </h1>
        <p className="mt-2 text-muted leading-relaxed">
          Зоны ЧСС по формуле Карвонена (с учётом покоя) или по % от макс. ЧСС.
        </p>
      </section>
      <section className="card p-5 mt-4">
        <h2 className="mb-3 text-lg font-bold">Калькулятор</h2>
        <div className="grid gap-2 max-w-[520px]">
          <label>
            Возраст (лет)
            <br />
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="w-full p-2.5 border border-zinc-200 rounded-xl"
            />
          </label>
          <label>
            Пульс покоя (опционально)
            <br />
            <input
              type="number"
              value={restHr}
              onChange={(e) => setRestHr(e.target.value)}
              className="w-full p-2.5 border border-zinc-200 rounded-xl"
              placeholder="Оставьте пустым для упрощённого расчёта"
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
