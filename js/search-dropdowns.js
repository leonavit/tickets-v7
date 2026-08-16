/**
 * Search field dropdowns (location / category).
 * Panels portal to document.body on mobile so header blur/transform
 * cannot skew position:fixed.
 */
(function initSearchDropdowns() {
  const MQ = "(max-width:900px)";
  let placing = false;

  function isMobile() {
    try {
      return window.matchMedia(MQ).matches;
    } catch (_) {
      return false;
    }
  }

  function placePanel(anchor, panel) {
    if (placing || panel.hidden) return;
    placing = true;
    try {
      const r = anchor.getBoundingClientRect();
      const gap = 8;
      const width = Math.min(
        Math.max(r.width, 200),
        Math.min(360, window.innerWidth - 24)
      );
      let left = r.left;
      if (left + width > window.innerWidth - 12) left = window.innerWidth - 12 - width;
      left = Math.max(12, left);

      let top = r.bottom + gap;
      const ph = panel.offsetHeight || 0;
      if (ph && top + ph > window.innerHeight - 12) {
        const above = r.top - ph - gap;
        if (above >= 12) top = above;
        else top = Math.max(12, window.innerHeight - ph - 12);
      }

      const nextTop = `${Math.round(top)}px`;
      const nextLeft = `${Math.round(left)}px`;
      const nextWidth = `${Math.round(width)}px`;
      if (
        panel.style.top === nextTop &&
        panel.style.left === nextLeft &&
        panel.style.width === nextWidth
      ) {
        return;
      }

      panel.style.position = "fixed";
      panel.style.zIndex = "420";
      panel.style.width = nextWidth;
      panel.style.left = nextLeft;
      panel.style.right = "auto";
      panel.style.maxWidth = "none";
      panel.style.top = nextTop;
    } finally {
      // Release after layout settles — avoids scroll-event feedback loops
      requestAnimationFrame(() => {
        placing = false;
      });
    }
  }

  function portalOpen(panel, home, anchor) {
    if (isMobile()) {
      if (panel.parentNode !== document.body) document.body.appendChild(panel);
      panel.classList.add("is-portaled");
    } else if (home && panel.parentNode !== home) {
      home.appendChild(panel);
      panel.classList.remove("is-portaled");
      panel.style.top = "";
      panel.style.left = "";
      panel.style.width = "";
      panel.style.right = "";
      panel.style.position = "";
    }
    panel.hidden = false;
    if (isMobile()) {
      requestAnimationFrame(() => placePanel(anchor, panel));
    }
  }

  function portalClose(panel, home) {
    if (panel.hidden && panel.parentNode === home) return;
    panel.hidden = true;
    panel.classList.remove("is-portaled");
    panel.style.top = "";
    panel.style.left = "";
    panel.style.width = "";
    panel.style.right = "";
    panel.style.position = "";
    if (home && panel.parentNode !== home) home.appendChild(panel);
  }

  function enhanceSelect(selectId) {
    const select = document.getElementById(selectId);
    if (!select || select.dataset.anchored === "1") return;
    select.dataset.anchored = "1";

    const field = select.closest(".search-field");
    const host = select.parentElement;
    if (!field || !host) return;

    host.classList.add("search-select-wrap");

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "search-select-display";
    btn.id = `${selectId}Display`;
    btn.setAttribute("aria-haspopup", "listbox");
    btn.setAttribute("aria-expanded", "false");
    btn.setAttribute(
      "aria-label",
      selectId === "searchLocation" ? "מיקום" : "קטגוריה"
    );

    const panel = document.createElement("div");
    panel.className = "search-select-panel";
    panel.id = `${selectId}Panel`;
    panel.hidden = true;
    panel.setAttribute("role", "listbox");

    const home = host;
    let scrollTimer = 0;

    const renderOptions = () => {
      panel.innerHTML = "";
      [...select.options].forEach((opt, i) => {
        const optionBtn = document.createElement("button");
        optionBtn.type = "button";
        optionBtn.className = "search-select-option";
        optionBtn.textContent = opt.textContent;
        optionBtn.setAttribute("role", "option");
        const selected = i === select.selectedIndex;
        optionBtn.setAttribute("aria-selected", selected ? "true" : "false");
        if (selected) optionBtn.classList.add("is-selected");
        optionBtn.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          select.selectedIndex = i;
          select.dispatchEvent(new Event("change", { bubbles: true }));
          btn.textContent = opt.textContent;
          close();
        });
        panel.appendChild(optionBtn);
      });
    };

    const syncLabel = () => {
      const opt = select.options[select.selectedIndex];
      btn.textContent = (opt && opt.textContent) || "";
    };

    const close = () => {
      portalClose(panel, home);
      btn.setAttribute("aria-expanded", "false");
    };

    const open = () => {
      const datePanel = document.getElementById("dateRangePanel");
      const dateDisplay = document.getElementById("dateRangeDisplay");
      if (datePanel && !datePanel.hidden) {
        datePanel.hidden = true;
        dateDisplay?.setAttribute("aria-expanded", "false");
        if (typeof window.ticketsClearDatePanelPos === "function") {
          window.ticketsClearDatePanelPos();
        }
      }
      document.querySelectorAll(".search-select-panel").forEach((p) => {
        if (p !== panel && !p.hidden) portalClose(p, p._selectHome || p.parentNode);
      });
      document.querySelectorAll(".search-select-display").forEach((b) => {
        if (b !== btn) b.setAttribute("aria-expanded", "false");
      });

      renderOptions();
      btn.setAttribute("aria-expanded", "true");
      portalOpen(panel, home, field);
    };

    panel._selectHome = home;
    select.classList.add("search-select-native");
    select.setAttribute("tabindex", "-1");
    select.setAttribute("aria-hidden", "true");
    host.insertBefore(btn, select);
    home.appendChild(panel);
    syncLabel();
    select.addEventListener("change", syncLabel);

    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (panel.hidden) open();
      else close();
    });

    document.addEventListener("click", (e) => {
      if (panel.hidden) return;
      if (e.target.closest(`#${panel.id}`) || e.target === btn) return;
      close();
    });

    window.addEventListener(
      "resize",
      () => {
        if (!panel.hidden) placePanel(field, panel);
      },
      { passive: true }
    );
    window.addEventListener(
      "scroll",
      () => {
        if (panel.hidden || !isMobile() || placing) return;
        window.clearTimeout(scrollTimer);
        scrollTimer = window.setTimeout(() => placePanel(field, panel), 50);
      },
      { passive: true }
    );
  }

  enhanceSelect("searchLocation");
  enhanceSelect("searchCategory");
})();
