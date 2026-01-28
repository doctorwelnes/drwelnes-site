import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/lib/auth";
import { getPrismaClient } from "@/lib/prisma";

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

  const items = await prisma.measurementEntry.findMany({
    where: { userId: user.id },
    orderBy: { date: "desc" },
    take: 100,
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

  return NextResponse.json({ measurements: items });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
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

  const dateRaw = typeof body?.date === "string" ? body.date : "";
  const note = typeof body?.note === "string" ? body.note.trim() : "";

  if (!dateRaw) {
    return NextResponse.json({ error: "date_required" }, { status: 400 });
  }

  const date = new Date(dateRaw);
  if (Number.isNaN(date.getTime())) {
    return NextResponse.json({ error: "invalid_date" }, { status: 400 });
  }

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

  const weightKg = toDecimalStringOrNull(body?.weightKg);
  const waistCm = toDecimalStringOrNull(body?.waistCm);
  const hipsCm = toDecimalStringOrNull(body?.hipsCm);
  const chestCm = toDecimalStringOrNull(body?.chestCm);
  const bicepsCm = toDecimalStringOrNull(body?.bicepsCm);

  const prisma = getPrismaClient();
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const created = await prisma.measurementEntry.create({
      data: {
        userId: user.id,
        date,
        weightKg: weightKg as any,
        waistCm: waistCm as any,
        hipsCm: hipsCm as any,
        chestCm: chestCm as any,
        bicepsCm: bicepsCm as any,
        note: note || null,
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

    return NextResponse.json({ measurement: created }, { status: 201 });
  } catch (e: any) {
    const msg = String(e?.message || "");
    if (msg.includes("Unique constraint") || msg.includes("P2002")) {
      return NextResponse.json({ error: "already_exists_for_date" }, { status: 409 });
    }
    throw e;
  }
}
