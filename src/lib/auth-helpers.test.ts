import { describe, it, expect, vi, beforeEach } from "vitest";
import { getAuthenticatedUser } from "./auth-helpers";
import { getServerSession } from "next-auth";
import { getPrismaClient } from "@/lib/prisma";

vi.mock("next-auth", () => ({
  getServerSession: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  authOptions: {},
}));

vi.mock("@/lib/prisma", () => ({
  getPrismaClient: vi.fn(),
}));

describe("auth-helpers: getAuthenticatedUser", () => {
  const mockFindFirst = vi.fn();
  const mockedGetServerSession = vi.mocked(getServerSession);
  const mockedGetPrismaClient = vi.mocked(getPrismaClient);

  type AuthResult = Awaited<ReturnType<typeof getAuthenticatedUser>>;

  const expectErrorResult = async (result: AuthResult) => {
    if (!("error" in result)) {
      throw new Error("Expected auth error result");
    }

    return result.error;
  };

  const expectSuccessResult = (result: AuthResult) => {
    if (!("user" in result)) {
      throw new Error("Expected auth success result");
    }

    return result;
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockedGetPrismaClient.mockReturnValue({
      user: { findFirst: mockFindFirst },
    } as never);
  });

  it("должен вернуть ошибку Unauthorized, если нет сессии", async () => {
    mockedGetServerSession.mockResolvedValue(null as never);

    const result = await getAuthenticatedUser();
    const error = await expectErrorResult(result);
    expect(error.status).toBe(401);
    expect(await error.json()).toEqual({ error: "Unauthorized" });
  });

  it("должен вернуть ошибку Unauthorized, если в сессии нет id и email", async () => {
    mockedGetServerSession.mockResolvedValue({ user: { name: "Test" } } as never);

    const result = await getAuthenticatedUser();
    const error = await expectErrorResult(result);
    expect(error.status).toBe(401);
    expect(await error.json()).toEqual({ error: "Unauthorized" });
  });

  it("должен вернуть пользователя по id", async () => {
    const fakeUser = { id: "123", email: null, role: "CLIENT" };
    mockedGetServerSession.mockResolvedValue({ user: { id: "123" } } as never);
    mockFindFirst.mockResolvedValue(fakeUser);

    const result = await getAuthenticatedUser();
    const success = expectSuccessResult(result);
    expect(success.user).toEqual(fakeUser);
    expect(mockFindFirst).toHaveBeenCalledWith({
      where: { OR: [{ id: "123" }] },
    });
  });

  it("должен вернуть пользователя по telegram", async () => {
    const fakeUser = { id: "123", email: null, role: "CLIENT" };
    mockedGetServerSession.mockResolvedValue({ user: { telegram: "@testuser" } } as never);
    mockFindFirst.mockResolvedValue(fakeUser);

    const result = await getAuthenticatedUser();
    const success = expectSuccessResult(result);
    expect(success.user).toEqual(fakeUser);
    expect(mockFindFirst).toHaveBeenCalledWith({
      where: {
        OR: [{ telegram: "@testuser" }, { telegram: "testuser" }, { telegram: "@testuser" }],
      },
    });
  });

  it("должен вернуть пользователя по телефону", async () => {
    const fakeUser = { id: "123", email: null, role: "CLIENT" };
    mockedGetServerSession.mockResolvedValue({ user: { phone: "+7 (999) 111-22-33" } } as never);
    mockFindFirst.mockResolvedValue(fakeUser);

    const result = await getAuthenticatedUser();
    const success = expectSuccessResult(result);
    expect(success.user).toEqual(fakeUser);
    expect(mockFindFirst).toHaveBeenCalledWith({
      where: {
        OR: [{ phone: "+7 (999) 111-22-33" }, { phone: "+79991112233" }],
      },
    });
  });

  it("должен вернуть ошибку User not found, если юзера нет в БД", async () => {
    mockedGetServerSession.mockResolvedValue({ user: { email: "test@test.com" } } as never);
    mockFindFirst.mockResolvedValue(null);

    const result = await getAuthenticatedUser();
    const error = await expectErrorResult(result);
    expect(error.status).toBe(404);
    expect(await error.json()).toEqual({ error: "User not found" });
  });

  it("должен успешно вернуть пользователя из БД", async () => {
    const fakeUser = { id: "123", email: "test@test.com", role: "CLIENT" };
    mockedGetServerSession.mockResolvedValue({ user: { email: "test@test.com" } } as never);
    mockFindFirst.mockResolvedValue(fakeUser);

    const result = await getAuthenticatedUser();
    const success = expectSuccessResult(result);
    expect(success.user).toEqual(fakeUser);
  });
});
