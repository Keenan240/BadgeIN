import Image from "next/image";
import type { CSSProperties } from "react";
import { cn } from "@/lib/cn";
import { badgeSubtitle } from "@/lib/badgeSubtitle";
import { DEFAULT_THEME, type BadgeTheme } from "@/lib/themes";
import type { Attendee, Orientation } from "@/lib/types";

interface BadgeCardProps {
  attendee: Attendee;
  orientation?: Orientation;
  eventName?: string;
  showPunchHole?: boolean;
  theme?: BadgeTheme;
  className?: string;
}

export function BadgeCard({
  attendee,
  orientation = "portrait",
  eventName,
  showPunchHole,
  theme = DEFAULT_THEME,
  className,
}: BadgeCardProps) {
  const subtitle = badgeSubtitle(attendee);
  const subtitleUpper = subtitle?.toUpperCase() ?? null;
  const isLight = theme.logoVariant === "light";
  const logoSrc = isLight ? "/logos/badgein-mark-white.svg" : "/logos/badgein-mark.svg";

  if (orientation === "landscape") {
    const surfaceStyle: CSSProperties = {
      backgroundColor: theme.bg,
      color: theme.fg,
      WebkitPrintColorAdjust: "exact",
      printColorAdjust: "exact",
    };

    return (
      <div
        className={cn(
          "relative flex h-full w-full flex-col overflow-hidden border border-dashed border-slate-300 font-mono [container-type:inline-size]",
          className
        )}
        style={surfaceStyle}
      >
        {showPunchHole && (
          <div
            aria-hidden
            className={`absolute top-[8%] left-1/2 -translate-x-1/2 w-[2.5cqw] aspect-square rounded-full border ${
              isLight ? "bg-white/30 border-white/40" : "bg-neutral-200 border-neutral-300"
            }`}
          />
        )}
        {/* Header row: logo left, event name right */}
        <header className="flex shrink-0 items-start justify-between gap-[3cqw] px-[4%] pb-[2.5cqw] pt-[8.2cqw]">
          <Image
            src={logoSrc}
            alt=""
            width={42}
            height={38}
            className="h-[5.5cqw] w-auto shrink-0"
            unoptimized
          />
          {eventName ? (
            <p
              className="max-w-[64%] text-right text-[2.3cqw] font-medium uppercase leading-tight tracking-wide"
              style={{ color: theme.fg }}
            >
              {eventName}
            </p>
          ) : (
            <span
              className="mt-1 block h-px w-10 shrink-0"
              style={{ backgroundColor: isLight ? "rgba(255,255,255,0.4)" : "#d4d4d4" }}
              aria-hidden
            />
          )}
        </header>

        {/* Name + subtitle centred vertically, shifted slightly up */}
        <div className="flex min-h-0 flex-1 flex-col justify-center px-[4%] pb-[8.2cqw]">
          <div className="-translate-y-[3.3cqw]">
            <h2
              className="break-words text-left text-[8.2cqw] font-medium uppercase leading-[1.05] tracking-tight"
              style={{ color: theme.fg }}
            >
              {attendee.name.toUpperCase()}
            </h2>
            {subtitleUpper ? (
              <p
                className="mt-[3%] break-words text-left text-[3.6cqw] font-normal uppercase leading-snug"
                style={{ color: theme.fg }}
              >
                {subtitleUpper}
              </p>
            ) : null}
          </div>
        </div>

        {/* QR: absolute bottom-right */}
        <div className="absolute bottom-[8%] right-[3.5%] w-[14.5cqw]">
          <div className={isLight ? "rounded bg-white p-[6%]" : ""}>
            {attendee.qrDataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={attendee.qrDataUrl}
                alt={`QR code for ${attendee.name}`}
                className="h-auto w-full"
              />
            ) : (
              <div className="aspect-square w-full bg-neutral-100" />
            )}
          </div>
        </div>
      </div>
    );
  }

  // Portrait fallback (unused now but kept for safety)
  return (
    <div
      className={cn(
        "badge-card relative flex flex-col items-center text-center overflow-hidden border border-dashed border-slate-300 bg-white font-mono text-black",
        className
      )}
      style={{ containerType: "inline-size" }}
    >
      <div className="flex-[3] flex flex-col items-center justify-center w-full min-h-0" style={{ padding: "8% 10% 3%" }}>
        <h3 className="font-medium uppercase leading-tight break-words w-full text-[6cqw]">
          {attendee.name.toUpperCase()}
        </h3>
        {subtitleUpper && (
          <p className="uppercase leading-snug break-words font-normal w-full text-[3.8cqw]" style={{ marginTop: "5%" }}>
            {subtitleUpper}
          </p>
        )}
      </div>
      <div className="flex-[2] flex items-center justify-center w-full min-h-0" style={{ paddingBottom: "8%" }}>
        {attendee.qrDataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={attendee.qrDataUrl} alt="" style={{ width: "30%", height: "auto" }} />
        ) : (
          <div className="bg-neutral-100 rounded" style={{ width: "30%", aspectRatio: "1" }} />
        )}
      </div>
    </div>
  );
}
