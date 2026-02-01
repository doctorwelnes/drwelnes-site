import Image from "next/image";

import HomeClient from "./ui/home-client";

export default function Home() {
  return (
    <main>
      <div className="mx-auto max-w-2xl rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-3">
          <Image src="/favicon.ico" alt="Dr.Welnes" width={32} height={32} />
          <h1 className="text-2xl font-semibold">Главная</h1>
        </div>
        <HomeClient />
      </div>
    </main>
  );
}
