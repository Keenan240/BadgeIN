import type { Attendee } from "./types";

export function badgeSubtitle(attendee: Pick<Attendee, "position" | "company">): string | null {
  const { position, company } = attendee;
  if (position && company) return `${position} @ ${company}`;
  if (position) return position;
  if (company) return company;
  return null;
}
