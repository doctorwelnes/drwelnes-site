import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/lib/auth";
import { getPrismaClient } from "@/lib/prisma";

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id: workoutId } = await ctx.params;
  if (!workoutId) {
    return NextResponse.json({ error: "invalid_workout_id" }, { status: 400 });
  }

  const body = (await req.json().catch(() => null)) as
    | {
        exerciseName?: unknown;
        note?: unknown;
      }
    | null;

  const exerciseName = typeof body?.exerciseName === "string" ? body.exerciseName.trim() : "";
  const note = typeof body?.note === "string" ? body.note.trim() : "";

  if (!exerciseName) {
    return NextResponse.json({ error: "exercise_name_required" }, { status: 400 });
  }

  const prisma = getPrismaClient();
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const workout = await prisma.workoutSession.findFirst({
    where: { id: workoutId, userId: user.id },
    select: { id: true },
  });

  if (!workout) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const last = await prisma.exerciseLog.findFirst({
    where: { workoutSessionId: workoutId },
    orderBy: [{ position: "desc" }, { id: "desc" }],
    select: { position: true },
  });

  const position = (last?.position ?? -1) + 1;

  const created = await prisma.exerciseLog.create({
    data: {
      workoutSessionId: workoutId,
      exerciseName,
      note: note || null,
      position,
    },
    select: {
      id: true,
      workoutSessionId: true,
      exerciseName: true,
      note: true,
      position: true,
    },
  });

  return NextResponse.json({ exercise: created }, { status: 201 });
}
