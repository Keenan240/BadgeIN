"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Loader2,
  Plus,
  Printer,
  Users,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { OrientationToggle } from "@/components/badge/OrientationToggle";
import { BadgeFront } from "@/components/badge/BadgeFront";
import { BadgeCard } from "@/components/badge/BadgeCard";
import { BadgeSheet } from "@/components/badge/BadgeSheet";
import { generateQrBatch } from "@/lib/generateQr";
import { mapAttendees } from "@/lib/mapAttendees";
import { cn } from "@/lib/cn";
import {
  AMAZON_LANYARD_HORIZONTAL_HOLDER_URL,
  AMAZON_LANYARD_VERTICAL_HOLDER_URL,
} from "@/lib/lanyardHolders";
import { buildCustomTheme, CUSTOM_THEME_ID, normalizeHexColor } from "@/lib/themeFromHex";
import { BADGE_THEMES, DEFAULT_THEME, type BadgeTheme } from "@/lib/themes";
import {
  BADGES_PER_PAGE,
  type Attendee,
  type AttendeeWarning,
  type ColumnMapping,
  type Orientation,
  type ParsedCsv,
} from "@/lib/types";

interface StepPreviewProps {
  parsed: ParsedCsv;
  mapping: ColumnMapping;
  attendees: Attendee[] | null;
  orientation: Orientation;
  onOrientationChange: (next: Orientation) => void;
  onAttendeesReady: (attendees: Attendee[], warnings: AttendeeWarning[]) => void;
  onBack: () => void;
}

