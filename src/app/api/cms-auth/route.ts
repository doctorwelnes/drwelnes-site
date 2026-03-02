import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const client_id = process.env.GITHUB_CMS_CLIENT_ID;

  if (!client_id) {
    return NextResponse.json({ error: "GITHUB_CMS_CLIENT_ID not set" }, { status: 500 });
  }

  const urlObj = new URL(request.url);
  const redirect_uri = `${urlObj.origin}/api/cms-callback`;
  const url = `https://github.com/login/oauth/authorize?client_id=${client_id}&scope=repo,user&redirect_uri=${encodeURIComponent(redirect_uri)}`;
  return NextResponse.redirect(url);
}
