import { NextResponse } from "next/server";

export async function GET() {
  const client_id = process.env.GITHUB_CMS_CLIENT_ID;

  if (!client_id) {
    return NextResponse.json({ error: "GITHUB_CMS_CLIENT_ID not set" }, { status: 500 });
  }

  const url = `https://github.com/login/oauth/authorize?client_id=${client_id}&scope=repo,user`;
  return NextResponse.redirect(url);
}
