import type { ColumnMapping } from "./types";

const AUTO_DETECT: Record<keyof ColumnMapping, string[]> = {
  name: [
    "name",
    "full name",
    "attendee name",
    "guest name",
    "first and last name",
    "your name",
    "what is your name",
    "display name",
  ],
  position: [
    "position",
    "role",
    "title",
    "job title",
    "current role",
    "current position",
    "job role",
    "what is your role",
    "what is your title",
    "what is your position",
    "occupation",
    "profession",
  ],
  company: [
    "company",
    "employer",
    "organization",
    "org",
    "workplace",
    "current company",
    "company name",
    "where do you work",
    "what company",
    "what organization",
  ],
  linkedin: [
    "linkedin",
    "linkedin url",
    "linkedin profile",
    "linkedin link",
    "linked in",
    "what is your linkedin",
    "your linkedin",
    "linkedin profile url",
    "linkedin handle",
    "share your linkedin",
    "linkedin profile link",
  ],
};

function score(column: string, candidates: string[]): number {
  const c = column.toLowerCase().trim();
  for (let i = 0; i < candidates.length; i++) {
    if (c === candidates[i]) return 100 - i;
  }
  for (let i = 0; i < candidates.length; i++) {
    if (c.includes(candidates[i])) return 50 - i;
  }
  return 0;
}

export function autoDetectMapping(columns: string[]): Partial<ColumnMapping> {
  const mapping: Partial<ColumnMapping> = {};
  const fields: (keyof ColumnMapping)[] = ["name", "linkedin", "position", "company"];

  for (const field of fields) {
    let bestColumn: string | undefined;
    let bestScore = 0;
    for (const col of columns) {
      const s = score(col, AUTO_DETECT[field]);
      if (s > bestScore) {
        bestScore = s;
        bestColumn = col;
      }
    }
    if (bestColumn) {
      mapping[field] = bestColumn;
    }
  }

  return mapping;
}
