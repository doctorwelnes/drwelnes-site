import { getPrismaClient } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const checks: Record<string, { status: string; latency_ms?: number; message?: string }> = {};

  // Database check
  const dbStart = Date.now();
  try {
    const prisma = getPrismaClient();
    await prisma.$executeRaw`SELECT 1`;
    checks.database = { status: "ok", latency_ms: Date.now() - dbStart };
  } catch (err) {
    checks.database = {
      status: "error",
      message: err instanceof Error ? err.message : "Database unreachable",
    };
  }

  const allHealthy = Object.values(checks).every((c) => c.status === "ok");

  return NextResponse.json(
    {
      status: allHealthy ? "ok" : "degraded",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      checks,
    },
    { status: allHealthy ? 200 : 503 },
  );
}
