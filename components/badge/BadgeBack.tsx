import type { Attendee } from "@/lib/types";

interface BadgeBackProps {
  attendee: Attendee;
}

export function BadgeBack({ attendee }: BadgeBackProps) {
  return (
    <div
      className="relative flex flex-col items-center w-full h-full bg-white border border-dashed border-slate-300 overflow-hidden"
      style={{ containerType: "inline-size" }}
    >
      {/* QR code — large and centred, takes the bulk of the card */}
      <div className="flex-1 flex items-center justify-center w-full px-[15%] min-h-0">
        {attendee.qrDataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={attendee.qrDataUrl}
            alt={`QR code for ${attendee.name}`}
            style={{ width: "70%", height: "auto" }}
          />
        ) : (
          <div className="bg-slate-100 rounded" style={{ width: "70%", aspectRatio: "1" }} />
        )}
      </div>

      {/* Instruction */}
      <p className="font-mono text-slate-500 text-[3cqw] tracking-wide text-center leading-snug px-[10%] pb-[5%]">
        Scan to connect on LinkedIn
      </p>

      {/* Attribution */}
      <p className="font-mono text-slate-300 text-[2.2cqw] tracking-[0.15em] uppercase pb-[6%]">
        BadgeIn
      </p>
    </div>
  );
}
