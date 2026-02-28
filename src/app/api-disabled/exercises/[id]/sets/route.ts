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

  const { id: exerciseLogId } = await ctx.params;
  if (!exerciseLogId) {
    return NextResponse.json({ error: "invalid_exercise_id" }, { status: 400 });
  }

  const body = (await req.json().catch(() => null)) as
    | {
        reps?: unknown;
        weightKg?: unknown;
      }
    | null;

  const reps = typeof body?.reps === "number" ? body.reps : typeof body?.reps === "string" ? Number(body.reps) : null;
  const weightKgRaw = body?.weightKg;

  const toDecimalStringOrNull = (v: unknown) => {
    if (v === null || v === undefined) return null;
    if (typeof v === "number" && Number.isFinite(v)) return String(v);
    if (typeof v === "string") {
      const s = v.trim().replace(",", ".");
      if (!s) return null;
      const n = Number(s);
      if (!Number.isFinite(n)) return null;
      return String(n);
    }
    return null;
  };

  const weightKg = toDecimalStringOrNull(weightKgRaw);

  const repsVal = reps === null || Number.isNaN(reps) ? null : Math.trunc(reps);

  if (repsVal !== null && repsVal < 0) {
    return NextResponse.json({ error: "invalid_reps" }, { status: 400 });
  }

  const prisma = getPrismaClient();
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const exercise = await prisma.exerciseLog.findFirst({
    where: { id: exerciseLogId, workoutSession: { userId: user.id } },
    select: { id: true },
  });

  if (!exercise) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const last = await prisma.setLog.findFirst({
    where: { exerciseLogId },
    orderBy: [{ position: "desc" }, { id: "desc" }],
    select: { position: true },
  });

  const position = (last?.position ?? -1) + 1;

  const created = await prisma.setLog.create({
    data: {
      exerciseLogId,
      position,
      reps: repsVal,
      weightKg: weightKg as any,
    },
    select: {
      id: true,
      exerciseLogId: true,
      position: true,
      reps: true,
      weightKg: true,
      timeSec: true,
      distanceM: true,
    },
  });

  return NextResponse.json({ set: created }, { status: 201 });
}
