import { NextResponse } from "next/server";
import { env } from "@/lib/env";

export async function GET() {
  const client_id = env.GITHUB_CMS_CLIENT_ID;

  if (!client_id) {
    return NextResponse.json({ error: "GITHUB_CMS_CLIENT_ID not set" }, { status: 500 });
  }

  const baseUrl = env.NEXTAUTH_URL?.replace(/\/$/, "") || "https://drwelnes.ru";
  const redirect_uri = `${baseUrl}/api/cms-callback`;
  const url = `https://github.com/login/oauth/authorize?client_id=${client_id}&scope=repo,user&redirect_uri=${encodeURIComponent(redirect_uri)}`;
  return NextResponse.redirect(url);
}
