import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth-helpers";
import { getPublicDir } from "@/lib/project-root";
import { getPrismaClient } from "@/lib/prisma";
import { writeFile, unlink } from "fs/promises";
import { mkdir } from "fs/promises";
import path from "path";
import { existsSync } from "fs";

export async function GET() {
  return NextResponse.json({ message: "Avatar API is working" });
}

export async function DELETE() {
  try {
    const auth = await getAuthenticatedUser();
    if ("error" in auth) {
      return auth.error;
    }

    const { user } = auth;
    const prisma = getPrismaClient();
    if (!user || !user.image) {
      return NextResponse.json({ error: "No avatar found" }, { status: 404 });
    }

    // Delete file from disk
    const filePath = path.join(getPublicDir(), user.image);
    if (existsSync(filePath)) {
      await unlink(filePath);
    }

    // Update user in database
    await prisma.user.update({
      where: { id: user.id },
      data: { image: null },
    });

    return NextResponse.json({ success: true, message: "Avatar deleted" });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to delete avatar: " + errorMessage },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthenticatedUser();
    if ("error" in auth) {
      return auth.error;
    }

    const { user } = auth;

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Only image files are allowed" }, { status: 400 });
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "File size must be less than 5MB" }, { status: 400 });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const originalName = file.name.replace(/[^a-zA-Z0-9.]/g, "_");
    const filename = `${timestamp}_${originalName}`;

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(getPublicDir(), "uploads", "avatars");
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    const filePath = path.join(uploadsDir, filename);

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Verify file was saved
    if (!existsSync(filePath)) {
      return NextResponse.json(
        { error: "Failed to save file - file does not exist after write" },
        { status: 500 },
      );
    }

    console.log("Avatar saved successfully:", filePath, "Size:", buffer.length, "bytes");

    // Generate public URL
    const imageUrl = `/uploads/avatars/${filename}`;

    // Update user in database
    const prisma = getPrismaClient();

    await prisma.user.update({
      where: { id: user.id },
      data: { image: imageUrl },
    });

    return NextResponse.json({
      success: true,
      imageUrl,
      message: "Avatar uploaded successfully",
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to upload avatar: " + errorMessage },
      { status: 500 },
    );
  }
}
