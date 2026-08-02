/**
 * Demo mode for client presentations.
 * Modular — does not alter app.js behavior when off.
 */
(function initDemoMode() {
  const STORAGE_KEY = "ticketsDemoMode";
  const DOCK_KEY = "ticketsDemoModeDock";
  const PAGES = [
    { href: "index.html", label: "דף הבית 1" },
    { href: "index2.html", label: "דף הבית 2" },
    { href: "index3.html", label: "דף הבית 3" },
  ];
  const REGIONS = [
    { selector: ".site-header", label: "ניווט ואזור אישי" },
    { selector: "#home .hero", label: "באנר ראשי" },
    { selector: ".header-search-row", label: "חיפוש מופעים" },
    { selector: ".hero-v2-search-wrap", label: "חיפוש מופעים" },
    { selector: "#homeSearch", label: "חיפוש מופעים" },
    { selector: ".categories-section", label: "בחירת קטגוריה" },
    { selector: "#homeSections .section", label: "רשימות מופעים" },
    { selector: ".join-section", label: "הרשמה ועדכונים" },
    { selector: "#events .events-layout", label: "קטלוג וסינון" },
    { selector: ".page-hero", label: "כותרת עמוד" },
    { selector: "#event .event-layout", label: "פרטי מופע ורכישה" },
    { selector: "#event .event-hero", label: "כותרת מופע" },
    { selector: "#seats .seats-map-full", label: "בחירת מושבים" },
    { selector: ".footer", label: "תחתית האתר" },
  ];

  let enabled = false;
  let dockCollapsed = false;
  let hotEl = null;
  let toggleBtn = null;
  let panelEl = null;
  let closeBtn = null;
  let labelEl = null;
  let cursorEl = null;
  let menuEl = null;
  let menuOpen = false;
  let pointerX = 0;
  let pointerY = 0;

  const LABEL_OFFSET_X = 18;
  const LABEL_OFFSET_Y = 22;
  const VIEW_MARGIN = 12;

  function readDock() {
    try {
      return localStorage.getItem(DOCK_KEY) === "1";
    } catch {
      return false;
    }
  }

  function writeDock(collapsed) {
    try {
      localStorage.setItem(DOCK_KEY, collapsed ? "1" : "0");
    } catch {
      /* ignore */
    }
  }

  function setDockCollapsed(collapsed) {
    dockCollapsed = !!collapsed;
    if (!panelEl) return;
    panelEl.classList.toggle("is-collapsed", dockCollapsed);
    panelEl.setAttribute("aria-expanded", dockCollapsed ? "false" : "true");
    if (closeBtn) closeBtn.hidden = dockCollapsed;
    if (toggleBtn) toggleBtn.tabIndex = dockCollapsed ? -1 : 0;
    writeDock(dockCollapsed);
  }

  function readStored() {
    try {
      return localStorage.getItem(STORAGE_KEY) === "1";
    } catch {
      return false;
    }
  }

  function writeStored(on) {
    try {
      localStorage.setItem(STORAGE_KEY, on ? "1" : "0");
    } catch {
      /* ignore */
    }
  }

  function currentPageFile() {
    const path = (location.pathname || "").replace(/\\/g, "/");
    const name = path.split("/").pop() || "";
    if (!name || name === "") return "index.html";
    return name;
  }

  function markRegions() {
    REGIONS.forEach(({ selector, label }) => {
      document.querySelectorAll(selector).forEach((el) => {
        if (el.closest(".demo-mode-panel") || el.closest(".demo-mode-menu")) return;
        if (selector === "#homeSearch") {
          if (el.closest(".hero-v2-search-wrap") || el.closest(".header-search-row")) return;
        }
        el.setAttribute("data-demo-region", "");
        el.setAttribute("data-demo-label", label);
      });
    });
  }

  function hideLabel() {
    if (labelEl) labelEl.classList.remove("is-visible");
  }

  function clearHot() {
    if (hotEl) {
      hotEl.classList.remove("is-demo-hot");
      hotEl = null;
    }
    hideLabel();
  }

  function placeLabelNearPointer(x, y) {
    if (!labelEl || !hotEl || menuOpen) {
      hideLabel();
      return;
    }
    const text = hotEl.getAttribute("data-demo-label") || "";
    if (!text) {
      hideLabel();
      return;
    }
    labelEl.textContent = text;
    labelEl.classList.add("is-visible");
    const lw = labelEl.offsetWidth || 120;
    const lh = labelEl.offsetHeight || 28;
    const maxLeft = window.innerWidth - lw - VIEW_MARGIN;
    const maxTop = window.innerHeight - lh - VIEW_MARGIN;

    let left = x + LABEL_OFFSET_X;
    let top = y + LABEL_OFFSET_Y;

    if (left > maxLeft) left = x - lw - LABEL_OFFSET_X;
    if (top > maxTop) top = y - lh - 12;
    if (left < VIEW_MARGIN) left = VIEW_MARGIN;
    if (top < VIEW_MARGIN) top = VIEW_MARGIN;
    if (left > maxLeft) left = Math.max(VIEW_MARGIN, maxLeft);
    if (top > maxTop) top = Math.max(VIEW_MARGIN, maxTop);

    labelEl.style.left = `${Math.round(left)}px`;
    labelEl.style.top = `${Math.round(top)}px`;
  }

  function setHot(el) {
    if (menuOpen) return;
    if (hotEl === el) {
      if (hotEl) placeLabelNearPointer(pointerX, pointerY);
      return;
    }
    if (hotEl) hotEl.classList.remove("is-demo-hot");
    hotEl = el;
    if (hotEl) {
      hotEl.classList.add("is-demo-hot");
      placeLabelNearPointer(pointerX, pointerY);
    } else {
      hideLabel();
    }
  }

  function closeMenu() {
    if (!menuEl) return;
    menuOpen = false;
    menuEl.classList.remove("is-open");
    menuEl.setAttribute("aria-hidden", "true");
    menuEl.querySelectorAll("button").forEach((btn) => {
      btn.tabIndex = -1;
    });
  }

  function placeMenu(x, y) {
    if (!menuEl) return;
    menuEl.classList.add("is-open");
    menuEl.setAttribute("aria-hidden", "false");
    const mw = menuEl.offsetWidth || 180;
    const mh = menuEl.offsetHeight || 160;
    let left = x + 8;
    let top = y + 8;
    if (left + mw > window.innerWidth - VIEW_MARGIN) left = x - mw - 8;
    if (top + mh > window.innerHeight - VIEW_MARGIN) top = y - mh - 8;
    if (left < VIEW_MARGIN) left = VIEW_MARGIN;
    if (top < VIEW_MARGIN) top = VIEW_MARGIN;
    menuEl.style.left = `${Math.round(left)}px`;
    menuEl.style.top = `${Math.round(top)}px`;
    menuEl.querySelectorAll("button").forEach((btn) => {
      btn.tabIndex = 0;
    });
    const first = menuEl.querySelector("button");
    if (first) first.focus();
  }

  function openMenu(x, y) {
    if (!menuEl || !enabled) return;
    menuOpen = true;
    hideLabel();
    const current = currentPageFile().toLowerCase();
    menuEl.querySelectorAll("[data-demo-page]").forEach((btn) => {
      const href = (btn.getAttribute("data-demo-page") || "").toLowerCase();
      btn.classList.toggle("is-current", href === current || (current === "" && href === "index.html"));
    });
    placeMenu(x, y);
  }

  function onPointerMove(e) {
    if (!enabled) return;
    pointerX = e.clientX;
    pointerY = e.clientY;
    if (cursorEl && !menuOpen) {
      cursorEl.style.transform = `translate(${pointerX - 4}px, ${pointerY - 2}px)`;
      cursorEl.classList.add("is-visible");
    }
    if (menuOpen) return;
    const target = e.target;
    if (!(target instanceof Element)) {
      setHot(null);
      return;
    }
    if (target.closest(".demo-mode-panel") || target.closest(".demo-mode-menu")) {
      setHot(null);
      return;
    }
    const region = target.closest("[data-demo-region]");
    setHot(region || null);
  }

  function onPointerLeave() {
    if (cursorEl) cursorEl.classList.remove("is-visible");
    if (!menuOpen) clearHot();
  }

  function onContextMenu(e) {
    if (!enabled) return;
    e.preventDefault();
    e.stopPropagation();
    pointerX = e.clientX;
    pointerY = e.clientY;
    openMenu(pointerX, pointerY);
  }

  function onDocumentClick(e) {
    if (!menuOpen) return;
    const t = e.target;
    if (t instanceof Element && t.closest(".demo-mode-menu")) return;
    closeMenu();
  }

  function onKeyDown(e) {
    if (!enabled) return;
    if (e.key === "Escape") {
      if (menuOpen) {
        e.preventDefault();
        closeMenu();
        if (toggleBtn) toggleBtn.focus();
      }
    }
  }

  function setEnabled(on) {
    enabled = !!on;
    document.body.classList.toggle("demo-mode-on", enabled);
    if (toggleBtn) {
      toggleBtn.setAttribute("aria-checked", enabled ? "true" : "false");
    }
    writeStored(enabled);
    if (!enabled) {
      closeMenu();
      clearHot();
      if (cursorEl) cursorEl.classList.remove("is-visible");
    } else {
      markRegions();
    }
  }

  function buildUI() {
    panelEl = document.createElement("div");
    panelEl.className = "demo-mode-panel";
    panelEl.setAttribute("aria-expanded", "true");

    const inner = document.createElement("div");
    inner.className = "demo-mode-panel-inner";

    toggleBtn = document.createElement("button");
    toggleBtn.type = "button";
    toggleBtn.className = "demo-mode-toggle";
    toggleBtn.setAttribute("role", "switch");
    toggleBtn.setAttribute("aria-checked", "false");
    toggleBtn.setAttribute("aria-label", "מצב הדגמה");
    toggleBtn.innerHTML =
      '<span class="demo-mode-toggle-track" aria-hidden="true"><span class="demo-mode-toggle-thumb"></span></span>' +
      "<span>מצב הדגמה</span>";
    toggleBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (dockCollapsed) return;
      setEnabled(!enabled);
    });

    closeBtn = document.createElement("button");
    closeBtn.type = "button";
    closeBtn.className = "demo-mode-dock-close";
    closeBtn.setAttribute("aria-label", "צמצום פאנל מצב הדגמה");
    closeBtn.textContent = "×";
    closeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      setDockCollapsed(true);
    });

    inner.appendChild(toggleBtn);
    inner.appendChild(closeBtn);
    panelEl.appendChild(inner);
    panelEl.addEventListener("click", () => {
      if (dockCollapsed) setDockCollapsed(false);
    });
    document.body.appendChild(panelEl);

    labelEl = document.createElement("div");
    labelEl.className = "demo-mode-label-float";
    labelEl.setAttribute("aria-hidden", "true");
    document.body.appendChild(labelEl);

    cursorEl = document.createElement("div");
    cursorEl.className = "demo-mode-cursor";
    cursorEl.setAttribute("aria-hidden", "true");
    cursorEl.innerHTML =
      '<svg width="32" height="40" viewBox="0 0 32 40" xmlns="http://www.w3.org/2000/svg">' +
      '<path d="M4 2 L4 34 L12 26 L17 38 L24 35 L18 23 L28 23 Z" fill="#111" stroke="#fff" stroke-width="2.2" stroke-linejoin="round"/>' +
      "</svg>";
    document.body.appendChild(cursorEl);

    menuEl = document.createElement("div");
    menuEl.className = "demo-mode-menu";
    menuEl.setAttribute("role", "menu");
    menuEl.setAttribute("aria-label", "מעבר בין גרסאות דף הבית");
    menuEl.setAttribute("aria-hidden", "true");
    menuEl.innerHTML =
      '<p class="demo-mode-menu-title">מעבר בין דפים</p>' +
      PAGES.map(
        (p) =>
          `<button type="button" role="menuitem" data-demo-page="${p.href}" tabindex="-1">${p.label}</button>`
      ).join("");
    menuEl.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-demo-page]");
      if (!btn) return;
      const href = btn.getAttribute("data-demo-page");
      if (!href) return;
      const hash = location.hash || "";
      closeMenu();
      location.href = href + hash;
    });
    document.body.appendChild(menuEl);
  }

  function observeDynamic() {
    const homeSections = document.getElementById("homeSections");
    if (!homeSections) return;
    const mo = new MutationObserver(() => {
      markRegions();
    });
    mo.observe(homeSections, { childList: true, subtree: true });
  }

  function demoChromeEls() {
    return [panelEl, labelEl, cursorEl, menuEl].filter(Boolean);
  }

  function syncDemoChromeHost() {
    const host = document.fullscreenElement || document.body;
    demoChromeEls().forEach((el) => {
      if (el.parentElement !== host) host.appendChild(el);
    });
  }

  function boot() {
    buildUI();
    markRegions();
    observeDynamic();
    document.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("pointerleave", onPointerLeave);
    document.addEventListener("contextmenu", onContextMenu);
    document.addEventListener("click", onDocumentClick);
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("fullscreenchange", syncDemoChromeHost);
    setEnabled(readStored());
    setDockCollapsed(readDock());
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
