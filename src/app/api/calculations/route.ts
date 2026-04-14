import { NextRequest, NextResponse } from "next/server";
import { getPrismaClient } from "@/lib/prisma";
import { saveCalculationSchema } from "@/lib/validation";
import { validateRequest } from "@/lib/validate-request";
import { getAuthenticatedUser } from "@/lib/auth-helpers";
import { writeLimiter, applyRateLimit } from "@/lib/rate-limiter";
import type { Prisma, PrismaClient } from "@prisma/client";

type CalculatorType = "BMI" | "CALORIES" | "BJU" | "WATER" | "IDEAL_WEIGHT";

const VALID_TYPES: CalculatorType[] = ["BMI", "CALORIES", "BJU", "WATER", "IDEAL_WEIGHT"];

type CalculationDelegate = {
  findMany(args: {
    where: {
      userId: string;
      type?: CalculatorType;
    };
    orderBy: { createdAt: "desc" };
    take: number;
  }): Promise<
    Array<{
      id: string;
      userId: string;
      type: CalculatorType;
      name: string;
      inputData: Prisma.JsonValue;
      result: Prisma.JsonValue;
      createdAt: Date;
    }>
  >;
  create(args: {
    data: {
      userId: string;
      type: CalculatorType;
      name: string;
      inputData: Prisma.InputJsonValue;
      result: Prisma.InputJsonValue;
    };
  }): Promise<unknown>;
  findFirst(args: {
    where: {
      id: string;
      userId: string;
    };
  }): Promise<{ id: string; userId: string } | null>;
  delete(args: {
    where: {
      id: string;
    };
  }): Promise<unknown>;
};

function isValidCalculatorType(type: string): type is CalculatorType {
  return VALID_TYPES.includes(type as CalculatorType);
}

// GET - получить историю расчетов пользователя
export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthenticatedUser();
    if ("error" in auth) return auth.error;
    const { user } = auth;

    const prisma = getPrismaClient() as PrismaClient & {
      calculation: CalculationDelegate;
    };

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") as CalculatorType | null;

    const calculations = await prisma.calculation.findMany({
      where: {
        userId: user.id,
        ...(type && { type }),
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    return NextResponse.json({ calculations });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to fetch calculations: " + errorMessage },
      { status: 500 },
    );
  }
}

// POST - сохранить новый расчет
export async function POST(req: NextRequest) {
  // Apply rate limiting
  const rateLimitResponse = await applyRateLimit(req, writeLimiter);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const auth = await getAuthenticatedUser();
    if ("error" in auth) return auth.error;
    const { user } = auth;

    const prisma = getPrismaClient();

    const body = await req.json();

    // Validate request body
    const validation = validateRequest(saveCalculationSchema, body);
    if (!validation.success) {
      return validation.error;
    }

    const { type, name, result } = validation.data;
    const { inputData } = body;

    if (!isValidCalculatorType(type)) {
      return NextResponse.json({ error: "Invalid calculator type" }, { status: 400 });
    }

    const calculation = await prisma.calculation.create({
      data: {
        userId: user.id,
        type,
        name,
        inputData: inputData as Prisma.InputJsonValue,
        result: result as Prisma.InputJsonValue,
      },
    });

    return NextResponse.json({ calculation });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to save calculation: " + errorMessage },
      { status: 500 },
    );
  }
}

// DELETE - удалить расчет
export async function DELETE(req: NextRequest) {
  try {
    const auth = await getAuthenticatedUser();
    if ("error" in auth) return auth.error;
    const { user } = auth;

    const prisma = getPrismaClient();

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing calculation id" }, { status: 400 });
    }

    // Проверяем, что расчет принадлежит текущему пользователю
    const calculation = await prisma.calculation.findFirst({
      where: { id, userId: user.id },
    });

    if (!calculation) {
      return NextResponse.json({ error: "Calculation not found" }, { status: 404 });
    }

    await prisma.calculation.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to delete calculation: " + errorMessage },
      { status: 500 },
    );
  }
}
