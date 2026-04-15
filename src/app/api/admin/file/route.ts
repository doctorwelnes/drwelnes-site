import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import matter from "gray-matter";
import { adminFileSchema } from "@/lib/validation";
import { validateRequest } from "@/lib/validate-request";
import { writeLimiter, applyRateLimit } from "@/lib/rate-limiter";
import { checkAdmin } from "@/lib/admin-auth";
import { getContentDir } from "@/lib/project-root";

// Защита от выхода за пределы папки content (Path Traversal Protection)
function getSafePath(relativePath: string) {
  const contentDir = getContentDir();
  const unescapedPath = decodeURIComponent(relativePath);

  // Нормализуем путь и проверяем, что он начинается с директории контента
  const rootPath = path.resolve(contentDir);
  const targetPath = path.resolve(contentDir, unescapedPath);

  if (!targetPath.startsWith(rootPath)) {
    throw new Error("Invalid path");
  }

  return targetPath;
}

// GET: Прочитать содержимое файла
export async function GET(req: NextRequest) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const searchParams = req.nextUrl.searchParams;
  const filePath = searchParams.get("path");

  if (!filePath) {
    return NextResponse.json({ error: "Missing path parameter" }, { status: 400 });
  }

  try {
    const fullPath = getSafePath(filePath);
    const fileContent = await fs.readFile(fullPath, "utf-8");
    const parsed = matter(fileContent);

    return NextResponse.json({
      path: filePath,
      frontmatter: parsed.data,
      content: parsed.content,
    });
  } catch {
    return NextResponse.json({ error: "File not found or access denied" }, { status: 404 });
  }
}

// POST: Обновить или создать файл
export async function POST(req: NextRequest) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Apply rate limiting
  const rateLimitResponse = await applyRateLimit(req, writeLimiter);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const body = await req.json();

    // Validate request body
    const validation = validateRequest(adminFileSchema, body);
    if (!validation.success) {
      return validation.error;
    }

    const { path: filePath, frontmatter, content } = validation.data;

    const fullPath = getSafePath(filePath);

    // Сериализуем обратно в формат Markdown + Frontmatter (YAML)
    const fileString = matter.stringify(content || "", frontmatter ?? {});

    // Убедимся, что директория существует (если это создание нового файла)
    await fs.mkdir(path.dirname(fullPath), { recursive: true });

    // Записываем файл на диск
    await fs.writeFile(fullPath, fileString, "utf-8");

    return NextResponse.json({ success: true, path: filePath });
  } catch {
    return NextResponse.json({ error: "Failed to write file" }, { status: 500 });
  }
}

// DELETE: Удалить файл
export async function DELETE(req: NextRequest) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const searchParams = req.nextUrl.searchParams;
  const filePath = searchParams.get("path");

  if (!filePath) {
    return NextResponse.json({ error: "Missing path parameter" }, { status: 400 });
  }

  try {
    const fullPath = getSafePath(filePath);
    await fs.unlink(fullPath);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete file" }, { status: 500 });
  }
}
