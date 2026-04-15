import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getPublicDir } from "@/lib/project-root";
import { mkdir } from "fs/promises";
import path from "path";
import { writeLimiter, applyRateLimit } from "@/lib/rate-limiter";

const SUPPORTED_VIDEO_EXTENSIONS = [".mp4", ".webm", ".m4v"];
const SUPPORTED_VIDEO_MIME_TYPES = ["video/mp4", "video/webm", "video/x-m4v"];

// Функция для транслитерации кириллицы в латиницу
function transliterate(text: string) {
  const map: Record<string, string> = {
    а: "a",
    б: "b",
    в: "v",
    г: "g",
    д: "d",
    е: "e",
    ё: "yo",
    ж: "zh",
    з: "z",
    и: "i",
    й: "y",
    к: "k",
    л: "l",
    м: "m",
    н: "n",
    о: "o",
    п: "p",
    р: "r",
    с: "s",
    т: "t",
    у: "u",
    ф: "f",
    х: "kh",
    ц: "ts",
    ч: "ch",
    ш: "sh",
    щ: "shch",
    ы: "y",
    э: "e",
    ю: "yu",
    я: "ya",
    " ": "_",
    ".": ".",
    "-": "-",
  };
  return text
    .toLowerCase()
    .split("")
    .map((char) => map[char] || (/[a-z0-9]/.test(char) ? char : "_"))
    .join("");
}

// Улучшенная функция для очистки имен файлов
function sanitizeFilename(filename: string) {
  const transliterated = transliterate(filename);
  return transliterated
    .replace(/[^a-z0-9.-]/g, "_")
    .replace(/_{2,}/g, "_")
    .replace(/^_|_$/g, "");
}

// ВРЕМЕННО ОТКЛЮЧЕНО (Bypass Mode) для соответствия остальным API админки
async function checkAdmin(request: NextRequest) {
  // 1. Проверяем сессию NextAuth
  const session = await getServerSession(authOptions);
  if (session?.user?.role === "ADMIN") return true;

  // 2. Проверяем токен GitHub OAuth (от CMS)
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
      if (ghRes.ok) return true;
    } catch {
      // Ignore GitHub auth failures and fall back to session check.
    }
  }

  // Bypass Mode: Разрешаем доступ, если в других файлах (например, api/admin/file) стоит return true
  // В данном проекте на время разработки разрешаем загрузку всем авторизованным пользователям
  if (session) return true;

  return false;
}

export async function POST(request: NextRequest) {
  // Apply rate limiting
  const rateLimitResponse = await applyRateLimit(request, writeLimiter);
  if (rateLimitResponse) return rateLimitResponse;

  if (!(await checkAdmin(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Проверка типа (видео или изображения)
    const fileExt = path.extname(file.name).toLowerCase();
    const isSupportedVideoExt = SUPPORTED_VIDEO_EXTENSIONS.includes(fileExt);
    const isSupportedVideoMime = SUPPORTED_VIDEO_MIME_TYPES.includes(file.type.toLowerCase());
    const isVideo =
      (file.type.startsWith("video/") || isSupportedVideoMime || isSupportedVideoExt) &&
      isSupportedVideoExt;
    const isImage =
      file.type.startsWith("image/") || /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(file.name);

    if (!isVideo && !isImage) {
      return NextResponse.json(
        {
          error: "Only images and supported browser video formats (mp4, webm, m4v) are allowed",
        },
        { status: 400 },
      );
    }

    // Папка для загрузки
    const typeFolder = isVideo ? "videos" : "images";
    const uploadDir = path.join(getPublicDir(), "uploads", typeFolder);

    // Создаем папку если её нет
    await mkdir(uploadDir, { recursive: true });

    // Формируем имя: дата-uuid-имя.mp4
    const originalName = sanitizeFilename(file.name);
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const uniqueName = `${timestamp}-${originalName}`;
    const filePath = path.join(uploadDir, uniqueName);

    // Потоковая запись
    const { createWriteStream } = await import("fs");
    const { Readable } = await import("stream");
    const nodeStream = Readable.fromWeb(file.stream() as import("stream/web").ReadableStream);
    const writeStream = createWriteStream(filePath);

    await new Promise<void>((resolve, reject) => {
      nodeStream.pipe(writeStream);
      writeStream.on("finish", () => resolve());
      writeStream.on("error", reject);
    });

    const fileUrl = `/uploads/${typeFolder}/${uniqueName}`;

    return NextResponse.json({
      success: true,
      url: fileUrl,
      fullUrl: `${process.env.NEXTAUTH_URL || ""}${fileUrl}`,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to upload file";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  if (!(await checkAdmin(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const videoDir = path.join(getPublicDir(), "uploads", "videos");
    const imageDir = path.join(getPublicDir(), "uploads", "images");

    const dirs = [videoDir, imageDir];
    let allFiles: { name: string; url: string; size: number; mtime: Date }[] = [];

    for (const dir of dirs) {
      try {
        const { readdir, stat } = await import("fs/promises");
        const filenames = await readdir(dir);
        const typeFolder = dir.endsWith("videos") ? "videos" : "images";

        const filesInfo = await Promise.all(
          filenames.map(async (name) => {
            const filePath = path.join(dir, name);
            const stats = await stat(filePath);
            return {
              name,
              url: `/uploads/${typeFolder}/${name}`,
              size: stats.size,
              mtime: stats.mtime,
            };
          }),
        );
        allFiles = [...allFiles, ...filesInfo];
      } catch {
        // Skip if dir doesn't exist
      }
    }

    // Сортировка: сначала новые
    allFiles.sort((a, b) => b.mtime.getTime() - a.mtime.getTime());

    return NextResponse.json({ files: allFiles });
  } catch {
    return NextResponse.json({ error: "Failed to read directory" }, { status: 500 });
  }
}
