import { getAllTheory, getTheoryBySlug } from "@/lib/content";
import { notFound } from "next/navigation";

export const dynamic = "force-static";

export async function generateStaticParams() {
  return getAllTheory().map((a) => ({ slug: a.slug }));
}

export default async function TheorySlugPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = getTheoryBySlug(decodeURIComponent(slug));
  if (!article) notFound();

  return (
    <main>
      <article className="card p-6 border-zinc-200/90 shadow-lg">
        <h1 className="m-0 text-[28px] leading-[1.15] tracking-[-0.03em] font-bold">
          {article.title}
        </h1>
        {article.description && (
          <p className="mt-2 text-muted leading-relaxed">{article.description}</p>
        )}
        {article.body && (
          <div
            className="mt-4 prose prose-zinc max-w-none"
            dangerouslySetInnerHTML={{ __html: article.body.replace(/\n/g, "<br />") }}
          />
        )}
        {article.tags && article.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {article.tags.map((tag) => (
              <span
                key={tag}
                className="px-2.5 py-1 rounded-full text-xs font-medium bg-zinc-100 text-zinc-600"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </article>
    </main>
  );
}
