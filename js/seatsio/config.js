/**
 * Seats.io renderer configuration (POC).
 *
 * Insert your PUBLIC workspace key + event key from the Seats.io dashboard.
 * Never put the secret key in frontend JavaScript.
 *
 * Docs:
 * https://docs.seats.io/docs/renderer/embed-a-floor-plan/
 * https://docs.seats.io/docs/tutorial/show-the-floor-plan-on-your-page/
 */
(function (global) {
  const params = new URLSearchParams(
    typeof location !== "undefined" ? location.search : ""
  );

  /** Demo ticket categories — easy to edit in one place */
  const PRICING_CATEGORIES = [
    { category: 1, price: 319, label: "קטגוריה 1" },
    { category: 2, price: 269, label: "קטגוריה 2" },
    { category: 3, price: 219, label: "קטגוריה 3" },
    { category: 4, price: 169, label: "קטגוריה 4" },
  ];

  function priceFormatter(price) {
    return "₪" + Number(price);
  }

  global.TicketsSeatsioConfig = {
    /** 'eu' | 'na' | 'sa' | 'oc' */
    region: params.get("seatsioRegion") || "eu",
    /** Public workspace key — Workspace Settings in Seats.io (NEVER put the secret key here) */
    workspaceKey:
      params.get("seatsioWorkspaceKey") ||
      params.get("workspaceKey") ||
      "c7c14800-265b-4a73-85f2-a10d87939ff8",
    /**
     * Event key from Seats.io → Charts → create/open Event for your floor plan.
     * This is NOT the secret workspace key.
     */
    eventKey: params.get("seatsioEventKey") || params.get("eventKey") || "",
    /** Hold-on-select session (official option) */
    session: "continue",
    language: "he",
    pricingCategories: PRICING_CATEGORIES,
    priceFormatter: priceFormatter,
    /** Official CDN map by region */
    cdnByRegion: {
      eu: "https://cdn-eu.seatsio.net/chart.js",
      na: "https://cdn-na.seatsio.net/chart.js",
      sa: "https://cdn-sa.seatsio.net/chart.js",
      oc: "https://cdn-oc.seatsio.net/chart.js",
    },
  };
})(typeof window !== "undefined" ? window : globalThis);
