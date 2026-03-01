import Link from "next/link";
import { getAllTheory } from "@/lib/content";

export const dynamic = "force-static";

export default function TheoryPage() {
  const articles = getAllTheory();

  return (
    <main>
      <section className="card p-6 border-zinc-200/90 shadow-lg">
        <h1 className="m-0 text-[28px] leading-[1.15] tracking-[-0.03em] font-bold">Теория</h1>
        <p className="mt-2 text-muted text-base leading-relaxed max-w-[64ch]">
          Сложное простым языком: статьи по нутрициологии, спортивной медицине и восстановлению.
        </p>
      </section>

      <div className="grid gap-3 mt-4">
        {articles.length === 0 && <p className="text-muted text-sm">Статей пока нет.</p>}
        {articles.map((a) => (
          <Link
            key={a.slug}
            href={`/theory/${a.slug}`}
            className="card p-4 hover:translate-y-[-1px] transition-transform"
          >
            <div className="font-extrabold tracking-tight">{a.title}</div>
            {a.description && <div className="mt-1.5 text-muted text-sm">{a.description}</div>}
          </Link>
        ))}
      </div>
    </main>
  );
}
