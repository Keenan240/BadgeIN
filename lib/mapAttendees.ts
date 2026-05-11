import type { Attendee, AttendeeWarning, ColumnMapping, RawCsvRow } from "./types";
import { isLikelyLinkedIn, normalizeLinkedIn } from "./normalizeLinkedIn";

export interface MapResult {
  attendees: Attendee[];
  warnings: AttendeeWarning[];
}

export function mapAttendees(
  rows: RawCsvRow[],
  mapping: ColumnMapping
): MapResult {
  const attendees: Attendee[] = [];
  const warnings: AttendeeWarning[] = [];

  rows.forEach((row, index) => {
    const id = `attendee-${index}`;
    const name = (row[mapping.name] ?? "").trim();
    const linkedinRaw = (row[mapping.linkedin] ?? "").trim();
    const position = mapping.position
      ? (row[mapping.position] ?? "").trim() || undefined
      : undefined;
    const company = mapping.company
      ? (row[mapping.company] ?? "").trim() || undefined
      : undefined;

    if (!name) {
      warnings.push({
        attendeeId: id,
        field: "name",
        message: `Row ${index + 1}: missing name — skipped.`,
      });
      return;
    }

    const linkedin = normalizeLinkedIn(linkedinRaw);

    if (!linkedin) {
      warnings.push({
        attendeeId: id,
        field: "linkedin",
        message: `Row ${index + 1} (${name}): no LinkedIn URL — badge will have no QR code.`,
      });
    } else if (!isLikelyLinkedIn(linkedin)) {
      warnings.push({
        attendeeId: id,
        field: "linkedin",
        message: `${name}: URL doesn't look like a LinkedIn profile, but included anyway.`,
      });
    }

    if (name.length > 32) {
      warnings.push({
        attendeeId: id,
        field: "name",
        message: `${name}: name is long and may be truncated on the badge.`,
      });
    }

    attendees.push({
      id,
      name,
      position,
      company,
      linkedin,
    });
  });

  return { attendees, warnings };
}
