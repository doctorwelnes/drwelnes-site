import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/lib/auth";
import { getPrismaClient } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const prisma = getPrismaClient();
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const templates = await prisma.workoutTemplate.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      exercises: {
        orderBy: { position: "asc" },
      },
    },
  });

  return NextResponse.json({
    templates: (templates as any[]).map((t: any) => ({
      id: t.id as string,
      title: t.title as string,
      note: (t.note ?? null) as string | null,
      createdAt: (t.createdAt as Date).toISOString(),
      exercises: (t.exercises as any[]).map((e: any) => ({
        id: e.id as string,
        exerciseName: e.exerciseName as string,
        position: (e.position ?? null) as number | null,
      })),
    })),
  });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = (await req.json().catch(() => null)) as
    | {
        title?: unknown;
        note?: unknown;
        exercises?: unknown;
      }
    | null;

  const title = typeof body?.title === "string" ? body.title.trim() : "";
  const note = typeof body?.note === "string" ? body.note.trim() : "";
  const exercisesRaw = Array.isArray(body?.exercises) ? body?.exercises : null;

  if (!title) {
    return NextResponse.json({ error: "title_required" }, { status: 400 });
  }

  const exercises = (exercisesRaw ?? [])
    .map((x) => (typeof x === "string" ? x.trim() : ""))
    .filter(Boolean);

  if (exercises.length === 0) {
    return NextResponse.json({ error: "exercises_required" }, { status: 400 });
  }

  const prisma = getPrismaClient();
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const created = await prisma.workoutTemplate.create({
    data: {
      userId: user.id,
      title,
      note: note || null,
      exercises: {
        create: exercises.map((name: string, idx: number) => ({
          exerciseName: name,
          position: idx + 1,
        })),
      },
    },
    include: {
      exercises: {
        orderBy: { position: "asc" },
      },
    },
  });

  return NextResponse.json(
    {
      template: {
        id: (created as any).id as string,
        title: (created as any).title as string,
        note: ((created as any).note ?? null) as string | null,
        createdAt: ((created as any).createdAt as Date).toISOString(),
        exercises: (((created as any).exercises ?? []) as any[]).map((e: any) => ({
          id: e.id as string,
          exerciseName: e.exerciseName as string,
          position: (e.position ?? null) as number | null,
        })),
      },
    },
    { status: 201 }
  );
}
