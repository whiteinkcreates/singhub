export type TsvRow = Record<string, string>;

export function parseTsv(content: string): TsvRow[] {
  const lines = content
    .split(/\r?\n/)
    .map((line) => line.trimEnd())
    .filter(Boolean);

  const headers = lines[0]?.split("\t") ?? [];

  return lines.slice(1).map((line) => {
    const values = line.split("\t");

    return headers.reduce<TsvRow>((row, header, index) => {
      row[header] = values[index] ?? "";
      return row;
    }, {});
  });
}

export function firstValue(row: TsvRow, keys: string[]): string {
  for (const key of keys) {
    const value = row[key]?.trim();

    if (value) {
      return value;
    }
  }

  return "";
}
