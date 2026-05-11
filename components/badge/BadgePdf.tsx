"use client";

import {
  Document,
  Font,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import { badgeSubtitle } from "@/lib/badgeSubtitle";
import { DEFAULT_THEME, type BadgeTheme } from "@/lib/themes";
import { BADGES_PER_PAGE, type Attendee, type Orientation } from "@/lib/types";

try {
  Font.register({
    family: "DM Mono",
    fonts: [
      { src: "https://fonts.gstatic.com/s/dmmono/v16/aFTU7PB1QTsUX8KYhh0.ttf", fontWeight: 400 },
      { src: "https://fonts.gstatic.com/s/dmmono/v16/aFTR7PB1QTsUX8KYvumzIYQ.ttf", fontWeight: 500 },
    ],
  });
} catch {
  /* already registered (e.g. Fast Refresh) */
}

const MARK_COLORS_DARK = [
  ["#1E1E1E", "#777777", "#777777"],
  ["#1E1E1E", "#A7A7A7", "#CACACA"],
  ["#383838", "#CACACA", "#EFEFEF"],
] as const;

const MARK_COLORS_LIGHT = [
  ["#EFEFEF",                 "#FFFFFF",                 "rgba(255,255,255,0.75)"],
  ["#FFFFFF",                 "rgba(255,255,255,0.75)",  "rgba(255,255,255,0.5)"],
  ["rgba(255,255,255,0.75)",  "rgba(255,255,255,0.5)",   "rgba(255,255,255,0.5)"],
] as const;

function PdfBadgeMark({ size = 22, variant = "dark" }: { size?: number; variant?: "dark" | "light" }) {
  const LOGO_W = size;
  const LOGO_H = (38 / 42) * LOGO_W;
  const R = (5.68041 / 42) * LOGO_W;
  const cx = [5.68041, 19, 32.3196].map((x) => (x / 42) * LOGO_W);
  const cy = [5.68041, 18.9997, 32.3196].map((y) => (y / 38) * LOGO_H);
  const palette = variant === "light" ? MARK_COLORS_LIGHT : MARK_COLORS_DARK;
  return (
    <View style={{ width: LOGO_W, height: LOGO_H, position: "relative" }}>
      {[0, 1, 2].flatMap((i) =>
        [0, 1, 2].map((j) => (
          <View
            key={`${i}-${j}`}
            style={{
              position: "absolute",
              left: cx[j] - R,
              top: cy[i] - R,
              width: R * 2,
              height: R * 2,
              borderRadius: R,
              backgroundColor: palette[i][j],
            }}
          />
        ))
      )}
    </View>
  );
}

// ── Badge dimensions (1 in = 72 pt) ────────────────────────────────────────
// Landscape: 3.4"  × 2.5"     →  2 cols × 4 rows = 8 per letter page
// Portrait:  2.2"  × 3.667"   →  3 cols × 3 rows = 9 per letter page
//
// Letter = 612 × 792 pt
//   Landscape margins: L/R = (612 − 2×244.8)/2 = 61.2 pt,  T/B = (792 − 4×180)/2 = 36 pt
//   Portrait  margins: L/R = (612 − 3×158.4)/2 = 68.4 pt,  T/B = 0

const L_W = 3.4 * 72;  // 244.8 pt
const L_H = 2.5 * 72;  // 180 pt
const L_PAD_V = (612 - 2 * L_W) / 2;  // 61.2 pt
const L_PAD_H = (792 - 4 * L_H) / 2;  // 36 pt

const P_W = 2.2 * 72;  // 158.4 pt
const P_H = 792 / 3;   // 264 pt (≈ 3.667 in — 0.84 mm shorter than 3.7")
const P_PAD_V = (612 - 3 * P_W) / 2;  // 68.4 pt
const P_PAD_H = 0;     // grid fills full page height

const CUT = { borderWidth: 0.25, borderStyle: "solid" as const, borderColor: "rgba(0,0,0,0.1)" };
const dm = "DM Mono";

const CUT_LABEL_TEXT = "CUT  \u00B7  CUT  \u00B7  CUT  \u00B7  CUT  \u00B7  CUT  \u00B7  CUT  \u00B7  CUT";
const CUT_LABEL_STYLE = { fontFamily: dm, fontWeight: 400 as const, fontSize: 5.5, color: "rgba(0,0,0,0.28)", letterSpacing: 2 };

/** Left/right vertical cut labels for a PDF page */
function PdfCutSides({ pageH, leftW, rightW, insetV = 0 }: { pageH: number; leftW: number; rightW: number; insetV?: number }) {
  const side: object = { position: "absolute" as const, justifyContent: "center", alignItems: "center" };
  return (
    <>
      <View style={{ ...side, top: insetV, bottom: insetV, left: 0, width: leftW }}>
        <Text style={{ ...CUT_LABEL_STYLE, transform: "rotate(-90deg)" }}>{CUT_LABEL_TEXT}</Text>
      </View>
      <View style={{ ...side, top: insetV, bottom: insetV, right: 0, width: rightW }}>
        <Text style={{ ...CUT_LABEL_STYLE, transform: "rotate(90deg)" }}>{CUT_LABEL_TEXT}</Text>
      </View>
    </>
  );
}

/** Top/bottom horizontal cut labels for a PDF page */
function PdfCutTopBottom({ pageW, topH, bottomH, insetH = 0 }: { pageW: number; topH: number; bottomH: number; insetH?: number }) {
  const strip: object = { position: "absolute" as const, justifyContent: "center", alignItems: "center" };
  return (
    <>
      <View style={{ ...strip, top: 0, left: insetH, right: insetH, height: topH }}>
        <Text style={CUT_LABEL_STYLE}>{CUT_LABEL_TEXT}</Text>
      </View>
      <View style={{ ...strip, bottom: 0, left: insetH, right: insetH, height: bottomH }}>
        <Text style={CUT_LABEL_STYLE}>{CUT_LABEL_TEXT}</Text>
      </View>
    </>
  );
}

const s = StyleSheet.create({
  // Pages: white letter sheet with badge grid centred
  lPage: {
    backgroundColor: "#ffffff", width: 612, height: 792,
    flexDirection: "row", flexWrap: "wrap",
    paddingTop: L_PAD_H, paddingBottom: L_PAD_H,
    paddingLeft: L_PAD_V, paddingRight: L_PAD_V,
  },
  pPage: {
    backgroundColor: "#ffffff", width: 612, height: 792,
    flexDirection: "row", flexWrap: "wrap",
    paddingTop: P_PAD_H, paddingBottom: P_PAD_H,
    paddingLeft: P_PAD_V, paddingRight: P_PAD_V,
  },

  // ── Landscape cell (244.8 × 180 pt) ────────────────────────────────────
  lCell: { width: L_W, height: L_H, ...CUT, overflow: "hidden" },
  lRoot: { width: "100%", height: "100%", position: "relative", backgroundColor: "#ffffff" },
  lInner: { flex: 1, flexDirection: "column", paddingTop: 12, paddingHorizontal: 14, paddingBottom: 12 },
  lHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 },
  lEvent: {
    fontFamily: dm, fontWeight: 500, fontSize: 6.5, color: "#000000",
    textTransform: "uppercase", textAlign: "right", letterSpacing: 0.8,
    maxWidth: "64%", lineHeight: 1.25,
  },
  // paddingRight clears the QR (46 wide + 12 from edge + 4 gap = 62)
  lCenter: { flex: 1, justifyContent: "center", paddingRight: 62 },
  lNameBlock: { marginTop: -8 },
  lName: { fontFamily: dm, fontWeight: 500, fontSize: 18, color: "#000000", textTransform: "uppercase", lineHeight: 1.08 },
  lSubtitle: { fontFamily: dm, fontWeight: 400, fontSize: 9.5, color: "#000000", textTransform: "uppercase", marginTop: 7, lineHeight: 1.35 },
  lQr: { position: "absolute", bottom: 14, right: 12, width: 46, height: 46 },

  // ── Portrait cell (158.4 × 264 pt) ─────────────────────────────────────
  pCell: { width: P_W, height: P_H, ...CUT, overflow: "hidden" },
  pRoot: { width: "100%", height: "100%", position: "relative", backgroundColor: "#ffffff" },
  pInner: { flex: 1, flexDirection: "column", paddingTop: 12, paddingHorizontal: 13, paddingBottom: 12 },
  pHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 },
  pEvent: {
    fontFamily: dm, fontWeight: 500, fontSize: 6.5, color: "#000000",
    textTransform: "uppercase", textAlign: "right", letterSpacing: 0.8,
    maxWidth: "54%", lineHeight: 1.25,
  },
  // paddingRight clears the QR (44 wide + 10 from edge + 4 gap = 58)
  pCenter: { flex: 1, justifyContent: "center", paddingRight: 58, paddingBottom: 6 },
  pNameBlock: { marginTop: -8 },
  pName: { fontFamily: dm, fontWeight: 500, fontSize: 17.5, color: "#000000", textTransform: "uppercase", lineHeight: 1.08 },
  pRole: { fontFamily: dm, fontWeight: 400, fontSize: 8.5, color: "#000000", textTransform: "uppercase", marginTop: 9, lineHeight: 1.35 },
  pQr: { position: "absolute", bottom: 14, right: 10, width: 44, height: 44 },
});

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

