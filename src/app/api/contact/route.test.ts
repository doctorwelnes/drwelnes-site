import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "./route";
import { NextRequest, NextResponse } from "next/server";

// Мокаем rate-limiter, чтобы не падать на лимитах
vi.mock("@/lib/rate-limiter", () => ({
  writeLimiter: {},
  applyRateLimit: vi.fn().mockResolvedValue(null),
}));

// Мокаем NextResponse
vi.mock("next/server", () => ({
  NextRequest: vi.fn(),
  NextResponse: {
    json: vi.fn((body, init) => ({ body, status: init?.status ?? 200 })),
  },
}));

describe("POST /api/contact", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("должен вернуть 400, если данные невалидны (нет имени)", async () => {
    const req = {
      json: vi.fn().mockResolvedValue({ contact: "123456" }), // Нет name
    } as unknown as NextRequest;

    const res = await POST(req);
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error", "Некорректные данные");
  });

  it("должен вернуть 400, если данные невалидны (короткий контакт)", async () => {
    const req = {
      json: vi.fn().mockResolvedValue({ name: "Иван", contact: "12" }), // Слишком короткий
    } as unknown as NextRequest;

    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("должен вернуть 200 и успешный ответ, если все данные валидны", async () => {
    const req = {
      json: vi.fn().mockResolvedValue({
        name: "Иван Иванов",
        contact: "+79998887766",
        message: "Хочу записаться на консультацию",
      }),
    } as unknown as NextRequest;

    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ success: true, message: "Заявка успешно отправлена" });
  });
});
