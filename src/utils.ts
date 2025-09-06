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