function pad<T>(arr: T[], length: number): (T | null)[] {
  const r: (T | null)[] = [...arr];
  while (r.length < length) r.push(null);
  return r;
}

interface BadgePdfProps {
  attendees: Attendee[];
  orientation?: Orientation;
  eventName?: string;
  theme?: BadgeTheme;
}

export function BadgePdf({ attendees, orientation = "portrait", eventName, theme = DEFAULT_THEME }: BadgePdfProps) {
  const perPage = BADGES_PER_PAGE[orientation];
  const pages = chunk(attendees, perPage);

  // Theme-derived inline overrides applied on top of the static StyleSheet
  const isLight = theme.logoVariant === "light";
  const cellBg = { backgroundColor: theme.bg };
  const fg = { color: theme.fg };
  const dividerBg = isLight ? "rgba(255,255,255,0.4)" : "#d4d4d4";
  // QR wrapper (white pill) sits under the QR image when on a coloured background
  const qrWrapperStyle = isLight
    ? { backgroundColor: "#ffffff", borderRadius: 3, padding: 3 }
    : null;

  if (orientation === "landscape") {
    const lEventLine = eventName?.trim() ? eventName.trim().toUpperCase() : null;
    return (
      <Document title="BadgeIn nametags">
        {pages.map((pageAttendees, pi) => {
          const cells = pad(pageAttendees, perPage);
          return (
            <Page key={pi} size="LETTER" style={s.lPage}>
              <PdfCutSides pageH={792} leftW={L_PAD_V} rightW={L_PAD_V} insetV={L_PAD_H} />
              <PdfCutTopBottom pageW={612} topH={L_PAD_H} bottomH={L_PAD_H} insetH={L_PAD_V} />
              {cells.map((a, i) => (
                <View key={i} style={s.lCell}>
                  {a ? (
                    <View style={[s.lRoot, cellBg]}>
                      <View style={s.lInner}>
                        <View style={s.lHeader}>
                          <PdfBadgeMark size={20} variant={theme.logoVariant} />
                          {lEventLine
                            ? <Text style={[s.lEvent, fg]}>{lEventLine}</Text>
                            : <View style={{ width: 22, height: 0.5, backgroundColor: dividerBg, marginTop: 4 }} />}
                        </View>
                        <View style={s.lCenter}>
                          <View style={s.lNameBlock}>
                            <Text style={[s.lName, fg]}>{a.name.toUpperCase()}</Text>
                            {badgeSubtitle(a) ? <Text style={[s.lSubtitle, fg]}>{badgeSubtitle(a)!.toUpperCase()}</Text> : null}
                          </View>
                        </View>
                      </View>
                      {a.qrDataUrl && (
                        qrWrapperStyle ? (
                          <View style={[s.lQr, qrWrapperStyle]}>
                            {/* eslint-disable-next-line jsx-a11y/alt-text */}
                            <Image src={a.qrDataUrl} style={{ width: "100%", height: "100%" }} />
                          </View>
                        ) : (
                          // eslint-disable-next-line jsx-a11y/alt-text
                          <Image src={a.qrDataUrl} style={s.lQr} />
                        )
                      )}
                    </View>
                  ) : null}
                </View>
              ))}
            </Page>
          );
        })}
      </Document>
    );
  }

  const eventLine = eventName?.trim() ? eventName.trim().toUpperCase() : null;

  return (
    <Document title="BadgeIn nametags">
      {pages.map((pageAttendees, pi) => {
        const cells = pad(pageAttendees, perPage);
        return (
          <Page key={pi} size="LETTER" style={s.pPage}>
            <PdfCutSides pageH={792} leftW={P_PAD_V} rightW={P_PAD_V} insetV={0} />
            {cells.map((a, i) => (
              <View key={i} style={s.pCell}>
                {a ? (
                  <View style={[s.pRoot, cellBg]}>
                    <View style={s.pInner}>
                      <View style={s.pHeader}>
                        <PdfBadgeMark size={15} variant={theme.logoVariant} />
                        {eventLine
                          ? <Text style={[s.pEvent, fg]}>{eventLine}</Text>
                          : <View style={{ width: 30, height: 0.5, backgroundColor: dividerBg, marginTop: 4, alignSelf: "flex-end" }} />}
                      </View>
                      <View style={s.pCenter}>
                        <View style={s.pNameBlock}>
                          <Text style={[s.pName, fg]}>{a.name.toUpperCase()}</Text>
                          {badgeSubtitle(a) ? (
                            <Text style={[s.pRole, fg]}>{badgeSubtitle(a)!.toUpperCase()}</Text>
                          ) : null}
                        </View>
                      </View>
                    </View>
                    {a.qrDataUrl ? (
                      qrWrapperStyle ? (
                        <View style={[s.pQr, qrWrapperStyle]}>
                          {/* eslint-disable-next-line jsx-a11y/alt-text */}
                          <Image src={a.qrDataUrl} style={{ width: "100%", height: "100%" }} />
                        </View>
                      ) : (
                        // eslint-disable-next-line jsx-a11y/alt-text
                        <Image src={a.qrDataUrl} style={s.pQr} />
                      )
                    ) : null}
                  </View>
                ) : null}
              </View>
            ))}
          </Page>
        );
      })}
    </Document>
  );
}
