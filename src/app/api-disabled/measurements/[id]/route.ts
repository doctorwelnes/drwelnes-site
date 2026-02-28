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
        date?: unknown;
        weightKg?: unknown;
        waistCm?: unknown;
        hipsCm?: unknown;
        chestCm?: unknown;
        bicepsCm?: unknown;
        note?: unknown;
      }
    | null;

  const dateRaw =
    body?.date === undefined
      ? undefined
      : typeof body?.date === "string"
        ? body.date
        : null;

  if (dateRaw === null) {
    return NextResponse.json({ error: "invalid_date" }, { status: 400 });
  }

  const date = dateRaw === undefined ? undefined : new Date(dateRaw);
  if (date !== undefined && Number.isNaN(date.getTime())) {
    return NextResponse.json({ error: "invalid_date" }, { status: 400 });
  }

  const note = typeof body?.note === "string" ? body.note.trim() : undefined;

  const toDecimalStringOrNullOrUndefined = (v: unknown) => {
    if (v === undefined) return undefined;
    if (v === null) return null;
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

  const weightKg = toDecimalStringOrNullOrUndefined(body?.weightKg);
  const waistCm = toDecimalStringOrNullOrUndefined(body?.waistCm);
  const hipsCm = toDecimalStringOrNullOrUndefined(body?.hipsCm);
  const chestCm = toDecimalStringOrNullOrUndefined(body?.chestCm);
  const bicepsCm = toDecimalStringOrNullOrUndefined(body?.bicepsCm);

  if (weightKg === undefined && body?.weightKg !== undefined) {
    return NextResponse.json({ error: "invalid_weight" }, { status: 400 });
  }
  if (waistCm === undefined && body?.waistCm !== undefined) {
    return NextResponse.json({ error: "invalid_waist" }, { status: 400 });
  }
  if (hipsCm === undefined && body?.hipsCm !== undefined) {
    return NextResponse.json({ error: "invalid_hips" }, { status: 400 });
  }
  if (chestCm === undefined && body?.chestCm !== undefined) {
    return NextResponse.json({ error: "invalid_chest" }, { status: 400 });
  }
  if (bicepsCm === undefined && body?.bicepsCm !== undefined) {
    return NextResponse.json({ error: "invalid_biceps" }, { status: 400 });
  }

  const prisma = getPrismaClient();
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const exists = await prisma.measurementEntry.findFirst({
    where: { id, userId: user.id },
    select: { id: true },
  });

  if (!exists) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  try {
    const updated = await prisma.measurementEntry.update({
      where: { id },
      data: {
        ...(date !== undefined ? { date } : {}),
        ...(weightKg !== undefined ? { weightKg: weightKg as any } : {}),
        ...(waistCm !== undefined ? { waistCm: waistCm as any } : {}),
        ...(hipsCm !== undefined ? { hipsCm: hipsCm as any } : {}),
        ...(chestCm !== undefined ? { chestCm: chestCm as any } : {}),
        ...(bicepsCm !== undefined ? { bicepsCm: bicepsCm as any } : {}),
        ...(note !== undefined ? { note: note || null } : {}),
      },
      select: {
        id: true,
        date: true,
        weightKg: true,
        waistCm: true,
        hipsCm: true,
        chestCm: true,
        bicepsCm: true,
        note: true,
      },
    });

    return NextResponse.json({ measurement: updated });
  } catch (e: any) {
    const msg = String(e?.message || "");
    if (msg.includes("Unique constraint") || msg.includes("P2002")) {
      return NextResponse.json({ error: "already_exists_for_date" }, { status: 409 });
    }
    throw e;
  }
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

  const exists = await prisma.measurementEntry.findFirst({
    where: { id, userId: user.id },
    select: { id: true },
  });

  if (!exists) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  await prisma.measurementEntry.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
