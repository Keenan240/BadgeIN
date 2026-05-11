import Image from "next/image";
import type { CSSProperties } from "react";
import { badgeSubtitle } from "@/lib/badgeSubtitle";
import { DEFAULT_THEME, type BadgeTheme } from "@/lib/themes";
import type { Attendee } from "@/lib/types";

interface BadgeFrontProps {
  attendee: Attendee;
  eventName?: string;
  showPunchHole?: boolean;
  theme?: BadgeTheme;
}

export function BadgeFront({ attendee, eventName, showPunchHole, theme = DEFAULT_THEME }: BadgeFrontProps) {
  const subtitle = badgeSubtitle(attendee);
  const subtitleUpper = subtitle?.toUpperCase() ?? null;
  const isLight = theme.logoVariant === "light";
  const logoSrc = isLight ? "/logos/badgein-mark-white.svg" : "/logos/badgein-mark.svg";

  const surfaceStyle: CSSProperties = {
    backgroundColor: theme.bg,
    color: theme.fg,
    WebkitPrintColorAdjust: "exact",
    printColorAdjust: "exact",
  };

  return (
    <div
      className="relative flex h-full w-full flex-col overflow-hidden border border-dashed border-slate-300 font-mono [container-type:inline-size]"
      style={surfaceStyle}
    >
      {showPunchHole && (
        <div
          aria-hidden
          className={`absolute top-[3.5%] left-1/2 -translate-x-1/2 w-[4.5cqw] min-w-[10px] max-w-[18px] aspect-square rounded-full border ${
            isLight ? "bg-white/30 border-white/40" : "bg-neutral-200 border-neutral-300"
          }`}
        />
      )}
      <header className="flex shrink-0 items-start justify-between gap-3 px-[8%] pb-3 pt-[20pt]">
        <Image
          src={logoSrc}
          alt=""
          width={42}
          height={38}
          className="h-[clamp(28px,9cqw,44px)] w-auto shrink-0"
          unoptimized
        />
        {eventName ? (
          <p
            className="max-w-[54%] text-right text-[4cqw] font-medium uppercase leading-tight tracking-wide"
            style={{ color: theme.fg }}
          >
            {eventName}
          </p>
        ) : (
          <span
            className="mt-1 block h-px w-14 shrink-0 self-end"
            style={{ backgroundColor: isLight ? "rgba(255,255,255,0.4)" : "#d4d4d4" }}
            aria-hidden
          />
        )}
      </header>

      <div className="flex min-h-0 flex-1 flex-col justify-center px-[8%] pb-[20pt]">
        <div className="-translate-y-[10pt]">
          <h2
            className="break-words text-left text-[11.5cqw] font-medium uppercase leading-[1.05] tracking-tight"
            style={{ color: theme.fg }}
          >
            {attendee.name.toUpperCase()}
          </h2>
          {subtitleUpper ? (
            <p
              className="mt-[5%] break-words text-left text-[4.4cqw] font-normal uppercase leading-snug"
              style={{ color: theme.fg }}
            >
              {subtitleUpper}
            </p>
          ) : null}
        </div>
      </div>

      <div className="absolute bottom-[7%] right-[5%] w-[19cqw] min-w-[48px] max-w-[min(116px,23%)]">
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
