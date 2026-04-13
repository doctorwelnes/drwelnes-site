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

  if (!session?.user?.email) {
    return {
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  const prisma = getPrismaClient();
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    return {
      error: NextResponse.json({ error: "User not found" }, { status: 404 }),
    };
  }

  return { user };
}
