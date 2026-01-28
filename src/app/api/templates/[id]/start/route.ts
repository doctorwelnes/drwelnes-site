import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/lib/auth";
import { getPrismaClient } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(_req: Request, ctx: { params: Promise<{ id: string }> }) {
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

  const template = await prisma.workoutTemplate.findFirst({
    where: { id, userId: user.id },
    include: { exercises: { orderBy: { position: "asc" } } },
  });

  if (!template) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const created = await prisma.workoutSession.create({
    data: {
      userId: user.id,
      title: (template as any).title as string,
      startedAt: new Date(),
      exercises: {
        create: (((template as any).exercises ?? []) as any[]).map((e: any, idx: number) => ({
          exerciseName: e.exerciseName as string,
          position: idx + 1,
        })),
      },
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
