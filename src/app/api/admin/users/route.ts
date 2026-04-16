import { NextResponse } from "next/server";
import { checkAdmin } from "@/lib/admin-auth";
import { getPrismaClient } from "@/lib/prisma";

export async function GET() {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const prisma = getPrismaClient();

    const users = await prisma.user.findMany({
      orderBy: [{ role: "desc" }, { createdAt: "desc" }],
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        telegram: true,
        role: true,
        image: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error("Failed to fetch admin users:", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}
