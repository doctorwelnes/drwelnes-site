import { NextRequest, NextResponse } from "next/server";
import { parseIngredientText } from "@/lib/ingredient-parser";
import { checkAdmin } from "@/lib/admin-auth";

export async function POST(req: NextRequest) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { text } = body;

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    const ingredients = parseIngredientText(text);

    return NextResponse.json({ ingredients });
  } catch (error) {
    console.error("Error parsing ingredients:", error);
    return NextResponse.json(
      { error: "Failed to parse ingredients" },
      { status: 500 }
    );
  }
}
