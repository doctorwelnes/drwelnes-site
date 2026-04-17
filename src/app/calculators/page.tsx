"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  Activity,
  Beaker,
  Zap,
  Heart,
  Scale,
  Calculator,
  Droplets,
  ArrowUpRight,
  ArrowRightLeft,
  CheckCircle2,
  Beef,
  Moon,
  Check,
} from "lucide-react";
import PageHeader from "@/components/PageHeader";
import ContentGate from "@/components/ContentGate";

const GUEST_LIMIT = 3;

const CALCULATORS = [
  {
    href: "/calculators/tdee",
    title: "Обмен энергии",
    desc: "Узнай свой суточный расход калорий",
    icon: <Zap className="w-5 h-5 text-orange-500" />,
  },
  {
    href: "/calculators/bmi",
    title: "Индекс массы тела",
    desc: "Посчитай свой BMI и оцени, в каком диапазоне здоровья ты находишься.",
    icon: <Scale className="w-5 h-5 text-orange-500" />,
  },
  {
    href: "/calculators/body-fat",
    title: "Процент жира",
    desc: "Оцени процент жировой массы по антропометрическим измерениям.",
    icon: <Activity className="w-5 h-5 text-orange-500" />,
  },
  {
    href: "/calculators/ffmi",
    title: "Индекс FFMI",
    desc: "Определи потенциал мышечного роста относительно нормы.",
    icon: <Activity className="w-5 h-5 text-orange-500" />,
  },
  {
    href: "/calculators/macros",
    title: "Нормы БЖУ",
    desc: "Рассчитай свою суточную норму белков, жиров и углеводов под свои цели.",
    icon: <Zap className="w-5 h-5 text-orange-500" />,
  },
  {
    href: "/calculators/training-macros",
    title: "БЖУ по дням",
    desc: "Составь циклирование БЖУ по дням отдыха и тренировок.",
    icon: <Calculator className="w-5 h-5 text-orange-500" />,
  },
  {
    href: "/calculators/ideal-weight",
    title: "Идеальный вес",
    desc: "Узнай свой идеальный вес по классическим формулам для своего роста и пола.",
    icon: <CheckCircle2 className="w-5 h-5 text-orange-500" />,
  },
  {
    href: "/calculators/water",
    title: "Норма воды",
    desc: "Рассчитай оптимальный объём воды по весу и уровню активности.",
    icon: <Droplets className="w-5 h-5 text-orange-500" />,
  },
  {
    href: "/calculators/whr",
    title: "Индекс WHR",
    desc: "Посчитай соотношение талии и бёдер и оцени риск по типу ожирения.",
    icon: <ArrowRightLeft className="w-5 h-5 text-orange-500" />,
  },
  {
    href: "/calculators/rfm",
    title: "Индекс RFM",
    desc: "Оцени уровень жира и композицию тела по окружности талии и росту.",
    icon: <Scale className="w-5 h-5 text-orange-500" />,
  },
  {
    href: "/calculators/workout-volume",
    title: "Объём (тоннаж)",
    desc: "Подсчитай суммарный тоннаж тренировки и контролируй нагрузку.",
    icon: <Activity className="w-5 h-5 text-orange-500" />,
  },
  {
    href: "/calculators/sleep",
    title: "Цикл сна",
    desc: "Подбери оптимальное время отхода ко сну и подъёма по циклам.",
    icon: <Moon className="w-5 h-5 text-orange-500" />,
  },
  {
    href: "/calculators/1rm",
    title: "Разовый максимум (1RM)",
    desc: "Определи свой разовый максимум в базовых упражнениях по подтягиванию, жиму или приседу.",
    icon: <Beaker className="w-5 h-5 text-orange-500" />,
  },
  {
    href: "/calculators/hr-zones",
    title: "Пульсовые зоны",
    desc: "Рассчитай пульсовые зоны для тренировки сердца и сосудов.",
    icon: <Heart className="w-5 h-5 text-orange-500" />,
  },
  {
    href: "/calculators/protein",
    title: "Норма белка",
    desc: "Узнай свою индивидуальную норму белка в сутки под свою цель и уровень активности.",
    icon: <Beef className="w-5 h-5 text-orange-500" />,
  },
];

