"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Zap,
  ChevronRight,
  User,
  ArrowUp,
  ArrowDown,
  Target,
  Save,
  History,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface SavedCalculation {
  id: string;
  type: string;
  name: string;
  result: {
    tdee: number;
    bmr: number;
    loss: number;
    gain: number;
  };
  inputData: {
    sex: string;
    age: number;
    height: number;
    weight: number;
    activity: string;
  };
  createdAt: string;
}

export default function TdeePage() {
  const [sex, setSex] = useState("male");
  const [age, setAge] = useState(25);
  const [height, setHeight] = useState(175);
  const [weight, setWeight] = useState(70);
  const [activity, setActivity] = useState("1.2");
  const [isSaving, setIsSaving] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [savedCalculations, setSavedCalculations] = useState<SavedCalculation[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Load history on mount to show pulsing dot
  useEffect(() => {
    loadHistory();
  }, []);

  const results = useMemo(() => {
    const bmr =
      sex === "male"
        ? 10 * weight + 6.25 * height - 5 * age + 5
        : 10 * weight + 6.25 * height - 5 * age - 161;

    const tdee = Math.round(bmr * Number(activity));

    return {
      bmr: Math.round(bmr),
      tdee,
      loss: Math.round(tdee * 0.8),
      gain: Math.round(tdee * 1.15),
    };
  }, [sex, age, height, weight, activity]);

  const handleSaveCalculation = async () => {
    setIsSaving(true);
    try {
      const response = await fetch("/api/calculations", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "CALORIES",
          name: "Расчет суточного расхода калорий (TDEE)",
          inputData: { sex, age, height, weight, activity },
          result: results,
        }),
      });

      if (response.ok) {
        toast.success("Расчет сохранен!", {
          description: "Данные добавлены в ваш личный кабинет",
        });
        // Refresh history immediately
        loadHistory();
      } else {
        let errorMessage = "Не удалось сохранить расчет";
        try {
          const data = await response.json();
          errorMessage = data?.error || data?.details || errorMessage;
        } catch {
          // Ignore JSON parse errors and keep the fallback message
        }
        throw new Error(errorMessage);
      }
    } catch (error) {
      const description = error instanceof Error ? error.message : "Не удалось сохранить расчет";
      toast.error("Ошибка сохранения", {
        description,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const loadHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const response = await fetch("/api/calculations?type=CALORIES", {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setSavedCalculations(data.calculations || []);
      }
    } catch {
      // Silent fail for loading history
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const toggleHistory = () => {
    if (!showHistory) {
      loadHistory();
    }
    setShowHistory(!showHistory);
  };

  return (
    <main className="animate-in fade-in duration-700">
      {/* Header */}
      <section className="relative overflow-hidden bg-[#13151a]/60 backdrop-blur-xl p-8 rounded-[40px] border border-white/5 shadow-2xl mb-6">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-transparent opacity-50" />
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-orange-500 mb-3">
          <Link
            href="/calculators"
            className="flex items-center gap-1 hover:text-white transition-colors"
          >
            <ChevronRight className="w-3 h-3 rotate-180" />
            Назад
          </Link>
          <ChevronRight className="w-3 h-3 opacity-50" />
          <span className="text-zinc-500">Обмен энергии</span>
        </div>
        <h1 className="text-3xl font-black uppercase tracking-tighter italic text-white flex items-center gap-3">
          <Zap className="w-8 h-8 text-orange-500" />
          Обмен энергии
        </h1>
        <p className="mt-2 text-zinc-500 text-sm font-medium leading-relaxed max-w-[50ch]">
          Узнай свой суточный расход калорий
        </p>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6 items-start">
        {/* Calc Form */}
        <section className="bg-[#13151a]/40 backdrop-blur-xl p-6 md:p-8 rounded-[40px] border border-white/5 shadow-xl space-y-8">
          {/* Sex Toggle */}
          <div className="flex bg-white/5 rounded-2xl p-1.5 border border-white/5 max-w-[280px]">
            <button
              onClick={() => setSex("male")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                sex === "male"
                  ? "bg-orange-500 text-black shadow-lg"
                  : "text-zinc-500 hover:text-white"
              }`}
            >
              <User className="w-4 h-4" /> Мужской
            </button>
            <button
              onClick={() => setSex("female")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                sex === "female"
                  ? "bg-orange-500 text-black shadow-lg"
                  : "text-zinc-500 hover:text-white"
              }`}
            >
              <User className="w-4 h-4" /> Женский
            </button>
          </div>

          {/* Sliders */}
          <div className="space-y-10">
            {/* Age */}
            <div className="space-y-4">
              <div className="flex items-end justify-between">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                  Возраст
                </label>
                <div className="text-2xl font-black italic text-white leading-none">
                  {age}{" "}
                  <span className="text-[10px] uppercase not-italic text-zinc-600 ml-1">лет</span>
                </div>
              </div>
              <input
                type="range"
                min="15"
                max="100"
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                className="w-full h-1.5 bg-white/5 rounded-full appearance-none cursor-pointer accent-orange-500 hover:accent-orange-400 transition-all [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-orange-500 [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(249,115,22,0.5)]"
              />
            </div>

            {/* Height */}
            <div className="space-y-4">
              <div className="flex items-end justify-between">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                  Рост
                </label>
                <div className="text-2xl font-black italic text-white leading-none">
                  {height}{" "}
                  <span className="text-[10px] uppercase not-italic text-zinc-600 ml-1">см</span>
                </div>
              </div>
              <input
                type="range"
                min="100"
                max="250"
                value={height}
                onChange={(e) => setHeight(Number(e.target.value))}
                className="w-full h-1.5 bg-white/5 rounded-full appearance-none cursor-pointer accent-orange-500 hover:accent-orange-400 transition-all [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-orange-500 [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(249,115,22,0.5)]"
              />
            </div>

            {/* Weight */}
            <div className="space-y-4">
              <div className="flex items-end justify-between">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                  Текущий вес
                </label>
                <div className="text-2xl font-black italic text-white leading-none">
                  {weight}{" "}
                  <span className="text-[10px] uppercase not-italic text-zinc-600 ml-1">кг</span>
                </div>
              </div>
              <input
                type="range"
                min="30"
                max="250"
                value={weight}
                onChange={(e) => setWeight(Number(e.target.value))}
                className="w-full h-1.5 bg-white/5 rounded-full appearance-none cursor-pointer accent-orange-500 hover:accent-orange-400 transition-all [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-orange-500 [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(249,115,22,0.5)]"
              />
            </div>
          </div>

          {/* Activity */}
          <div className="space-y-4 pt-4">
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 block mb-2">
              Активность
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {[
                { val: "1.2", lbl: "Сидячая работа", desc: "Минимум движений" },
                { val: "1.375", lbl: "Лёгкая", desc: "1-3 трен. / нед" },
                { val: "1.55", lbl: "Средняя", desc: "3-5 трен. / нед" },
                { val: "1.725", lbl: "Высокая", desc: "6-7 трен. / нед" },
                { val: "1.9", lbl: "Профи", desc: "Спец. нагрузки" },
              ].map((act) => (
                <button
                  key={act.val}
                  onClick={() => setActivity(act.val)}
                  className={`flex flex-col items-start p-4 rounded-2xl border transition-all text-left ${
                    activity === act.val
                      ? "bg-orange-500/10 border-orange-500 text-white shadow-inner shadow-orange-500/10"
                      : "bg-white/5 border-white/5 text-zinc-400 hover:border-white/20"
                  }`}
                >
                  <span className="text-[11px] font-black uppercase tracking-tight">{act.lbl}</span>
                  <span className="text-[9px] font-medium opacity-60">{act.desc}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Results Bento Grid */}
        <aside className="space-y-4 sticky top-28">
          <div className="grid grid-cols-2 gap-4">
            {/* TDEE Main Card */}
            <div className="col-span-2 bg-orange-500 p-8 rounded-[40px] text-black shadow-[0_20px_40px_rgba(249,115,22,0.3)] relative overflow-hidden group min-h-[180px] flex flex-col justify-center">
              <Zap className="absolute -right-4 -bottom-4 w-32 h-32 opacity-10 rotate-12 group-hover:rotate-0 transition-transform duration-1000" />
              <div className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-1">
                Поддержание (TDEE)
              </div>
              <div className="text-6xl font-black italic tracking-tighter leading-none mb-2">
                {results.tdee}
              </div>
              <div className="text-[10px] font-black uppercase tracking-widest opacity-60">
                ккал / день
              </div>
            </div>

            {/* BMR Card */}
            <div className="bg-[#13151a]/60 backdrop-blur-md p-6 rounded-[32px] border border-white/5 shadow-xl flex flex-col justify-center">
              <div className="text-[9px] font-black uppercase tracking-widest text-zinc-500 mb-1">
                Энергия для жизнедеятельности
              </div>
              <div className="text-xl font-black italic text-white leading-none">
                {results.bmr}{" "}
                <span className="text-[9px] not-italic text-zinc-600 ml-0.5">ккал</span>
              </div>
            </div>

            {/* Empty space or another metric? Let's use it for a target icon */}
            <div className="bg-[#13151a]/40 backdrop-blur-md p-6 rounded-[32px] border border-white/5 flex items-center justify-center">
              <Target className="w-8 h-8 text-orange-500/30" />
            </div>

            {/* Loss Card */}
            <div className="bg-[#13151a]/60 backdrop-blur-md p-6 rounded-[32px] border border-white/5 shadow-xl">
              <div className="flex items-center gap-2 text-blue-400 mb-2">
                <ArrowDown className="w-4 h-4" />
                <span className="text-[9px] font-black uppercase tracking-widest">
                  Для похудения
                </span>
              </div>
              <div className="text-3xl font-black italic text-white leading-none">
                {results.loss}
              </div>
              <p className="mt-2 text-[8px] text-zinc-600 font-bold leading-tight uppercase tracking-tighter">
                Дефицит -20%
              </p>
            </div>

            {/* Gain Card */}
            <div className="bg-[#13151a]/60 backdrop-blur-md p-6 rounded-[32px] border border-white/5 shadow-xl">
              <div className="flex items-center gap-2 text-emerald-400 mb-2">
                <ArrowUp className="w-4 h-4" />
                <span className="text-[9px] font-black uppercase tracking-widest">Для набора</span>
              </div>
              <div className="text-3xl font-black italic text-white leading-none">
                {results.gain}
              </div>
              <p className="mt-2 text-[8px] text-zinc-600 font-bold leading-tight uppercase tracking-tighter">
                Профицит +15%
              </p>
            </div>
          </div>

          {/* Save and History Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleSaveCalculation}
              disabled={isSaving}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-orange-500 hover:bg-orange-400 disabled:bg-orange-500/50 rounded-2xl text-black font-bold text-sm transition-all"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {isSaving ? "Сохранение..." : "Сохранить расчет"}
            </button>
            <button
              type="button"
              onClick={toggleHistory}
              className="relative flex items-center justify-center gap-2 px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-white font-bold text-sm transition-all"
            >
              <History className="w-4 h-4" />
              История
              {/* Pulsing dot when calculations exist */}
              {savedCalculations.length > 0 && !showHistory && (
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
              )}
            </button>
          </div>

          {/* History Section */}
          {showHistory && (
            <div className="bg-[#13151a]/60 backdrop-blur-md p-6 rounded-[32px] border border-white/5">
              <h3 className="text-sm font-black uppercase tracking-widest text-white mb-4">
                История расчетов
              </h3>
              {isLoadingHistory ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 text-orange-500 animate-spin" />
                </div>
              ) : savedCalculations.length > 0 ? (
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {savedCalculations.map((calc) => (
                    <div
                      key={calc.id}
                      className="flex items-center justify-between p-3 bg-white/5 rounded-xl"
                    >
                      <div>
                        <p className="text-sm font-bold text-white">{calc.result.tdee} ккал</p>
                        <p className="text-[10px] text-zinc-500">
                          {new Date(calc.createdAt).toLocaleDateString("ru-RU")}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-zinc-400">
                          {calc.inputData.weight} кг, {calc.inputData.age} лет
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-zinc-500 text-center py-4">Нет сохраненных расчетов</p>
              )}
            </div>
          )}

          <div className="bg-white/5 border border-white/5 rounded-[32px] p-6 text-center">
            <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest leading-relaxed italic">
              «Придерживайтесь рациона 2 недели для результата»
            </p>
          </div>
        </aside>
      </div>
    </main>
  );
}
