import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { spawnSync } from "child_process";
import sharp from "sharp";
import { writeLimiter, applyRateLimit } from "@/lib/rate-limiter";
import { checkAdmin } from "@/lib/admin-auth";
import { getContentDir, getPublicDir } from "@/lib/project-root";

const SUPPORTED_VIDEO_EXTENSIONS = [".mp4", ".webm", ".m4v"];
const SUPPORTED_VIDEO_MIME_TYPES = ["video/mp4", "video/webm", "video/x-m4v"];
const UPLOADS_DIR = path.join(getPublicDir(), "uploads");
const PUBLIC_ROOT = fs.realpathSync.native
  ? fs.realpathSync.native(getPublicDir())
  : fs.realpathSync(getPublicDir());
const UPLOADS_ROOT = path.join(PUBLIC_ROOT, "uploads");

type MediaEntry = {
  name: string;
  url: string;
  type: "image" | "video" | "other" | "directory";
  size?: number;
  isDirectory?: boolean;
};

function sleepMs(ms: number) {
  const sab = new SharedArrayBuffer(4);
  const int32 = new Int32Array(sab);
  Atomics.wait(int32, 0, 0, ms);
}

function tryRmPathSync(targetPath: string) {
  fs.rmSync(targetPath, { recursive: true, force: true, maxRetries: 10, retryDelay: 80 });

  if (fs.existsSync(targetPath) && process.platform === "win32") {
    const escaped = targetPath.replace(/"/g, '\\"');
    spawnSync(
      "cmd.exe",
      [
        "/c",
        fs.existsSync(targetPath) && fs.statSync(targetPath).isDirectory()
          ? `rmdir /s /q "${escaped}"`
          : `del /f /q "${escaped}"`,
      ],
      { windowsHide: true },
    );

    if (fs.existsSync(targetPath)) {
      spawnSync(
        "powershell.exe",
        [
          "-NoProfile",
          "-Command",
          `Remove-Item -LiteralPath \"${escaped}\" -Recurse -Force -ErrorAction SilentlyContinue`,
        ],
        { windowsHide: true },
      );
    }
  }
}

function scanDir(dir: string): MediaEntry[] {
  if (!fs.existsSync(dir)) return [];
  const items = fs.readdirSync(dir, { withFileTypes: true });
  const results: MediaEntry[] = [];

  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    // Ensure we use forward slashes for URLs and handle potential encoding issues
    const rel = "/" + path.relative(PUBLIC_ROOT, fullPath).replace(/\\/g, "/");

    if (item.isDirectory()) {
      results.push({
        name: item.name,
        url: rel,
        type: "directory",
        isDirectory: true,
      });
    } else {
      const ext = path.extname(item.name).toLowerCase();
      const isImage = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".avif", ".svg"].includes(ext);
      const isVideo = SUPPORTED_VIDEO_EXTENSIONS.includes(ext);
      const stat = fs.statSync(fullPath);
      results.push({
        name: item.name,
        url: rel,
        type: isImage ? "image" : isVideo ? "video" : "other",
        size: stat.size,
      });
    }
  }
  return results;
}

