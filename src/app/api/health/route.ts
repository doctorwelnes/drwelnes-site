import { NextResponse } from "next/server";
import { getPrismaClient } from "@/lib/prisma";
import { env } from "@/lib/env";

export async function GET() {
  const health = {
    status: "ok" as const,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    env: env.NODE_ENV,
    checks: {
      database: {
        status: "ok" as const,
      },
    },
  };

  try {
    const prisma = getPrismaClient();
    await prisma.$queryRaw`SELECT 1`;

    return NextResponse.json(health, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        ...health,
        status: "degraded" as const,
        checks: {
          database: {
            status: "error" as const,
            message: error instanceof Error ? error.message : "Database unreachable",
          },
        },
      },
      { status: 503 },
    );
  }
}
