import Link from "next/link";

export const dynamic = "force-static";

const CALCULATORS = [
  {
    href: "/calculators/tdee",
    title: "Основной обмен энергии",
    desc: "Калькулятор TDEE (формула Миффлина-Сан Жеора)",
  },
  { href: "/calculators/bmi", title: "Индекс массы тела", desc: "Калькулятор BMI" },
  {
    href: "/calculators/1rm",
    title: "Разовый максимум",
    desc: "1RM по формулам Эпли, Бжицки, Лэндера",
  },
  { href: "/calculators/hr-zones", title: "Пульсовые зоны", desc: "Зоны ЧСС по формуле Карвонена" },
  { href: "/calculators/protein", title: "Норма белка", desc: "Расчёт индивидуальной нормы белка" },
];

export default function CalculatorsPage() {
  return (
    <main>
      <section className="card p-6 border-zinc-200/90 shadow-lg">
        <h1 className="m-0 text-[28px] leading-[1.15] tracking-[-0.03em] font-bold">
          Калькуляторы
        </h1>
        <p className="mt-2 text-muted text-base leading-relaxed max-w-[64ch]">
          Расчёт точного калоража, разового максимума, пульсовых зон и другие полезные калькуляторы.
        </p>
      </section>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
        {CALCULATORS.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="card p-5 hover:translate-y-[-1px] transition-transform"
          >
            <div className="font-extrabold tracking-tight">{c.title}</div>
            <div className="mt-1.5 text-muted text-sm">{c.desc}</div>
          </Link>
        ))}
      </div>
    </main>
  );
}
