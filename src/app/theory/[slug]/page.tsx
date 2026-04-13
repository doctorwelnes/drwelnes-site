import { getAllTheory, getTheoryBySlug } from "@/lib/content";
import { notFound } from "next/navigation";
import TheoryDetailClient from "../theory-detail-client";

export const dynamic = "force-static";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  const article = getTheoryBySlug(decodedSlug);

  if (!article) return {};

  return {
    title: article.title,
    description:
      article.description ||
      `Полезная статья: ${article.title}. Читайте больше в разделе теории на Dr.Welnes.`,
    openGraph: {
      title: article.title,
      description: article.description,
      type: "article",
      images: [
        {
          url: "/logo.png",
          width: 800,
          height: 600,
        },
      ],
    },
  };
}
export async function generateStaticParams() {
  return getAllTheory().map((a) => ({ slug: a.slug }));
}

export default async function TheorySlugPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = getTheoryBySlug(decodeURIComponent(slug));
  if (!article) notFound();

  return <TheoryDetailClient article={article} />;
}
