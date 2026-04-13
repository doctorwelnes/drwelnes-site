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
      <head>
        <meta charset="utf-8">
        <title>Авторизация...</title>
      </head>
      <body>
        <div style="font-family: sans-serif; text-align: center; margin-top: 50px;">
          Авторизация успешна. Это окно закроется автоматически...
        </div>
        <script>
          (function() {
            const data = ${JSON.stringify(formattedData)};
            const msg = 'authorization:github:success:' + JSON.stringify(data);
            
            function sendMsg() {
              if (window.opener) {
                window.opener.postMessage(msg, "*");
              }
            }
            
            // Отправляем данные сразу
            sendMsg();
            
            // Если админка пришлет запрос
            window.addEventListener("message", function(e) {
              if (e.data === "authorizing:github") {
                sendMsg();
              }
            });
            
            // Надежный фолбэк: так как мы поставили cookie, просто просим родителя перезагрузиться
            // После перезагрузки скрипт в index.html сам прочитает cookie и зайдет в панель
            setTimeout(function() {
              if (window.opener) {
                try {
                  window.opener.location.reload();
                } catch(err) {
                  // Silent fail for reload
                }
              }
              window.close();
            }, 1000);
          })();
        </script>
      </body>
      </html>
    `;

    const htmlResponse = new NextResponse(content, {
      headers: { "Content-Type": "text/html" },
    });

    // Устанавливаем cookies для кастомного обработчика в public/admin/index.html
    htmlResponse.cookies.set("decap_token", data.access_token, {
      path: "/admin",
      secure: true,
      sameSite: "lax",
    });
    htmlResponse.cookies.set("decap_provider", "github", {
      path: "/admin",
      secure: true,
      sameSite: "lax",
    });

    return htmlResponse;
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete file" }, { status: 500 });
  }
}
