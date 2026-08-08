(function () {
  const PRICES = [169, 219, 269, 319];
  let zoom = 1;
  let activePrice = null;
  let accessibleFilter = false;

  function formatBlockName(block) {
    const b = String(block || "");
    if (!b) return "גוש";
    if (b === "אורקסטרה" || b === "נגיש") return b;
    if (b.startsWith("גוש")) return b;
    return `גוש ${b}`;
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
      `${blockName}, שורה ${row}, מושב ${col}, ${price} שקלים${accessible ? ", מושב נגיש" : ""}`
    );
    return b;
  }

  function fillBlock(container, { block, price, rows, accessibleRows, takenMod }) {
    container.innerHTML = "";
    const label = document.createElement("span");
    label.className = "hall-block-label";
    label.textContent = formatBlockName(block);
    container.appendChild(label);
    const wrap = document.createElement("div");
    wrap.className = "hall-seat-rows";
    let n = 0;
    rows.forEach((cols, rIdx) => {
      const rowEl = document.createElement("div");
      rowEl.className = "hall-seat-row";
      const rowNum = rIdx + 1;
      for (let c = 1; c <= cols; c++) {
        n += 1;
        const accessible = accessibleRows && accessibleRows.includes(rowNum);
        const taken = n % (takenMod || 13) === 0 || n % 19 === 0;
        rowEl.appendChild(
          seatButton({
            id: `${block}-${rowNum}-${c}`,
            row: rowNum,
            col: c,
            block,
            price,
            accessible: !!accessible,
            taken,
          })
        );
      }
      wrap.appendChild(rowEl);
    });
    container.appendChild(wrap);
    container.dataset.price = String(price);
    container.dataset.block = block;
  }

  function fillAccessibleZone(zone) {
    const rowsWrap = zone.querySelector(".hall-seat-rows") || document.createElement("div");
    rowsWrap.className = "hall-seat-rows";
    rowsWrap.innerHTML = "";
    const rowEl = document.createElement("div");
    rowEl.className = "hall-seat-row";
    for (let i = 1; i <= 10; i++) {
      rowEl.appendChild(
        seatButton({
          id: `נגיש-${i}`,
          row: 1,
          col: i,
          block: "נגיש",
          price: 269,
          accessible: true,
          taken: i === 4 || i === 9,
        })
      );
    }
    rowsWrap.appendChild(rowEl);
    if (!rowsWrap.parentNode) zone.appendChild(rowsWrap);
    zone.dataset.price = "269";
  }

  function applyFilters() {
    const canvas = document.getElementById("hallCanvas");
    if (!canvas) return;
    const filtering = activePrice != null || accessibleFilter;
    canvas.classList.toggle("is-filtering", filtering && !accessibleFilter);
    canvas.classList.toggle("filter-accessible", accessibleFilter);

    canvas.querySelectorAll(".hall-block, .hall-accessible-zone").forEach((el) => {
      const matchPrice = activePrice != null && String(el.dataset.price) === String(activePrice);
      const isAcc = el.classList.contains("hall-accessible-zone");
      el.classList.toggle(
        "is-spotlight",
        (activePrice != null && matchPrice) || (accessibleFilter && isAcc)
      );
    });

    canvas.querySelectorAll(".seat").forEach((seat) => {
      const priceMatch = activePrice != null && seat.dataset.price === String(activePrice);
      seat.classList.toggle("is-price-match", priceMatch);
      seat.classList.toggle("accessible-match", accessibleFilter && seat.classList.contains("accessible"));
    });

    document.querySelectorAll(".price-chip").forEach((btn) => {
      btn.classList.toggle("is-active", activePrice != null && btn.dataset.price === String(activePrice));
    });
    document.getElementById("accessibleFilterBtn")?.classList.toggle("is-active", accessibleFilter);
    document.getElementById("accessibleFilterBtn")?.setAttribute("aria-pressed", accessibleFilter ? "true" : "false");
  }

  function setZoom(next) {
    zoom = Math.min(1.8, Math.max(0.55, next));
    const canvas = document.getElementById("hallCanvas");
    if (canvas) canvas.style.transform = `scale(${zoom})`;
    const label = document.getElementById("seatsZoomLabel");
    if (label) label.textContent = Math.round(zoom * 100) + "%";
  }

  window.initSeats = function initSeats() {
    const canvas = document.getElementById("hallCanvas");
    if (!canvas || canvas.dataset.ready === "1") return;
    canvas.dataset.ready = "1";

    fillBlock(document.getElementById("block5"), {
      block: "גוש 5",
      price: 269,
      rows: [8, 9, 10, 11, 12, 12, 13, 13, 14, 14],
      takenMod: 14,
    });
    fillBlock(document.getElementById("blockOrchestra"), {
      block: "אורקסטרה",
      price: 319,
      rows: [16, 16, 18, 18, 20, 20, 20, 22, 22, 22, 22, 22],
      takenMod: 11,
    });
    fillBlock(document.getElementById("block1"), {
      block: "גוש 1",
      price: 269,
      rows: [8, 9, 10, 11, 12, 12, 13, 13, 14, 14],
      takenMod: 15,
    });
    fillBlock(document.getElementById("block4"), {
      block: "גוש 4",
      price: 219,
      rows: [10, 11, 12, 13, 14, 14, 15, 15, 16],
      takenMod: 12,
    });
    fillBlock(document.getElementById("block3"), {
      block: "גוש 3",
      price: 169,
      rows: [14, 15, 16, 17, 18, 18, 18, 18, 18, 18],
      takenMod: 16,
    });
    fillBlock(document.getElementById("block2"), {
      block: "גוש 2",
      price: 219,
      rows: [10, 11, 12, 13, 14, 14, 15, 15, 16],
      takenMod: 13,
    });
    fillAccessibleZone(document.getElementById("accessibleZone"));

    document.getElementById("seatsZoomIn")?.addEventListener("click", () => setZoom(zoom + 0.15));
    document.getElementById("seatsZoomOut")?.addEventListener("click", () => setZoom(zoom - 0.15));
    document.getElementById("seatsZoomReset")?.addEventListener("click", () => setZoom(1));
    document.getElementById("seatsFullscreen")?.addEventListener("click", toggleFullscreen);

    document.querySelectorAll(".price-chip").forEach((btn) => {
      btn.addEventListener("click", () => {
        const p = Number(btn.dataset.price);
        accessibleFilter = false;
        activePrice = activePrice === p ? null : p;
        applyFilters();
      });
    });
    document.getElementById("accessibleFilterBtn")?.addEventListener("click", () => {
      activePrice = null;
      accessibleFilter = !accessibleFilter;
      applyFilters();
    });

    document.addEventListener("fullscreenchange", syncFullscreenUi);
    setZoom(1);
  };

  function isFs() {
    const shell = document.getElementById("seatsShell");
    return document.fullscreenElement === shell || shell?.classList.contains("is-fullscreen");
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

  window.updateSeatSummary = function updateSeatSummary() {
    const sel = [...document.querySelectorAll(".seat.selected")];
    const summary = document.getElementById("seatsSummary");
    const peek = document.getElementById("seatsSummaryPeek");
    if (summary) {
      summary.classList.toggle("is-open", sel.length > 0);
      if (!sel.length) {
        summary.classList.remove("is-collapsed");
        if (peek) peek.hidden = true;
      } else if (summary.classList.contains("is-collapsed")) {
        if (peek) peek.hidden = false;
      }
    }

    const box = document.getElementById("selectedSeats");
    const empty = document.getElementById("selectedSeatsEmpty");
    const showName = document.getElementById("seatsShowName");
    const btn = document.getElementById("toCart");
    const total = document.getElementById("seatTotal");
    if (sel.length) {
      if (empty) empty.hidden = true;
      if (box) {
        box.hidden = false;
        box.innerHTML = sel
          .map((el) => {
            const price = Number(el.dataset.price || 229);
            const blockName = formatBlockName(el.dataset.block || "A");
            const seatId = el.dataset.seat;
            return `<div class="selected-seat-row" data-selected-seat="${seatId}">
              <div class="selected-seat-main">
                <div class="selected-seat-lines"><span>${blockName}</span><span>שורה ${el.dataset.row || "-"}</span><strong>מושב ${el.dataset.col || el.dataset.seat}</strong></div>
                <strong class="selected-seat-price">${price} ₪</strong>
              </div>
              <button type="button" class="selected-seat-remove" data-remove-seat="${seatId}" aria-label="הסרת מושב ${el.dataset.col || seatId}">×</button>
            </div>`;
          })
          .join("");
      }
      if (showName) showName.hidden = false;
    } else {
      if (empty) empty.hidden = false;
      if (box) {
        box.hidden = true;
        box.innerHTML = "";
      }
      if (showName) showName.hidden = true;
    }
    const sum = sel.reduce((s, el) => s + Number(el.dataset.price || 229), 0);
    if (total) total.textContent = sum + " ₪";
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
  // Delegation fallback (fullscreen / dynamic)
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
  if (removeBtn) {
    e.preventDefault();
    e.stopPropagation();
    const id = removeBtn.dataset.removeSeat;
    const seat = [...document.querySelectorAll("#hallCanvas .seat.selected")].find(
      (s) => s.dataset.seat === id
    );
    if (seat) seat.classList.remove("selected");
    if (typeof window.updateSeatSummary === "function") window.updateSeatSummary();
    return;
  }

  const seat = e.target.closest("#hallCanvas .seat");
  if (!seat || seat.disabled || seat.classList.contains("taken")) return;
  requestAnimationFrame(() => {
    if (typeof window.updateSeatSummary === "function") window.updateSeatSummary();
  });
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
