import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getPrismaClient } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as
    | {
        code?: string;
        email?: string;
        password?: string;
        name?: string;
      }
    | null;

  const code = body?.code?.trim();
  const email = body?.email?.trim().toLowerCase();
  const password = body?.password;
  const name = body?.name?.trim();

  if (!code || !email || !password) {
    return NextResponse.json({ error: "invalid_payload" }, { status: 400 });
  }

  const prisma = getPrismaClient();

  const invite = await prisma.invite.findUnique({ where: { code } });
  if (!invite) {
    return NextResponse.json({ error: "invite_not_found" }, { status: 404 });
  }

  if (invite.usedAt || invite.usedByUserId) {
    return NextResponse.json({ error: "invite_already_used" }, { status: 409 });
  }

  if (invite.expiresAt && invite.expiresAt.getTime() < Date.now()) {
    return NextResponse.json({ error: "invite_expired" }, { status: 410 });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "email_already_taken" }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 12);

  try {
    const created = await prisma.$transaction(async (tx: any) => {
      const user = await tx.user.create({
        data: {
          email,
          name: name || null,
          passwordHash,
          role: invite.role,
        },
        select: { id: true, email: true, role: true },
      });

      await tx.invite.update({
        where: { id: invite.id },
        data: {
          usedAt: new Date(),
          usedByUserId: user.id,
        },
      });

      return user;
    });

    return NextResponse.json({ ok: true, user: created });
  } catch {
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}
