import type { BadgeTheme } from "@/lib/themes";

export const CUSTOM_THEME_ID = "custom" as const;

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  let h = hex.trim();
  if (h.startsWith("#")) h = h.slice(1);
  if (h.length === 3) {
    h = h
      .split("")
      .map((c) => c + c)
      .join("");
  }
  if (h.length !== 6 || !/^[0-9a-fA-F]{6}$/.test(h)) return null;
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

/** Normalizes to #RRGGBB or null if invalid */
export function normalizeHexColor(input: string): string | null {
  const rgb = hexToRgb(input);
  if (!rgb) return null;
  const to2 = (n: number) => n.toString(16).padStart(2, "0");
  return `#${to2(rgb.r)}${to2(rgb.g)}${to2(rgb.b)}`.toUpperCase();
}

function relativeLuminance(hex: string): number | null {
  const rgb = hexToRgb(hex);
  if (!rgb) return null;
  const lin = [rgb.r, rgb.g, rgb.b].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * lin[0]! + 0.7152 * lin[1]! + 0.0722 * lin[2]!;
}

function contrastRatio(lum1: number, lum2: number): number {
  const L1 = Math.max(lum1, lum2);
  const L2 = Math.min(lum1, lum2);
  return (L1 + 0.05) / (L2 + 0.05);
}

/** Pick #000000 or #FFFFFF based on which has higher WCAG contrast vs background */
export function pickForegroundForBackground(bgHex: string): { fg: string; logoVariant: "dark" | "light" } {
  const lumBg = relativeLuminance(bgHex);
  if (lumBg == null) return { fg: "#000000", logoVariant: "dark" };
  const lumBlack = 0;
  const lumWhite = 1;
  const cBlack = contrastRatio(lumBg, lumBlack);
  const cWhite = contrastRatio(lumBg, lumWhite);
  if (cBlack > cWhite) return { fg: "#000000", logoVariant: "dark" };
  if (cWhite > cBlack) return { fg: "#FFFFFF", logoVariant: "light" };
  return lumBg > 0.5 ? { fg: "#000000", logoVariant: "dark" } : { fg: "#FFFFFF", logoVariant: "light" };
}

export function buildCustomTheme(bgHex: string): BadgeTheme | null {
  const bg = normalizeHexColor(bgHex);
  if (!bg) return null;
  const { fg, logoVariant } = pickForegroundForBackground(bg);
  return {
    id: CUSTOM_THEME_ID,
    label: "Custom",
    bg,
    fg,
    logoVariant,
  };
}
