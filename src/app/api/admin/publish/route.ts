import { NextResponse } from "next/server";
import { execFile } from "child_process";
import util from "util";
import { checkAdmin } from "@/lib/admin-auth";

const execFileAsync = util.promisify(execFile);

async function stagePublishChanges(cwd: string) {
  await execFileAsync("git", ["add", "-u", "--", "content", "public/uploads"], {
    cwd,
    maxBuffer: 10 * 1024 * 1024,
  });

  const { stdout: untrackedStdout } = await execFileAsync(
    "git",
    ["ls-files", "-o", "--exclude-standard", "-z", "--", "content", "public/uploads"],
    { cwd, maxBuffer: 10 * 1024 * 1024 },
  );

  const untrackedFiles = untrackedStdout
    .split("\0")
    .map((file) => file.trim())
    .filter(Boolean);

  if (untrackedFiles.length > 0) {
    await execFileAsync("git", ["add", "--", ...untrackedFiles], {
      cwd,
      maxBuffer: 10 * 1024 * 1024,
    });
  }
}

export async function POST() {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const cwd = process.cwd();
    await stagePublishChanges(cwd);

    const { stdout: stagedStdout } = await execFileAsync(
      "git",
      ["diff", "--cached", "--name-only"],
      {
        cwd,
        maxBuffer: 10 * 1024 * 1024,
      },
    );

    if (!stagedStdout.trim()) {
      return NextResponse.json({
        success: true,
        stdout: "No changes to commit or push",
        stderr: "",
      });
    }

    // Выполняем git add, git commit и git push в master,
    // чтобы production workflow автоматически задеплоил изменения.
    const { stdout, stderr } = await execFileAsync(
      "git",
      [
        "-c",
        "user.name=Dr Welnes CMS",
        "-c",
        "user.email=cms@drwelnes.ru",
        "commit",
        "-m",
        "Admin CMS: Published content and media",
      ],
      { cwd, maxBuffer: 10 * 1024 * 1024 },
    );

    const pushResult = await execFileAsync("git", ["push", "origin", "HEAD:master"], {
      cwd,
      maxBuffer: 10 * 1024 * 1024,
    });

    return NextResponse.json({
      success: true,
      stdout: `${stdout || ""}${pushResult.stdout || ""}`,
      stderr: `${stderr || ""}${pushResult.stderr || ""}`,
    });
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
