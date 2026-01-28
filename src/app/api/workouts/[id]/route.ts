import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/lib/auth";
import { getPrismaClient } from "@/lib/prisma";

export async function GET(
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

  const workout = await prisma.workoutSession.findFirst({
    where: { id, userId: user.id },
    select: {
      id: true,
      title: true,
      startedAt: true,
      endedAt: true,
      rpe: true,
      note: true,
      createdAt: true,
      exercises: {
        orderBy: [{ position: "asc" }, { id: "asc" }],
        select: {
          id: true,
          exerciseName: true,
          note: true,
          position: true,
          sets: {
            orderBy: [{ position: "asc" }, { id: "asc" }],
            select: {
              id: true,
              position: true,
              reps: true,
              weightKg: true,
              timeSec: true,
              distanceM: true,
            },
          },
        },
      },
    },
  });

  if (!workout) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  return NextResponse.json({ workout });
}

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
        title?: unknown;
        endedAt?: unknown;
        rpe?: unknown;
        note?: unknown;
      }
    | null;

  const title = typeof body?.title === "string" ? body.title.trim() : undefined;
  const note = typeof body?.note === "string" ? body.note.trim() : undefined;
  const endedAtRaw =
    body?.endedAt === null
      ? null
      : typeof body?.endedAt === "string"
        ? body.endedAt
        : undefined;

  const rpeRaw = body?.rpe;
  const rpeNum =
    rpeRaw === null
      ? null
      : typeof rpeRaw === "number"
        ? rpeRaw
        : typeof rpeRaw === "string"
          ? Number(rpeRaw)
          : undefined;

  if (rpeNum !== undefined) {
    if (rpeNum !== null && (!Number.isFinite(rpeNum) || rpeNum < 1 || rpeNum > 10)) {
      return NextResponse.json({ error: "invalid_rpe" }, { status: 400 });
    }
  }

  let endedAt: Date | null | undefined = undefined;
  if (endedAtRaw !== undefined) {
    if (endedAtRaw === null) {
      endedAt = null;
    } else {
      const d = new Date(endedAtRaw);
      if (Number.isNaN(d.getTime())) {
        return NextResponse.json({ error: "invalid_endedAt" }, { status: 400 });
      }
      endedAt = d;
    }
  }

  const prisma = getPrismaClient();
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const exists = await prisma.workoutSession.findFirst({
    where: { id, userId: user.id },
    select: { id: true, startedAt: true },
  });
  if (!exists) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  if (endedAt && endedAt.getTime() < exists.startedAt.getTime()) {
    return NextResponse.json({ error: "ended_before_started" }, { status: 400 });
  }

  const updated = await prisma.workoutSession.update({
    where: { id },
    data: {
      ...(title !== undefined ? { title } : {}),
      ...(note !== undefined ? { note: note || null } : {}),
      ...(endedAt !== undefined ? { endedAt } : {}),
      ...(rpeNum !== undefined ? { rpe: rpeNum === null ? null : Math.trunc(rpeNum) } : {}),
    },
    select: {
      id: true,
      title: true,
      startedAt: true,
      endedAt: true,
      rpe: true,
      note: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ workout: updated });
}
