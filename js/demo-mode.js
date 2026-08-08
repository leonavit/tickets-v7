/**
 * Demo mode for client presentations.
 * Modular — does not alter app.js behavior when off.
 */
(function initDemoMode() {
  const STORAGE_KEY = "ticketsDemoMode";
  const DOCK_KEY = "ticketsDemoModeDock";
  const REGIONS = [
    { selector: ".site-header", label: "ניווט ואזור אישי" },
    { selector: "#home .hero", label: "באנר ראשי" },
    { selector: ".header-search-row", label: "חיפוש מופעים" },
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

  function markRegions() {
    REGIONS.forEach(({ selector, label }) => {
      document.querySelectorAll(selector).forEach((el) => {
        if (el.closest(".demo-mode-panel")) return;
        if (selector === "#homeSearch") {
          if (el.closest(".header-search-row")) return;
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
    if (!labelEl || !hotEl) {
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

  function onPointerMove(e) {
    if (!enabled) return;
    pointerX = e.clientX;
    pointerY = e.clientY;
    if (cursorEl) {
      cursorEl.style.transform = `translate(${pointerX - 4}px, ${pointerY - 2}px)`;
      cursorEl.classList.add("is-visible");
    }
    const target = e.target;
    if (!(target instanceof Element)) {
      setHot(null);
      return;
    }
    if (target.closest(".demo-mode-panel")) {
      setHot(null);
      return;
    }
    const region = target.closest("[data-demo-region]");
    setHot(region || null);
  }

  function onPointerLeave() {
    if (cursorEl) cursorEl.classList.remove("is-visible");
    clearHot();
  }

  function setEnabled(on) {
    enabled = !!on;
    document.body.classList.toggle("demo-mode-on", enabled);
    if (toggleBtn) {
      toggleBtn.setAttribute("aria-checked", enabled ? "true" : "false");
    }
    writeStored(enabled);
    if (!enabled) {
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
    return [panelEl, labelEl, cursorEl].filter(Boolean);
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
