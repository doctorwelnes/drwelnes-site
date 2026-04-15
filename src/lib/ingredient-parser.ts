/**
 * Local regex-based ingredient parser for recipes
 * Parses text like "200г муки", "2 яйца", "100 мл молока" into structured ingredients
 */

export interface ParsedIngredient {
  name: string;
  amount?: string;
  weight?: string;
}

function capitalizeText(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return trimmed;
  return `${trimmed.charAt(0).toUpperCase()}${trimmed.slice(1)}`;
}

/**
 * Parse ingredient text into structured format
 * Supports formats:
 * - "200г муки" -> { name: "муки", amount: "200", weight: "г" }
 * - "2 яйца" -> { name: "яйца", amount: "2" }
 * - "100 мл молока" -> { name: "молока", amount: "100", weight: "мл" }
 * - "1/2 стакана сахара" -> { name: "сахара", amount: "1/2", weight: "стакана" }
 */
export function parseIngredientText(text: string): ParsedIngredient[] {
  const ingredients: ParsedIngredient[] = [];

  // Split by common separators: newlines, commas, semicolons
  const lines = text
    .split(/[\n,;•]/)
    .map((line) => line.trim())
    // Remove leading bullets, dashes and numbered list markers
    .map((line) =>
      line
        .replace(/^[-*•]+\s*/, "")
        .replace(/^\d+[.)]\s*/, "")
        .trim(),
    )
    .filter((line) => line.length > 0);

  for (const line of lines) {
    const parsed = parseSingleIngredient(line);
    if (parsed) {
      ingredients.push(parsed);
    }
  }

  return ingredients;
}

/**
 * Parse a single ingredient line
 */
function parseSingleIngredient(line: string): ParsedIngredient | null {
  const amountPattern = "(?:\\d+(?:[.,]\\d+)?(?:\\s+\\d+\\/\\d+)?|\\d+\\/\\d+)";
  const unitPattern =
    "(?:г|гр|грамм|мл|миллилитр|шт|штука|стакан(?:а)?|ч\\.?\\s*л\\.?|чайная(?:\\s+ложка)?|ст\\.?\\s*л\\.?|столовая(?:\\s+ложка)?)";

  const buildAmountWithUnit = (amount: string, unit: string) =>
    `${amount} ${unit.replace(/\s+/g, " ").trim()}`.trim();

  // Pattern 1: Number + unit + name (e.g., "200г муки", "100 мл молока", "1 ч. л. соли")
  // Match the entire line including parentheses in the name
  const pattern1 = new RegExp(`^(${amountPattern})\\s*(${unitPattern})\\s+(.+)$`, "i");
  const match1 = line.match(pattern1);

  if (match1) {
    const normalizedUnit = normalizeUnit(match1[2]);

    return {
      amount:
        normalizedUnit === "г" || normalizedUnit === "мл"
          ? match1[1].trim()
          : buildAmountWithUnit(match1[1].trim(), match1[2]),
      weight: normalizedUnit === "г" || normalizedUnit === "мл" ? normalizedUnit : undefined,
      name: capitalizeText(match1[3]),
    };
  }

  // Pattern 1.5: Number + unit without space + name (e.g., "200гмуки", "100млмолока")
  const pattern1b = new RegExp(`^(${amountPattern})(${unitPattern})(.+)$`, "i");
  const match1b = line.match(pattern1b);

  if (match1b) {
    const normalizedUnit = normalizeUnit(match1b[2]);

    return {
      amount:
        normalizedUnit === "г" || normalizedUnit === "мл"
          ? match1b[1].trim()
          : buildAmountWithUnit(match1b[1].trim(), match1b[2]),
      weight: normalizedUnit === "г" || normalizedUnit === "мл" ? normalizedUnit : undefined,
      name: capitalizeText(match1b[3]),
    };
  }

  // Pattern 2: Number + name (e.g., "2 яйца", "3 помидора", "1 средняя морковь")
  const pattern2 = new RegExp(`^(${amountPattern})\\s+(.+)$`, "i");
  const match2 = line.match(pattern2);

  if (match2) {
    return {
      amount: match2[1].trim(),
      name: capitalizeText(match2[2]),
    };
  }

  // Pattern 3: Just name (e.g., "соль по вкусу", "ваниль по вкусу", "разрыхлитель")
  if (line.length > 0) {
    return {
      name: capitalizeText(line),
    };
  }

  return null;
}

/**
 * Normalize unit abbreviations
 */
function normalizeUnit(unit: string): string {
  const unitMap: Record<string, string> = {
    г: "г",
    гр: "г",
    грамм: "г",
    мл: "мл",
    миллилитр: "мл",
    шт: "шт",
    штука: "шт",
    стакан: "стакан",
    стакана: "стакан",
    "ч.л": "ч.л.",
    чайная: "ч.л.",
    ложка: "ч.л.",
    "ст.л": "ст.л.",
    столовая: "ст.л.",
  };

  const normalized = unit.toLowerCase().trim();
  return unitMap[normalized] || normalized;
}

/**
 * Parse multiple ingredients from text and return as JSON string
 * Useful for API responses
 */
export function parseIngredientsToJSON(text: string): string {
  const ingredients = parseIngredientText(text);
  return JSON.stringify(ingredients, null, 2);
}
