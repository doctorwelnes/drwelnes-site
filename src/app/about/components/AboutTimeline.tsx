import { ShieldCheck, GraduationCap, Activity } from "lucide-react";

export function AboutTimeline() {
  return (
    <section className="mb-32">
      <h2 className="text-2xl font-black uppercase tracking-widest text-zinc-600 mb-12">
        этапы моего становления
      </h2>
      <div className="space-y-4">
        {[
          {
            year: "2014 - 2019",
            title: "Критическая медицина",
            desc: "Врач анестезиолог-реаниматолог. Работа в условиях экстремальной интенсивности, глубокое изучение физиологии выживания и систем восстановления.",
            icon: <ShieldCheck />,
          },
          {
            year: "2021 - 2026",
            title: "Спортивная специализация",
            desc: "Врач по спортивной медицине и физической реабилитационной медицине. Фокус на механобиобиологии и метаболической адаптации.",
            icon: <GraduationCap />,
          },
          {
            year: "2025 - 2026",
            title: "Advanced Retraining",
            desc: "Углубленная переподготовка по высокотехнологичной реабилитации и спортивной фармакологии.",
            icon: <Activity />,
          },
        ].map((item, idx) => (
          <div
            key={idx}
            className="group relative bg-white/5 hover:bg-white/10 border border-white/5 p-6 md:p-8 rounded-3xl transition-all animate-in fade-in slide-in-from-left-8 duration-700 fill-mode-both"
            style={{ animationDelay: `${idx * 150}ms` }}
          >
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <div className="text-[#f95700] font-black tabular-nums text-xl min-w-[120px]">
                {item.year}
              </div>
              <div className="flex-1">
                <h4 className="text-xl font-bold text-white mb-2">{item.title}</h4>
                <p className="text-zinc-500">{item.desc}</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-zinc-900 flex items-center justify-center text-[#f95700] group-hover:scale-110 transition-transform">
                {item.icon}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
