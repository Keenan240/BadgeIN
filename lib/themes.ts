export interface BadgeTheme {
  id: string;
  label: string;
  /** Background colour (hex, used for both CSS and PDF) */
  bg: string;
  /** Foreground colour for text and accents */
  fg: string;
  /** Which logo variant to use on this background */
  logoVariant: "dark" | "light";
}

/**
 * Available badge colour themes. Classic is the default.
 * Coloured themes all use the white logo variant and white text,
 * with a white QR wrapper so the code stays scannable.
 */
export const BADGE_THEMES: BadgeTheme[] = [
  { id: "classic", label: "Classic",      bg: "#FFFFFF", fg: "#000000", logoVariant: "dark"  },
  { id: "blue",    label: "Ocean Blue",   bg: "#1D4ED8", fg: "#FFFFFF", logoVariant: "light" },
  { id: "green",   label: "Jungle Green", bg: "#166534", fg: "#FFFFFF", logoVariant: "light" },
  { id: "slate",   label: "Slate Night",  bg: "#1E293B", fg: "#FFFFFF", logoVariant: "light" },
  { id: "violet",  label: "Deep Violet",  bg: "#5B21B6", fg: "#FFFFFF", logoVariant: "light" },
];

export const DEFAULT_THEME = BADGE_THEMES[0];
