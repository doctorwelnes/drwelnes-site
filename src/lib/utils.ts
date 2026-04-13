/**
 * Russian pluralization utility
 * @param value Number to determine plural form
 * @param one Form for 1 (e.g., "рецепт")
 * @param two Form for 2, 3, 4 (e.g., "рецепта")
 * @param five Form for 5-20, 0 (e.g., "рецептов")
 */
export function pluralize(value: number, one: string, two: string, five: string): string {
  let n = Math.abs(value);
  n %= 100;
  if (n >= 5 && n <= 20) {
    return five;
  }
  n %= 10;
  if (n === 1) {
    return one;
  }
  if (n >= 2 && n <= 4) {
    return two;
  }
  return five;
}
