/**
 * Mock venue / section / seat data for the seats flow POC.
 * Kept separate from rendering so a real API can replace this later.
 */
(function (global) {
  const SERVICE_FEE_PER_TICKET = 5;

  const PRICE_TIERS = [
    { id: "t169", price: 169, color: "#8ecae6", label: "₪169" },
    { id: "t219", price: 219, color: "#90be6d", label: "₪219" },
    { id: "t269", price: 269, color: "#f4a261", label: "₪269" },
    { id: "t319", price: 319, color: "#f00358", label: "₪319" },
  ];

  const VENUE = {
    id: "venue-demo-amphitheater",
    name: "אמפי שוני, בנימינה",
    stageLabel: "במה",
  };

  /**
   * Spatial layout hints (percentages within venue plan).
   * availability: "good" | "limited" | "soldout"
   */
  const SECTIONS = [
    {
      id: "orchestra",
      name: "אורקסטרה",
      nameEn: "Orchestra",
      priceFrom: 319,
      tierId: "t319",
      availability: "good",
      availabilityLabel: "זמינות טובה",
      layout: { col: "center", row: 1, shape: "wide-front" },
      seatmapSectionHint: "Orchestra",
      rows: [14, 16, 16, 18, 18, 20, 20, 20],
      takenMod: 11,
      accessibleRowOffset: 0,
    },
    {
      id: "section-1",
      name: "גוש 1",
      nameEn: "Section 1",
      priceFrom: 269,
      tierId: "t269",
      availability: "limited",
      availabilityLabel: "זמינות מוגבלת",
      layout: { col: "right", row: 2, shape: "side" },
      seatmapSectionHint: "Section 1",
      rows: [12, 12, 14, 14, 14, 16],
      takenMod: 7,
      accessibleRowOffset: -1,
    },
    {
      id: "section-2",
      name: "גוש 2",
      nameEn: "Section 2",
      priceFrom: 269,
      tierId: "t269",
      availability: "good",
      availabilityLabel: "זמינות טובה",
      layout: { col: "left", row: 2, shape: "side" },
      seatmapSectionHint: "Section 2",
      rows: [12, 12, 14, 14, 14, 16],
      takenMod: 9,
      accessibleRowOffset: -1,
    },
    {
      id: "section-3",
      name: "גוש 3",
      nameEn: "Section 3",
      priceFrom: 219,
      tierId: "t219",
      availability: "good",
      availabilityLabel: "זמינות טובה",
      layout: { col: "center", row: 2, shape: "mid" },
      seatmapSectionHint: "Section 3",
      rows: [16, 18, 18, 20, 20, 20, 22],
      takenMod: 13,
      accessibleRowOffset: -1,
    },
    {
      id: "section-4",
      name: "גוש 4",
      nameEn: "Section 4",
      priceFrom: 219,
      tierId: "t219",
      availability: "limited",
      availabilityLabel: "זמינות מוגבלת",
      layout: { col: "right", row: 3, shape: "rear-side" },
      seatmapSectionHint: "Section 4",
      rows: [10, 12, 12, 14, 14],
      takenMod: 5,
      accessibleRowOffset: -1,
    },
    {
      id: "section-5",
      name: "גוש 5",
      nameEn: "Section 5",
      priceFrom: 169,
      tierId: "t169",
      availability: "soldout",
      availabilityLabel: "אזל",
      layout: { col: "left", row: 3, shape: "rear-side" },
      seatmapSectionHint: "Section 5",
      rows: [10, 12, 12, 14, 14],
      takenMod: 3,
      accessibleRowOffset: -1,
      soldOut: true,
    },
  ];

  function getSection(id) {
    return SECTIONS.find((s) => s.id === id) || null;
  }

  function getTier(tierId) {
    return PRICE_TIERS.find((t) => t.id === tierId) || PRICE_TIERS[0];
  }

  /** Deterministic mock seats for a section (fallback renderer). */
  function generateSeats(sectionId) {
    const section = getSection(sectionId);
    if (!section) return [];
    const seats = [];
    let n = 0;
    const rows = section.rows || [];
    const accessRow =
      rows.length + (section.accessibleRowOffset == null ? -1 : section.accessibleRowOffset);
    rows.forEach((cols, rIdx) => {
      const row = rIdx + 1;
      for (let c = 1; c <= cols; c++) {
        n += 1;
        const taken =
          !!section.soldOut ||
          n % (section.takenMod || 13) === 0 ||
          n % 19 === 0;
        seats.push({
          id: `${section.id}-r${row}-c${c}`,
          sectionId: section.id,
          sectionName: section.name,
          row,
          seat: c,
          price: section.priceFrom,
          tierId: section.tierId,
          status: taken ? "unavailable" : "available",
          accessible: row === accessRow && c <= 2,
        });
      }
    });
    return seats;
  }

  function performanceMeta(ev) {
    return {
      eventName: (ev && ev.title) || "עידן רייכל",
      date: "12.08.2026",
      time: "21:00",
      venue: VENUE.name,
    };
  }

  global.TicketsVenueData = {
    SERVICE_FEE_PER_TICKET,
    PRICE_TIERS,
    VENUE,
    SECTIONS,
    getSection,
    getTier,
    generateSeats,
    performanceMeta,
  };
})(typeof window !== "undefined" ? window : globalThis);
