import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

// Простая функция для очистки имен файлов
function sanitizeFilename(filename: string) {
  return filename
    .replace(/[^a-zA-Z0-9.-]/g, "_")
    .replace(/_{2,}/g, "_")
    .toLowerCase();
}

export async function POST(request: NextRequest) {
  console.log("=== Upload API: Request received ===");

  // 1. Проверяем сессию NextAuth
  const session = (await getServerSession(authOptions)) as { role?: string } | null;
  let isAdmin = session?.role === "ADMIN";

  // 2. Если нет сессии NextAuth (или роль не админ), проверяем токен GitHub OAuth (от CMS)
  if (!isAdmin) {
    const authHeader = request.headers.get("Authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      try {
        const ghRes = await fetch("https://api.github.com/user", {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/vnd.github.v3+json",
          },
        });
        if (ghRes.ok) {
          console.log("=== Upload API: Authenticated via Decap CMS GitHub Token ===");
          isAdmin = true;
        } else {
          console.warn("=== Upload API: GitHub Token validation failed ===", ghRes.status);
        }
      } catch (e) {
        console.error("=== Upload API: Error validating GitHub token ===", e);
      }
    }
  }

  if (!isAdmin) {
    console.warn("=== Upload API: Unauthorized access attempt ===");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      console.warn("=== Upload API: No file in form data ===");
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    console.log(
      `=== Upload API: Processing file: ${file.name} (${file.size} bytes), type: ${file.type}`,
    );

    // Проверка типа (только mp4 для видео)
    if (!file.type.startsWith("video/") && !file.name.endsWith(".mp4")) {
      // Разрешим mp4 даже если MIME тип странный
      if (!file.name.endsWith(".mp4")) {
        return NextResponse.json({ error: "Only video files are allowed" }, { status: 400 });
      }
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Папка для загрузки
    const uploadDir = path.join(process.cwd(), "public", "uploads", "videos");

    // Создаем папку если её нет
    await mkdir(uploadDir, { recursive: true });

    // Формируем имя: дата-uuid-имя.mp4
    const originalName = sanitizeFilename(file.name);
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const uniqueName = `${timestamp}-${originalName}`;
    const filePath = path.join(uploadDir, uniqueName);

    await writeFile(filePath, buffer);

    const fileUrl = `/uploads/videos/${uniqueName}`;

    return NextResponse.json({
      success: true,
      url: fileUrl,
      fullUrl: `${process.env.NEXTAUTH_URL || ""}${fileUrl}`,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to upload file";
    console.error("Upload error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
