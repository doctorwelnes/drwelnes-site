import { NextResponse } from "next/server";
import { getAllExercises } from "@/lib/content";

export async function GET() {
  try {
    const exercises = getAllExercises();
    const data = exercises.map((e) => ({
      slug: e.slug,
      title: e.title,
    }));
    return NextResponse.json(data);
  } catch (_error) {
    return NextResponse.json({ error: "Failed to fetch exercises" }, { status: 500 });
  }
}
