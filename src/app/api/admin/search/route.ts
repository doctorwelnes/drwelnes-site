import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import matter from "gray-matter";
import { getContentDir } from "@/lib/project-root";

async function walkDir(dir: string, baseDir: string): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        return walkDir(fullPath, baseDir);
      } else if (entry.isFile() && entry.name.endsWith(".md")) {
        return [path.relative(baseDir, fullPath).replace(/\\/g, "/")];
      }
      return [];
    }),
  );
  return files.flat();
}

export async function POST(req: Request) {
  try {
    const { query } = await req.json();
    if (!query || typeof query !== "string") {
      return NextResponse.json({ results: [] });
    }

    const contentDir = getContentDir();
    const allFiles = await walkDir(contentDir, contentDir);
    const searchResults = [];

    for (const relPath of allFiles) {
      const fullPath = path.join(contentDir, relPath);
      const content = await fs.readFile(fullPath, "utf-8");

      const { data, content: body } = matter(content);
      const lowerQuery = query.toLowerCase();

      const inTitle = (data.title || "").toLowerCase().includes(lowerQuery);
      const inBody = body.toLowerCase().includes(lowerQuery);
      const inTags = (data.tags || []).some((tag: string) =>
        tag.toLowerCase().includes(lowerQuery),
      );

      if (inTitle || inBody || inTags) {
        searchResults.push({
          path: relPath,
          title: data.title || path.basename(relPath, ".md"),
          excerpt: inBody ? body.substring(0, 150) + "..." : data.description || "",
          type: "file",
        });
      }
    }

    return NextResponse.json({ results: searchResults });
  } catch {
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
