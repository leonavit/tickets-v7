/**
 * Seatmap.pro runtime configuration (POC).
 *
 * Insert organization Public API Key + Event ID from Seatmap.pro Editor Admin.
 * Never put private organization tokens (X-API-Key) in frontend code.
 *
 * Docs: https://seatmap.pro/knowledge-base/renderer/gettingstarted/
 * CDN:  https://cdn.jsdelivr.net/npm/@seatmap.pro/renderer/+esm
 */
(function (global) {
  const params = new URLSearchParams(
    typeof location !== "undefined" ? location.search : ""
  );

  /**
   * mode:
   *  - "auto"     → try Seatmap.pro when publicKey+eventId exist, else fallback
   *  - "fallback" → always use local mock map
   *  - "seatmap"  → force Seatmap.pro (shows error UI if credentials missing)
   */
  global.TicketsSeatmapConfig = {
    mode: params.get("seatmapMode") || "auto",
    /** Public key from Editor Admin → Organization Settings */
    publicKey: params.get("seatmapPublicKey") || "",
    /** Event UUID from Booking API / Events Hub */
    eventId: params.get("seatmapEventId") || "",
    /** "prod" | "stage" per Seatmap.pro docs */
    env: params.get("seatmapEnv") || "prod",
    /** Official ESM build (no local build system required) */
    sdkUrl: "https://cdn.jsdelivr.net/npm/@seatmap.pro/renderer/+esm",
    providerId: "seatmap.pro",
  };
})(typeof window !== "undefined" ? window : globalThis);
