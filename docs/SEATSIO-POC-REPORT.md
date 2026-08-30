# Seats.io Seat-Selection POC — Technical Report

## 1. Files changed

- `index.html` — seat-selection step now hosts `#seat-map`; summary panel enriched (meta, empty state, fees, mobile bar); script includes for Seats.io modules
- `js/seats-hall.js` — area pick retained; seat step mounts Seats.io via adapter; selection syncs to summary / cart
- `js/app.js` — seats route calls `initSeats`; cart uses `getSelectedTicketSeats()`
- `css/seats-hall.css` — Seats.io map hero layout, summary meta, mobile sticky bar

## 2. Files added

- `js/seatsio/config.js` — region, public workspace key, event key, pricing categories
- `js/seatsio/adapter.js` — CDN loader + `SeatingChart` mount + selection normalization
- `docs/SEATSIO-POC-REPORT.md` — this report

## 3. Where Seats.io configuration lives

`js/seatsio/config.js` → `window.TicketsSeatsioConfig`

Also overridable via URL:

```
?seatsioWorkspaceKey=PUBLIC_KEY&seatsioEventKey=EVENT_KEY&seatsioRegion=eu
```

## 4. Where to insert the PUBLIC workspace key

In `js/seatsio/config.js`:

```js
workspaceKey: ""  // ← paste public workspace key from Seats.io Workspace Settings
```

Or: `?seatsioWorkspaceKey=...`

**Do not** put the secret key in frontend code.

## 5. Where to insert the Event key

In `js/seatsio/config.js`:

```js
eventKey: ""  // ← paste event key from Seats.io Designer / Events
```

Or: `?seatsioEventKey=...`

## 6. CDN region in use

Default: **Europe** — `https://cdn-eu.seatsio.net/chart.js`

Change `region` to `na` | `sa` | `oc` to switch CDN.

## 7. Official renderer callbacks implemented

- `onObjectSelected`
- `onObjectDeselected`
- `onChartRendered`

Programmatic remove from summary uses official `chart.deselectObjects([label])`.

## 8. How pricing is configured

In `TicketsSeatsioConfig.pricingCategories`:

| Category | Price |
|---|---|
| 1 | ₪319 |
| 2 | ₪269 |
| 3 | ₪219 |
| 4 | ₪169 |

Passed to the renderer as:

```js
pricing: {
  prices: [ { category, price }, ... ],
  priceFormatter: (price) => '₪' + price
}
```

(Official object-format pricing; categories must match your Seats.io Designer categories.)

## 9. How selected seats sync to the side panel

1. Seats.io fires `onObjectSelected` / `onObjectDeselected`
2. Adapter normalizes object → `{ id, sectionName, row, seat, price, category }`
3. `TicketsSeatsioAdapter` keeps a local `Map` and calls `onSelectionChange`
4. `seats-hall.js` stores `selectedSeats` and runs `updateSeatSummary()`
5. Summary lists tickets; remove button calls `deselectObjects`
6. Cart uses `window.getSelectedTicketSeats()`

## 10. Real Seats.io vs prototype UI

| Real Seats.io | Prototype UI (ours) |
|---|---|
| Interactive floor plan (`chart.js`) | Event hero / breadcrumbs / RTL chrome |
| Pan / zoom / select / hold session | Area-selection schematic (step 1) |
| `pricing` + `priceFormatter` on chart | Sticky summary panel, fees (₪5), CTA |
| `session: 'continue'` | Mobile bottom bar / bottom sheet |
| Object labels & categories from chart | Accordion (על המופע / הגעה / תקנון) |

**Not implemented (by design):** Seats.io REST booking, payment, secret key, backend holds confirmation.

### How to run the POC

1. Create chart + event in Seats.io Designer
2. Paste public workspace key + event key into `js/seatsio/config.js`
3. Align Designer category keys with 1–4 (or edit `pricingCategories`)
4. Open site → choose date → choose area → seat map renders via Seats.io

If keys are missing: console error only (no invented fake seat map). A light placeholder hint appears in the empty map host.
