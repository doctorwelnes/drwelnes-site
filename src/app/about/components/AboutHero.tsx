import { Activity } from "lucide-react";

export function AboutHero() {
  return (
    <section className="mb-24 md:mb-32">
      <h1 className="text-4xl md:text-6xl lg:text-7xl font-black italic uppercase tracking-tighter leading-[0.9] mb-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
        Мой путь: От <span className="text-[#f95700]">реанимации</span> <br /> до высших достижений
      </h1>

      <div className="grid lg:grid-cols-2 gap-12 items-start animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200 fill-mode-both">
        <div className="space-y-6 text-zinc-400 text-lg leading-relaxed">
          <p>
            Я верю, что трансформация тела — это не просто вопрос дисциплины, а точная наука. Мой фундамент закладывался в течение 5 лет работы врачом{" "}
            <span className="text-white font-bold">анестезиологом-реаниматологом</span>. Это были годы, когда я каждый день видел границы человеческого организма и понимал, как работают основные системы жизнеобеспечения в критических условиях.
          </p>
          <p>
            Этот уникальный опыт дал мне понимание физиологии и биохимии на уровне, который недоступен обычным фитнес-консультантам. Я знаю, как стресс, питание и нагрузки влияют на каждую клетку нашего тела.
          </p>
        </div>
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-[#f95700] to-orange-400 rounded-3xl blur opacity-20 group-hover:opacity-30 transition duration-1000"></div>
          <div className="relative bg-[#16181d] border border-white/5 p-8 md:p-10 rounded-3xl backdrop-blur-xl">
            <div className="w-14 h-14 bg-[#f95700]/10 rounded-2xl flex items-center justify-center mb-6">
              <Activity className="w-8 h-8 text-[#f95700]" />
            </div>
            <h3 className="text-2xl font-black italic uppercase mb-4 text-white">Научный подход</h3>
            <p className="text-zinc-500 leading-relaxed">
              Сегодня я применяю все эти знания в области спортивной медицины и реабилитации. Моя цель — помочь вам изменить свое тело, опираясь на доказательную медицину, а не на догадки.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