function getAllUsedMedia(): Set<string> {
  const usedMedia = new Set<string>();
  const contentDir = getContentDir();
  if (!fs.existsSync(contentDir)) return usedMedia;

  const walk = (dir: string) => {
    const items = fs.readdirSync(dir, { withFileTypes: true });
    for (const item of items) {
      const fullPath = path.join(dir, item.name);
      if (item.isDirectory()) {
        walk(fullPath);
      } else if (item.name.endsWith(".md")) {
        const content = fs.readFileSync(fullPath, "utf-8");
        // Match markdown images: ![](/uploads/...)
        const imgMatches = content.matchAll(/!\[.*?\]\((.*?)\)/g);
        for (const m of imgMatches) usedMedia.add(m[1]);

        // Match video tags: <video src="/uploads/..."
        const videoMatches = content.matchAll(/<video.*?src=["'](.*?)["']/g);
        for (const m of videoMatches) usedMedia.add(m[1]);

        // Match frontmatter fields (simple regex for common fields)
        const fmMatches = content.matchAll(
          /(?:image|videoFile|videoPoster|videoUrl):\s*["']?(.*?)["']?$/gm,
        );
        for (const m of fmMatches) usedMedia.add(m[1].trim());
      }
    }
  };

  walk(contentDir);
  return usedMedia;
}

export async function GET(req: NextRequest) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const folderParam = searchParams.get("folderPath") || "/uploads";

    // Decode folderPath to handle cyrillic characters
    const folderPath = decodeURIComponent(folderParam);

    // Разрешаем путь относительно корня public
    const cleanPath = folderPath.startsWith("/") ? folderPath.slice(1) : folderPath;
    const targetDir = path.join(PUBLIC_ROOT, cleanPath);

    // Проверка безопасности: путь должен быть внутри public/uploads или быть самим public/uploads
    const normalizedTarget = path.normalize(targetDir);
    const normalizedUploads = path.normalize(UPLOADS_ROOT);

    if (!normalizedTarget.startsWith(normalizedUploads)) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    if (!fs.existsSync(targetDir)) {
      return NextResponse.json({ files: [] });
    }

    const usedMedia = getAllUsedMedia();
    const files = scanDir(targetDir).map((file) => ({
      ...file,
      isUsed: usedMedia.has(file.url),
    }));
    return NextResponse.json({ files });
  } catch (err) {
    console.error("GET media error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rateLimitResponse = await applyRateLimit(req, writeLimiter);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const contentType = req.headers.get("content-type") || "";

    // Handle folder creation
    if (contentType.includes("application/json")) {
      const { folderPath, name } = await req.json();
      if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });

      const targetDir = folderPath
        ? path.join(getPublicDir(), folderPath.startsWith("/") ? folderPath.slice(1) : folderPath)
        : UPLOADS_DIR;

      const newDirPath = path.join(targetDir, name.replace(/[/\\?%*:|"<>]/g, "-"));
      const normalizedPath = path.normalize(newDirPath);
      if (!normalizedPath.startsWith(path.normalize(UPLOADS_DIR))) {
        return NextResponse.json({ error: "Access denied" }, { status: 403 });
      }

      if (fs.existsSync(newDirPath)) {
        return NextResponse.json({ error: "Folder already exists" }, { status: 400 });
      }

      fs.mkdirSync(newDirPath, { recursive: true });
      return NextResponse.json({ success: true });
    }

    // Handle file upload
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const folderParam = (formData.get("folderPath") as string) || "/uploads";
    const folderPath = decodeURIComponent(folderParam);
    const customName = formData.get("customName") as string;

    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = path.extname(file.name).toLowerCase();
    const isImage = [".jpg", ".jpeg", ".png", ".webp", ".avif"].includes(ext);
    const isSupportedVideoExt = SUPPORTED_VIDEO_EXTENSIONS.includes(ext);
    const isSupportedVideoMime = SUPPORTED_VIDEO_MIME_TYPES.includes(file.type.toLowerCase());
    const isVideo =
      (file.type.startsWith("video/") || isSupportedVideoMime || isSupportedVideoExt) &&
      isSupportedVideoExt;

    let fileName = file.name;
    if (customName) {
      // Auto-naming logic: use custom name + original extension or .webp for images
      const baseName = customName.replace(/[/\\?%*:|"<>]/g, "-").toLowerCase();
      fileName = isImage ? `${baseName}.webp` : `${baseName}${ext}`;
    }

    const cleanFolderPath = folderPath.startsWith("/") ? folderPath.slice(1) : folderPath;
    const targetDir = path.join(getPublicDir(), cleanFolderPath);

    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    let filePath = path.join(targetDir, fileName);

    // Ensure unique filename if exists
    let counter = 1;
    while (fs.existsSync(filePath)) {
      const nameWithoutExt = path.parse(fileName).name;
      const currentExt = path.parse(fileName).ext;
      filePath = path.join(targetDir, `${nameWithoutExt}-${counter}${currentExt}`);
      counter++;
    }

    if (isImage) {
      // Optimize image with sharp
      await sharp(buffer)
        .resize(1920, 1080, { fit: "inside", withoutEnlargement: true })
        .webp({ quality: 80 })
        .toFile(filePath);
    } else if (isVideo) {
      fs.writeFileSync(filePath, buffer);
      // Force sync to disk
      const fd = fs.openSync(filePath, "r+");
      fs.fsyncSync(fd);
      fs.closeSync(fd);
    } else {
      return NextResponse.json(
        {
          error: "Only images and supported browser video formats (mp4, webm, m4v) are allowed",
        },
        { status: 400 },
      );
    }

    const relativePath = "/" + path.relative(getPublicDir(), filePath).replace(/\\/g, "/");
    return NextResponse.json({ success: true, url: relativePath });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Apply rate limiting
  const rateLimitResponse = await applyRateLimit(req, writeLimiter);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const { url, urls } = await req.json();
    const urlsToDelete = urls || (url ? [url] : []);

    if (!urlsToDelete || urlsToDelete.length === 0) {
      return NextResponse.json({ error: "URL or urls are required" }, { status: 400 });
    }

    const results = [];
    for (const targetUrl of urlsToDelete) {
      try {
        const decodedUrl = decodeURIComponent(String(targetUrl));
        const trimmedUrl = decodedUrl.replace(/\/+$/, "");

        // Разрешаем путь относительно корня public
        const cleanUrl = trimmedUrl.startsWith("/") ? trimmedUrl.slice(1) : trimmedUrl;
        const originalFilePath = path.join(PUBLIC_ROOT, cleanUrl);
        let filePath = originalFilePath;
        let renamedPath: string | undefined;

        // Безопасность: проверяем, что файл все еще находится в UPLOADS_DIR или public/uploads
        const normalizedPath = path.normalize(filePath);
        if (
          !normalizedPath.startsWith(path.normalize(UPLOADS_ROOT)) &&
          !normalizedPath.startsWith(path.join(PUBLIC_ROOT, "uploads"))
        ) {
          results.push({ url: targetUrl, success: false, error: "Access denied" });
          continue;
        }

        if (!fs.existsSync(filePath)) {
          try {
            const parentDir = path.dirname(filePath);
            const desiredBaseName = path.basename(filePath);
            if (fs.existsSync(parentDir)) {
              const entries = fs.readdirSync(parentDir);
              const desiredNorm = desiredBaseName.normalize("NFC").toLowerCase();
              const match = entries.find((e) => e.normalize("NFC").toLowerCase() === desiredNorm);
              if (match) {
                filePath = path.join(parentDir, match);
              } else {
                const desiredPrefixNorm = `${desiredNorm}.__deleting__`;
                const prefixMatch = entries.find((e) =>
                  e.normalize("NFC").toLowerCase().startsWith(desiredPrefixNorm),
                );
                if (prefixMatch) {
                  filePath = path.join(parentDir, prefixMatch);
                }
              }
            }
          } catch {}
        }

        if (!fs.existsSync(filePath)) {
          results.push({
            url: targetUrl,
            success: false,
            error: "File not found",
            decodedUrl,
            cleanUrl,
            filePath: originalFilePath,
          });
          continue;
        }

        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
          tryRmPathSync(filePath);
        } else {
          fs.unlinkSync(filePath);
        }

        if (fs.existsSync(filePath) && !path.basename(filePath).includes("__deleting__")) {
          try {
            renamedPath = `${filePath}.__deleting__${Date.now()}`;
            fs.renameSync(filePath, renamedPath);
            filePath = renamedPath;
            tryRmPathSync(filePath);
          } catch {}
        }

        for (let i = 0; i < 8 && fs.existsSync(filePath); i++) {
          try {
            tryRmPathSync(filePath);
          } catch {}
          sleepMs(80);
        }

        if (fs.existsSync(filePath) || fs.existsSync(originalFilePath)) {
          results.push({
            url: targetUrl,
            success: false,
            error: "Delete did not remove path",
            decodedUrl,
            cleanUrl,
            filePath: originalFilePath,
            renamedPath,
            resolvedPath: filePath,
          });
          continue;
        }

        results.push({
          url: targetUrl,
          success: true,
          decodedUrl,
          cleanUrl,
          filePath: originalFilePath,
          renamedPath,
          resolvedPath: filePath,
        });
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error";
        console.error("DELETE media error for", targetUrl, error);
        results.push({ url: targetUrl, success: false, error: message });
      }
    }

    const allSuccess = results.every((r) => r.success);
    if (!allSuccess && urlsToDelete.length > 1) {
      return NextResponse.json({ success: false, results }, { status: 207 });
    }

    if (!results[0]?.success) {
      return NextResponse.json(
        { error: results[0]?.error || "Failed to delete", results },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, results });
  } catch (err) {
    console.error("DELETE media error:", err);
    return NextResponse.json({ error: "Failed to delete file" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  // Apply rate limiting
  const rateLimitResponse = await applyRateLimit(req, writeLimiter);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const { url, newName } = await req.json();
    if (!url || !newName) {
      return NextResponse.json({ error: "URL and newName are required" }, { status: 400 });
    }

    const cleanUrl = url.startsWith("/") ? url.slice(1) : url;
    const oldPath = path.join(getPublicDir(), cleanUrl);
    const oldDir = path.dirname(oldPath);

    // Оставляем оригинальное расширение
    const oldFileName = path.basename(url);
    const ext = path.extname(oldFileName);
    const cleanNewName = newName.replace(/[/\\?%*:|"<>]/g, "-");
    const newFileName = cleanNewName.endsWith(ext) ? cleanNewName : cleanNewName + ext;
    const newPath = path.join(oldDir, newFileName);

    // Security check: ensure we stay inside UPLOADS_DIR
    const normalizedNewPath = path.normalize(newPath);
    if (!normalizedNewPath.startsWith(path.normalize(UPLOADS_DIR))) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    if (!fs.existsSync(oldPath)) {
      return NextResponse.json({ error: "Original file not found" }, { status: 404 });
    }

    if (fs.existsSync(newPath)) {
      return NextResponse.json({ error: "File with this name already exists" }, { status: 400 });
    }

    fs.renameSync(oldPath, newPath);

    // Возвращаем новый URL
    const newUrl = url.replace(oldFileName, newFileName);
    return NextResponse.json({ success: true, newUrl });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: "Failed to rename file: " + errorMessage }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const rateLimitResponse = await applyRateLimit(req, writeLimiter);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const { urls, targetFolder } = await req.json();
    if (!urls || !Array.isArray(urls) || !targetFolder) {
      return NextResponse.json(
        { error: "urls array and targetFolder are required" },
        { status: 400 },
      );
    }

    const cleanTargetDir = targetFolder.startsWith("/") ? targetFolder.slice(1) : targetFolder;
    const targetDirPath = path.join(PUBLIC_ROOT, cleanTargetDir);

    if (!fs.existsSync(targetDirPath)) {
      fs.mkdirSync(targetDirPath, { recursive: true });
    }

    const results = [];
    for (const url of urls) {
      const cleanUrl = url.startsWith("/") ? url.slice(1) : url;
      const oldPath = path.join(PUBLIC_ROOT, cleanUrl);
      const fileName = path.basename(oldPath);
      const newPath = path.join(targetDirPath, fileName);

      // Security checks
      const normalizedOld = path.normalize(oldPath);
      const normalizedNew = path.normalize(newPath);
      if (
        !normalizedOld.startsWith(path.normalize(UPLOADS_ROOT)) ||
        !normalizedNew.startsWith(path.normalize(UPLOADS_ROOT))
      ) {
        results.push({ url, success: false, error: "Access denied" });
        continue;
      }

      if (!fs.existsSync(oldPath)) {
        results.push({ url, success: false, error: "Source not found" });
        continue;
      }

      if (fs.existsSync(newPath)) {
        results.push({ url, success: false, error: "Target already exists" });
        continue;
      }

      fs.renameSync(oldPath, newPath);
      results.push({ url, success: true });
    }

    return NextResponse.json({ success: true, results });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: "Failed to move files: " + errorMessage }, { status: 500 });
  }
}
