"use client";

import { useState } from "react";

export default function TdeePage() {
  const [sex, setSex] = useState("male");
  const [age, setAge] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [activity, setActivity] = useState("1.2");
  const [result, setResult] = useState<string | null>(null);

  const calculate = () => {
    const a = Number(age),
      h = Number(height),
      w = Number(weight),
      act = Number(activity);
    if (!a || !h || !w) {
      setResult("Заполните все поля.");
      return;
    }
    const bmr = sex === "male" ? 10 * w + 6.25 * h - 5 * a + 5 : 10 * w + 6.25 * h - 5 * a - 161;
    const base = Math.round(bmr * act);
    setResult(
      `Должный калораж: ${base} ккал/день\nСнижение веса: ${Math.max(0, base - 300)} ккал/день\nНабор массы: ${base + 300} ккал/день`,
    );
  };

  return (
    <main>
      <section className="card p-6 border-zinc-200/90 shadow-lg">
        <h1 className="m-0 text-[28px] leading-[1.15] tracking-[-0.03em] font-bold">
          Основной обмен энергии
        </h1>
        <p className="mt-2 text-muted leading-relaxed max-w-[64ch]">
          Калькулятор базального обмена (формула Миффлина-Сан Жеора) + расчёт калоража с учётом
          активности.
        </p>
      </section>
      <section className="card p-5 mt-4">
        <h2 className="mb-3 text-lg font-bold">Калькулятор</h2>
        <div className="grid gap-2 max-w-[520px]">
          <label>
            Пол
            <br />
            <select
              value={sex}
              onChange={(e) => setSex(e.target.value)}
              className="w-full p-2.5 border border-zinc-200 rounded-xl"
            >
              <option value="male">Муж</option>
              <option value="female">Жен</option>
            </select>
          </label>
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
          <label>
            Активность
            <br />
            <select
              value={activity}
              onChange={(e) => setActivity(e.target.value)}
              className="w-full p-2.5 border border-zinc-200 rounded-xl"
            >
              <option value="1.2">Минимальная — сидячая работа</option>
              <option value="1.375">Лёгкая — 1-3 тренировки/нед</option>
              <option value="1.55">Средняя — 3-5 тренировок/нед</option>
              <option value="1.725">Высокая — 6-7 тренировок/нед</option>
              <option value="1.9">Очень высокая — тяжёлая работа + тренировки</option>
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
