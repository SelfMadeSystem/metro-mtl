/**
 * Normalizes a string by removing all whitespace, periods, dashes, and apostrophes,
 * converting it to lowercase, and removing all accents and (eg `ﬁ` -> `fi`)
 */
export function normalizeString(s: string): string {
  return s
    .normalize("NFKD")
    .replace(/[\u0300-\u036F.\-'\s]/g, "")
    .toLowerCase();
}

/**
 * Removes consecutive duplicates from an array. For example, `[1, 1, 2, 3, 3, 3, 4]` becomes `[1, 2, 3, 4]`.
 */
export function deduplicate<T>(arr: T[]): T[] {
  return arr.filter((item, index) => index === 0 || item !== arr[index - 1]);
}
