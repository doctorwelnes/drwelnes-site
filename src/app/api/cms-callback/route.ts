import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.json({ error: "No code provided" }, { status: 400 });
  }

  const client_id = process.env.GITHUB_CMS_CLIENT_ID;
  const client_secret = process.env.GITHUB_CMS_CLIENT_SECRET;

  try {
    const response = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        client_id,
        client_secret,
        code,
      }),
    });

    const data = await response.json();

    if (data.error) {
      return NextResponse.json(data, { status: 400 });
    }

    // Decap CMS expects the response to be sent via postMessage to the opener window
    const content = `
      <!DOCTYPE html>
      <html>
      <body>
        <script>
          const receiveMessage = (message) => {
            window.opener.postMessage(
              'authorization:github:success:${JSON.stringify(data)}',
              message.origin
            );
            window.removeEventListener("message", receiveMessage, false);
          }
          window.addEventListener("message", receiveMessage, false);
          window.opener.postMessage("authorizing:github", "*");
        </script>
      </body>
      </html>
    `;

    return new NextResponse(content, {
      headers: { "Content-Type": "text/html" },
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to exchange token" }, { status: 500 });
  }
}
