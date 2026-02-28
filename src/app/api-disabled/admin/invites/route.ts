import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import crypto from "crypto";

import { authOptions } from "@/lib/auth";
import { getPrismaClient } from "@/lib/prisma";

export const runtime = "nodejs";

function assertAdmin(session: any) {
  if (!session) return false;
  return session.role === "ADMIN";
}

export async function GET() {
  const session = (await getServerSession(authOptions)) as any;
  if (!assertAdmin(session)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const prisma = getPrismaClient();
  const invites = await prisma.invite.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return NextResponse.json({
    invites: invites.map((i) => ({
      id: i.id,
      code: i.code,
      role: i.role,
      createdAt: i.createdAt.toISOString(),
      expiresAt: i.expiresAt ? i.expiresAt.toISOString() : null,
      usedAt: i.usedAt ? i.usedAt.toISOString() : null,
      usedByUserId: i.usedByUserId,
    })),
  });
}

export async function POST(req: Request) {
  const session = (await getServerSession(authOptions)) as any;
  if (!assertAdmin(session)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const body = (await req.json().catch(() => null)) as
    | {
        expiresDays?: number | null;
      }
    | null;

  const expiresDays = body?.expiresDays;
  const expiresAt =
    typeof expiresDays === "number" && Number.isFinite(expiresDays)
      ? new Date(Date.now() + expiresDays * 24 * 60 * 60 * 1000)
      : null;

  const prisma = getPrismaClient();

  const code = crypto.randomUUID().slice(0, 8).toUpperCase();

  const invite = await prisma.invite.create({
    data: {
      code,
      role: "CLIENT",
      expiresAt,
    },
  });

  return NextResponse.json({
    invite: {
      id: invite.id,
      code: invite.code,
      role: invite.role,
      createdAt: invite.createdAt.toISOString(),
      expiresAt: invite.expiresAt ? invite.expiresAt.toISOString() : null,
      usedAt: invite.usedAt ? invite.usedAt.toISOString() : null,
      usedByUserId: invite.usedByUserId,
    },
  });
}
