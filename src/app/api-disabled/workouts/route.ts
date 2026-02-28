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

  const items = await prisma.workoutSession.findMany({
    where: { userId: user.id },
    orderBy: { startedAt: "desc" },
    take: 50,
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

  return NextResponse.json({ workouts: items });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = (await req.json().catch(() => null)) as
    | {
        title?: unknown;
        startedAt?: unknown;
      }
    | null;

  const title = typeof body?.title === "string" ? body.title.trim() : "";
  const startedAtRaw = typeof body?.startedAt === "string" ? body.startedAt : null;

  if (!title) {
    return NextResponse.json({ error: "title_required" }, { status: 400 });
  }

  const startedAt = startedAtRaw ? new Date(startedAtRaw) : new Date();
  if (Number.isNaN(startedAt.getTime())) {
    return NextResponse.json({ error: "invalid_startedAt" }, { status: 400 });
  }

  const prisma = getPrismaClient();
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const created = await prisma.workoutSession.create({
    data: {
      userId: user.id,
      title,
      startedAt,
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

  return NextResponse.json({ workout: created }, { status: 201 });
}
