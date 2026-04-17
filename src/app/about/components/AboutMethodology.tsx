import { Activity, Zap, ShieldCheck } from "lucide-react";

export function AboutMethodology() {
  return (
    <section className="mb-32">
      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter leading-none mb-4">
          Научная <span className="text-[#f95700]">Методология</span>
        </h2>
        <p className="text-zinc-500 max-w-2xl mx-auto">
          Три фундаментальных компонента, работающих в неразрывной синергии для достижения
          максимального результата
        </p>
      </div>

      <div className="relative">
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-px bg-gradient-to-r from-transparent via-[#f95700]/20 to-transparent hidden lg:block" />

        <div className="grid lg:grid-cols-3 gap-8 relative z-10">
          {[
            {
              id: "01",
              title: "Метаболический анализ",
              desc: "Глубокое понимание базовых показателей: от гормонального фона до механики движений.",
              icon: <Activity className="w-6 h-6" />,
            },
            {
              id: "02",
              title: "Биохимическая оптимизация",
              desc: "Настройка рациона и нагрузок для минимизации воспаления и максимизации анаболизма.",
              icon: <Zap className="w-6 h-6" />,
            },
            {
              id: "03",
              title: "Стабилизация результата",
              desc: "Создание устойчивых нейронных и физических привычек для естественного образа жизни.",
              icon: <ShieldCheck className="w-6 h-6" />,
            },
          ].map((step) => (
            <div
              key={step.id}
              className="bg-[#16181d] border border-white/5 p-8 rounded-[40px] relative group hover:border-[#f95700]/30 transition-all duration-500"
            >
              <div className="absolute top-6 right-8 text-4xl font-black text-white/5 group-hover:text-[#f95700]/10 transition-colors">
                {step.id}
              </div>
              <div className="w-14 h-14 rounded-2xl bg-[#f95700]/10 flex items-center justify-center text-[#f95700] mb-6 group-hover:scale-110 transition-transform">
                {step.icon}
              </div>
              <h4 className="text-xl font-black italic uppercase mb-4 text-white group-hover:text-[#f95700] transition-colors">
                {step.title}
              </h4>
              <p className="text-zinc-500 text-sm leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 bg-gradient-to-br from-[#f95700]/10 to-transparent border border-[#f95700]/20 rounded-[48px] p-8 md:p-12 flex flex-col md:flex-row items-center gap-8 group">
          <div className="relative w-32 h-32 shrink-0">
            <div className="absolute inset-0 bg-[#f95700]/20 blur-2xl animate-pulse" />
            <svg className="w-full h-full text-[#f95700]" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                strokeDasharray="5 5"
                className="animate-spin-slow"
              />
              <circle
                cx="50"
                cy="50"
                r="35"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeDasharray="15 5"
                style={{ animation: "reverse-spin 10s linear infinite" }}
              />
              <Activity className="absolute inset-0 m-auto w-8 h-8 text-[#f95700]" />
            </svg>
          </div>
          <div className="flex-1 text-center md:text-left">
            <h4 className="text-2xl font-black italic uppercase text-white mb-2">
              Синергия систем
            </h4>
            <p className="text-zinc-400 text-sm leading-relaxed max-w-xl">
              Методология работает только тогда, когда все три компонента объединены в единую
              стратегию. Нарушение одного звена ведет к дестабилизации всей системы здоровья.
            </p>
          </div>
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 min-w-[160px]">
            <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1">
              Health Synergy
            </div>
            <div className="text-3xl font-black italic tracking-tighter text-[#f95700]">
              OPTIMIZED
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
