import { Fingerprint, Brain, InfinityIcon } from "lucide-react";

export function AboutPhilosophy() {
  return (
    <section className="mb-24 md:mb-32">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <h2 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter leading-none">
            Моя <span className="text-zinc-500">Философия</span>
          </h2>
        </div>
        <p className="max-w-xs text-zinc-500 text-sm leading-relaxed md:text-right">
          Фундаментальные убеждения, на которых строится каждый план и каждая рекомендация
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {[
          {
            title: "Биологическая честность",
            desc: "Я не предлагаю «волшебные таблетки». Мы работаем с реальной физиологией вашего организма, учитывая его генетические и биохимические пределы.",
            icon: <Fingerprint className="w-6 h-6" />,
          },
          {
            title: "Интеллектуальный контроль",
            desc: "Моя цель — сделать вас экспертом собственного тела. Вы будете понимать «почему» и «как» работает каждое решение в вашей программе.",
            icon: <Brain className="w-6 h-6" />,
          },
          {
            title: "Устойчивая трансформация",
            desc: "Результат, который невозможно удержать, не имеет смысла. Мы строим систему, которая станет частью вашей жизни навсегда.",
            icon: <InfinityIcon className="w-6 h-6" />,
          },
        ].map((item, idx) => (
          <div
            key={idx}
            className="group p-8 rounded-[32px] bg-white/5 border border-white/5 hover:border-[#f95700]/20 hover:bg-white/[0.07] transition-all duration-500 animate-in fade-in slide-in-from-bottom-6 block"
            style={{ animationDelay: `${idx * 200}ms` }}
          >
            <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-white/5 flex items-center justify-center text-[#f95700] mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
              {item.icon}
            </div>
            <h4 className="text-lg font-black italic uppercase mb-3 group-hover:text-[#f95700] transition-colors">
              {item.title}
            </h4>
            <p className="text-zinc-500 text-sm leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
