import { getAllExercises, getExerciseBySlug } from "@/lib/content";
import { notFound } from "next/navigation";
import ExerciseDetailClient from "./exercise-detail-client";

export const dynamic = "force-static";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  const exercise = getExerciseBySlug(decodedSlug);

  if (!exercise) return {};

  return {
    title: exercise.title,
    description:
      exercise.description ||
      `Упражнение: ${exercise.title}. Техника выполнения на сайте Dr.Welnes.`,
    openGraph: {
      title: exercise.title,
      description: exercise.description,
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
  return getAllExercises().map((e) => ({ slug: e.slug }));
}

export default async function ExerciseSlugPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const exercise = getExerciseBySlug(decodeURIComponent(slug));
  if (!exercise) notFound();

  return <ExerciseDetailClient exercise={exercise} />;
}
