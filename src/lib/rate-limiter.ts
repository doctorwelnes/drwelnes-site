import { RateLimiterMemory } from "rate-limiter-flexible";
import { NextRequest, NextResponse } from "next/server";

// General API rate limiter: 100 requests per minute per IP
export const generalLimiter = new RateLimiterMemory({
  keyPrefix: "general",
  points: 100,
  duration: 60,
});

// Strict rate limiter for auth endpoints: 5 requests per minute per IP
export const authLimiter = new RateLimiterMemory({
  keyPrefix: "auth",
  points: 5,
  duration: 60,
});

// Medium rate limiter for write operations: 20 requests per minute per IP
export const writeLimiter = new RateLimiterMemory({
  keyPrefix: "write",
  points: 20,
  duration: 60,
});

// Get client IP from request
export function getClientIP(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  const realIP = req.headers.get("x-real-ip");

  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  if (realIP) {
    return realIP;
  }

  return "unknown";
}

// Apply rate limiting and return response if limit exceeded
export async function applyRateLimit(
  req: NextRequest,
  limiter: RateLimiterMemory,
  ip?: string,
): Promise<NextResponse | null> {
  const clientIP = ip || getClientIP(req);

  try {
    await limiter.consume(clientIP);
    return null;
  } catch (rejRes: unknown) {
    const retryMs = (rejRes as { msBeforeNext?: number }).msBeforeNext || 60000;
    const retrySeconds = Math.round(retryMs / 1000);
    return NextResponse.json(
      { error: "Too many requests", retryAfter: retrySeconds },
      { status: 429, headers: { "Retry-After": String(retrySeconds) } },
    );
  }
}
