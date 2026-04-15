/**
 * Test file for ingredient parser
 * Run with: npx tsx src/lib/ingredient-parser.test.ts
 */

import { parseIngredientText } from "./ingredient-parser";

type ComparableIngredient = {
  name: string;
  amount?: string;
  weight?: string;
};

function normalizeIngredients(items: Array<ComparableIngredient | { [key: string]: unknown }>) {
  return items.map((item) => ({
    name: String(item.name ?? ""),
    amount: item.amount ? String(item.amount) : undefined,
    weight: item.weight ? String(item.weight) : undefined,
  }));
}

const testCases = [
  {
    name: "Simple format with grams",
    input: "200г муки\n100г сахара",
    expected: [
      { name: "Муки", amount: "200", weight: "г" },
      { name: "Сахара", amount: "100", weight: "г" },
    ],
  },
  {
    name: "Format with milliliters",
    input: "100 мл молока\n50 мл воды",
    expected: [
      { name: "Молока", amount: "100", weight: "мл" },
      { name: "Воды", amount: "50", weight: "мл" },
    ],
  },
  {
    name: "Format with pieces",
    input: "2 яйца\n3 помидора",
    expected: [
      { name: "Яйца", amount: "2" },
      { name: "Помидора", amount: "3" },
    ],
  },
  {
    name: "Count units are preserved in amount",
    input: "1 шт яйца\n1 штука банана",
    expected: [
      { name: "Яйца", amount: "1 шт" },
      { name: "Банана", amount: "1 шт" },
    ],
  },
  {
    name: "Mixed format",
    input: "200г муки, 2 яйца, 100 мл молока, 1 ч.л. соли",
    expected: [
      { name: "Муки", amount: "200", weight: "г" },
      { name: "Яйца", amount: "2" },
      { name: "Молока", amount: "100", weight: "мл" },
      { name: "Соли", amount: "1 ч. л." },
    ],
  },
  {
    name: "Fractional amounts",
    input: "1/2 стакана сахара\n1 1/2 ч.л. соли",
    expected: [
      { name: "Сахара", amount: "1/2 стакана" },
      { name: "Соли", amount: "1 1/2 ч. л." },
    ],
  },
  {
    name: "User's exact example",
    input: `- 1 средняя морковь\n- 1 банан\n- 1 яйцо\n- 50 мл молока\n- 50 г муки\n- 30 г грецких орехов (в тесто)\n- ваниль по вкусу\n- разрыхлитель\n- 200 г греческого йогурта\n- 2 ст. л. эритритола (в тесто и в крем)`,
    expected: [
      { name: "Средняя морковь", amount: "1" },
      { name: "Банан", amount: "1" },
      { name: "Яйцо", amount: "1" },
      { name: "Молока", amount: "50", weight: "мл" },
      { name: "Муки", amount: "50", weight: "г" },
      { name: "Грецких орехов (в тесто)", amount: "30", weight: "г" },
      { name: "Ваниль по вкусу" },
      { name: "Разрыхлитель" },
      { name: "Греческого йогурта", amount: "200", weight: "г" },
      { name: "Эритритола (в тесто и в крем)", amount: "2 ст. л." },
    ],
  },
];

console.log("🧪 Testing Ingredient Parser\n");

testCases.forEach((testCase, index) => {
  console.log(`Test ${index + 1}: ${testCase.name}`);
  console.log(`Input: ${testCase.input}`);

  const result = parseIngredientText(testCase.input);
  console.log(`Result:`, JSON.stringify(result, null, 2));

  const passed =
    JSON.stringify(normalizeIngredients(result)) ===
    JSON.stringify(normalizeIngredients(testCase.expected));
  console.log(`Status: ${passed ? "✅ PASSED" : "❌ FAILED"}`);
  console.log("---\n");
});

console.log("🎉 All tests completed!");