export function StepPreview({
  parsed,
  mapping,
  attendees,
  orientation,
  onOrientationChange,
  onAttendeesReady,
  onBack,
}: StepPreviewProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [warnings, setWarnings] = useState<AttendeeWarning[]>([]);
  const [isMissingLinkedinModalOpen, setIsMissingLinkedinModalOpen] = useState(false);
  const [isLinkedinWarningDismissed, setIsLinkedinWarningDismissed] = useState(false);
  const [eventName, setEventName] = useState("");
  const [showPunchHole, setShowPunchHole] = useState(false);
  const [theme, setTheme] = useState<BadgeTheme>(DEFAULT_THEME);
  const [customHexOpen, setCustomHexOpen] = useState(false);
  const [customHexDraft, setCustomHexDraft] = useState("");

  useEffect(() => { setCurrentPage(0); }, [orientation]);

  const { mappedAttendees, mappingWarnings } = useMemo(() => {
    const result = mapAttendees(parsed.rawRows, mapping);
    return { mappedAttendees: result.attendees, mappingWarnings: result.warnings };
  }, [parsed.rawRows, mapping]);

  useEffect(() => {
    if (attendees && attendees.length === mappedAttendees.length) {
      setWarnings(mappingWarnings);
      return;
    }

    let cancelled = false;
    setIsGenerating(true);
    setError(null);
    setProgress({ done: 0, total: mappedAttendees.length });

    generateQrBatch(mappedAttendees, (done, total) => {
      if (!cancelled) setProgress({ done, total });
    })
      .then((withQr) => {
        if (cancelled) return;
        onAttendeesReady(withQr, mappingWarnings);
        setWarnings(mappingWarnings);
      })
      .catch((e) => {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "Failed to generate QR codes.");
      })
      .finally(() => {
        if (!cancelled) setIsGenerating(false);
      });

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mappedAttendees, mappingWarnings]);

  const handlePrint = useCallback(() => { window.print(); }, []);

  const handleBuyLanyard = useCallback(() => {
    const url =
      orientation === "portrait"
        ? AMAZON_LANYARD_VERTICAL_HOLDER_URL
        : AMAZON_LANYARD_HORIZONTAL_HOLDER_URL;
    window.open(url, "_blank", "noopener,noreferrer");
  }, [orientation]);

  const perPage = BADGES_PER_PAGE[orientation];
  const totalPages = Math.max(1, Math.ceil((attendees?.length ?? 0) / perPage));
  const safeCurrentPage = Math.min(currentPage, totalPages - 1);
  const pageBadges = attendees?.slice(safeCurrentPage * perPage, (safeCurrentPage + 1) * perPage) ?? [];
  const emptySlots = perPage - pageBadges.length;
  const ready = !isGenerating && !!attendees && attendees.length > 0;
  const linkedinWarnings = warnings.filter((warning) => warning.field === "linkedin");
  const attendeeLookup = new Map(mappedAttendees.map((attendee) => [attendee.id, attendee]));
  const missingLinkedinGuests = linkedinWarnings.map((warning) => attendeeLookup.get(warning.attendeeId)).filter(Boolean);

  useEffect(() => {
    setIsLinkedinWarningDismissed(false);
  }, [linkedinWarnings.length]);

  // Grid dimensions per orientation
  // Portrait:  3 cols × 3 rows (badge 2.2" × 3.667", margins 11.18% L/R, 0% T/B)
  // Landscape: 2 cols × 4 rows (badge 3.4" × 2.5",   margins 10% L/R, 4.55% T/B on letter)
  const gridCols = orientation === "portrait" ? 3 : 2;
  const gridRows = orientation === "portrait" ? 3 : 4;

  // Proportional page margins (as % of letter dimensions) to mirror the real print layout
  const previewMargins =
    orientation === "portrait"
      ? { top: "0%",   bottom: "0%",   left: "11.18%", right: "11.18%" }
      : { top: "4.55%", bottom: "4.55%", left: "10%", right: "10%" };

  return (
    <>
      {/* ── Screen layout ── */}
      <div className="no-print flex gap-10" style={{ height: "calc(100vh - 180px)" }}>

        {/* Left panel */}
        <div className="flex w-[340px] shrink-0 flex-col gap-4 overflow-hidden py-3 pr-1">
          <div className="space-y-3">
            <button
              onClick={onBack}
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back
            </button>
            <div>
              <h2 className="text-2xl font-medium tracking-tight">Review badges</h2>
            </div>

            <div className="flex flex-wrap gap-2">
              <div className="inline-flex items-center gap-2 rounded-lg border bg-card px-3 py-1.5 text-sm">
                <Users className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="font-medium">{mappedAttendees.length}</span>
                <span className="text-muted-foreground">
                  {mappedAttendees.length === 1 ? "badge" : "badges"}
                </span>
              </div>
              {ready && (
                <div className="inline-flex items-center gap-2 rounded-lg border bg-card px-3 py-1.5 text-sm">
                  <span className="text-muted-foreground">Pages:</span>
                  <span className="font-medium">{totalPages}</span>
                </div>
              )}
            </div>
          </div>

          <section className="space-y-3 rounded-xl border bg-card/40 p-3">
            <div className="flex items-end gap-3">
              <div className="min-w-0 flex-1 space-y-1.5">
                <p className="text-xs font-medium text-muted-foreground">Orientation</p>
                <OrientationToggle
                  value={orientation}
                  onChange={onOrientationChange}
                  className="w-full"
                />
              </div>

              <div className="shrink-0 space-y-1.5">
                <p className="text-xs font-medium text-muted-foreground">Punch hole</p>
                <button
                  type="button"
                  role="switch"
                  aria-checked={showPunchHole}
                  aria-label="Punch hole"
                  onClick={() => setShowPunchHole((v) => !v)}
                  className="inline-flex items-center rounded-lg border bg-card p-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <span
                    className={cn(
                      "inline-flex items-center gap-2 rounded-md px-3 py-2 text-xs transition-colors",
                      showPunchHole
                        ? "bg-foreground text-background"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <span
                      aria-hidden
                      className={cn(
                        "h-3.5 w-3.5 rounded-full border",
                        showPunchHole
                          ? "border-background bg-background/25"
                          : "border-muted-foreground/40"
                      )}
                    />
                    {showPunchHole ? "On" : "Off"}
                  </span>
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground">
                Event name <span className="opacity-50">(optional)</span>
              </p>
              <input
                type="text"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                placeholder="e.g. Toronto Tech Week"
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none transition-shadow focus-visible:ring-2 focus-visible:ring-ring placeholder:text-muted-foreground/50"
              />
            </div>

            <div className="flex min-h-9 flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
              <p className="shrink-0 pt-0.5 text-xs font-medium text-muted-foreground">Badge colour</p>
              <div className="relative flex h-7 min-w-0 flex-1 items-center justify-end sm:max-w-[292px]">
                <div
                  className={cn(
                    "z-0 flex items-center gap-3 pr-9 transition-[opacity,transform] duration-300 ease-out",
                    customHexOpen && "pointer-events-none -translate-x-1 scale-[0.96] opacity-0",
                  )}
                >
                  {BADGE_THEMES.map((t) => {
                    const isSelected = theme.id === t.id;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        title={t.label}
                        aria-label={t.label}
                        aria-pressed={isSelected}
                        onClick={() => {
                          setTheme(t);
                          setCustomHexOpen(false);
                          setCustomHexDraft("");
                        }}
                        className={`relative m-0.5 h-6 w-6 shrink-0 rounded-full border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                          isSelected
                            ? "z-[1] ring-2 ring-foreground ring-offset-1 ring-offset-background border-transparent"
                            : "border-border hover:scale-110"
                        }`}
                        style={{ backgroundColor: t.bg }}
                      />
                    );
                  })}
                </div>

                <div
                  className={cn(
                    "absolute top-0 z-10 flex h-7 items-center gap-1 overflow-hidden rounded-full border bg-background shadow-sm transition-[left,right,width,max-width] duration-300 ease-out",
                    customHexOpen
                      ? "left-0 right-0 w-auto max-w-full px-1.5"
                      : "right-0 w-7 max-w-[28px] justify-center px-0",
                    !customHexOpen &&
                      theme.id === CUSTOM_THEME_ID &&
                      "ring-2 ring-foreground ring-offset-1 ring-offset-background border-transparent",
                  )}
                >
                  {customHexOpen ? (
                    <>
                      <input
                        type="text"
                        value={customHexDraft}
                        onChange={(e) => {
                          const v = e.target.value;
                          setCustomHexDraft(v);
                          const normalized = normalizeHexColor(v);
                          if (normalized) {
                            const next = buildCustomTheme(normalized);
                            if (next) setTheme(next);
                          }
                        }}
                        placeholder="#1A2B3C"
                        spellCheck={false}
                        autoCapitalize="characters"
                        autoFocus
                        className="min-w-0 flex-1 border-0 bg-transparent py-0.5 font-mono text-xs outline-none placeholder:text-muted-foreground/50 focus:ring-0"
                        aria-label="Custom background hex colour"
                      />
                      <button
                        type="button"
                        aria-label="Close custom colour"
                        onClick={() => {
                          setCustomHexOpen(false);
                          if (theme.id === CUSTOM_THEME_ID) setCustomHexDraft(theme.bg);
                        }}
                        className="shrink-0 rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      aria-label="Add custom hex colour"
                      title="Custom hex"
                      onClick={() => {
                        setCustomHexOpen(true);
                        setCustomHexDraft(theme.id === CUSTOM_THEME_ID ? theme.bg : "");
                      }}
                      className="flex h-full w-full items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
                    >
                      <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </section>

          {ready && totalPages > 1 && (
            <div className="flex items-center gap-3 border-t pt-3">
              <Button
                variant="outline" size="sm"
                onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                disabled={safeCurrentPage === 0}
                className="h-8 w-8 p-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm tabular-nums flex-1 text-center">
                Page {safeCurrentPage + 1} of {totalPages}
              </span>
              <Button
                variant="outline" size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={safeCurrentPage >= totalPages - 1}
                className="h-8 w-8 p-0"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Missing LinkedIn notice */}
          {missingLinkedinGuests.length > 0 && !isLinkedinWarningDismissed && (
            <div className="fixed bottom-6 right-6 z-50 w-[min(460px,calc(100vw-2rem))] rounded-lg border border-red-300 bg-red-50 p-3 shadow-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0 text-red-600" />
                <div className="flex-1 text-sm">
                  <p className="font-medium text-red-900">
                    You have {linkedinWarnings.length}{" "}
                    {missingLinkedinGuests.length === 1 ? "guest" : "guests"} with no LinkedIn profile attached.
                  </p>
                  <button
                    onClick={() => setIsMissingLinkedinModalOpen(true)}
                    className="mt-1 text-xs text-red-700 underline underline-offset-2 hover:text-red-800"
                  >
                    View full list
                  </button>
                </div>
                <button
                  onClick={() => setIsLinkedinWarningDismissed(true)}
                  className="rounded p-1 text-red-600 hover:bg-red-100 hover:text-red-800"
                  aria-label="Dismiss warning"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {error && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm leading-snug text-destructive">
              {error}
            </div>
          )}

          {isGenerating && (
            <div className="flex items-center gap-2 rounded-lg border bg-muted/30 px-3 py-2.5 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
              Generating QR codes… {progress.done}/{progress.total}
            </div>
          )}

          <section className="flex flex-col gap-1.5 border-t pt-3">
            <div className="grid grid-cols-2 gap-2">
              <Button onClick={handlePrint} disabled={!ready} className="gap-2">
                <Printer className="h-4 w-4" />
                Print
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleBuyLanyard}
                className="gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                Buy Lanyards
              </Button>
            </div>
            <p className="text-left text-xs leading-snug text-muted-foreground">
              {orientation === "portrait" ? (
                <>
                  <span className="tabular-nums">2.20&quot; × 3.67&quot;</span> vertical holder size.
                </>
              ) : (
                <>
                  <span className="tabular-nums">3.40&quot; × 2.50&quot;</span> horizontal holder size.
                </>
              )}
            </p>
          </section>
        </div>

        {/* Right panel: page preview */}
        <div className="flex flex-1 min-w-0 items-center justify-center overflow-hidden py-4 pl-8">
          {isGenerating && !attendees && (
            <div className="flex flex-col items-center gap-3 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin" />
              <p className="text-sm">Generating QR codes… {progress.done}/{progress.total}</p>
            </div>
          )}

          {ready && (
            <div
              className="relative bg-white border shadow-md shrink-0"
              style={{ height: "100%", aspectRatio: "8.5 / 11" }}
            >
              {/* Cut labels in the margin strips */}
              <div className="absolute inset-y-0 left-0 flex items-center justify-center overflow-hidden"
                style={{ width: previewMargins.left }}>
                <span className="text-black/30 whitespace-nowrap font-mono tracking-widest"
                  style={{ fontSize: 5, transform: "rotate(-90deg)" }}>
                  ✂ CUT ✂ CUT ✂ CUT ✂ CUT ✂ CUT
                </span>
              </div>
              <div className="absolute inset-y-0 right-0 flex items-center justify-center overflow-hidden"
                style={{ width: previewMargins.right }}>
                <span className="text-black/30 whitespace-nowrap font-mono tracking-widest"
                  style={{ fontSize: 5, transform: "rotate(90deg)" }}>
                  ✂ CUT ✂ CUT ✂ CUT ✂ CUT ✂ CUT
                </span>
              </div>
              {orientation === "landscape" && (
                <>
                  <div className="absolute inset-x-0 top-0 flex items-center justify-center overflow-hidden"
                    style={{ height: previewMargins.top }}>
                    <span className="text-black/30 whitespace-nowrap font-mono tracking-widest"
                      style={{ fontSize: 5 }}>
                      ✂ CUT ✂ CUT ✂ CUT ✂ CUT ✂ CUT ✂ CUT
                    </span>
                  </div>
                  <div className="absolute inset-x-0 bottom-0 flex items-center justify-center overflow-hidden"
                    style={{ height: previewMargins.bottom }}>
                    <span className="text-black/30 whitespace-nowrap font-mono tracking-widest"
                      style={{ fontSize: 5 }}>
                      ✂ CUT ✂ CUT ✂ CUT ✂ CUT ✂ CUT ✂ CUT
                    </span>
                  </div>
                </>
              )}

              {/* Badge grid positioned at the same proportional margins as the real print */}
              <div
                className="absolute grid"
                style={{
                  top: previewMargins.top,
                  bottom: previewMargins.bottom,
                  left: previewMargins.left,
                  right: previewMargins.right,
                  gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
                  gridTemplateRows: `repeat(${gridRows}, 1fr)`,
                }}
              >
                {pageBadges.map((a) =>
                  orientation === "portrait" ? (
                    <BadgeFront
                      key={a.id}
                      attendee={a}
                      eventName={eventName || undefined}
                      showPunchHole={showPunchHole}
                      theme={theme}
                    />
                  ) : (
                    <BadgeCard key={a.id} attendee={a} orientation="landscape" eventName={eventName || undefined} showPunchHole={showPunchHole} theme={theme} />
                  )
                )}
                {Array.from({ length: emptySlots }).map((_, i) => (
                  <div key={`empty-${i}`} className="border border-dashed border-slate-200 bg-white" />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Print-only full badge sheet */}
      <div className="print-only">
        <BadgeSheet
          attendees={attendees ?? []}
          orientation={orientation}
          eventName={eventName || undefined}
          showPunchHole={showPunchHole}
          theme={theme}
        />
      </div>

      {isMissingLinkedinModalOpen && (
        <div className="no-print fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl border bg-background shadow-xl">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <h3 className="text-sm font-medium">
                Guests without LinkedIn URLs ({linkedinWarnings.length})
              </h3>
              <button
                onClick={() => setIsMissingLinkedinModalOpen(false)}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Close
              </button>
            </div>
            <div className="max-h-[60vh] overflow-y-auto px-4 py-3">
              <ul className="space-y-1 text-sm text-muted-foreground">
                {missingLinkedinGuests.map((guest) =>
                  guest ? (
                    <li key={guest.id}>{guest.name || "Unnamed guest"}</li>
                  ) : null,
                )}
              </ul>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
