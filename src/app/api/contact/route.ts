import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { writeLimiter, applyRateLimit } from "@/lib/rate-limiter";
import { sendTelegramHtmlMessage } from "@/lib/telegram";

const contactSchema = z.object({
  name: z.string().min(2, "Имя должно содержать минимум 2 символа"),
  contact: z.string().min(5, "Контакт должен содержать минимум 5 символов"),
  message: z.string().optional(),
  category: z.string().min(1, "Выберите тип консультации"),
});

export async function POST(req: NextRequest) {
  // Apply rate limiting (max 3 requests per 15 minutes for contact forms)
  const rateLimitResponse = await applyRateLimit(req, writeLimiter);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const body = await req.json();
    const result = contactSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Некорректные данные", details: result.error.flatten() },
        { status: 400 },
      );
    }

    const { name, contact, message, category } = result.data;

    // Получение информации о категории
    const categoryInfo = {
      personal: { icon: "🏃", name: "Персональные тренировки" },
      group: { icon: "👥", name: "Групповые программы" },
      nutrition: { icon: "🥗", name: "Консультации питания" },
      recovery: { icon: "💪", name: "Восстановление" },
      other: { icon: "📝", name: "Другое" },
    };

    const selectedCategory =
      categoryInfo[category as keyof typeof categoryInfo] || categoryInfo.other;

    const telegramMessage = await sendTelegramHtmlMessage({
      context: "contact",
      title: "Новая заявка на консультацию!",
      fields: [
        { label: "Имя", value: name },
        { label: "Контакт", value: contact },
        { label: "Категория", value: `${selectedCategory.icon} ${selectedCategory.name}` },
        { label: "Сообщение", value: message || "Нет сообщения" },
        {
          label: "Время",
          value: new Date().toLocaleString("ru-RU", {
            timeZone: "Europe/Moscow",
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ],
    });

    if (!telegramMessage.ok && !telegramMessage.skipped) {
      console.warn("Telegram notification for consultation failed", telegramMessage.reason);
    }

    // Логируем заявку для резервного копирования
    console.log("Новая заявка на консультацию:", {
      name,
      contact,
      message,
      category,
      categoryName: selectedCategory.name,
    });

    return NextResponse.json({ success: true, message: "Заявка успешно отправлена" });
  } catch {
    return NextResponse.json({ error: "Произошла ошибка при отправке заявки" }, { status: 500 });
  }
}
