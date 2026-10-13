/** Textarea value (one item per line) → list stored in a JSON column. */
export function parseLines(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

/** JSON column value → list of strings; anything malformed reads as empty. */
export function asStringList(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((v): v is string => typeof v === "string") : [];
}

/** JSON column value → textarea value. */
export function toLines(value: unknown): string {
  return asStringList(value).join("\n");
}
