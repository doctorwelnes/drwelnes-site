import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getPrismaClient } from "@/lib/prisma";
import type { User } from "@prisma/client";

interface AuthSuccess {
  user: User;
}

interface AuthFailure {
  error: NextResponse;
}

type AuthResult = AuthSuccess | AuthFailure;

/**
 * Common auth boilerplate for API routes.
 * Verifies session, looks up user, and returns the user object or an error response.
 *
 * Usage:
 * ```ts
 * const auth = await getAuthenticatedUser();
 * if ("error" in auth) return auth.error;
 * const { user } = auth;
 * ```
 */
export async function getAuthenticatedUser(): Promise<AuthResult> {
  const session = await getServerSession(authOptions);

  const sessionUserId = session?.user?.id;
  const sessionUserEmail = session?.user?.email;
  const sessionUserTelegram = session?.user?.telegram;
  const sessionUserPhone = session?.user?.phone;

  if (!sessionUserId && !sessionUserEmail && !sessionUserTelegram && !sessionUserPhone) {
    return {
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  const prisma = getPrismaClient();
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        ...(sessionUserId ? [{ id: sessionUserId }] : []),
        ...(sessionUserEmail ? [{ email: sessionUserEmail }] : []),
        ...(sessionUserTelegram
          ? [
              { telegram: sessionUserTelegram },
              { telegram: sessionUserTelegram.replace(/^@/, "") },
              { telegram: `@${sessionUserTelegram.replace(/^@/, "")}` },
            ]
          : []),
        ...(sessionUserPhone
          ? [{ phone: sessionUserPhone }, { phone: sessionUserPhone.replace(/[\s\-()]+/g, "") }]
          : []),
      ],
    },
  });

  if (!user) {
    return {
      error: NextResponse.json({ error: "User not found" }, { status: 404 }),
    };
  }

  return { user };
}
