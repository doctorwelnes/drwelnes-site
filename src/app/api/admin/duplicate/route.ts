import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { adminDuplicateSchema } from "@/lib/validation";
import { validateRequest } from "@/lib/validate-request";
import { writeLimiter, applyRateLimit } from "@/lib/rate-limiter";

const BASE_CONTENT_DIR = path.join(process.cwd(), "content");

export async function POST(req: NextRequest) {
  // Apply rate limiting
  const rateLimitResponse = await applyRateLimit(req, writeLimiter);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const body = await req.json();

    // Validate request body
    const validation = validateRequest(adminDuplicateSchema, body);
    if (!validation.success) {
      return validation.error;
    }

    const { path: filePath } = validation.data;

    const absPath = path.join(BASE_CONTENT_DIR, filePath);
    if (!fs.existsSync(absPath)) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const ext = path.extname(absPath);
    const base = absPath.slice(0, -ext.length);
    let newPath = `${base}-copy${ext}`;
    let counter = 2;
    while (fs.existsSync(newPath)) {
      newPath = `${base}-copy-${counter}${ext}`;
      counter++;
    }

    fs.copyFileSync(absPath, newPath);

    const relative = path.relative(BASE_CONTENT_DIR, newPath).replace(/\\/g, "/");
    return NextResponse.json({ path: relative, newPath: relative });
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
