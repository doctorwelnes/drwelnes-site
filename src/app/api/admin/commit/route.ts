import { NextResponse } from "next/server";
import { exec } from "child_process";
import util from "util";
import path from "path";
import { checkAdmin } from "@/lib/admin-auth";

const execAsync = util.promisify(exec);

export async function POST() {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const cwd = process.cwd();

    // Выполняем git add, git commit и git push
    const { stdout, stderr } = await execAsync(
      `git add content public/uploads && git commit -m "Admin CMS: Published content and medias" && git push || echo "No changes to commit or push"`,
      { cwd },
    );

    return NextResponse.json({ success: true, stdout, stderr });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        error:
          "Failed to create git commit: " +
          (error instanceof Error ? error.message : String(error)),
      },
      { status: 500 },
    );
  }
}
