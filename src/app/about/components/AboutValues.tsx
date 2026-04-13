import { Zap, ShieldCheck, Brain } from "lucide-react";

export function AboutValues() {
  return (
    <section className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-32">
      <div className="p-8 rounded-[40px] bg-[#16181d] border border-white/5 space-y-4">
        <Zap className="w-10 h-10 text-[#f95700]" />
        <h4 className="text-xl font-black italic uppercase">Эффективность</h4>
        <p className="text-zinc-500 text-sm leading-relaxed">
          Мы не тратим время на бесполезные упражнения. Каждый подход и каждый продукт в рационе
          обоснован метаболическим ответом организма.
        </p>
      </div>
      <div className="p-8 rounded-[40px] bg-white text-black space-y-4">
        <ShieldCheck className="w-10 h-10 text-[#f95700]" />
        <h4 className="text-xl font-black italic uppercase">Безопасность</h4>
        <p className="text-zinc-800 text-sm leading-relaxed">
          Благодаря медицинскому бэкграунду, я учитываю ваши особенности организма, хронические
          заболевания и травмы, выстраивая процесс так, чтобы контролировать или даже лечить
          некоторые заболевания.
        </p>
      </div>
      <div className="p-8 rounded-[40px] bg-[#f95700] text-black space-y-4">
        <Brain className="w-10 h-10 text-black" />
        <h4 className="text-xl font-black italic uppercase">Образование</h4>
        <p className="text-black/80 text-sm leading-relaxed">
          Моя задача — не просто вести вас за руку, а научить вас понимать свое тело, чтобы вы
          сохранили результат на всю жизнь.
        </p>
      </div>
    </section>
  );
}
