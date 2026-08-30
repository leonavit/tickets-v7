# Seatmap.pro Integration Report (POC)

## 1. Files changed

- `index.html` — redesigned hall/area step + seat-selection step markup; enhanced summary panel; script includes for venue data / seatmap modules
- `js/seats-hall.js` — rewritten flow: spatial section selection → provider-mounted seat map → summary sync
- `js/app.js` — seats route always calls `initSeats`; cart uses `getSelectedTicketSeats()`; ignores provider seat clicks in global handler
- `css/seats-hall.css` — spatial venue plan, price legend, seat-map wrapper, summary/meta, mobile sticky bar

## 2. Files added

- `js/data/venue-seats.js` — mock venue, sections, price tiers, seat generation
- `js/seatmap/config.js` — Seatmap.pro public credentials placeholders (no secrets)
- `js/seatmap/provider.js` — provider boundary: Seatmap.pro adapter + isolated fallback mock renderer
- `docs/SEATMAP-PRO-REPORT.md` — this report

## 3. How Seatmap.pro was integrated

Documented integration path (vanilla JS, no build step):

```js
import { SeatmapBookingRenderer } from 'https://cdn.jsdelivr.net/npm/@seatmap.pro/renderer/+esm';

const renderer = new SeatmapBookingRenderer(container, {
  publicKey: 'YOUR_PUBLIC_API_KEY',
  env: 'prod', // or 'stage'
  onSeatSelect(seat) { /* sync cart */ },
  onSeatDeselect(seat) { /* sync cart */ },
});
await renderer.loadEvent('YOUR_EVENT_ID');
```

In this prototype, `TicketsSeatmapProvider.mount()` attempts that path when `publicKey` + `eventId` are present in `js/seatmap/config.js` or via URL:

`?seatmapPublicKey=...&seatmapEventId=...&seatmapMode=auto`

The renderer mounts into `#seatMapContainer` inside `#seatMapWrapper`.

## 4. What uses the real Seatmap.pro SDK

- Dynamic ESM import of `@seatmap.pro/renderer` from jsDelivr
- `SeatmapBookingRenderer` construction with documented callbacks
- `loadEvent(eventId)`
- Best-effort `zoomToSection` / `viewSection` when available
- Zoom controls mapped to `zoomIn` / `zoomOut` / `zoomToFit` when present

**Currently inactive by default** because no public demo API key / event ID is published in Seatmap.pro docs.

## 5. What is mock / prototype behavior

- Entire Screen 1 venue plan (Orchestra + Sections 1–5)
- Price tiers / availability labels
- Fallback seat grid (curved-ish rows, taken/free/selected, pan/zoom)
- Selection list, fees (₪5/ticket), totals, mini venue orientation
- Transition UX: select area → CTA → seat map
- Mobile sticky summary bar + bottom sheet (existing summary panel)

## 6. Credentials / IDs required for a real implementation

| Value | Where | Frontend? |
|---|---|---|
| **Public API Key** | Editor Admin → Organization Settings | Yes (`TicketsSeatmapConfig.publicKey`) |
| **Event ID (UUID)** | Booking API v2 / Events Hub after creating event linked to schema | Yes (`eventId`) |
| **Organization token** (`X-API-Key`) | Admin panel | **No — backend only** |
| **Organization ID** | Admin panel | Backend only |
| Published **schema** with prices assigned to seats | Editor | Prerequisite (renderer hides seats without prices) |

Never place the private organization token in frontend JS.

## 7. Functionality that needs a backend in production

- Create/sync events (`POST /api/private/v2.0/events/`)
- Assign prices to seats/sections
- Lock seat on select / unlock on deselect (anti double-booking TTL)
- Confirm sale after payment
- Source of truth for inventory, orders, customer data (Seatmap.pro is visualization only)

## 8. Limitations discovered

- No public demo `publicKey` / `eventId` in official docs (playground exists but was unavailable at investigation time)
- npm package `@seatmap.pro/renderer` is ESM; works via CDN `+esm` in static pages, but depends on network + CORS to `booking.seatmap.pro`
- Real maps require Editor-published schema + priced seats
- Section naming for `zoomToSection` must match schema labels
- Accessibility / RTL: SDK canvas is typically LTR; wrapper keeps Hebrew RTL chrome around it
- Enterprise sales process for trial credentials (not self-serve keys in docs)

## 9. Isolation from the rest of the prototype

Clear boundary:

```
Ticket-S UI (summary, CTA, routing, Hebrew chrome)
        ↓ normalized seat objects
TicketsSeatmapProvider.mount(#seatMapContainer)
        ├── seatmap.pro adapter
        └── fallback adapter (removable)
```

UI never imports Seatmap.pro types directly. Cart uses `getSelectedTicketSeats()`. Replacing the provider does not require rewriting purchase screens.

## 10. Replacing Seatmap.pro with Seats.io later

**Low–moderate effort** if the provider contract is kept:

1. Add `js/seatmap/seatsio-adapter.js` implementing the same adapter methods (`mount`, selection callbacks, zoom, destroy)
2. Point `TicketsSeatmapConfig.providerId` / mode switch at Seats.io
3. Keep Screen 1 (our venue plan) as-is or drive it from Seats.io chart categories
4. Remove fallback once live credentials exist

Estimated: **0.5–2 days** for a POC swap; longer for production lock/confirm parity.

---

### How to demo today

1. Open the site → event → choose date → seats flow
2. Screen 1: hover/select a colored area → **בחירת מושבים**
3. Screen 2: pick seats on the fallback map → summary updates → **המשך לרכישה**

### How to enable live Seatmap.pro

Edit `js/seatmap/config.js`:

```js
publicKey: 'pk_...',
eventId: '........-....-....-....-............',
mode: 'auto', // or 'seatmap'
```

Or pass query params. If load fails, the notice + fallback map keep the demo flow usable.
