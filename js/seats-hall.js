(function () {
  let zoom = 1;
  let accessibleFilter = false;
  let activeStage = null;

  const STAGE_DEFS = {
    pit: {
      label: "פיט",
      price: 185,
      rows: [12, 12, 14, 14, 14, 16, 16],
      takenMod: 11,
    },
    "hall-front": {
      label: "אולם",
      price: 185,
      rows: [16, 16, 18, 18, 20, 20, 20, 22, 22],
      takenMod: 13,
    },
    "hall-mid": {
      label: "אולם",
      price: 185,
      rows: [18, 18, 20, 20, 20, 22, 22, 22, 22],
      takenMod: 12,
    },
    "balcony-center": {
      label: "יציע מרכז",
      price: 115,
      rows: [14, 16, 16, 18, 18, 18],
      takenMod: 14,
    },
    "box-right": {
      label: "תא ימין",
      price: 145,
      rows: [6, 6, 6, 6],
      takenMod: 9,
    },
    "gallery-right": {
      label: "גלריה ימין",
      price: 145,
      rows: [8, 8, 10, 10, 10],
      takenMod: 10,
    },
    "balcony-right": {
      label: "יציע ימין",
      price: 85,
      rows: [10, 10, 12, 12, 12, 12],
      takenMod: 15,
    },
    "box-left": { label: "תא שמאל", price: 145, rows: [6, 6, 6], takenMod: 8 },
    "gallery-left": {
      label: "גלריה שמאל",
      price: 145,
      rows: [8, 8, 10, 10],
      takenMod: 10,
    },
    "balcony-left": {
      label: "יציע שמאל",
      price: 115,
      rows: [10, 10, 12, 12],
      takenMod: 12,
    },
  };

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
        '<div class="seats-summary-hero-media"><img id="seatsSummaryPoster" alt="" loading="lazy"></div>';
      const head = summary.querySelector(".seats-summary-head");
      if (head) summary.insertBefore(hero, head);
      else summary.prepend(hero);
      const existingName = document.getElementById("seatsShowName");
      if (existingName) {
        hero.appendChild(existingName);
      } else {
        const fallback = document.createElement("strong");
        fallback.className = "seats-show-name";
        fallback.id = "seatsShowName";
        hero.appendChild(fallback);
      }
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

  function fillActiveBlock(def) {
    const container = document.getElementById("activeSeatBlock");
    if (!container || !def) return;
    container.innerHTML = "";
    container.dataset.price = String(def.price);
    container.dataset.block = def.label;

    const label = document.createElement("span");
    label.className = "hall-block-label";
    label.textContent = def.label;
    container.appendChild(label);

    const wrap = document.createElement("div");
    wrap.className = "hall-seat-rows";
    let n = 0;
    (def.rows || []).forEach((cols, rIdx) => {
      const rowEl = document.createElement("div");
      rowEl.className = "hall-seat-row";
      const rowNum = rIdx + 1;
      const accessibleRow = rowNum === (def.rows.length | 0);
      const rowLabel = document.createElement("span");
      rowLabel.className = "hall-row-label";
      rowLabel.textContent = String(rowNum);
      rowLabel.setAttribute("aria-hidden", "true");
      rowEl.appendChild(rowLabel);
      for (let c = 1; c <= cols; c++) {
        n += 1;
        const taken = n % (def.takenMod || 13) === 0 || n % 19 === 0;
        rowEl.appendChild(
          seatButton({
            id: `${def.label}-${rowNum}-${c}`,
            row: rowNum,
            col: c,
            block: def.label,
            price: def.price,
            accessible: accessibleRow && c <= 2,
            taken,
          })
        );
      }
      wrap.appendChild(rowEl);
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
      // clear selections when going back
      document
        .querySelectorAll("#hallCanvas .seat.selected")
        .forEach((s) => s.classList.remove("selected"));
      if (typeof window.updateSeatSummary === "function") {
        window.updateSeatSummary();
      }
    }
  }

  function openStage(stageId) {
    const def = STAGE_DEFS[stageId];
    if (!def) return;
    activeStage = stageId;
    fillActiveBlock(def);
    const badge = document.getElementById("seatMapStageBadge");
    const label = document.getElementById("activeStageLabel");
    if (badge) badge.textContent = def.label;
    if (label) label.textContent = def.label;
    accessibleFilter = false;
    applyFilters();
    setZoom(1);
    setSeatsStep("seats");
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

  function setZoom(next) {
    zoom = Math.min(1.8, Math.max(0.55, next));
    const canvas = document.getElementById("hallCanvas");
    const vp = document.getElementById("hallViewport");
    if (canvas) {
      canvas.style.transform = `scale(${zoom})`;
      canvas.style.transformOrigin = "center top";
      // Expand layout so overflow scroll can pan when zoomed in
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
    }
    vp?.classList.toggle("is-zoom-pan", zoom > 1);
    const label = document.getElementById("seatsZoomLabel");
    if (label) label.textContent = Math.round(zoom * 100) + "%";
  }

  function bindHallPan(vp) {
    if (!vp || vp.dataset.panBound === "1") return;
    vp.dataset.panBound = "1";

    let dragging = false;
    let moved = false;
    let startX = 0;
    let startY = 0;
    let startLeft = 0;
    let startTop = 0;
    let pointerId = null;
    const THRESHOLD = 5;

    const endPan = (e) => {
      if (!dragging) return;
      if (pointerId != null && e.pointerId !== pointerId) return;
      dragging = false;
      try {
        if (pointerId != null) vp.releasePointerCapture(pointerId);
      } catch (_) {}
      pointerId = null;
      vp.classList.remove("is-panning");
      if (moved) {
        vp.dataset.suppressSeatClick = "1";
        // Clear after the synthetic click from this gesture
        requestAnimationFrame(() => {
          delete vp.dataset.suppressSeatClick;
        });
      }
      moved = false;
    };

    vp.addEventListener("pointerdown", (e) => {
      const shellEl = document.getElementById("seatsShell");
      if (!shellEl || shellEl.dataset.seatsStep !== "seats") return;
      if (zoom <= 1) return;
      if (e.button !== 0 && e.button !== 1) return;
      // Keep seat clicks selectable while zoomed-in.
      if (e.target && e.target.closest && e.target.closest(".seat")) return;
      dragging = true;
      moved = false;
      pointerId = e.pointerId;
      startX = e.clientX;
      startY = e.clientY;
      startLeft = vp.scrollLeft;
      startTop = vp.scrollTop;
      try {
        vp.setPointerCapture(e.pointerId);
      } catch (_) {}
    });

    vp.addEventListener("pointermove", (e) => {
      if (!dragging || (pointerId != null && e.pointerId !== pointerId)) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      if (!moved && Math.hypot(dx, dy) < THRESHOLD) return;
      if (!moved) {
        moved = true;
        vp.classList.add("is-panning");
      }
      vp.scrollLeft = startLeft - dx;
      vp.scrollTop = startTop - dy;
    });

    vp.addEventListener("pointerup", endPan);
    vp.addEventListener("pointercancel", endPan);

    // Block seat toggle after a pan gesture
    vp.addEventListener(
      "click",
      (e) => {
        if (vp.dataset.suppressSeatClick === "1") {
          e.preventDefault();
          e.stopPropagation();
          delete vp.dataset.suppressSeatClick;
        }
      },
      true
    );
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

    document.getElementById("stageSchematic")?.addEventListener("click", (e) => {
      const zone = e.target.closest(".stage-zone[data-stage-id]");
      if (!zone || zone.disabled || zone.dataset.available === "0") return;
      openStage(zone.dataset.stageId);
    });

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
        setZoom(zoom + step);
      },
      { passive: false }
    );
    bindHallPan(hallViewport);

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
    if (btn) btn.disabled = !sel.length;
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
