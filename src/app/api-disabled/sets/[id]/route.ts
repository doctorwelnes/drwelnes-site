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
        reps?: unknown;
        weightKg?: unknown;
      }
    | null;

  const repsRaw = body?.reps;
  const weightRaw = body?.weightKg;

  const repsNum =
    repsRaw === null
      ? null
      : typeof repsRaw === "number"
        ? repsRaw
        : typeof repsRaw === "string"
          ? Number(repsRaw)
          : undefined;

  if (repsNum !== undefined) {
    if (repsNum !== null && (!Number.isFinite(repsNum) || repsNum < 0)) {
      return NextResponse.json({ error: "invalid_reps" }, { status: 400 });
    }
  }

  const toDecimalStringOrNull = (v: unknown) => {
    if (v === null) return null;
    if (v === undefined) return undefined;
    if (typeof v === "number" && Number.isFinite(v)) return String(v);
    if (typeof v === "string") {
      const s = v.trim().replace(",", ".");
      if (!s) return null;
      const n = Number(s);
      if (!Number.isFinite(n)) return undefined;
      return String(n);
    }
    return undefined;
  };

  const weightKg = toDecimalStringOrNull(weightRaw);
  if (weightKg === undefined && weightRaw !== undefined) {
    return NextResponse.json({ error: "invalid_weight" }, { status: 400 });
  }

  const prisma = getPrismaClient();
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const exists = await prisma.setLog.findFirst({
    where: { id, exerciseLog: { workoutSession: { userId: user.id } } },
    select: { id: true },
  });

  if (!exists) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const updated = await prisma.setLog.update({
    where: { id },
    data: {
      ...(repsNum !== undefined
        ? { reps: repsNum === null ? null : Math.trunc(repsNum) }
        : {}),
      ...(weightKg !== undefined ? { weightKg: weightKg as any } : {}),
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

  return NextResponse.json({ set: updated });
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

  const exists = await prisma.setLog.findFirst({
    where: { id, exerciseLog: { workoutSession: { userId: user.id } } },
    select: { id: true },
  });

  if (!exists) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  await prisma.setLog.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
