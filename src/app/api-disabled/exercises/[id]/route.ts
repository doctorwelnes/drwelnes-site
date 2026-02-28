import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/lib/auth";
import { getPrismaClient } from "@/lib/prisma";

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params;
  if (!id) {
    return NextResponse.json({ error: "invalid_id" }, { status: 400 });
  }

  const body = (await req.json().catch(() => null)) as
    | {
        exerciseName?: unknown;
        note?: unknown;
      }
    | null;

  const exerciseName =
    typeof body?.exerciseName === "string" ? body.exerciseName.trim() : undefined;
  const note = typeof body?.note === "string" ? body.note.trim() : undefined;

  if (exerciseName !== undefined && !exerciseName) {
    return NextResponse.json({ error: "exercise_name_required" }, { status: 400 });
  }

  const prisma = getPrismaClient();
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const exists = await prisma.exerciseLog.findFirst({
    where: { id, workoutSession: { userId: user.id } },
    select: { id: true },
  });

  if (!exists) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const updated = await prisma.exerciseLog.update({
    where: { id },
    data: {
      ...(exerciseName !== undefined ? { exerciseName } : {}),
      ...(note !== undefined ? { note: note || null } : {}),
    },
    select: {
      id: true,
      workoutSessionId: true,
      exerciseName: true,
      note: true,
      position: true,
    },
  });

  return NextResponse.json({ exercise: updated });
}

export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params;
  if (!id) {
    return NextResponse.json({ error: "invalid_id" }, { status: 400 });
  }

  const prisma = getPrismaClient();
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const exists = await prisma.exerciseLog.findFirst({
    where: { id, workoutSession: { userId: user.id } },
    select: { id: true },
  });

  if (!exists) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  await prisma.exerciseLog.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
