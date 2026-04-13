interface AboutCTAProps {
  onOpenBooking: () => void;
}

export function AboutCTA({ onOpenBooking }: AboutCTAProps) {
  return (
    <section className="relative rounded-3xl md:rounded-[40px] overflow-hidden bg-linear-to-br from-zinc-900 to-[#16181d] border border-white/5 px-6 py-12 sm:px-10 md:p-20 text-center flex flex-col items-center justify-center">
      <div className="relative z-10 max-w-2xl mx-auto space-y-6 md:space-y-8 w-full">
        <h2 className="text-2xl sm:text-3xl md:text-5xl font-black italic uppercase leading-tight hyphens-auto">
          Готовы к <span className="text-[#f95700]">научной</span> трансформации?
        </h2>
        <p className="text-zinc-400 text-sm sm:text-base md:text-lg">
          Давайте обсудим ваши цели и построим план, который действительно будет работать именно для
          вас.
        </p>
        <div className="pt-4 flex justify-center">
          <button
            onClick={onOpenBooking}
            className="px-8 py-4 bg-white text-black rounded-full font-black uppercase tracking-widest hover:bg-[#f95700] hover:text-white transition-all transform hover:scale-105 active:scale-95 shadow-xl relative z-20"
          >
            Начать сотрудничество
          </button>
        </div>
      </div>
      {/* Abstract background decor */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#f95700]/10 blur-[100px] rounded-full" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 blur-[100px] rounded-full" />
    </section>
  );
}
