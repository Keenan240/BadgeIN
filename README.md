# BadgeIn

QR-coded nametags for in-person networking events. Upload a guest list CSV (from Luma, Eventbrite, etc.), map your columns, preview QR-coded badges, and download a print-ready PDF — all in under five minutes.

The QR code on each badge links directly to that attendee's LinkedIn profile, so people can swap profiles without ever pulling out their phones to type.

## How it works

1. **Upload CSV** — drag in your attendee list. Files are parsed entirely in the browser; nothing is uploaded anywhere.
2. **Map columns** — tell BadgeIn which CSV columns hold Name, Position, Company, and LinkedIn URL. Auto-detection handles standard Luma exports.
3. **Preview badges** — see every nametag exactly as it will print, complete with a unique QR code per attendee.
4. **Print or download PDF** — print directly from your browser, or download a `.pdf` file to send to a print shop.

## Stack

- [Next.js 14](https://nextjs.org) (App Router) + TypeScript
- [Tailwind CSS](https://tailwindcss.com) for styling
- [`papaparse`](https://www.papaparse.com) — CSV parsing in the browser
- [`qrcode`](https://github.com/soldair/node-qrcode) — QR generation
- [`@react-pdf/renderer`](https://react-pdf.org) — client-side PDF export
- Deployed on [Vercel](https://vercel.com)

## Getting started

```bash
npm install
npm run dev
```

The app runs at [http://localhost:3000](http://localhost:3000). There is no backend or database — the entire flow lives in the browser.

## Project structure

```
app/
  page.tsx              # Landing page
  generate/page.tsx     # 4-step wizard (upload → map → preview → print)
components/
  badge/                # BadgeCard, BadgeSheet, BadgePdf
  wizard/               # StepUpload, StepMapping, StepPreview, StepExport, StepIndicator
  ui/                   # Button, Card, Input, Select primitives
lib/
  parseCsv.ts           # papaparse wrapper
  autoDetect.ts         # Luma column auto-detection
  mapAttendees.ts       # CSV row → Attendee, with validation warnings
  normalizeLinkedIn.ts  # URL normalization
  generateQr.ts         # QR data URL generation
  badgeSubtitle.ts      # "Position @ Company" fallback logic
public/
  template.csv          # Downloadable CSV template
```

## CSV format

The minimum columns required are **Name** and **LinkedIn URL**. **Position** and **Company** are optional. Column names are mapped manually in Step 2, so any CSV layout works.

```csv
Name,Position,Company,LinkedIn URL
Sarah Chen,Product Designer,Shopify,https://www.linkedin.com/in/sarahchen
```

A working template is available at `/template.csv`.

## Print layout

- US Letter (8.5" × 11") with centered trim guides
- Portrait badges: 3 columns × 3 rows = **9 badges per page**, each 2.20" × 3.67"
- Landscape badges: 2 columns × 4 rows = **8 badges per page**, each 3.40" × 2.50"
- Badge widths are slightly reduced for easier lanyard-holder insertion

## License

MIT
