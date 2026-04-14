import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getPrismaClient } from "@/lib/prisma";

type RegisterMethod = "email" | "telegram" | "phone";

const normalizeEmail = (value: string) => value.trim().toLowerCase();
const normalizeTelegram = (value: string) => {
  const handle = value.trim().replace(/^@/, "").toLowerCase();
  return handle ? `@${handle}` : "";
};
const normalizePhone = (value: string) => value.replace(/[\s\-()]+/g, "");

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const method = body.method as RegisterMethod;
    const identifier = typeof body.identifier === "string" ? body.identifier.trim() : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (!name || !identifier || !password) {
      return NextResponse.json(
        { error: "Имя, способ регистрации, идентификатор и пароль обязательны" },
        { status: 400 },
      );
    }

    if (!["email", "telegram", "phone"].includes(method)) {
      return NextResponse.json({ error: "Некорректный способ регистрации" }, { status: 400 });
    }

    const prisma = getPrismaClient();

    const normalizedEmail = method === "email" ? normalizeEmail(identifier) : null;
    const normalizedTelegram = method === "telegram" ? normalizeTelegram(identifier) : null;
    const normalizedPhone = method === "phone" ? normalizePhone(identifier) : null;

    if (
      (method === "email" && !normalizedEmail) ||
      (method === "telegram" && !normalizedTelegram) ||
      (method === "phone" && !normalizedPhone)
    ) {
      return NextResponse.json({ error: "Укажите корректный идентификатор" }, { status: 400 });
    }

    const existingUser = await prisma.user.findFirst({
      where:
        method === "email"
          ? { email: normalizedEmail! }
          : method === "telegram"
            ? { telegram: normalizedTelegram! }
            : { phone: normalizedPhone! },
    });

    if (existingUser) {
      const errorByMethod = {
        email: "Пользователь с такой почтой уже существует",
        telegram: "Пользователь с таким Telegram уже существует",
        phone: "Пользователь с таким номером уже существует",
      } as const;

      return NextResponse.json({ error: errorByMethod[method] }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const userData = {
      name,
      passwordHash,
      role: "CLIENT" as const,
      email: method === "email" ? normalizedEmail : null,
      telegram: method === "telegram" ? normalizedTelegram : null,
      phone: method === "phone" ? normalizedPhone : null,
    };

    const user = await prisma.user.create({
      data: userData,
    });

    return NextResponse.json({
      success: true,
      message: "Пользователь успешно создан",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        phone: user.phone,
        telegram: user.telegram,
      },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      {
        success: false,
        message: "Ошибка при создании аккаунта",
        error: errorMessage,
      },
      { status: 500 },
    );
  }
}
