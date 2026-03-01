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
  // 1. Проверяем сессию
  const session = (await getServerSession(authOptions)) as { role?: string } | null;

  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

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
