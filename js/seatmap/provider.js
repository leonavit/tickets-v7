/**
 * Provider boundary between Ticket-S UI and seat-map technology.
 * Seatmap.pro adapter + isolated fallback mock renderer.
 *
 * Swap provider later (e.g. Seats.io) by replacing adapters only.
 */
(function (global) {
  const FEE = () =>
    (global.TicketsVenueData && global.TicketsVenueData.SERVICE_FEE_PER_TICKET) ||
    5;

  function normalizeSeat(raw, section) {
    if (!raw) return null;
    // Fallback / mock seat objects are already normalized shape
    if (raw.sectionId && raw.sectionName && raw.row != null && raw.seat != null && !raw.compositeKey) {
      return {
        id: String(raw.id),
        sectionId: raw.sectionId,
        sectionName: raw.sectionName,
        row: String(raw.row),
        seat: String(raw.seat),
        price: Number(raw.price) || 0,
        accessible: !!raw.accessible,
        source: "fallback",
        raw,
      };
    }
    // Seatmap.pro seat object (documented fields vary; map defensively)
    if (raw.compositeKey || raw.seatId || raw.id) {
      const row =
        raw.row ||
        raw.rowLabel ||
        (raw.metadata && raw.metadata.row) ||
        "?";
      const seatNum =
        raw.seat ||
        raw.seatLabel ||
        raw.number ||
        (raw.metadata && raw.metadata.seat) ||
        "?";
      const sectionName =
        raw.sectionName ||
        raw.section ||
        (section && section.name) ||
        "אזור";
      const price =
        Number(
          raw.price ||
            raw.amount ||
            (raw.prices && raw.prices[0] && raw.prices[0].amount) ||
            (section && section.priceFrom) ||
            0
        ) || 0;
      return {
        id: String(raw.compositeKey || raw.seatId || raw.id),
        sectionId: (section && section.id) || String(raw.sectionId || ""),
        sectionName,
        row: String(row),
        seat: String(seatNum),
        price,
        source: "seatmap.pro",
        raw,
      };
    }
    return null;
  }

  /* ---------- Fallback mock map ---------- */
  function createFallbackAdapter(container, options) {
    const section = options.section;
    const data = global.TicketsVenueData;
    const seats = data.generateSeats(section.id);
    const selected = new Map();
    let zoom = 1;
    let destroyed = false;

    container.innerHTML = "";
    container.classList.add("seat-map-fallback");
    container.dataset.provider = "fallback";

    const viewport = document.createElement("div");
    viewport.className = "hall-viewport seat-map-fallback-viewport";
    viewport.id = "hallViewport";

    const canvas = document.createElement("div");
    canvas.className = "seat-map-fallback-canvas hall-canvas hall-canvas-single";
    canvas.id = "hallCanvas";

    const stage = document.createElement("div");
    stage.className = "hall-stage main seat-map-stage-badge";
    stage.id = "seatMapStageBadge";
    stage.textContent = "במה";

    const block = document.createElement("div");
    block.className = "hall-block orchestra seat-map-fallback-block";
    block.id = "activeSeatBlock";
    block.dataset.price = String(section.priceFrom);
    block.dataset.block = section.name;

    const label = document.createElement("span");
    label.className = "hall-block-label";
    label.textContent = section.name;
    block.appendChild(label);

    const rowsWrap = document.createElement("div");
    rowsWrap.className = "hall-seat-rows";

    const byRow = {};
    seats.forEach((s) => {
      if (!byRow[s.row]) byRow[s.row] = [];
      byRow[s.row].push(s);
    });

    Object.keys(byRow)
      .map(Number)
      .sort((a, b) => a - b)
      .forEach((rowNum) => {
        const rowEl = document.createElement("div");
        rowEl.className = "hall-seat-row";
        const rowLabel = document.createElement("span");
        rowLabel.className = "hall-row-label";
        rowLabel.textContent = String(rowNum);
        rowLabel.setAttribute("aria-hidden", "true");
        rowEl.appendChild(rowLabel);
        byRow[rowNum].forEach((s) => {
          const btn = document.createElement("button");
          btn.type = "button";
          btn.className = "seat";
          if (s.status !== "available") {
            btn.classList.add("taken");
            btn.disabled = true;
          }
          if (s.accessible) btn.classList.add("accessible");
          btn.dataset.seat = s.id;
          btn.dataset.row = String(s.row);
          btn.dataset.col = String(s.seat);
          btn.dataset.block = s.sectionName;
          btn.dataset.price = String(s.price);
          btn.dataset.tooltip = `${s.sectionName}\nשורה ${s.row}\nמושב ${s.seat}\n${s.price} ₪`;
          btn.setAttribute(
            "aria-label",
            `${s.sectionName}, שורה ${s.row}, מושב ${s.seat}, ${s.price} שקלים`
          );
          btn.textContent = String(s.seat);
          btn.addEventListener("click", (ev) => {
            ev.preventDefault();
            ev.stopPropagation();
            if (btn.disabled || destroyed) return;
            const on = !btn.classList.contains("selected");
            btn.classList.toggle("selected", on);
            const norm = normalizeSeat(s, section);
            if (on) {
              selected.set(norm.id, norm);
              options.onSeatSelect && options.onSeatSelect(norm);
            } else {
              selected.delete(norm.id);
              options.onSeatDeselect && options.onSeatDeselect(norm);
            }
            options.onSelectionChange &&
              options.onSelectionChange([...selected.values()]);
          });
          rowEl.appendChild(btn);
        });
        rowsWrap.appendChild(rowEl);
      });

    block.appendChild(rowsWrap);
    const wrap = document.createElement("div");
    wrap.className = "hall-single-wrap";
    wrap.appendChild(stage);
    wrap.appendChild(block);
    canvas.appendChild(wrap);
    viewport.appendChild(canvas);
    container.appendChild(viewport);

    function setZoom(next) {
      zoom = Math.min(1.8, Math.max(0.55, next));
      canvas.style.transform = `scale(${zoom})`;
      canvas.style.transformOrigin = "center top";
      if (zoom > 1) {
        const w = canvas.offsetWidth;
        const h = canvas.offsetHeight;
        const extraX = ((zoom - 1) * w) / 2;
        canvas.style.marginLeft = `${extraX}px`;
        canvas.style.marginRight = `${extraX}px`;
        canvas.style.marginBottom = `${(zoom - 1) * h}px`;
      } else {
        canvas.style.marginLeft = "";
        canvas.style.marginRight = "";
        canvas.style.marginBottom = "";
      }
      viewport.classList.toggle("is-zoom-pan", zoom > 1);
      const zl = document.getElementById("seatsZoomLabel");
      if (zl) zl.textContent = Math.round(zoom * 100) + "%";
    }

    // light pan when zoomed
    let dragging = false;
    let startX = 0;
    let startY = 0;
    let startLeft = 0;
    let startTop = 0;
    viewport.addEventListener("pointerdown", (e) => {
      if (zoom <= 1) return;
      if (e.target.closest && e.target.closest(".seat")) return;
      dragging = true;
      startX = e.clientX;
      startY = e.clientY;
      startLeft = viewport.scrollLeft;
      startTop = viewport.scrollTop;
      viewport.classList.add("is-panning");
      try {
        viewport.setPointerCapture(e.pointerId);
      } catch (_) {}
    });
    viewport.addEventListener("pointermove", (e) => {
      if (!dragging) return;
      viewport.scrollLeft = startLeft - (e.clientX - startX);
      viewport.scrollTop = startTop - (e.clientY - startY);
    });
    const endPan = () => {
      dragging = false;
      viewport.classList.remove("is-panning");
    };
    viewport.addEventListener("pointerup", endPan);
    viewport.addEventListener("pointercancel", endPan);
    viewport.addEventListener(
      "wheel",
      (e) => {
        e.preventDefault();
        const raw =
          e.deltaMode === 1
            ? e.deltaY * 16
            : e.deltaMode === 2
              ? e.deltaY * 400
              : e.deltaY;
        setZoom(zoom + Math.max(-0.2, Math.min(0.2, -raw * 0.0015)));
      },
      { passive: false }
    );

    setZoom(1);
    options.onReady &&
      options.onReady({ provider: "fallback", note: "mock-map" });

    return {
      provider: "fallback",
      zoomIn: () => setZoom(zoom + 0.15),
      zoomOut: () => setZoom(zoom - 0.15),
      zoomReset: () => setZoom(1),
      getSelection: () => [...selected.values()],
      deselectById(id) {
        const btn = canvas.querySelector(`.seat[data-seat="${CSS.escape(id)}"]`);
        if (btn && btn.classList.contains("selected")) btn.click();
        else if (selected.has(id)) {
          const seat = selected.get(id);
          selected.delete(id);
          options.onSeatDeselect && options.onSeatDeselect(seat);
          options.onSelectionChange &&
            options.onSelectionChange([...selected.values()]);
        }
      },
      clearSelection() {
        canvas.querySelectorAll(".seat.selected").forEach((b) => {
          b.classList.remove("selected");
        });
        selected.clear();
        options.onSelectionChange && options.onSelectionChange([]);
      },
      destroy() {
        destroyed = true;
        container.innerHTML = "";
        container.classList.remove("seat-map-fallback");
      },
    };
  }

  /* ---------- Seatmap.pro adapter ---------- */
  async function createSeatmapProAdapter(container, options) {
    const cfg = global.TicketsSeatmapConfig || {};
    if (!cfg.publicKey || !cfg.eventId) {
      throw new Error("MISSING_SEATMAP_CREDENTIALS");
    }

    container.innerHTML = "";
    container.classList.add("seat-map-seatmappro");
    container.dataset.provider = "seatmap.pro";

    const root = document.createElement("div");
    root.className = "seat-map-seatmappro-root";
    root.id = "seatmap-root";
    root.setAttribute("dir", "ltr"); // SDK canvas often LTR; wrapper stays RTL
    container.appendChild(root);

    const mod = await import(/* webpackIgnore: true */ cfg.sdkUrl);
    const SeatmapBookingRenderer =
      mod.SeatmapBookingRenderer || mod.default || mod;
    if (!SeatmapBookingRenderer) {
      throw new Error("SEATMAP_SDK_EXPORT_MISSING");
    }

    const selected = new Map();
    const section = options.section;

    const renderer = new SeatmapBookingRenderer(root, {
      publicKey: cfg.publicKey,
      env: cfg.env || "prod",
      onSeatSelect: (seat) => {
        const norm = normalizeSeat(seat, section);
        if (!norm) return;
        selected.set(norm.id, norm);
        options.onSeatSelect && options.onSeatSelect(norm);
        options.onSelectionChange &&
          options.onSelectionChange([...selected.values()]);
      },
      onSeatDeselect: (seat) => {
        const norm = normalizeSeat(seat, section);
        if (!norm) return;
        selected.delete(norm.id);
        options.onSeatDeselect && options.onSeatDeselect(norm);
        options.onSelectionChange &&
          options.onSelectionChange([...selected.values()]);
      },
    });

    await renderer.loadEvent(cfg.eventId);

    // Prefer focusing the chosen section when the SDK supports it
    try {
      const hint = section && section.seatmapSectionHint;
      if (hint && typeof renderer.zoomToSection === "function") {
        renderer.zoomToSection(hint);
      } else if (hint && typeof renderer.viewSection === "function") {
        renderer.viewSection(hint);
      }
    } catch (_) {}

    options.onReady &&
      options.onReady({ provider: "seatmap.pro", renderer });

    return {
      provider: "seatmap.pro",
      renderer,
      zoomIn: () => renderer.zoomIn && renderer.zoomIn(),
      zoomOut: () => renderer.zoomOut && renderer.zoomOut(),
      zoomReset: () => renderer.zoomToFit && renderer.zoomToFit(),
      getSelection: () => [...selected.values()],
      deselectById(id) {
        const seat = selected.get(id);
        if (!seat) return;
        selected.delete(id);
        try {
          if (renderer.deselectSeat) renderer.deselectSeat(seat.raw || id);
        } catch (_) {}
        options.onSeatDeselect && options.onSeatDeselect(seat);
        options.onSelectionChange &&
          options.onSelectionChange([...selected.values()]);
      },
      clearSelection() {
        selected.clear();
        options.onSelectionChange && options.onSelectionChange([]);
      },
      destroy() {
        try {
          if (renderer.destroy) renderer.destroy();
        } catch (_) {}
        container.innerHTML = "";
        container.classList.remove("seat-map-seatmappro");
      },
    };
  }

  function showCredentialNotice(container) {
    // Developer-only: keep out of customer-facing UI; log once for integrators.
    if (!global.__ticketsSeatmapNoticeLogged) {
      global.__ticketsSeatmapNoticeLogged = true;
      console.info(
        "[TicketsSeatmap] Using local fallback map. Set publicKey + eventId in js/seatmap/config.js (or URL params) to load Seatmap.pro."
      );
    }
  }

  /**
   * Mount the active seat-map provider into `container`.
   * @returns {Promise<object>} adapter instance
   */
  async function mount(container, options) {
    if (!container) throw new Error("NO_CONTAINER");
    const cfg = global.TicketsSeatmapConfig || { mode: "fallback" };
    const mode = cfg.mode || "auto";
    const canLive = !!(cfg.publicKey && cfg.eventId);

    if (mode === "seatmap" || (mode === "auto" && canLive)) {
      try {
        return await createSeatmapProAdapter(container, options);
      } catch (err) {
        console.warn("[TicketsSeatmap] Seatmap.pro unavailable, using fallback:", err);
        const wrap = container.parentElement;
        if (wrap && !wrap.querySelector(".seat-map-config-notice")) {
          showCredentialNotice(wrap);
        }
        return createFallbackAdapter(container, options);
      }
    }

    if (mode === "auto" && !canLive) {
      // Fallback clears container; show notice after mount via parent wrapper.
      const wrap = container.parentElement;
      if (wrap && !wrap.querySelector(".seat-map-config-notice")) {
        showCredentialNotice(wrap);
      }
    }
    return createFallbackAdapter(container, options);
  }

  global.TicketsSeatmapProvider = {
    mount,
    normalizeSeat,
    FEE,
    createFallbackAdapter,
  };
})(typeof window !== "undefined" ? window : globalThis);
