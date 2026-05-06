const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface ParsedEmails {
  valid: string[];
  invalid: string[];
  duplicates: string[];
}

/** Aceita emails separados por vírgula, ponto-e-vírgula, espaço ou quebra de linha. */
export function parseEmails(raw: string): ParsedEmails {
  const tokens = raw
    .split(/[\s,;]+/)
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean);

  const seen = new Set<string>();
  const valid: string[] = [];
  const invalid: string[] = [];
  const duplicates: string[] = [];

  tokens.forEach((token) => {
    if (!emailRegex.test(token)) {
      invalid.push(token);
      return;
    }
    if (seen.has(token)) {
      duplicates.push(token);
      return;
    }
    seen.add(token);
    valid.push(token);
  });

  return { valid, invalid, duplicates };
}

/** Lê emails de um CSV simples (uma coluna ou primeira coluna). */
export async function parseEmailsFromFile(file: File): Promise<ParsedEmails> {
  const text = await file.text();
  // Trata tanto CSV (vírgulas) quanto uma lista simples
  const lines = text.split(/\r?\n/);
  const tokens = lines
    .map((line) => {
      const first = line.split(",")[0];
      return (first ?? "").trim();
    })
    .filter((token) => token && !token.toLowerCase().includes("email")); // ignora header
  return parseEmails(tokens.join("\n"));
}
