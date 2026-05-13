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
- [Vercel Web Analytics](https://vercel.com/docs/analytics) (`@vercel/analytics`) for traffic in the Vercel dashboard
- [Upstash Redis](https://vercel.com/marketplace?category=storage&search=redis) (via Vercel integration) for a durable **print-click** counter

## Getting started

```bash
npm install
npm run dev
```

The app runs at [http://localhost:3000](http://localhost:3000). CSV parsing and badge generation stay in the browser; optional Redis + API routes only track how often **Print** is used.

### Vercel Web Analytics (visits)

After you enable Web Analytics on the project and deploy with `<Analytics />` in the root layout, open your project on Vercel → **Analytics** for page views and visitors. On the **Hobby** plan, reporting is typically limited to about the **last month** of data (and an event quota); it is not an unlimited historical archive. Longer retention requires a paid plan—see [Vercel Analytics pricing](https://vercel.com/docs/analytics/limits-and-pricing).

### Print-click counter (Redis)

The API uses **Upstash’s HTTP REST** credentials (`UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN`). A plain `REDIS_URL` (TCP) from some wizards is **not** enough—copy the REST URL and REST token from the [Upstash console](https://console.upstash.com) → your database → **REST API**, and add them manually under Vercel → **Settings** → **Environment Variables** if they are missing. Then **redeploy**.

**One-time checklist**

1. **Vercel:** Connect **Upstash Redis** to this project (Production at minimum). Confirm you see **`UPSTASH_REDIS_REST_URL`** and **`UPSTASH_REDIS_REST_TOKEN`** on the project (add from Upstash if needed).
2. **Vercel:** Add **`STATS_SECRET`** (long random string) for Production.
3. **Vercel:** **Redeploy** so the new env vars apply.
4. **This repo on your PC:** One-time CLI login and link, then pull env (optional, for local `next dev` hitting Redis):

   ```bash
   npx vercel@latest login
   npx vercel@latest link --yes
   npm run env:pull
   ```

   If `link` asks too many questions, link by name: `npx vercel@latest link --yes --project YOUR_VERCEL_PROJECT_NAME` (name from the Vercel dashboard).

   That writes **`.env.development.local`** (gitignored). You still need step 5 for `npm run stats`.

5. **This repo:** Create **`.env.local`** with your **live** API URL and the same secret as on Vercel:

   ```bash
   BADGEIN_STATS_URL=https://YOUR_PROJECT.vercel.app/api/prints
   STATS_SECRET=your-long-random-secret
   ```

6. **Read the count:**

   ```bash
   npm run stats
   ```

7. **Reset the counter** (same secret as above; deletes the Redis key so the next print is `1` again):

   ```bash
   npm run stats:reset
   ```

You can also reset from the [Upstash console](https://console.upstash.com) with `DEL badgein:print_clicks` if you prefer.

`npm run stats` and `npm run stats:reset` load **`.env.development.local`** first, then **`.env.local`** (so secrets in `.env.local` win).

**Local dev:** without Upstash REST vars, `POST /api/prints` still returns 204 so printing works; the count only increments where Redis REST is configured.

## Project structure

```
app/
  page.tsx              # Landing page
  generate/page.tsx     # Wizard (upload → map → preview → print)
  api/prints/route.ts   # POST increment; GET count; DELETE reset (Bearer STATS_SECRET for GET/DELETE)
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
