import Link from "next/link";
import { getAllRecipes } from "@/lib/content";

export const dynamic = "force-static";

export default function RecipesPage() {
  const recipes = getAllRecipes();
  const snacks = recipes.filter((r) => r.category === "перекусы");
  const desserts = recipes.filter((r) => r.category === "десерты");
  const other = recipes.filter((r) => r.category !== "перекусы" && r.category !== "десерты");

  const Section = ({ title, items }: { title: string; items: typeof recipes }) =>
    items.length > 0 ? (
      <section className="mt-4">
        <h2 className="mb-3 text-lg font-bold">{title}</h2>
        <div className="grid gap-3">
          {items.map((r) => (
            <Link
              key={r.slug}
              href={`/recipes/${r.slug}`}
              className="card p-4 hover:translate-y-[-1px] transition-transform"
            >
              <div className="font-extrabold tracking-tight">{r.title}</div>
              {r.description && <div className="mt-1.5 text-muted text-sm">{r.description}</div>}
              {r.kbru?.calories !== undefined && (
                <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted">
                  <span>{r.kbru.calories} ккал</span>
                  {r.kbru.protein !== undefined && <span>Б: {r.kbru.protein}</span>}
                  {r.kbru.fat !== undefined && <span>Ж: {r.kbru.fat}</span>}
                  {r.kbru.carbs !== undefined && <span>У: {r.kbru.carbs}</span>}
                </div>
              )}
            </Link>
          ))}
        </div>
      </section>
    ) : null;

  return (
    <main>
      <section className="card p-6 border-zinc-200/90 shadow-lg">
        <h1 className="m-0 text-[28px] leading-[1.15] tracking-[-0.03em] font-bold">Рецепты</h1>
        <p className="mt-2 text-muted text-base leading-relaxed max-w-[64ch]">
          Подборка рецептов с описанием и видео. Открывай карточку — внутри пошаговая инструкция.
        </p>
      </section>

      <Section title="Перекусы" items={snacks} />
      <Section title="Десерты" items={desserts} />
      <Section title="Остальное" items={other} />
    </main>
  );
}
