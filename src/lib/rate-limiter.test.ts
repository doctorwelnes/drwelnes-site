import { describe, it, expect } from "vitest";
import {
  getClientIP,
  applyRateLimit,
  authLimiter,
  writeLimiter,
  generalLimiter,
} from "./rate-limiter";
import { NextRequest } from "next/server";

describe("getClientIP", () => {
  it("should return IP from x-forwarded-for header", () => {
    const req = {
      headers: new Map([["x-forwarded-for", "192.168.1.1, 10.0.0.1"]]),
    } as unknown as NextRequest;

    expect(getClientIP(req)).toBe("192.168.1.1");
  });

  it("should return IP from x-real-ip header", () => {
    const req = {
      headers: new Map([["x-real-ip", "192.168.1.2"]]),
    } as unknown as NextRequest;

    expect(getClientIP(req)).toBe("192.168.1.2");
  });

  it("should return 'unknown' when no IP headers present", () => {
    const req = {
      headers: new Map(),
    } as unknown as NextRequest;

    expect(getClientIP(req)).toBe("unknown");
  });

  it("should prefer x-forwarded-for over x-real-ip", () => {
    const req = {
      headers: new Map([
        ["x-forwarded-for", "10.0.0.1"],
        ["x-real-ip", "192.168.1.1"],
      ]),
    } as unknown as NextRequest;

    expect(getClientIP(req)).toBe("10.0.0.1");
  });
});

describe("Rate Limiters Configuration", () => {
  it("authLimiter should have correct configuration", () => {
    expect(authLimiter.points).toBe(5);
    expect(authLimiter.duration).toBe(60);
  });

  it("writeLimiter should have correct configuration", () => {
    expect(writeLimiter.points).toBe(20);
    expect(writeLimiter.duration).toBe(60);
  });

  it("generalLimiter should have correct configuration", () => {
    expect(generalLimiter.points).toBe(100);
    expect(generalLimiter.duration).toBe(60);
  });
});

describe("applyRateLimit", () => {
  it("should return null when under limit", async () => {
    const req = {
      headers: new Map([["x-forwarded-for", "192.168.1.1"]]),
    } as unknown as NextRequest;

    // Use a fresh limiter instance to ensure we're under the limit
    const result = await applyRateLimit(req, generalLimiter, "test-ip-1");
    expect(result).toBeNull();
  });

  it("should return NextResponse when limit exceeded", async () => {
    const req = {
      headers: new Map([["x-forwarded-for", "192.168.1.2"]]),
    } as unknown as NextRequest;

    // Use authLimiter with only 1 point for easier testing
    const testLimiter = authLimiter;

    // Consume all points first
    await testLimiter.consume("test-ip-2");
    await testLimiter.consume("test-ip-2");
    await testLimiter.consume("test-ip-2");
    await testLimiter.consume("test-ip-2");
    await testLimiter.consume("test-ip-2");

    // Next request should be blocked
    const result = await applyRateLimit(req, testLimiter, "test-ip-2");

    expect(result).not.toBeNull();
    expect(result?.status).toBe(429);
    expect(result?.headers.get("Retry-After")).toBeDefined();
  });
});
