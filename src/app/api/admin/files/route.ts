import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import matter from "gray-matter";
import { checkAdmin } from "@/lib/admin-auth";
import { getContentDir } from "@/lib/project-root";

type FileTreeNode = {
  name: string;
  title?: string;
  type: "directory" | "file";
  path: string;
  children?: FileTreeNode[];
  lastModified?: Date;
  isDraft?: boolean;
};

// Рекурсивное чтение директории для построения дерева файлов
async function walkDir(dir: string, baseDir: string): Promise<FileTreeNode[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });

  const files = await Promise.all(
    entries.map(async (entry): Promise<FileTreeNode | null> => {
      const fullPath = path.join(dir, entry.name);
      // Относительный путь от корня контента (например, 'recipes/desert/pie.md')
      const relativePath = path.relative(baseDir, fullPath).replace(/\\/g, "/");

      if (entry.isDirectory()) {
        return {
          name: entry.name,
          type: "directory",
          path: relativePath,
          children: await walkDir(fullPath, baseDir),
        };
      } else if (entry.isFile() && entry.name.endsWith(".md")) {
        const stats = await fs.stat(fullPath);

        // Читаем начало файла для проверки статуса черновика и заголовка
        let isDraft = false;
        let title = entry.name.replace(".md", "");
        try {
          const content = await fs.readFile(fullPath, "utf-8");
          const { data } = matter(content);
          isDraft = data.draft === true;
          if (data.title) title = data.title;
        } catch {
          // Silent fail for frontmatter parsing
        }

        return {
          name: entry.name,
          title,
          type: "file",
          path: relativePath,
          lastModified: stats.mtime,
          isDraft,
        };
      }
      return null;
    }),
  );

  return files.filter((file): file is FileTreeNode => file !== null); // Убираем null (не-md файлы)
}

export async function GET() {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const contentDir = getContentDir();
    const entries = await fs.readdir(contentDir, { withFileTypes: true });

    const tree = await Promise.all(
      entries
        .filter((entry) => entry.isDirectory())
        .map(async (entry) => {
          const fullPath = path.join(contentDir, entry.name);
          const children = await walkDir(fullPath, contentDir).catch(() => []);
          return {
            name: entry.name,
            type: "directory",
            path: entry.name,
            children,
          };
        }),
    );

    return NextResponse.json({ tree });
  } catch {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
