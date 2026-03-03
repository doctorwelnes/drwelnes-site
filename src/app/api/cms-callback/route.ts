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
    const baseUrl = process.env.NEXTAUTH_URL?.replace(/\/$/, "") || "https://drwelnes.ru";
    const redirect_uri = `${baseUrl}/api/cms-callback`;

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
        redirect_uri,
      }),
    });

    const data = await response.json();

    if (data.error) {
      console.error("GitHub OAuth Error:", data);
      return NextResponse.json(data, { status: 400 });
    }

    // Decap CMS expects 'token' and 'provider'
    const formattedData = {
      token: data.access_token,
      provider: "github",
    };

    // Decap CMS expects the response to be sent via postMessage to the opener window
    const content = `
      <!DOCTYPE html>
      <html>
      <head><title>Авторизация...</title></head>
      <body>
        <div style="font-family: sans-serif; text-align: center; margin-top: 50px;">
          Авторизация завершена. Это окно закроется автоматически...
        </div>
        <script>
          (function() {
            const data = ${JSON.stringify(formattedData)};
            const message = 'authorization:github:success:' + JSON.stringify(data);
            
            console.log("Sending auth data to opener...");
            
            // Отправляем сразу (для некоторых версий)
            window.opener.postMessage(message, "*");
            
            // Слушаем рукопожатие (для стандартного протокола)
            const receiveMessage = (event) => {
              console.log("Received message from opener:", event.data);
              if (event.data === "authorizing:github") {
                window.opener.postMessage(message, event.origin);
              }
            };
            
            window.addEventListener("message", receiveMessage, false);
            window.opener.postMessage("authorizing:github", "*");
            
            // Принудительно закрываем окно через небольшой промежуток времени
            setTimeout(() => {
              window.close();
            }, 1000);
          })();
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
