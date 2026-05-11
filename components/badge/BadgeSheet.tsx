import { cn } from "@/lib/cn";
import { DEFAULT_THEME, type BadgeTheme } from "@/lib/themes";
import { BADGES_PER_PAGE, type Attendee, type Orientation } from "@/lib/types";
import { BadgeFront } from "./BadgeFront";
import { BadgeCard } from "./BadgeCard";

const SCISSORS = "\u2702";
const CUT_REPEAT = `${SCISSORS} CUT  ${SCISSORS} CUT  ${SCISSORS} CUT  ${SCISSORS} CUT  ${SCISSORS} CUT  ${SCISSORS} CUT  ${SCISSORS} CUT  ${SCISSORS} CUT`;

function CutLabels({ orientation }: { orientation: Orientation }) {
  return (
    <>
      <div aria-hidden className="badge-cut-label badge-cut-left">
        <span>{CUT_REPEAT}</span>
      </div>
      <div aria-hidden className="badge-cut-label badge-cut-right">
        <span>{CUT_REPEAT}</span>
      </div>
      {orientation === "landscape" && (
        <>
          <div aria-hidden className="badge-cut-label badge-cut-top">
            <span>{CUT_REPEAT}</span>
          </div>
          <div aria-hidden className="badge-cut-label badge-cut-bottom">
            <span>{CUT_REPEAT}</span>
          </div>
        </>
      )}
    </>
  );
}

interface BadgeSheetProps {
  attendees: Attendee[];
  orientation?: Orientation;
  eventName?: string;
  showPunchHole?: boolean;
  theme?: BadgeTheme;
  className?: string;
}

function pad<T>(arr: T[], length: number, fill: null): (T | null)[] {
  const result: (T | null)[] = [...arr];
  while (result.length < length) result.push(fill);
  return result;
}

export function BadgeSheet({
  attendees,
  orientation = "portrait",
  eventName,
  showPunchHole,
  theme = DEFAULT_THEME,
  className,
}: BadgeSheetProps) {
  const perPage = BADGES_PER_PAGE[orientation];

  const pages: Attendee[][] = [];
  for (let i = 0; i < attendees.length; i += perPage) {
    pages.push(attendees.slice(i, i + perPage));
  }
  if (pages.length === 0) pages.push([]);

  return (
    <div className={cn("badge-sheet", className)}>
      {pages.map((pageAttendees, pageIndex) => {
        const cells = pad(pageAttendees, perPage, null);

        if (orientation === "landscape") {
          return (
            <div key={pageIndex} className="badge-page" data-orientation="landscape">
              <CutLabels orientation="landscape" />
              {cells.map((a, i) =>
                a ? (
                  <BadgeCard key={a.id} attendee={a} orientation="landscape" eventName={eventName} showPunchHole={showPunchHole} theme={theme} />
                ) : (
                  <div key={`empty-${i}`} className="w-full h-full border border-dashed border-slate-200 bg-white" />
                )
              )}
            </div>
          );
        }

        return (
          <div key={pageIndex} className="badge-page" data-orientation="portrait">
            <CutLabels orientation="portrait" />
            {cells.map((a, i) =>
              a ? (
                <BadgeFront key={a.id} attendee={a} eventName={eventName} showPunchHole={showPunchHole} theme={theme} />
              ) : (
                <div key={`fe-${i}`} className="w-full h-full border border-dashed border-slate-200 bg-white" />
              )
            )}
          </div>
        );
      })}
    </div>
  );
}