export default function CalculatorsPage() {
  const { data: session } = useSession();
  const isGuest = !session?.user;
  const [calculatorHistory, setCalculatorHistory] = useState<Record<string, boolean>>({});

  useEffect(() => {
    async function loadHistory() {
      try {
        const response = await fetch("/api/calculations");
        if (response.ok) {
          const data = await response.json();
          const history: Record<string, boolean> = {};
          data.calculations?.forEach((calc: { type: string }) => {
            history[calc.type] = true;
          });
          setCalculatorHistory(history);
        }
      } catch (error) {
        // Silent fail for loading calculator history
      }
    }
    loadHistory();
  }, []);

  const typeToHref: Record<string, string> = {
    BMI: "/calculators/bmi",
    CALORIES: "/calculators/tdee",
    BJU: "/calculators/macros",
    WATER: "/calculators/water",
    IDEAL_WEIGHT: "/calculators/ideal-weight",
  };

  return (
    <main className="min-h-screen bg-[#0c0d10] p-4 sm:p-8 font-sans animate-in fade-in duration-700 relative pb-32">
      {/* Background Ambience */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-[-10%] w-[50%] h-[50%] bg-orange-500/10 blur-[160px] rounded-full animate-float-slow" />
        <div
          className="absolute -bottom-[20%] left-[5%] w-[60%] h-[60%] bg-orange-500/15 blur-[160px] rounded-full animate-float"
          style={{ animationDelay: "-10s" }}
        />
      </div>

      <div className="mx-auto max-w-7xl space-y-8 lg:space-y-12 relative z-10">
        <PageHeader
          title="Калькуляторы"
          pluralLabels={["ИНСТРУМЕНТ", "ИНСТРУМЕНТА", "ИНСТРУМЕНТОВ"]}
          countValue={CALCULATORS.length}
          icon={Calculator}
          accentColor="orange"
          subtitle="точно и последовательно"
        />

        <div className="grid gap-4 md:gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {(isGuest ? CALCULATORS.slice(0, GUEST_LIMIT) : CALCULATORS).map((c, idx) => (
            <Link
              key={`${c.href}-${idx}-v3`}
              href={c.href}
              className="group relative bg-[#13151a]/90 backdrop-blur-xl rounded-[32px] border border-white/10 hover:border-orange-500/30 transition-all duration-500 overflow-hidden flex items-center justify-between flex-row p-6 md:flex-col md:items-start md:justify-start md:p-10 md:hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)]"
            >
              {/* Checkmark in top-right corner of card */}
              {calculatorHistory[
                Object.keys(typeToHref).find((key) => typeToHref[key] === c.href) || ""
              ] && (
                <div className="absolute top-4 right-4 w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center z-10">
                  <Check className="w-3 h-3 text-black" />
                </div>
              )}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-orange-500/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />

              {/* Mobile Icon (Right side) / Desktop Icon (Top) */}
              <div className="shrink-0 relative order-2 md:order-1 md:mb-8">
                <div className="rounded-full flex items-center justify-center transition-all shadow-xl group-hover:scale-110 relative z-10 w-12 h-12 bg-white border border-white/10 md:w-16 md:h-16 md:bg-white/5 md:border-white/10 group-hover:border-orange-500/30">
                  <div className="relative">
                    {typeof c.icon === "object" && "type" in c.icon ? (
                      <c.icon.type
                        {...c.icon.props}
                        className="transition-colors w-5 h-5 text-black md:w-8 md:h-8 md:text-orange-500 md:group-hover:text-white"
                      />
                    ) : (
                      c.icon
                    )}
                  </div>
                </div>
                <div className="absolute inset-0 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity bg-white/20 md:bg-orange-500/20" />
              </div>

              {/* Text Content */}
              <div className="flex-1 min-w-0 flex flex-col justify-center order-1 md:order-2 md:mb-8">
                <div className="flex flex-col">
                  <h2 className="font-black text-white uppercase tracking-tighter mb-1 italic leading-[1.1] text-[17px] md:text-2xl md:mb-3 md:leading-tight">
                    {c.title}
                  </h2>
                  <p className="font-medium leading-[1.4] transition-opacity text-[11px] text-zinc-500 opacity-80 md:text-sm md:opacity-60 group-hover:opacity-100 md:leading-relaxed">
                    {c.desc}
                  </p>
                </div>
              </div>

              {/* Desktop Footer (Hidden on mobile) */}
              <div className="items-center gap-3 order-3 mt-auto pt-6 border-t border-white/5 w-full hidden md:flex">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 group-hover:text-orange-500 transition-colors">
                  Открыть
                </span>
                <div className="h-px flex-1 bg-white/5 group-hover:bg-orange-500/30 transition-colors" />
                <ArrowUpRight className="w-4 h-4 text-zinc-700 group-hover:text-orange-500 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
              </div>
            </Link>
          ))}
        </div>
        {isGuest && (
          <ContentGate
            total={CALCULATORS.length}
            freeLimit={GUEST_LIMIT}
            sectionLabel="калькуляторов"
          />
        )}
      </div>
    </main>
  );
}
