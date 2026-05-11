"use client";

import { badgeSubtitle } from "@/lib/badgeSubtitle";
import type { Attendee, Orientation } from "@/lib/types";

interface PageBadgeProps {
  attendee: Attendee;
  orientation: Orientation;
}

export function PageBadge({ attendee, orientation }: PageBadgeProps) {
  const subtitle = badgeSubtitle(attendee);

  if (orientation === "landscape") {
    return (
      <div
        className="border border-dashed border-slate-300 bg-white flex flex-row items-center overflow-hidden"
        style={{ containerType: "inline-size", padding: "5% 8%", gap: "4%" }}
      >
        {/* Text: takes remaining space, left-aligned */}
        <div className="flex-1 flex flex-col justify-center min-w-0">
          <p className="font-semibold text-slate-900 leading-tight break-words text-[6.5cqw]">
            {attendee.name}
          </p>
          {subtitle && (
            <p className="text-slate-500 leading-snug break-words font-normal text-[4cqw]" style={{ marginTop: "5%" }}>
              {subtitle}
            </p>
          )}
        </div>

        {/* QR: fixed 22% of card width */}
        <div className="shrink-0 flex items-center" style={{ width: "22%" }}>
          {attendee.qrDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={attendee.qrDataUrl}
              alt=""
              style={{ width: "100%", height: "auto" }}
            />
          ) : (
            <div className="bg-slate-100 rounded" style={{ width: "100%", aspectRatio: "1" }} />
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className="border border-dashed border-slate-300 bg-white flex flex-col items-center text-center overflow-hidden"
      style={{ containerType: "inline-size" }}
    >
      {/* Text section: 60% of card height */}
      <div className="flex-[3] flex flex-col items-center justify-center w-full min-h-0" style={{ padding: "8% 10% 3%" }}>
        <p className="font-semibold text-slate-900 leading-tight break-words w-full text-[6cqw]">
          {attendee.name}
        </p>
        {subtitle && (
          <p className="text-slate-500 leading-snug break-words font-normal w-full text-[3.8cqw]" style={{ marginTop: "5%" }}>
            {subtitle}
          </p>
        )}
      </div>

      {/* QR section: 40% of card height */}
      <div className="flex-[2] flex items-center justify-center w-full min-h-0" style={{ paddingBottom: "8%" }}>
        {attendee.qrDataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={attendee.qrDataUrl}
            alt=""
            style={{ width: "30%", height: "auto" }}
          />
        ) : (
          <div className="bg-slate-100 rounded" style={{ width: "30%", aspectRatio: "1" }} />
        )}
      </div>
    </div>
  );
}
