import { NextResponse } from "next/server";

export async function GET() {
  const client_id = process.env.GITHUB_CMS_CLIENT_ID;

  if (!client_id) {
    return NextResponse.json({ error: "GITHUB_CMS_CLIENT_ID not set" }, { status: 500 });
  }

  const redirect_uri = `${process.env.NEXTAUTH_URL}/api/cms-callback`;
  const url = `https://github.com/login/oauth/authorize?client_id=${client_id}&scope=repo,user&redirect_uri=${encodeURIComponent(redirect_uri)}`;
  return NextResponse.redirect(url);
}
