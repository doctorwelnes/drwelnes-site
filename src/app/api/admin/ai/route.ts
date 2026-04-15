import { NextRequest, NextResponse } from "next/server";
import { checkAdmin } from "@/lib/admin-auth";

export async function POST(req: NextRequest) {
  try {
    if (!(await checkAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { command, content, frontmatter } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: "GEMINI_API_KEY not configured" }, { status: 500 });
    }

    let prompt = "";
    if (command === "generate-tags") {
      prompt = `Извлеки 5-7 ключевых тегов (одним словом на русском) для следующего контента. Верни ТОЛЬКО JSON массив строк. 
      Контент: ${content || frontmatter.title}`;
    } else if (command === "seo-description") {
      prompt = `Напиши краткое (до 160 символов) SEO-описание на русском для этого контента. Оно должно быть завлекающим.
      Контент: ${content || frontmatter.title}`;
    } else if (command === "refactor") {
      prompt = `Причеши этот Markdown текст на русском: исправь опечатки, улучши структуру (используй списки, заголовки), сделай его более профессиональным, но сохрани смысл. Верни ТОЛЬКО исправленный текст.
      Текст: ${content}`;
    } else if (command === "exercise-mistakes") {
      prompt = `Составь список из 3-4 типичных ошибок при выполнении упражнения "${frontmatter.title}". 
      Верни ТОЛЬКО JSON массив строк на русском языке.
      Пример: ["Слишком быстрый темп", "Круглая спина"]`;
    } else if (command === "exercise-advice") {
      prompt = `Дай один короткий, но очень полезный профессиональный совет по технике выполнения упражнения "${frontmatter.title}". 
      Верни ТОЛЬКО текст совета на русском языке без лишних знаков.`;
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      },
    );

    if (!response.ok) {
      const errData = await response.json();
      return NextResponse.json(
        { error: `Google API Error: ${JSON.stringify(errData)}` },
        { status: response.status },
      );
    }

    const data = await response.json();
    const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    if (command === "generate-tags") {
      try {
        const cleaned = resultText.replace(/```json|```/g, "").trim();
        const tags = JSON.parse(cleaned);
        return NextResponse.json({ tags });
      } catch {
        return NextResponse.json({ error: "Failed to parse tags" });
      }
    } else if (command === "seo-description") {
      return NextResponse.json({ description: resultText.trim() });
    } else if (command === "refactor") {
      return NextResponse.json({ content: resultText.trim() });
    } else if (command === "exercise-mistakes") {
      try {
        const jsonMatch = resultText.match(/\[[\s\S]*\]/);
        const cleaned = jsonMatch ? jsonMatch[0] : resultText.replace(/```json|```/g, "").trim();
        const mistakes = JSON.parse(cleaned);
        return NextResponse.json({ mistakes });
      } catch {
        return NextResponse.json({
          error: "Ошибка парсинга JSON: " + resultText.substring(0, 50) + "...",
        });
      }
    } else if (command === "exercise-advice") {
      return NextResponse.json({ advice: resultText.trim() });
    }

    return NextResponse.json({ error: "Unknown command" }, { status: 400 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: "AI API Error: " + message }, { status: 500 });
  }
}
