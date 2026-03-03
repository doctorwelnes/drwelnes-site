import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { mkdir } from "fs/promises";
import path from "path";

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

    // Папка для загрузки
    const uploadDir = path.join(process.cwd(), "public", "uploads", "videos");

    // Создаем папку если её нет
    await mkdir(uploadDir, { recursive: true });

    // Формируем имя: дата-uuid-имя.mp4
    const originalName = sanitizeFilename(file.name);
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const uniqueName = `${timestamp}-${originalName}`;
    const filePath = path.join(uploadDir, uniqueName);

    // Потоковая запись: Web Stream (Next.js) -> Node Stream -> Диск
    const { createWriteStream } = await import("fs");
    const { Readable } = await import("stream");
    const nodeStream = Readable.fromWeb(file.stream() as any);
    const writeStream = createWriteStream(filePath);

    await new Promise<void>((resolve, reject) => {
      nodeStream.pipe(writeStream);
      writeStream.on("finish", () => resolve());
      writeStream.on("error", reject);
    });

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

export async function GET(request: NextRequest) {
  // 1. Проверяем авторизацию (NextAuth или CMS token)
  const session = (await getServerSession(authOptions)) as { role?: string } | null;
  let isAdmin = session?.role === "ADMIN";

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
        if (ghRes.ok) isAdmin = true;
      } catch (e) {}
    }
  }

  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const uploadDir = path.join(process.cwd(), "public", "uploads", "videos");
    try {
      await import("fs/promises").then((fs) => fs.access(uploadDir));
    } catch {
      // Если папки еще нет, возвращаем пустой массив
      return NextResponse.json({ files: [] });
    }

    const { readdir, stat } = await import("fs/promises");
    const filenames = await readdir(uploadDir);

    const filesInfo = await Promise.all(
      filenames.map(async (name) => {
        const filePath = path.join(uploadDir, name);
        const stats = await stat(filePath);
        return {
          name,
          url: `/uploads/videos/${name}`,
          size: stats.size,
          mtime: stats.mtime,
        };
      }),
    );

    // Сортировка: сначала новые
    filesInfo.sort((a, b) => b.mtime.getTime() - a.mtime.getTime());

    return NextResponse.json({ files: filesInfo });
  } catch (error) {
    return NextResponse.json({ error: "Failed to read directory" }, { status: 500 });
  }
}
