export interface RawCsvRow {
  [column: string]: string;
}

export interface ColumnMapping {
  name: string;
  position?: string;
  company?: string;
  linkedin: string;
}

export interface Attendee {
  id: string;
  name: string;
  position?: string;
  company?: string;
  linkedin: string;
  qrDataUrl?: string;
}

export interface AttendeeWarning {
  attendeeId: string;
  field: "linkedin" | "name" | "general";
  message: string;
}

export interface ParsedCsv {
  rawRows: RawCsvRow[];
  detectedColumns: string[];
  fileName: string;
}

export type WizardStep = "upload" | "mapping" | "preview";

export type Orientation = "portrait" | "landscape";

// Portrait:  3 cols × 3 rows = 9 per page  (badge 2.2" × 3.667", margins 0.95" L/R, 0" T/B)
// Landscape: 2 cols × 4 rows = 8 per page  (badge 3.4" × 2.5",   margins 0.85" L/R, 0.5" T/B on letter)
export const BADGES_PER_PAGE: Record<Orientation, number> = {
  portrait: 9,
  landscape: 8,
};
