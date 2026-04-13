import { describe, it, expect, vi, beforeEach } from "vitest";
import { getAuthenticatedUser } from "./auth-helpers";
import { getServerSession } from "next-auth/next";
import { getPrismaClient } from "@/lib/prisma";

vi.mock("next-auth/next", () => ({
  getServerSession: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  authOptions: {},
}));

vi.mock("@/lib/prisma", () => ({
  getPrismaClient: vi.fn(),
}));

describe("auth-helpers: getAuthenticatedUser", () => {
  const mockFindUnique = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (getPrismaClient as any).mockReturnValue({
      user: { findUnique: mockFindUnique },
    });
  });

  it("должен вернуть ошибку Unauthorized, если нет сессии", async () => {
    (getServerSession as any).mockResolvedValue(null);

    const result = await getAuthenticatedUser();
    expect(result.error).toBe("Unauthorized");
    expect(result.status).toBe(401);
  });

  it("должен вернуть ошибку Unauthorized, если в сессии нет email", async () => {
    (getServerSession as any).mockResolvedValue({ user: { name: "Test" } });

    const result = await getAuthenticatedUser();
    expect(result.error).toBe("Unauthorized");
    expect(result.status).toBe(401);
  });

  it("должен вернуть ошибку User not found, если юзера нет в БД", async () => {
    (getServerSession as any).mockResolvedValue({ user: { email: "test@test.com" } });
    mockFindUnique.mockResolvedValue(null);

    const result = await getAuthenticatedUser();
    expect(result.error).toBe("User not found");
    expect(result.status).toBe(404);
  });

  it("должен успешно вернуть пользователя из БД", async () => {
    const fakeUser = { id: "123", email: "test@test.com", role: "CLIENT" };
    (getServerSession as any).mockResolvedValue({ user: { email: "test@test.com" } });
    mockFindUnique.mockResolvedValue(fakeUser);

    const result = await getAuthenticatedUser();
    expect(result.error).toBeUndefined();
    expect(result.user).toEqual(fakeUser);
  });
});
