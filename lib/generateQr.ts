import QRCode from "qrcode";
import type { Attendee } from "./types";

export async function generateQr(url: string): Promise<string> {
  return QRCode.toDataURL(url, {
    width: 240,
    margin: 1,
    errorCorrectionLevel: "M",
    color: { dark: "#000000", light: "#ffffff" },
  });
}

export async function generateQrBatch(
  attendees: Attendee[],
  onProgress?: (done: number, total: number) => void
): Promise<Attendee[]> {
  const total = attendees.length;
  let done = 0;

  const results = await Promise.all(
    attendees.map(async (a) => {
      done += 1;
      onProgress?.(done, total);
      if (!a.linkedin) return a;
      const qrDataUrl = await generateQr(a.linkedin);
      return { ...a, qrDataUrl };
    })
  );

  return results;
}
