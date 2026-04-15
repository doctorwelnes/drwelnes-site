import { NextResponse } from "next/server";
import { exec } from "child_process";
import util from "util";
import { checkAdmin } from "@/lib/admin-auth";

const execAsync = util.promisify(exec);

export async function POST() {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const cwd = process.cwd();

    // Выполняем git add, git commit и git push в master,
    // чтобы production workflow автоматически задеплоил изменения.
    const { stdout, stderr } = await execAsync(
      `set -eu
git add content
if [ -d public/uploads ]; then
  git add public/uploads
fi
if git diff --cached --quiet; then
  echo "No changes to commit or push"
  exit 0
fi
git -c user.name="Dr Welnes CMS" -c user.email="cms@drwelnes.ru" commit -m "Admin CMS: Published content and medias"
git push origin HEAD:master`,
      { cwd },
    );

    return NextResponse.json({ success: true, stdout, stderr });
  } catch (error: unknown) {
    const err = error as Error & { stdout?: string; stderr?: string };
    return NextResponse.json(
      {
        error:
          "Failed to create git commit: " +
          (error instanceof Error ? error.message : String(error)),
        stdout: err.stdout,
        stderr: err.stderr,
      },
      { status: 500 },
    );
  }
}
