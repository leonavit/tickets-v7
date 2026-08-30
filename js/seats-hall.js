(function () {
  let zoom = 1;
  let stageZoom = 1;
  let accessibleFilter = false;
  let activeStage = null;

  /* Every wedge in venue-fan-svg (viewBox 0 0 1000 540) is an annular sector
     around one shared center, so seats are laid out in polar coordinates. */
  const VIEW_W = 1000;
  const VIEW_H = 540;
  const FAN_CX = 500;
  const FAN_CY = 60;
  /* Radial band of each ring, matching the arc radii in the SVG paths */
  const RING_RADII = {
    hall: { inner: 105, outer: 255 },
    balcony: { inner: 270, outer: 435 },
  };
  /* Zone n covers 160°−28n .. 160°−28(n−1), measured as atan2(y−cy, x−cx) */
  const FAN_START_DEG = 160;
  const FAN_ZONE_DEG = 28;
  /* Keeps seats clear of the wedge outline (stroke-width 10 → 5 units each side) */
  const WEDGE_INSET = 7;
  /* Angular room reserved inside the wedge for the row number */
  const ROW_LABEL_GUTTER = 8;

  function zonePolar(stageId) {
    const m = /^(hall|balcony)-([1-5])$/.exec(String(stageId || ""));
    if (!m) return null;
    const ring = RING_RADII[m[1]];
    const index = Number(m[2]);
    const endDeg = FAN_START_DEG - FAN_ZONE_DEG * (index - 1);
    return {
      ring: m[1],
      innerR: ring.inner,
      outerR: ring.outer,
      startDeg: endDeg - FAN_ZONE_DEG,
      endDeg,
    };
  }

  function polarPoint(r, deg) {
    const rad = (deg * Math.PI) / 180;
    return { x: FAN_CX + r * Math.cos(rad), y: FAN_CY + r * Math.sin(rad) };
  }

  /* Bounding box of the wedge as percentages of the scene, for zoom/centering */
  function zoneBoxPct(stageId) {
    const p = zonePolar(stageId);
    if (!p) return null;
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    const steps = 48;
    for (let i = 0; i <= steps; i++) {
      const deg = p.startDeg + ((p.endDeg - p.startDeg) * i) / steps;
      [p.innerR, p.outerR].forEach((r) => {
        const { x, y } = polarPoint(r, deg);
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      });
    }
    return {
      left: (minX / VIEW_W) * 100,
      top: (minY / VIEW_H) * 100,
      width: ((maxX - minX) / VIEW_W) * 100,
      height: ((maxY - minY) / VIEW_H) * 100,
    };
  }


  /* Inner halls (upper, near stage): rows 1–24; outer balconies (lower): rows 25–37.
     Seats per row come from the wedge arc, so only rows and pricing live here. */
  const UPPER_ZONE_ROWS = 24;
  const LOWER_ZONE_ROWS = 13;
  const LOWER_ROW_OFFSET = UPPER_ZONE_ROWS;
  const STAGE_DEFS = {
    "hall-1": {
      label: "אולם",
      price: 240,
      rowCount: UPPER_ZONE_ROWS,
      rowOffset: 0,
      takenMod: 13,
    },
    "hall-2": {
      label: "אולם",
      price: 240,
      rowCount: UPPER_ZONE_ROWS,
      rowOffset: 0,
      takenMod: 12,
    },
    "hall-3": {
      label: "אולם",
      price: 240,
      rowCount: UPPER_ZONE_ROWS,
      rowOffset: 0,
      takenMod: 11,
    },
    "hall-4": {
      label: "אולם",
      price: 240,
      rowCount: UPPER_ZONE_ROWS,
      rowOffset: 0,
      takenMod: 13,
    },
    "hall-5": {
      label: "אולם",
      price: 240,
      rowCount: UPPER_ZONE_ROWS,
      rowOffset: 0,
      takenMod: 12,
    },
    "balcony-1": {
      label: "יציע",
      price: 180,
      rowCount: LOWER_ZONE_ROWS,
      rowOffset: LOWER_ROW_OFFSET,
      takenMod: 14,
    },
    "balcony-2": {
      label: "יציע",
      price: 180,
      rowCount: LOWER_ZONE_ROWS,
      rowOffset: LOWER_ROW_OFFSET,
      takenMod: 13,
    },
    "balcony-3": {
      label: "יציע",
      price: 180,
      rowCount: LOWER_ZONE_ROWS,
      rowOffset: LOWER_ROW_OFFSET,
      takenMod: 12,
    },
    "balcony-4": {
      label: "יציע",
      price: 180,
      rowCount: LOWER_ZONE_ROWS,
      rowOffset: LOWER_ROW_OFFSET,
      takenMod: 14,
    },
    "balcony-5": {
      label: "יציע",
      price: 180,
      rowCount: LOWER_ZONE_ROWS,
      rowOffset: LOWER_ROW_OFFSET,
      takenMod: 13,
    },
  };

  const SEAT_ZOOM_MAX = 3.2;
  const SEAT_ZOOM_MIN = 0.55;

  function formatBlockName(block) {
    const b = String(block || "");
    if (!b) return "אזור";
    if (b.startsWith("גוש")) return b;
    return b;
  }

  function activeEventData() {
    try {
      if (typeof getEventById === "function" && typeof activeEventId !== "undefined") {
        return getEventById(activeEventId) || null;
      }
    } catch (_) {}
    return null;
  }

  function syncSeatsSummaryHero() {
    const summary = document.getElementById("seatsSummary");
    if (!summary) return;
    let hero = summary.querySelector(".seats-summary-hero");
    if (!hero) {
      hero = document.createElement("div");
      hero.className = "seats-summary-hero";
      hero.innerHTML =
        '<div class="seats-summary-hero-media"><img id="seatsSummaryPoster" alt="" loading="lazy"></div>' +
        '<div class="cart-hold-timer seats-hold-timer" id="seatsHoldTimer" hidden role="status" aria-live="polite">' +
        '<img class="cart-hold-timer-icon" src="assets/icons/clock.svg" alt="" aria-hidden="true">' +
        '<span class="cart-hold-timer-text">נותרו לסיום ההזמנה <strong class="cart-hold-countdown" id="seatsHoldCountdown" dir="ltr">10:00</strong> דקות</span>' +
        "</div>";
      const head = summary.querySelector(".seats-summary-head");
      if (head) summary.insertBefore(hero, head);
      else summary.prepend(hero);
      const existingRow = document.getElementById("seatsShowRow");
      const existingName = document.getElementById("seatsShowName");
      if (existingRow) {
        hero.appendChild(existingRow);
      } else if (existingName) {
        hero.appendChild(existingName);
      } else {
        const fallback = document.createElement("strong");
        fallback.className = "seats-show-name";
        fallback.id = "seatsShowName";
        hero.appendChild(fallback);
      }
    } else if (!document.getElementById("seatsHoldTimer")) {
      const media = hero.querySelector(".seats-summary-hero-media");
      const timer = document.createElement("div");
      timer.className = "cart-hold-timer seats-hold-timer";
      timer.id = "seatsHoldTimer";
      timer.hidden = true;
      timer.setAttribute("role", "status");
      timer.setAttribute("aria-live", "polite");
      timer.innerHTML =
        '<img class="cart-hold-timer-icon" src="assets/icons/clock.svg" alt="" aria-hidden="true">' +
        '<span class="cart-hold-timer-text">נותרו לסיום ההזמנה <strong class="cart-hold-countdown" id="seatsHoldCountdown" dir="ltr">10:00</strong> דקות</span>';
      if (media) media.insertAdjacentElement("afterend", timer);
      else hero.prepend(timer);
    }
    const ev = activeEventData();
    const title = ev && ev.title ? ev.title : "המופע";
    const showName = document.getElementById("seatsShowName");
    const poster = document.getElementById("seatsSummaryPoster");
    if (showName) {
      showName.textContent = title;
      showName.hidden = false;
    }
    if (poster) {
      const src =
        ev && typeof eventImage === "function"
          ? eventImage(ev)
          : "assets/events/1.jpg";
      poster.src = src;
      poster.alt = title;
    }
  }

  function seatButton({ id, row, col, block, price, accessible, taken }) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "seat";
    if (taken) {
      b.classList.add("taken");
      b.disabled = true;
    }
    if (accessible) b.classList.add("accessible");
    b.dataset.seat = String(id);
    b.dataset.row = String(row);
    b.dataset.col = String(col);
    b.dataset.block = String(block);
    b.dataset.price = String(price);
    const blockName = formatBlockName(block);
    b.dataset.tooltip = `${blockName}\nשורה ${row}\nמושב ${col}\n${price} ₪`;
    b.setAttribute(
      "aria-label",
      `${blockName}, שורה ${row}, מושב ${col}, ${price} שקלים${
        accessible ? ", מושב נגיש" : ""
      }`
    );
    b.textContent = String(col);
    return b;
  }

  function ensureSeatHoverTip() {
    let tip = document.getElementById("seatHoverTip");
    if (tip) return tip;
    tip = document.createElement("div");
    tip.id = "seatHoverTip";
    tip.className = "seat-hover-tip";
    tip.hidden = true;
    tip.setAttribute("role", "tooltip");
    document.body.appendChild(tip);
    return tip;
  }

  function hideSeatHoverTip() {
    const tip = document.getElementById("seatHoverTip");
    if (!tip) return;
    tip.hidden = true;
    tip.textContent = "";
  }

  function showSeatHoverTip(seat) {
    if (!seat || seat.disabled || seat.classList.contains("taken")) {
      hideSeatHoverTip();
      return;
    }
    const text = seat.dataset.tooltip;
    if (!text) {
      hideSeatHoverTip();
      return;
    }
    const tip = ensureSeatHoverTip();
    tip.textContent = text;
    tip.hidden = false;
    const r = seat.getBoundingClientRect();
    const tipW = tip.offsetWidth || 100;
    const tipH = tip.offsetHeight || 56;
    let left = r.left + r.width / 2;
    let top = r.top - 12;
    left = Math.min(window.innerWidth - tipW / 2 - 8, Math.max(tipW / 2 + 8, left));
    if (top - tipH < 8) {
      tip.classList.add("is-below");
      tip.style.top = `${r.bottom + 12}px`;
    } else {
      tip.classList.remove("is-below");
      tip.style.top = `${top}px`;
    }
    tip.style.left = `${left}px`;
  }

  function bindSeatHoverTip(root) {
    if (!root || root.dataset.tipBound === "1") return;
    root.dataset.tipBound = "1";
    root.addEventListener("pointerover", (e) => {
      const seat = e.target.closest?.(".seat");
      if (!seat || !root.contains(seat)) return;
      showSeatHoverTip(seat);
    });
    root.addEventListener("pointerout", (e) => {
      const seat = e.target.closest?.(".seat");
      if (!seat) return;
      const next = e.relatedTarget;
      if (next && seat.contains(next)) return;
      if (next && next.closest?.(".seat") === seat) return;
      hideSeatHoverTip();
    });
    root.addEventListener("pointerdown", hideSeatHoverTip);
  }

  function ensureVenueContextSvg() {
    const scene = document.getElementById("venueSeatScene");
    const layer = document.getElementById("venueActiveLayer");
    if (!scene || !layer) return null;
    let ctx = document.getElementById("venueContextSvg");
    if (ctx) {
      ctx.setAttribute("class", "venue-fan-svg venue-context-svg");
      return ctx;
    }
    const src = document.querySelector("#stageSchematic .venue-fan-svg");
    if (!src) return null;
    ctx = src.cloneNode(true);
    ctx.id = "venueContextSvg";
    ctx.setAttribute("class", "venue-fan-svg venue-context-svg");
    ctx.setAttribute("aria-hidden", "true");
    ctx.style.pointerEvents = "none";
    ctx.querySelectorAll(".stage-zone").forEach((zone) => {
      zone.removeAttribute("tabindex");
      zone.removeAttribute("role");
      zone.style.pointerEvents = "none";
    });
    scene.insertBefore(ctx, layer);
    return ctx;
  }

  function zoneGeomFromSvg(stageId) {
    const box = zoneBoxPct(stageId);
    return box ? { box } : null;
  }

  function highlightContextZone(stageId) {
    const ctx = ensureVenueContextSvg();
    if (!ctx) return;
    ctx.querySelectorAll(".stage-zone").forEach((zone) => {
      const active = zone.dataset.stageId === stageId;
      zone.classList.toggle("is-active", active);
      zone.classList.toggle("is-dimmed", !active);
      zone.classList.toggle("is-labels-hidden", active);
    });
  }

  /* Keep the diagram point under the cursor fixed while zoom changes */
  function zoomTowardPointer(vp, targetEl, clientX, clientY, applyFn) {
    if (
      !vp ||
      !targetEl ||
      clientX == null ||
      clientY == null ||
      !Number.isFinite(clientX) ||
      !Number.isFinite(clientY)
    ) {
      applyFn();
      return;
    }
    const before = targetEl.getBoundingClientRect();
    if (!before.width || !before.height) {
      applyFn();
      return;
    }
    const rx = (clientX - before.left) / before.width;
    const ry = (clientY - before.top) / before.height;
    applyFn();
    const after = targetEl.getBoundingClientRect();
    if (!after.width || !after.height) return;
    vp.scrollLeft += after.left + rx * after.width - clientX;
    vp.scrollTop += after.top + ry * after.height - clientY;
  }

  function setStageZoom(next, pivot) {
    const apply = () => {
      stageZoom = Math.min(2.2, Math.max(0.7, next));
      const target = document.getElementById("stageFanZoomTarget");
      const vp = document.getElementById("stageFanViewport");
      if (target) {
        target.style.transformOrigin = "center center";
        target.style.transform = `scale(${stageZoom})`;
        if (stageZoom > 1) {
          const w = target.offsetWidth;
          const h = target.offsetHeight;
          const extraX = ((stageZoom - 1) * w) / 2;
          const extraY = ((stageZoom - 1) * h) / 2;
          target.style.marginLeft = `${extraX}px`;
          target.style.marginRight = `${extraX}px`;
          target.style.marginTop = `${extraY}px`;
          target.style.marginBottom = `${extraY}px`;
        } else {
          target.style.marginLeft = "";
          target.style.marginRight = "";
          target.style.marginTop = "";
          target.style.marginBottom = "";
        }
      }
      vp?.classList.toggle("is-zoom-pan", stageZoom > 1);
      const label = document.getElementById("stageZoomLabel");
      if (label) label.textContent = Math.round(stageZoom * 100) + "%";
    };

    const target = document.getElementById("stageFanZoomTarget");
    const vp = document.getElementById("stageFanViewport");
    if (pivot && vp && target) {
      zoomTowardPointer(vp, target, pivot.x, pivot.y, apply);
    } else {
      apply();
    }
  }

  function centerViewportOnActiveZone() {
    const vp = document.getElementById("hallViewport");
    const scene = document.getElementById("venueSeatScene");
    const box = zoneBoxPct(activeStage);
    if (!vp || !scene || !box) return;
    const sr = scene.getBoundingClientRect();
    const vr = vp.getBoundingClientRect();
    if (!sr.width || !vr.width) return;
    const zoneCx = sr.left + (sr.width * (box.left + box.width / 2)) / 100;
    const zoneCy = sr.top + (sr.height * (box.top + box.height / 2)) / 100;
    vp.scrollLeft += zoneCx - (vr.left + vr.width / 2);
    vp.scrollTop += zoneCy - (vr.top + vr.height / 2);
  }

  function zoomSeatCanvasToZone(stageId) {
    const box = zoneBoxPct(stageId);
    const canvas = document.getElementById("hallCanvas");
    if (!box || !canvas) return;
    /* Fill ~85% of the viewport with the selected wedge */
    const z = Math.min(
      SEAT_ZOOM_MAX,
      Math.max(1.85, 0.85 / Math.max(box.width / 100, box.height / 100))
    );
    setZoom(z);
    setTimeout(() => {
      centerViewportOnActiveZone();
      setTimeout(centerViewportOnActiveZone, 40);
    }, 30);
  }

  /* Seats are placed in scene coordinates, so the layer spans the whole scene */
  function applyZoneGeometry(stageId) {
    const layer = document.getElementById("venueActiveLayer");
    const block = document.getElementById("activeSeatBlock");
    const scene = document.getElementById("venueSeatScene");
    if (!layer || !block) return;
    if (!zonePolar(stageId)) {
      layer.hidden = true;
      scene?.removeAttribute("data-active-zone");
      return;
    }
    layer.style.left = "0";
    layer.style.top = "0";
    layer.style.width = "100%";
    layer.style.height = "100%";
    block.style.clipPath = "";
    layer.hidden = false;
    scene?.setAttribute("data-active-zone", stageId);
    highlightContextZone(stageId);
  }

  /* One row per radial step; seat count follows the arc so spacing stays even */
  function buildWedgeGrid(def, stageId) {
    const p = zonePolar(stageId);
    if (!p) return null;
    const rowCount = Math.max(1, def.rowCount || LOWER_ZONE_ROWS);
    const innerR = p.innerR + WEDGE_INSET;
    const outerR = p.outerR - WEDGE_INSET;
    const rowPitch = (outerR - innerR) / rowCount;
    /* Square-ish grid: seats along the arc sit as far apart as the rows */
    const seatPitch = rowPitch;
    const seatDiameter = rowPitch * 0.7;
    /* Room for the row number inside the wedge, right of seat 1 */
    const labelGutter = Math.max(ROW_LABEL_GUTTER, seatDiameter * 1.6);
    const rows = [];
    for (let i = 0; i < rowCount; i++) {
      const radius = innerR + (i + 0.5) * rowPitch;
      /* Constant physical margin from the two straight wedge edges */
      const angleInset = ((WEDGE_INSET / radius) * 180) / Math.PI;
      const gutterDeg = ((labelGutter / radius) * 180) / Math.PI;
      const startDeg = p.startDeg + angleInset + gutterDeg;
      const endDeg = p.endDeg - angleInset;
      const spanDeg = Math.max(0, endDeg - startDeg);
      const arc = (radius * spanDeg * Math.PI) / 180;
      const seats = Math.max(3, Math.round(arc / seatPitch));
      rows.push({
        radius,
        startDeg,
        spanDeg,
        seats,
        labelDeg: p.startDeg + angleInset + gutterDeg / 2,
      });
    }
    return { rows, seatDiameter };
  }

  function fillActiveBlock(def, stageId) {
    const container = document.getElementById("activeSeatBlock");
    const zoneId = stageId || activeStage;
    if (!container || !def) return;
    container.innerHTML = "";
    container.dataset.price = String(def.price);
    container.dataset.block = def.label;
    applyZoneGeometry(zoneId);

    const grid = buildWedgeGrid(def, zoneId);
    if (!grid) return;

    const wrap = document.createElement("div");
    wrap.className = "hall-seat-rows hall-seat-rows-wedge";
    /* Percent of scene width keeps seats locked to the map at any size or zoom */
    const seatPct = (grid.seatDiameter / VIEW_W) * 100;
    wrap.style.setProperty("--seat-size", `${seatPct.toFixed(4)}%`);
    wrap.style.setProperty("--seat-cqw", seatPct.toFixed(4));

    const place = (el, radius, deg) => {
      const { x, y } = polarPoint(radius, deg);
      el.style.left = `${((x / VIEW_W) * 100).toFixed(4)}%`;
      el.style.top = `${((y / VIEW_H) * 100).toFixed(4)}%`;
    };

    let n = 0;
    const rowOffset = def.rowOffset || 0;
    const rowCount = grid.rows.length;
    grid.rows.forEach((row, rIdx) => {
      const displayRow = rIdx + 1 + rowOffset;
      const accessibleRow = rIdx + 1 === rowCount;
      const step = row.spanDeg / row.seats;
      for (let c = 1; c <= row.seats; c++) {
        n += 1;
        const taken = n % (def.takenMod || 13) === 0 || n % 19 === 0;
        const seat = seatButton({
          id: `${def.label}-${displayRow}-${c}`,
          row: displayRow,
          col: c,
          block: def.label,
          price: def.price,
          accessible: accessibleRow && c <= 2,
          taken,
        });
        /* Seat 1 sits at the smallest angle, i.e. the right edge in RTL */
        place(seat, row.radius, row.startDeg + (c - 0.5) * step);
        wrap.appendChild(seat);
      }
      const rowLabel = document.createElement("span");
      rowLabel.className = "hall-row-label";
      rowLabel.textContent = String(displayRow);
      rowLabel.setAttribute("aria-hidden", "true");
      place(rowLabel, row.radius, row.labelDeg);
      wrap.appendChild(rowLabel);
    });

    container.appendChild(wrap);
  }

  function setSeatsStep(step) {
    const shell = document.getElementById("seatsShell");
    const stageStep = document.getElementById("stagePickStep");
    const seatStep = document.getElementById("seatPickStep");
    const crumb = document.querySelector(
      '#seats .breadcrumbs [aria-current="page"]'
    );
    if (!shell || !stageStep || !seatStep) return;
    const isStage = step === "stage";
    shell.dataset.seatsStep = isStage ? "stage" : "seats";
    stageStep.hidden = !isStage;
    seatStep.hidden = isStage;
    if (crumb) {
      crumb.textContent = isStage ? "בחירת אזור" : "בחירת מושבים";
    }
    if (isStage) {
      hideSeatHoverTip();
      const stageVp = document.getElementById("stageFanViewport");
      stageVp?.classList.remove("is-panning");
      if (stageVp) delete stageVp.dataset.suppressZoneClick;
      document.getElementById("venueActiveLayer")?.setAttribute("hidden", "");
      document
        .getElementById("venueSeatScene")
        ?.removeAttribute("data-active-zone");
      document
        .querySelectorAll("#hallCanvas .seat.selected")
        .forEach((s) => s.classList.remove("selected"));
      if (typeof window.updateSeatSummary === "function") {
        window.updateSeatSummary();
      }
      setStageZoom(1);
      const ctx = document.getElementById("venueContextSvg");
      ctx?.querySelectorAll(".stage-zone").forEach((zone) => {
        zone.classList.remove("is-active", "is-dimmed", "is-labels-hidden");
      });
      setZoom(1);
    }
  }

  function openStage(stageId) {
    const def = STAGE_DEFS[stageId];
    if (!def) return;
    activeStage = stageId;
    ensureVenueContextSvg();
    fillActiveBlock(def, stageId);
    const label = document.getElementById("activeStageLabel");
    if (label) label.textContent = def.label;
    accessibleFilter = false;
    applyFilters();
    setSeatsStep("seats");
    /* setTimeout: reliable after layout (rAF can stall in background tabs) */
    setTimeout(() => {
      applyZoneGeometry(stageId);
      zoomSeatCanvasToZone(stageId);
    }, 40);
  }

  function applyFilters() {
    const canvas = document.getElementById("hallCanvas");
    if (!canvas) return;
    canvas.classList.toggle("filter-accessible", accessibleFilter);
    canvas.querySelectorAll(".seat").forEach((seat) => {
      seat.classList.toggle(
        "accessible-match",
        accessibleFilter && seat.classList.contains("accessible")
      );
    });
    document
      .getElementById("accessibleFilterBtn")
      ?.classList.toggle("is-active", accessibleFilter);
    document
      .getElementById("accessibleFilterBtn")
      ?.setAttribute("aria-pressed", accessibleFilter ? "true" : "false");
  }

  function setZoom(next, pivot) {
    hideSeatHoverTip();
    const apply = () => {
      zoom = Math.min(SEAT_ZOOM_MAX, Math.max(SEAT_ZOOM_MIN, next));
      const canvas = document.getElementById("hallCanvas");
      const vp = document.getElementById("hallViewport");
      if (canvas) {
        /* Resize in layout, not transform:scale(), so circles stay crisp */
        canvas.style.setProperty("--seat-zoom", String(zoom));
        canvas.style.transform = "";
        canvas.style.transformOrigin = "";
        canvas.style.marginLeft = "";
        canvas.style.marginRight = "";
        canvas.style.marginTop = "";
        canvas.style.marginBottom = "";
      }
      vp?.classList.toggle("is-zoom-pan", zoom > 1);
      const label = document.getElementById("seatsZoomLabel");
      if (label) label.textContent = Math.round(zoom * 100) + "%";
    };

    const canvas = document.getElementById("hallCanvas");
    const vp = document.getElementById("hallViewport");
    if (pivot && vp && canvas) {
      zoomTowardPointer(vp, canvas, pivot.x, pivot.y, apply);
    } else {
      apply();
    }
  }

  function bindViewportPan(vp, options) {
    if (!vp || vp.dataset.panBound === "1") return;
    vp.dataset.panBound = "1";

    const step = options?.step || "seats";
    const getZoom = options?.getZoom || (() => zoom);
    const ignoreSelector = options?.ignoreSelector || ".seat";
    const suppressKey = options?.suppressKey || "suppressSeatClick";

    let dragging = false;
    let moved = false;
    let startX = 0;
    let startY = 0;
    let startLeft = 0;
    let startTop = 0;
    let pointerId = null;
    const THRESHOLD = 6;

    const endPan = (e) => {
      if (!dragging) return;
      if (pointerId != null && e && e.pointerId !== pointerId) return;
      const didPan = moved;
      dragging = false;
      try {
        if (pointerId != null) vp.releasePointerCapture(pointerId);
      } catch (_) {}
      pointerId = null;
      vp.classList.remove("is-panning");
      if (didPan) {
        vp.dataset[suppressKey] = "1";
        setTimeout(() => {
          delete vp.dataset[suppressKey];
        }, 0);
      }
      moved = false;
    };

    vp.addEventListener("pointerdown", (e) => {
      const shellEl = document.getElementById("seatsShell");
      if (!shellEl || shellEl.dataset.seatsStep !== step) return;
      if (getZoom() <= 1) return;
      if (e.button !== 0 && e.button !== 1) return;
      if (
        ignoreSelector &&
        e.target &&
        e.target.closest &&
        e.target.closest(ignoreSelector)
      ) {
        return;
      }
      /* Delay capture until a real drag — otherwise zone clicks break after zoom */
      dragging = true;
      moved = false;
      pointerId = e.pointerId;
      startX = e.clientX;
      startY = e.clientY;
      startLeft = vp.scrollLeft;
      startTop = vp.scrollTop;
    });

    vp.addEventListener("pointermove", (e) => {
      if (!dragging || (pointerId != null && e.pointerId !== pointerId)) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      if (!moved && Math.hypot(dx, dy) < THRESHOLD) return;
      if (!moved) {
        moved = true;
        vp.classList.add("is-panning");
        try {
          vp.setPointerCapture(pointerId);
        } catch (_) {}
      }
      vp.scrollLeft = startLeft - dx;
      vp.scrollTop = startTop - dy;
    });

    vp.addEventListener("pointerup", endPan);
    vp.addEventListener("pointercancel", endPan);
    vp.addEventListener("lostpointercapture", () => {
      if (dragging) endPan();
    });

    // Block click only after an actual pan gesture
    vp.addEventListener(
      "click",
      (e) => {
        if (vp.dataset[suppressKey] === "1") {
          e.preventDefault();
          e.stopPropagation();
          delete vp.dataset[suppressKey];
        }
      },
      true
    );
  }

  function bindHallPan(vp) {
    bindViewportPan(vp, {
      step: "seats",
      getZoom: () => zoom,
      ignoreSelector: ".seat",
      suppressKey: "suppressSeatClick",
    });
  }

  function bindStagePan(vp) {
    bindViewportPan(vp, {
      step: "stage",
      getZoom: () => stageZoom,
      ignoreSelector: "",
      suppressKey: "suppressZoneClick",
    });
  }

  function isFs() {
    const shell = document.getElementById("seatsShell");
    return (
      document.fullscreenElement === shell ||
      shell?.classList.contains("is-fullscreen")
    );
  }

  function syncFullscreenUi() {
    const shell = document.getElementById("seatsShell");
    const btn = document.getElementById("seatsFullscreen");
    const on = isFs();
    shell?.classList.toggle("is-fullscreen", on && !document.fullscreenElement);
    if (btn) {
      btn.classList.toggle("is-active", on);
      btn.setAttribute("aria-label", on ? "יציאה ממסך מלא" : "מסך מלא");
      btn.title = on ? "יציאה ממסך מלא" : "מסך מלא";
    }
  }

  async function toggleFullscreen() {
    const shell = document.getElementById("seatsShell");
    if (!shell) return;
    try {
      if (!isFs()) {
        if (shell.requestFullscreen) await shell.requestFullscreen();
        else shell.classList.add("is-fullscreen");
      } else if (document.fullscreenElement === shell) {
        await document.exitFullscreen();
      } else if (shell.classList.contains("is-fullscreen")) {
        shell.classList.remove("is-fullscreen");
      }
    } catch (_) {
      shell.classList.add("is-fullscreen");
    }
    syncFullscreenUi();
  }

  window.initSeats = function initSeats() {
    const shell = document.getElementById("seatsShell");
    if (!shell || shell.dataset.bound === "1") {
      setSeatsStep("stage");
      return;
    }
    shell.dataset.bound = "1";

    const stageSchematic = document.getElementById("stageSchematic");
    const tryOpenZone = (zone) => {
      if (!zone || zone.disabled || zone.dataset.available === "0") return;
      if (zone.getAttribute("aria-disabled") === "true") return;
      openStage(zone.dataset.stageId);
    };
    stageSchematic?.addEventListener("click", (e) => {
      const vp = document.getElementById("stageFanViewport");
      if (vp?.dataset.suppressZoneClick === "1") return;
      const zone = e.target.closest?.(".stage-zone[data-stage-id]");
      if (!zone && e.target !== stageSchematic) {
        /* Click may land on svg/path text — walk up from composedPath */
        const path = typeof e.composedPath === "function" ? e.composedPath() : [];
        for (const node of path) {
          if (node?.classList?.contains?.("stage-zone") && node.dataset?.stageId) {
            tryOpenZone(node);
            return;
          }
        }
      }
      tryOpenZone(zone);
    });
    stageSchematic?.addEventListener("keydown", (e) => {
      if (e.key !== "Enter" && e.key !== " ") return;
      const zone = e.target.closest?.(".stage-zone[data-stage-id]");
      if (!zone) return;
      e.preventDefault();
      tryOpenZone(zone);
    });

    document.getElementById("stageZoomIn")?.addEventListener("click", () => setStageZoom(stageZoom + 0.15));
    document.getElementById("stageZoomOut")?.addEventListener("click", () => setStageZoom(stageZoom - 0.15));
    document.getElementById("stageZoomReset")?.addEventListener("click", () => setStageZoom(1));

    const stageFanViewport = document.getElementById("stageFanViewport");
    stageFanViewport?.addEventListener(
      "wheel",
      (e) => {
        const shellEl = document.getElementById("seatsShell");
        if (!shellEl || shellEl.dataset.seatsStep !== "stage") return;
        e.preventDefault();
        const raw =
          e.deltaMode === 1 ? e.deltaY * 16 : e.deltaMode === 2 ? e.deltaY * 400 : e.deltaY;
        const step = Math.max(-0.2, Math.min(0.2, -raw * 0.0015));
        setStageZoom(stageZoom + step, { x: e.clientX, y: e.clientY });
      },
      { passive: false }
    );
    bindStagePan(stageFanViewport);

    document.getElementById("backToStages")?.addEventListener("click", () => {
      activeStage = null;
      setSeatsStep("stage");
    });

    document
      .getElementById("seatsZoomIn")
      ?.addEventListener("click", () => setZoom(zoom + 0.15));
    document
      .getElementById("seatsZoomOut")
      ?.addEventListener("click", () => setZoom(zoom - 0.15));
    document
      .getElementById("seatsZoomReset")
      ?.addEventListener("click", () => setZoom(1));
    document
      .getElementById("seatsFullscreen")
      ?.addEventListener("click", toggleFullscreen);

    // Mouse wheel / trackpad over the seat map → zoom in/out
    const hallViewport = document.getElementById("hallViewport");
    hallViewport?.addEventListener(
      "wheel",
      (e) => {
        const shellEl = document.getElementById("seatsShell");
        if (!shellEl || shellEl.dataset.seatsStep !== "seats") return;
        e.preventDefault();
        const raw =
          e.deltaMode === 1 ? e.deltaY * 16 : e.deltaMode === 2 ? e.deltaY * 400 : e.deltaY;
        const step = Math.max(-0.2, Math.min(0.2, -raw * 0.0015));
        setZoom(zoom + step, { x: e.clientX, y: e.clientY });
      },
      { passive: false }
    );
    bindHallPan(hallViewport);
    bindSeatHoverTip(hallViewport);
    hallViewport?.addEventListener("scroll", hideSeatHoverTip, { passive: true });

    document
      .getElementById("accessibleFilterBtn")
      ?.addEventListener("click", () => {
        accessibleFilter = !accessibleFilter;
        applyFilters();
      });

    document.addEventListener("fullscreenchange", syncFullscreenUi);
    setSeatsStep("stage");
    setZoom(1);
  };

  window.resetSeatsFlow = function resetSeatsFlow() {
    activeStage = null;
    setSeatsStep("stage");
  };

  /* Single empty seat left beside a selection in the same available run */
  window.hasOrphanEmptySeat = function hasOrphanEmptySeat() {
    const seats = [...document.querySelectorAll("#hallCanvas .seat")];
    if (!seats.length) return false;

    const byRow = new Map();
    seats.forEach((seat) => {
      const row = String(seat.dataset.row || "");
      if (!row) return;
      if (!byRow.has(row)) byRow.set(row, []);
      byRow.get(row).push(seat);
    });

    const leavesSingleEmpty = (flags) => {
      const n = flags.length;
      if (!n || !flags.some(Boolean)) return false;
      for (let i = 0; i < n; i++) {
        if (flags[i]) continue;
        const leftSel = i > 0 && flags[i - 1];
        const rightSel = i < n - 1 && flags[i + 1];
        if (leftSel && rightSel) return true;
        if (i === 0 && rightSel) return true;
        if (i === n - 1 && leftSel) return true;
      }
      return false;
    };

    for (const [, rowSeats] of byRow) {
      rowSeats.sort(
        (a, b) => Number(a.dataset.col || 0) - Number(b.dataset.col || 0)
      );
      let run = [];
      let orphan = false;
      const flush = () => {
        if (!run.length) return;
        const flags = run.map((s) => s.classList.contains("selected"));
        if (leavesSingleEmpty(flags)) orphan = true;
        run = [];
      };
      rowSeats.forEach((seat) => {
        const taken = seat.classList.contains("taken") || seat.disabled;
        if (taken) {
          flush();
          return;
        }
        run.push(seat);
      });
      flush();
      if (orphan) return true;
    }
    return false;
  };

  window.updateSeatSummary = function updateSeatSummary() {
    syncSeatsSummaryHero();
    const sel = [...document.querySelectorAll("#hallCanvas .seat.selected")];
    const summary = document.getElementById("seatsSummary");
    const peek = document.getElementById("seatsSummaryPeek");
    const shell = document.getElementById("seatsShell");
    const onSeatStep = shell?.dataset.seatsStep === "seats";

    if (summary) {
      const desktopSeats =
        onSeatStep && window.matchMedia("(min-width:961px)").matches;
      if (desktopSeats) {
        summary.classList.add("is-open");
        summary.classList.remove("is-collapsed");
        if (peek) peek.hidden = true;
      } else {
        summary.classList.toggle("is-open", onSeatStep && sel.length > 0);
        if (!sel.length) {
          summary.classList.remove("is-collapsed");
          if (peek) peek.hidden = true;
        } else if (summary.classList.contains("is-collapsed")) {
          if (peek) peek.hidden = false;
        }
      }
    }

    const box = document.getElementById("selectedSeats");
    const empty = document.getElementById("selectedSeatsEmpty");
    const btn = document.getElementById("toCart");
    const total = document.getElementById("seatTotal");
    if (sel.length) {
      if (empty) empty.hidden = true;
      if (box) {
        box.hidden = false;
        box.innerHTML = sel
          .map((el) => {
            const price = Number(el.dataset.price || 185);
            const blockName = formatBlockName(el.dataset.block || "אזור");
            const seatId = el.dataset.seat;
            return `<div class="selected-seat-row" data-selected-seat="${seatId}">
              <div class="selected-seat-main">
                <div class="selected-seat-lines">${blockName}&nbsp;·&nbsp;שורה ${
              el.dataset.row || "-"
            }&nbsp;·&nbsp;מושב&nbsp;${
              el.dataset.col || el.dataset.seat
            }</div>
                <strong class="selected-seat-price">${price}&nbsp;₪</strong>
              </div>
              <button type="button" class="selected-seat-remove" data-remove-seat="${seatId}" aria-label="הסרת מושב ${
              el.dataset.col || seatId
            }"><svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" focusable="false"><path fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" d="M4 7h16M9 7V4h6v3M7 7l1 13h8l1-13M10 11v5M14 11v5"/></svg></button>
            </div>`;
          })
          .join("");
      }
    } else {
      if (empty) empty.hidden = false;
      if (box) {
        box.hidden = true;
        box.innerHTML = "";
      }
    }
    const sum = sel.reduce((s, el) => s + Number(el.dataset.price || 185), 0);
    if (total) total.textContent = sum + "\u00a0₪";
    if (btn) {
      const hasSel = sel.length > 0;
      btn.disabled = !hasSel;
      btn.textContent = hasSel ? "המשך לרכישה" : "לא בחרת מושב עדיין";
    }
    if (typeof window.syncSeatHoldTimer === "function") {
      window.syncSeatHoldTimer(sel.length > 0);
    }
  };

  function collapseSummary() {
    const summary = document.getElementById("seatsSummary");
    const peek = document.getElementById("seatsSummaryPeek");
    if (!summary || !summary.classList.contains("is-open")) return;
    summary.classList.add("is-collapsed");
    if (peek) peek.hidden = false;
  }

  function expandSummary() {
    const summary = document.getElementById("seatsSummary");
    const peek = document.getElementById("seatsSummaryPeek");
    if (!summary) return;
    summary.classList.remove("is-collapsed");
    if (peek) peek.hidden = true;
  }

  document.getElementById("seatsSummaryHide")?.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    collapseSummary();
  });
  document.getElementById("seatsSummaryPeek")?.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    expandSummary();
  });
  document.addEventListener("click", (e) => {
    if (e.target.closest("#seatsSummaryHide")) {
      e.preventDefault();
      collapseSummary();
      return;
    }
    if (e.target.closest("#seatsSummaryPeek")) {
      e.preventDefault();
      expandSummary();
    }
  });
})();

document.addEventListener("click", (e) => {
  const removeBtn = e.target.closest("[data-remove-seat]");
  if (!removeBtn) return;
  e.preventDefault();
  e.stopPropagation();
  const id = removeBtn.dataset.removeSeat;
  const seat = [
    ...document.querySelectorAll("#hallCanvas .seat.selected"),
  ].find((s) => s.dataset.seat === id);
  if (seat) seat.classList.remove("selected");
  if (typeof window.updateSeatSummary === "function") window.updateSeatSummary();
});

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    window.initSeats();
    window.updateSeatSummary();
  });
} else {
  window.initSeats();
  window.updateSeatSummary();
}
