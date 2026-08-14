/**
 * Theme Options — builder-style side panel (stage 1: colors + hide demo mode).
 */
(function initThemeOptions() {
  const STORAGE_KEY = "ticketsThemeOptions";

  const COLOR_KEYS = [
    "brandDark",
    "brandPink",
    "brandBorder",
    "line",
    "dash",
    "ink",
    "searchBg",
    "headerBg",
    "headerFg",
    "categoriesBg",
    "footerBg",
    "carouselBgA",
    "carouselHeadingA",
    "carouselBtnA",
    "carouselBgB",
    "carouselHeadingB",
    "carouselBtnB",
  ];

  const COLOR_LABELS = {
    brandDark: "גרדיאנט התחלה",
    brandPink: "גרדיאנט סיום",
    brandBorder: "בורדר כפתורים",
    line: "קווי סקשנים",
    dash: "קווים מקווקוים",
    ink: "צבע גופן",
    searchBg: "רקע מנוע חיפוש",
    headerBg: "רקע האדר",
    headerFg: "צבע אלמנטים בהאדר",
    categoriesBg: "רקע מה תרצו לראות היום",
    footerBg: "רקע פוטר",
    carouselBgA: "רקע קרוסלות A",
    carouselHeadingA: "כותרת קרוסלות A",
    carouselBtnA: "כפתור קרוסלות A",
    carouselBgB: "רקע קרוסלות B",
    carouselHeadingB: "כותרת קרוסלות B",
    carouselBtnB: "כפתור קרוסלות B",
  };

  /** Light palette — previous site default (darks/lights as before). */
  const PALETTE_LIGHT = {
    brandDark: "#e72173",
    brandPink: "#a91854",
    brandBorder: "#c31c61",
    line: "#deded8",
    dash: "#777777",
    ink: "#1d104a",
    searchBg: "#1d104a",
    headerBg: "#ffffff",
    headerFg: "#1d104a",
    carouselBgA: "#e2e0e8",
    carouselBgB: "#ffffff",
    categoriesBg: "#e2e0e8",
    footerBg: "#1d104a",
    carouselHeadingA: "#1d104a",
    carouselBtnA: "#1d104a",
    carouselHeadingB: "#1d104a",
    carouselBtnB: "#1d104a",
    bg: "#f5f5f2",
    soft: "#eeeeea",
    muted: "#6e6e68",
    pageFg: "#1d104a",
    chromeBg: "#1d104a",
    headerLogo: "dark",
    footerLogo: "light",
  };

  /** Dark palette — invert light↔dark surfaces from the light palette. */
  const PALETTE_DARK = {
    brandDark: "#e72173",
    brandPink: "#a91854",
    brandBorder: "#c31c61",
    line: "#3d3560",
    dash: "#b0aec0",
    ink: "#1d104a",
    searchBg: "#ffffff",
    headerBg: "#1d104a",
    headerFg: "#ffffff",
    carouselBgA: "#1d104a",
    carouselBgB: "#15102e",
    categoriesBg: "#1d104a",
    footerBg: "#1d104a",
    carouselHeadingA: "#ffffff",
    carouselBtnA: "#e72173",
    carouselHeadingB: "#ffffff",
    carouselBtnB: "#e72173",
    bg: "#120c28",
    soft: "#1d1640",
    muted: "#a8a4b8",
    pageFg: "#f5f2ff",
    chromeBg: "#1d104a",
    headerLogo: "light",
    footerLogo: "light",
  };

  const PALETTES = {
    light: PALETTE_LIGHT,
    dark: PALETTE_DARK,
  };
  const PALETTE_IDS = ["dark", "light"];
  const PALETTE_META = {
    dark: { title: "פלטה כהה", subtitle: "סגול-ורוד-כהה" },
    light: { title: "פלטה בהירה", subtitle: "סגול-ורוד-בהיר" },
  };

  const DEFAULTS = {
    ...PALETTE_LIGHT,
    paletteId: "light",
    hideDemoMode: false,
    cardLayout: "popular",
    textAnimation: "staggered-letters",
    showDatesQty: "default",
    popularBokeh: false,
  };

  const CARD_LAYOUTS = ["popular", "all-flip", "all-simple", "popular-special", "popular-special-flip"];
  const SHOW_DATES_QTY = ["default", "medium", "calendar"];
  const LOGO_VARIANTS = ["dark", "light"];
  const LOGO_SRC = {
    dark: "assets/images/LOGO TICKETS.png",
    light: "assets/images/logowhite.png",
  };
  const LOGO_LABELS = {
    dark: "כהה (האדר)",
    light: "בהיר (פוטר)",
  };

  const TEXT_ANIMATIONS = [
    "staggered-letters",
    "fade-in",
    "scale-up",
    "rotate-in",
    "slide-from-left",
    "fade-up-words",
    "blur-in",
    "none",
  ];

  let open = false;
  let state = { ...DEFAULTS };
  let tabBtn = null;
  let panelEl = null;
  let sharedPaletteListEl = null;
  let backdropEl = null;
  let demoCheckbox = null;

  function readStored() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { ...DEFAULTS };
      const parsed = JSON.parse(raw);
      const next = { ...DEFAULTS, ...parsed };
      // migrate old key from previous stage wording
      if (parsed.hideFontStatus != null && parsed.hideDemoMode == null) {
        next.hideDemoMode = !!parsed.hideFontStatus;
      }
      delete next.hideFontStatus;
      if (!CARD_LAYOUTS.includes(next.cardLayout)) {
        next.cardLayout = DEFAULTS.cardLayout;
      }
      if (!TEXT_ANIMATIONS.includes(next.textAnimation)) {
        next.textAnimation = DEFAULTS.textAnimation;
      }
      if (!SHOW_DATES_QTY.includes(next.showDatesQty)) {
        next.showDatesQty = DEFAULTS.showDatesQty;
      }
      if (!LOGO_VARIANTS.includes(next.headerLogo)) {
        next.headerLogo = DEFAULTS.headerLogo;
      }
      if (!LOGO_VARIANTS.includes(next.footerLogo)) {
        next.footerLogo = DEFAULTS.footerLogo;
      }
      if (!PALETTE_IDS.includes(next.paletteId)) {
        // Legacy saves (before paletteId) keep the light look they already had.
        next.paletteId = parsed.paletteId == null ? "light" : DEFAULTS.paletteId;
      }
      next.popularBokeh = !!next.popularBokeh;
      if (parsed.carouselBg && !parsed.carouselBgA) {
        next.carouselBgA = parsed.carouselBg;
      }
      delete next.carouselBg;
      return next;
    } catch {
      return { ...DEFAULTS };
    }
  }

  function syncHeaderIconFilter(hex) {
    let flood = document.getElementById("themeHeaderIconFlood");
    if (!flood) {
      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("aria-hidden", "true");
      svg.setAttribute("focusable", "false");
      svg.style.cssText =
        "position:absolute;width:0;height:0;overflow:hidden;pointer-events:none";
      svg.innerHTML =
        '<filter id="themeHeaderIconFilter" color-interpolation-filters="sRGB">' +
        `<feFlood id="themeHeaderIconFlood" flood-color="${hex}" result="flood"/>` +
        '<feComposite in="flood" in2="SourceAlpha" operator="in"/>' +
        "</filter>";
      document.body.appendChild(svg);
      flood = document.getElementById("themeHeaderIconFlood");
    }
    if (flood) flood.setAttribute("flood-color", hex);
  }

  function writeStored() {
    try {
      const { hideFontStatus, ...payload } = state;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      /* ignore */
    }
  }

  let lastEmittedPaletteId = null;

  function applyTheme() {
    const root = document.documentElement;
    const palette = PALETTES[state.paletteId] || PALETTE_LIGHT;
    root.style.setProperty("--brand-dark", state.brandDark);
    root.style.setProperty("--brand-pink", state.brandPink);
    root.style.setProperty("--brand-border", state.brandBorder || palette.brandBorder);
    root.style.setProperty(
      "--brand-gradient",
      `linear-gradient(135deg, ${state.brandDark} 0%, ${state.brandPink} 100%)`
    );
    root.style.setProperty("--line", state.line);
    root.style.setProperty("--dash", state.dash);
    root.style.setProperty("--ink", state.ink);
    root.style.setProperty("--bg", state.bg || palette.bg);
    root.style.setProperty("--soft", state.soft || palette.soft);
    root.style.setProperty("--muted", state.muted || palette.muted);
    root.style.setProperty("--page-fg", state.pageFg || palette.pageFg || state.ink);
    root.style.setProperty("--chrome-bg", state.chromeBg || palette.chromeBg);
    root.style.setProperty("--search-bg", state.searchBg);
    root.style.setProperty("--header-bg", state.headerBg || palette.headerBg);
    root.style.setProperty("--header-fg", state.headerFg || palette.headerFg);
    syncHeaderIconFilter(state.headerFg || palette.headerFg);
    root.style.setProperty("--carousel-bg-a", state.carouselBgA || palette.carouselBgA);
    root.style.setProperty("--carousel-bg-b", state.carouselBgB || palette.carouselBgB);
    root.style.setProperty(
      "--categories-bg",
      state.categoriesBg || palette.categoriesBg || "#1d104a"
    );
    root.style.setProperty(
      "--footer-bg",
      state.footerBg || palette.footerBg || palette.chromeBg || "#1d104a"
    );
    root.style.setProperty(
      "--carousel-heading-a",
      state.carouselHeadingA || palette.carouselHeadingA
    );
    root.style.setProperty("--carousel-btn-a", state.carouselBtnA || palette.carouselBtnA);
    root.style.setProperty(
      "--carousel-heading-b",
      state.carouselHeadingB || palette.carouselHeadingB
    );
    root.style.setProperty("--carousel-btn-b", state.carouselBtnB || palette.carouselBtnB);
    document.body.classList.toggle("hide-demo-mode", !!state.hideDemoMode);
    document.body.classList.remove("hide-font-status");
    document.body.classList.toggle("theme-palette-dark", state.paletteId === "dark");
    document.body.classList.toggle("theme-palette-light", state.paletteId === "light");
    const layout = CARD_LAYOUTS.includes(state.cardLayout)
      ? state.cardLayout
      : DEFAULTS.cardLayout;
    state.cardLayout = layout;
    document.body.dataset.cardLayout = layout;
    document.body.classList.toggle("cards-all-flip", layout === "all-flip");
    document.body.classList.toggle("cards-all-simple", layout === "all-simple");
    document.body.classList.toggle(
      "cards-popular-special",
      layout === "popular-special" || layout === "popular-special-flip"
    );
    const textAnim = TEXT_ANIMATIONS.includes(state.textAnimation)
      ? state.textAnimation
      : DEFAULTS.textAnimation;
    state.textAnimation = textAnim;
    document.body.dataset.textAnimation = textAnim;
    const showDatesQty = SHOW_DATES_QTY.includes(state.showDatesQty)
      ? state.showDatesQty
      : DEFAULTS.showDatesQty;
    state.showDatesQty = showDatesQty;
    document.body.dataset.showDatesQty = showDatesQty;
    document.body.classList.toggle("popular-bokeh-on", !!state.popularBokeh);
    applyLogos();
    if (state.hideDemoMode) {
      document.body.classList.remove("demo-mode-on");
      const demoToggle = document.querySelector(".demo-mode-toggle");
      if (demoToggle) demoToggle.setAttribute("aria-checked", "false");
      try {
        localStorage.setItem("ticketsDemoMode", "0");
      } catch {
        /* ignore */
      }
    }
    if (lastEmittedPaletteId !== state.paletteId) {
      lastEmittedPaletteId = state.paletteId;
      document.dispatchEvent(
        new CustomEvent("tickets:palette", { detail: { paletteId: state.paletteId } })
      );
    }
  }

  function setCardLayout(layout, { persist = true, emit = true } = {}) {
    if (!CARD_LAYOUTS.includes(layout)) return;
    state.cardLayout = layout;
    applyTheme();
    syncCardLayoutControls();
    if (persist) writeStored();
    if (emit) {
      document.dispatchEvent(
        new CustomEvent("tickets:cardLayout", { detail: { cardLayout: layout } })
      );
    }
  }

  function syncCardLayoutControls() {
    if (!panelEl) return;
    panelEl.querySelectorAll('input[name="themeCardLayout"]').forEach((input) => {
      input.checked = input.value === state.cardLayout;
    });
  }

  function setTextAnimation(value, { persist = true, emit = true } = {}) {
    if (!TEXT_ANIMATIONS.includes(value)) return;
    state.textAnimation = value;
    applyTheme();
    syncTextAnimationControls();
    if (persist) writeStored();
    if (emit) {
      document.dispatchEvent(
        new CustomEvent("tickets:textAnimation", {
          detail: { textAnimation: value },
        })
      );
    }
  }

  function syncTextAnimationControls() {
    if (!panelEl) return;
    const select = panelEl.querySelector("#themeTextAnimation");
    if (select) select.value = state.textAnimation;
  }

  function setShowDatesQty(value, { persist = true, emit = true } = {}) {
    if (!SHOW_DATES_QTY.includes(value)) return;
    state.showDatesQty = value;
    applyTheme();
    syncShowDatesQtyControls();
    if (persist) writeStored();
    if (emit) {
      document.dispatchEvent(
        new CustomEvent("tickets:showDatesQty", {
          detail: { showDatesQty: value },
        })
      );
    }
  }

  function syncShowDatesQtyControls() {
    if (!panelEl) return;
    panelEl.querySelectorAll('input[name="themeShowDatesQty"]').forEach((input) => {
      input.checked = input.value === state.showDatesQty;
    });
  }

  function logoSrc(variant) {
    return LOGO_SRC[LOGO_VARIANTS.includes(variant) ? variant : "dark"];
  }

  function applyLogos() {
    const header = LOGO_VARIANTS.includes(state.headerLogo)
      ? state.headerLogo
      : DEFAULTS.headerLogo;
    const footer = LOGO_VARIANTS.includes(state.footerLogo)
      ? state.footerLogo
      : DEFAULTS.footerLogo;
    state.headerLogo = header;
    state.footerLogo = footer;
    const headerImg = document.getElementById("headerLogo");
    const footerImg = document.getElementById("footerLogo");
    if (headerImg) headerImg.src = logoSrc(header);
    if (footerImg) footerImg.src = logoSrc(footer);
  }

  function setLogo(slot, value, { persist = true } = {}) {
    if (!LOGO_VARIANTS.includes(value)) return;
    if (slot !== "header" && slot !== "footer") return;
    if (slot === "header") state.headerLogo = value;
    else state.footerLogo = value;
    applyTheme();
    syncLogoControls();
    if (persist) writeStored();
  }

  function syncLogoControls() {
    if (!panelEl) return;
    const headerSelect = panelEl.querySelector("#themeHeaderLogo");
    const footerSelect = panelEl.querySelector("#themeFooterLogo");
    if (headerSelect) headerSelect.value = state.headerLogo;
    if (footerSelect) footerSelect.value = state.footerLogo;
  }

  function makeLogoSelect(id, labelText, slot) {
    const wrap = document.createElement("div");
    wrap.className = "theme-options-logo-row";

    const label = document.createElement("label");
    label.className = "theme-options-select-label";
    label.htmlFor = id;
    label.textContent = labelText;

    const select = document.createElement("select");
    select.id = id;
    select.className = "theme-options-select";
    select.setAttribute("aria-label", labelText);
    LOGO_VARIANTS.forEach((key) => {
      const opt = document.createElement("option");
      opt.value = key;
      opt.textContent = LOGO_LABELS[key];
      if (key === state[slot === "header" ? "headerLogo" : "footerLogo"]) {
        opt.selected = true;
      }
      select.appendChild(opt);
    });
    select.addEventListener("change", () => setLogo(slot, select.value));

    wrap.appendChild(label);
    wrap.appendChild(select);
    return wrap;
  }

  function textAnimationLabel(key) {
    const map = window.TICKETS_TEXT_ANIMATION_PRESETS || {};
    if (map[key]?.label) return map[key].label;
    const fallback = {
      "staggered-letters": "Staggered Letters",
      "fade-in": "Fade-In Effect",
      "scale-up": "Scale-Up Effect",
      "rotate-in": "Rotate-In Effect",
      "slide-from-left": "Slide From Left",
      "fade-up-words": "Fade Up Words",
      "blur-in": "Blur In",
      none: "ללא אנימציה",
    };
    return fallback[key] || key;
  }

  function setOpen(next) {
    open = !!next;
    if (panelEl) panelEl.classList.toggle("is-open", open);
    if (backdropEl) backdropEl.classList.toggle("is-open", open);
    if (tabBtn) tabBtn.setAttribute("aria-expanded", open ? "true" : "false");
    document.body.classList.toggle("theme-options-open", open);
    if (panelEl) panelEl.setAttribute("aria-hidden", open ? "false" : "true");
  }


  function colorLabel(key) {
    return COLOR_LABELS[key] || key;
  }

  function groupColorsByHex() {
    const map = new Map();
    COLOR_KEYS.forEach((key) => {
      const hex = normalizeHex(state[key]) || normalizeHex(colorDefault(key));
      if (!hex) return;
      if (!map.has(hex)) map.set(hex, []);
      map.get(hex).push(key);
    });
    return [...map.entries()]
      .map(([hex, keys]) => ({ hex, keys }))
      .sort((a, b) => b.keys.length - a.keys.length || a.hex.localeCompare(b.hex));
  }

  function setSharedColor(fromHex, toValue, sourceEl) {
    const from = normalizeHex(fromHex);
    const to = normalizeHex(toValue);
    if (!from || !to) return false;
    const keys = COLOR_KEYS.filter((key) => normalizeHex(state[key]) === from);
    if (!keys.length) return false;
    keys.forEach((key) => {
      state[key] = to;
    });
    syncColorControls({ rebuildShared: false });
    if (sourceEl) {
      if (sourceEl.type === "color") {
        const swatch = sourceEl.closest(".theme-options-swatch");
        if (swatch) swatch.style.background = to;
        const hexInput = sourceEl
          .closest(".theme-options-shared-row")
          ?.querySelector(".theme-options-hex");
        if (hexInput) hexInput.value = to.toUpperCase();
      } else if (sourceEl.classList.contains("theme-options-hex")) {
        sourceEl.value = to.toUpperCase();
        const picker = sourceEl
          .closest(".theme-options-shared-row")
          ?.querySelector('input[type="color"]');
        if (picker) picker.value = to;
        const swatch = sourceEl
          .closest(".theme-options-shared-row")
          ?.querySelector(".theme-options-swatch");
        if (swatch) swatch.style.background = to;
      }
      const row = sourceEl.closest(".theme-options-shared-row");
      if (row) row.dataset.sharedHex = to;
    }
    applyTheme();
    writeStored();
    return true;
  }

  function rebuildSharedPalette() {
    if (!sharedPaletteListEl) return;
    sharedPaletteListEl.innerHTML = "";
    const groups = groupColorsByHex().filter((g) => g.keys.length >= 2);
    if (!groups.length) {
      const empty = document.createElement("p");
      empty.className = "theme-options-hint";
      empty.textContent =
        "אין כרגע צבע משותף בין כמה שדות — כשאותו HEX מופיע ביותר מאזור אחד, תופיע כאן קובייה אחת לעריכה.";
      sharedPaletteListEl.appendChild(empty);
      return;
    }
    groups.forEach(({ hex, keys }) => {
      const row = document.createElement("div");
      row.className = "theme-options-color-row theme-options-shared-row";
      row.dataset.sharedHex = hex;

      const textWrap = document.createElement("div");
      textWrap.className = "theme-options-shared-meta";
      const title = document.createElement("span");
      title.className = "theme-options-shared-title";
      title.textContent = `${hex.toUpperCase()} · ${keys.length} אזורים`;
      const detail = document.createElement("small");
      detail.className = "theme-options-shared-detail";
      detail.textContent = keys.map(colorLabel).join(" · ");
      textWrap.appendChild(title);
      textWrap.appendChild(detail);

      const control = document.createElement("div");
      control.className = "theme-options-color-control";

      const swatch = document.createElement("span");
      swatch.className = "theme-options-swatch";
      swatch.style.background = hex;

      const picker = document.createElement("input");
      picker.type = "color";
      picker.value = hex;
      picker.setAttribute(
        "aria-label",
        `מכנה משותף ${hex.toUpperCase()} — ${keys.length} אזורים`
      );
      picker.addEventListener("input", () => {
        const from = row.dataset.sharedHex || hex;
        setSharedColor(from, picker.value, picker);
      });
      picker.addEventListener("change", () => rebuildSharedPalette());

      const hexInput = document.createElement("input");
      hexInput.type = "text";
      hexInput.className = "theme-options-hex";
      hexInput.value = hex.toUpperCase();
      hexInput.spellcheck = false;
      hexInput.autocomplete = "off";
      hexInput.maxLength = 7;
      hexInput.setAttribute("inputmode", "text");
      hexInput.setAttribute("aria-label", `HEX מכנה משותף ${hex.toUpperCase()}`);
      hexInput.title = "HEX";
      hexInput.addEventListener("input", () => {
        const raw = hexInput.value.trim();
        if (!normalizeHex(raw)) return;
        const from = row.dataset.sharedHex || hex;
        setSharedColor(from, raw, hexInput);
      });
      hexInput.addEventListener("change", () => rebuildSharedPalette());
      hexInput.addEventListener("blur", () => {
        const n = normalizeHex(hexInput.value);
        if (n) hexInput.value = n.toUpperCase();
        rebuildSharedPalette();
      });

      swatch.appendChild(picker);
      control.appendChild(swatch);
      control.appendChild(hexInput);

      row.appendChild(textWrap);
      row.appendChild(control);
      sharedPaletteListEl.appendChild(row);
    });
  }

  function syncColorControls({ rebuildShared = true } = {}) {
    if (!panelEl) return;
    panelEl.querySelectorAll("[data-theme-key]").forEach((input) => {
      const key = input.getAttribute("data-theme-key");
      if (!key || state[key] == null) return;
      const hex = normalizeHex(state[key]) || colorDefault(key);
      if (input.type === "color") {
        input.value = hex;
        const swatch = input.closest(".theme-options-swatch");
        if (swatch) swatch.style.background = hex;
      } else {
        input.value = hex.toUpperCase();
      }
    });
    if (rebuildShared) rebuildSharedPalette();
  }

  function normalizeHex(value) {
    if (!value) return null;
    let hex = String(value).trim();
    if (!hex.startsWith("#")) hex = `#${hex}`;
    if (/^#[0-9a-fA-F]{3}$/.test(hex)) {
      hex = `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`;
    }
    if (!/^#[0-9a-fA-F]{6}$/.test(hex)) return null;
    return hex.toLowerCase();
  }

  function setColor(key, value, sourceEl) {
    const hex = normalizeHex(value);
    if (!hex) return false;
    state[key] = hex;
    if (panelEl) {
      panelEl.querySelectorAll(`[data-theme-key="${key}"]`).forEach((el) => {
        if (el === sourceEl) return;
        if (el.type === "color") {
          el.value = hex;
          const swatch = el.closest(".theme-options-swatch");
          if (swatch) swatch.style.background = hex;
        } else {
          el.value = hex.toUpperCase();
        }
      });
      if (sourceEl && sourceEl.type === "color") {
        const swatch = sourceEl.closest(".theme-options-swatch");
        if (swatch) swatch.style.background = hex;
      }
    }
    applyTheme();
    writeStored();
    rebuildSharedPalette();
    return true;
  }

  function makeColorControl(key, ariaLabel) {
    const wrap = document.createElement("div");
    wrap.className = "theme-options-color-control";

    const swatch = document.createElement("span");
    swatch.className = "theme-options-swatch";
    swatch.style.background = state[key];

    const picker = document.createElement("input");
    picker.type = "color";
    picker.value = normalizeHex(state[key]) || colorDefault(key);
    picker.dataset.themeKey = key;
    picker.setAttribute("aria-label", ariaLabel);
    picker.addEventListener("input", () => setColor(key, picker.value, picker));

    const hex = document.createElement("input");
    hex.type = "text";
    hex.className = "theme-options-hex";
    hex.value = (normalizeHex(state[key]) || colorDefault(key)).toUpperCase();
    hex.dataset.themeKey = key;
    hex.spellcheck = false;
    hex.autocomplete = "off";
    hex.maxLength = 7;
    hex.setAttribute("inputmode", "text");
    hex.setAttribute("aria-label", `${ariaLabel} HEX`);
    hex.title = "HEX";
    hex.addEventListener("input", () => {
      const raw = hex.value.trim();
      if (normalizeHex(raw)) {
        setColor(key, raw, hex);
        hex.value = normalizeHex(raw).toUpperCase();
      }
    });
    hex.addEventListener("blur", () => {
      const fixed = normalizeHex(hex.value) || normalizeHex(state[key]) || colorDefault(key);
      hex.value = fixed.toUpperCase();
      setColor(key, fixed, hex);
    });
    hex.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        hex.blur();
      }
    });

    // keep hex field uppercase display in sync when picker changes
    picker.addEventListener("input", () => {
      hex.value = (normalizeHex(picker.value) || picker.value).toUpperCase();
    });

    swatch.appendChild(picker);
    wrap.appendChild(swatch);
    wrap.appendChild(hex);
    return wrap;
  }

  function activePaletteColors() {
    return PALETTES[state.paletteId] || PALETTE_LIGHT;
  }

  function colorDefault(key) {
    const palette = activePaletteColors();
    return palette[key] != null ? palette[key] : DEFAULTS[key];
  }

  function applyPaletteColors(palette) {
    COLOR_KEYS.forEach((key) => {
      if (palette[key] != null) state[key] = palette[key];
    });
    ["bg", "soft", "muted", "pageFg", "chromeBg", "headerLogo", "footerLogo"].forEach((key) => {
      if (palette[key] != null) state[key] = palette[key];
    });
  }

  function setPalette(id, { persist = true } = {}) {
    if (!PALETTE_IDS.includes(id)) return;
    state.paletteId = id;
    applyPaletteColors(PALETTES[id]);
    applyTheme();
    syncColorControls();
    syncLogoControls();
    syncPaletteControls();
    if (persist) writeStored();
  }

  function syncPaletteControls() {
    if (!panelEl) return;
    panelEl.querySelectorAll('input[name="themePaletteId"]').forEach((input) => {
      input.checked = input.value === state.paletteId;
    });
    const subtitle = panelEl.querySelector("#themePaletteToggle .theme-options-block-subtitle");
    if (subtitle) {
      subtitle.textContent =
        (PALETTE_META[state.paletteId] || PALETTE_META.light).subtitle;
    }
  }

  function resetColors() {
    applyPaletteColors(activePaletteColors());
    syncColorControls();
    syncLogoControls();
    applyTheme();
    writeStored();
  }

  function colorRow(label, key, { nested = false } = {}) {
    const row = document.createElement("div");
    row.className =
      "theme-options-color-row" + (nested ? " is-nested-color" : "");

    const text = document.createElement("span");
    text.textContent = label;

    row.appendChild(text);
    row.appendChild(makeColorControl(key, label));
    return row;
  }

  function carouselSurfaceGroup(letter, bgKey, headingKey, btnKey) {
    const group = document.createElement("div");
    group.className = "theme-options-carousel-group";
    group.appendChild(colorRow(`רקע קרוסלות ${letter}`, bgKey));
    group.appendChild(
      colorRow("צבע כותרת וכוכב", headingKey, { nested: true })
    );
    group.appendChild(
      colorRow("רקע כפתור למופעים בקטגוריה", btnKey, { nested: true })
    );
    return group;
  }

  function headerSurfaceGroup() {
    const group = document.createElement("div");
    group.className = "theme-options-carousel-group";
    group.appendChild(colorRow("רקע האדר", "headerBg"));
    group.appendChild(
      colorRow("צבע אלמנטים בהאדר", "headerFg", { nested: true })
    );
    return group;
  }

  function gradientRow() {
    const wrap = document.createElement("div");
    wrap.className = "theme-options-color-row";

    const text = document.createElement("span");
    text.textContent = "גרדיאנט כפתורים";

    const pair = document.createElement("div");
    pair.className = "theme-options-gradient-pair";
    pair.appendChild(makeColorControl("brandDark", "צבע התחלת גרדיאנט"));
    pair.appendChild(makeColorControl("brandPink", "צבע סיום גרדיאנט"));

    wrap.appendChild(text);
    wrap.appendChild(pair);
    return wrap;
  }

  function makeToggleSection(title, { open = false, id, subtitle, nested = false, palettePreview = false } = {}) {
    const section = document.createElement("section");
    section.className =
      "theme-options-block" +
      (nested ? " is-nested" : "") +
      (open ? " is-open" : "");

    const toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = "theme-options-block-toggle";
    if (id) {
      toggle.id = id + "Toggle";
      toggle.setAttribute("aria-controls", id + "Panel");
    }
    toggle.setAttribute("aria-expanded", open ? "true" : "false");

    let titleInner = subtitle
      ? `<span class="theme-options-block-title-wrap"><span class="theme-options-block-title">${title}</span><span class="theme-options-block-subtitle">${subtitle}</span></span>`
      : `<span class="theme-options-block-title">${title}</span>`;

    if (palettePreview) {
      titleInner =
        `<span class="theme-options-block-label">` +
        `<span class="theme-options-palette-swatches" aria-hidden="true">` +
        `<span class="theme-options-palette-swatch is-purple"></span>` +
        `<span class="theme-options-palette-swatch is-pink"></span>` +
        `<span class="theme-options-palette-swatch is-gray"></span>` +
        `</span>` +
        titleInner +
        `</span>`;
    }

    toggle.innerHTML =
      titleInner + `<span class="theme-options-block-icon" aria-hidden="true"></span>`;

    const panel = document.createElement("div");
    panel.className = "theme-options-block-panel";
    if (id) panel.id = id + "Panel";
    panel.hidden = !open;

    toggle.addEventListener("click", () => {
      const next = !section.classList.contains("is-open");
      section.classList.toggle("is-open", next);
      toggle.setAttribute("aria-expanded", next ? "true" : "false");
      panel.hidden = !next;
    });

    section.appendChild(toggle);
    section.appendChild(panel);
    return { section, panel, toggle };
  }

  function buildUI() {
    tabBtn = document.createElement("button");
    tabBtn.type = "button";
    tabBtn.className = "theme-options-tab";
    tabBtn.setAttribute("aria-expanded", "false");
    tabBtn.setAttribute("aria-controls", "themeOptionsPanel");
    tabBtn.setAttribute("aria-label", "הגדרות אתר");
    tabBtn.innerHTML =
      '<svg class="theme-options-tab-icon" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M19.14 12.94c.04-.31.06-.63.06-.94s-.02-.63-.06-.94l2.03-1.58a.5.5 0 0 0 .12-.64l-1.92-3.32a.5.5 0 0 0-.6-.22l-2.39.96a7.1 7.1 0 0 0-1.63-.94l-.36-2.54a.5.5 0 0 0-.5-.42h-3.84a.5.5 0 0 0-.5.42l-.36 2.54c-.58.23-1.12.54-1.63.94l-2.39-.96a.5.5 0 0 0-.6.22L2.77 8.84a.5.5 0 0 0 .12.64l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94L2.89 14.52a.5.5 0 0 0-.12.64l1.92 3.32c.14.24.43.34.68.24l2.39-.96c.5.4 1.05.72 1.63.94l.36 2.54c.05.24.26.42.5.42h3.84c.24 0 .45-.18.5-.42l.36-2.54c.58-.23 1.12-.54 1.63-.94l2.39.96c.25.1.54 0 .68-.24l1.92-3.32a.5.5 0 0 0-.12-.64l-2.03-1.58ZM12 15.5A3.5 3.5 0 1 1 12 8.5a3.5 3.5 0 0 1 0 7Z"/></svg>';
    tabBtn.addEventListener("click", () => setOpen(!open));

    backdropEl = document.createElement("div");
    backdropEl.className = "theme-options-backdrop";
    backdropEl.addEventListener("click", () => setOpen(false));

    panelEl = document.createElement("aside");
    panelEl.id = "themeOptionsPanel";
    panelEl.className = "theme-options-panel";
    panelEl.setAttribute("role", "dialog");
    panelEl.setAttribute("aria-modal", "true");
    panelEl.setAttribute("aria-label", "הגדרות אתר");
    panelEl.setAttribute("aria-hidden", "true");

    const header = document.createElement("div");
    header.className = "theme-options-header";
    header.innerHTML = "<h2>הגדרות אתר</h2>";

    const closeBtn = document.createElement("button");
    closeBtn.type = "button";
    closeBtn.className = "theme-options-close";
    closeBtn.setAttribute("aria-label", "סגור הגדרות אתר");
    closeBtn.textContent = "×";
    closeBtn.addEventListener("click", () => setOpen(false));
    header.appendChild(closeBtn);

    const body = document.createElement("div");
    body.className = "theme-options-body";

    const colorsToggle = makeToggleSection("צבעוניות", {
      open: false,
      id: "themeColors",
    });

    const palettePickHint = document.createElement("p");
    palettePickHint.className = "theme-options-hint";
    palettePickHint.textContent = "בחירת פלטה";
    colorsToggle.panel.appendChild(palettePickHint);

    const palettePickList = document.createElement("div");
    palettePickList.className = "theme-options-radio-list theme-options-palette-pick";
    palettePickList.setAttribute("role", "group");
    palettePickList.setAttribute("aria-label", "בחירת פלטה");

    PALETTE_IDS.forEach((id) => {
      const meta = PALETTE_META[id];
      const label = document.createElement("label");
      label.className = "theme-options-check";
      label.innerHTML =
        `<input type="checkbox" name="themePaletteId" value="${id}">` +
        `<span><strong>${meta.title}</strong><small>${meta.subtitle}</small></span>`;
      const input = label.querySelector("input");
      input.checked = state.paletteId === id;
      input.addEventListener("change", () => {
        if (input.checked) setPalette(id);
        else if (state.paletteId === id) input.checked = true;
      });
      palettePickList.appendChild(label);
    });
    colorsToggle.panel.appendChild(palettePickList);

    const paletteToggle = makeToggleSection("פלטה", {
      open: false,
      id: "themePalette",
      subtitle: (PALETTE_META[state.paletteId] || PALETTE_META.light).subtitle,
      nested: true,
      palettePreview: true,
    });
    const colorsTools = document.createElement("div");
    colorsTools.className = "theme-options-block-tools";
    const resetBtn = document.createElement("button");
    resetBtn.type = "button";
    resetBtn.className = "theme-options-reset";
    resetBtn.textContent = "איפוס לברירת מחדל";
    resetBtn.setAttribute("aria-label", "החזרת כל הצבעים לברירת המקור");
    resetBtn.addEventListener("click", resetColors);
    colorsTools.appendChild(resetBtn);

    const sharedHint = document.createElement("p");
    sharedHint.className = "theme-options-hint";
    sharedHint.textContent =
      "מכנה משותף — כל HEX שמופיע ביותר משדה אחד מרוכז כאן. שינוי הקובייה מעדכן את כל האזורים עם אותו צבע.";
    sharedPaletteListEl = document.createElement("div");
    sharedPaletteListEl.className =
      "theme-options-color-list theme-options-shared-palette";
    sharedPaletteListEl.setAttribute("aria-label", "פלטת גרסא · מכנה משותף");

    const list = document.createElement("div");
    list.className = "theme-options-color-list";
    list.appendChild(gradientRow());
    list.appendChild(colorRow("בורדר כפתורים", "brandBorder"));
    list.appendChild(colorRow("קווים מקווקוים", "dash"));
    list.appendChild(colorRow("קווי סקשנים", "line"));
    list.appendChild(colorRow("צבע גופן", "ink"));
    list.appendChild(colorRow("רקע מנוע חיפוש", "searchBg"));
    list.appendChild(colorRow("רקע מה תרצו לראות היום", "categoriesBg"));
    list.appendChild(colorRow("רקע פוטר", "footerBg"));
    list.appendChild(headerSurfaceGroup());
    list.appendChild(
      carouselSurfaceGroup("A", "carouselBgA", "carouselHeadingA", "carouselBtnA")
    );
    list.appendChild(
      carouselSurfaceGroup("B", "carouselBgB", "carouselHeadingB", "carouselBtnB")
    );
    paletteToggle.panel.appendChild(colorsTools);
    paletteToggle.panel.appendChild(sharedHint);
    paletteToggle.panel.appendChild(sharedPaletteListEl);
    rebuildSharedPalette();
    paletteToggle.panel.appendChild(list);
    colorsToggle.panel.appendChild(paletteToggle.section);

    const demoBlock = document.createElement("section");
    demoBlock.className = "theme-options-block";
    const check = document.createElement("label");
    check.className = "theme-options-check";
    check.innerHTML =
      '<input type="checkbox">' +
      "<span>הסתר מצב הדגמה<small>כשמסומן — כפתור מצב ההדגמה (סמן מוגדל והדגשת אזורים) מוסתר מהאתר</small></span>";
    demoCheckbox = check.querySelector("input");
    demoCheckbox.checked = !!state.hideDemoMode;
    demoCheckbox.addEventListener("change", () => {
      state.hideDemoMode = demoCheckbox.checked;
      applyTheme();
      writeStored();
    });
    demoBlock.appendChild(check);

    body.appendChild(colorsToggle.section);

    const cardsToggle = makeToggleSection("מבנה כרטיסיות", {
      open: false,
      id: "themeCards",
    });
    const cardsList = document.createElement("div");
    cardsList.className = "theme-options-radio-list";
    cardsList.setAttribute("role", "radiogroup");
    cardsList.setAttribute("aria-label", "מבנה כרטיסיות");

    const layoutOptions = [
      {
        value: "all-flip",
        title: "אפקט פליפ",
        desc: "כל האייטמים בכרטיסיות יהיו כמו הפליפ במופעים פופולריים",
      },
      {
        value: "all-simple",
        title: "ללא אפקט",
        desc: "כל הכרטיסיות ללא פליפ, כולל מופעים פופולריים",
      },
      {
        value: "popular-special",
        title: "מופעים פופולריים מיוחד",
        desc: "קרוסלת Cover Flow למופעים פופולריים — בפרופורציה ובתנועה כמו בצילום המסך (רק במחשב)",
      },
      {
        value: "popular-special-flip",
        title: "מופעים פופולריים מיוחד עם פליפ",
        desc: "Cover Flow למופעים פופולריים, ופליפ לשאר הכרטיסיות בעמוד",
      },
    ];

    layoutOptions.forEach((opt) => {
      const label = document.createElement("label");
      label.className = "theme-options-radio";
      label.innerHTML =
        `<input type="radio" name="themeCardLayout" value="${opt.value}">` +
        `<span><strong>${opt.title}</strong><small>${opt.desc}</small></span>`;
      const input = label.querySelector("input");
      input.checked = state.cardLayout === opt.value;
      input.addEventListener("change", () => {
        if (input.checked) setCardLayout(opt.value);
      });
      cardsList.appendChild(label);
    });

    const revert = document.createElement("button");
    revert.type = "button";
    revert.className = "theme-options-linkish";
    revert.textContent = "חזרה למקורי (פליפ רק בפופולריים)";
    revert.addEventListener("click", () => setCardLayout("popular"));
    cardsToggle.panel.appendChild(cardsList);
    cardsToggle.panel.appendChild(revert);
    body.appendChild(cardsToggle.section);

    const animToggle = makeToggleSection("אנימציות כותרות", {
      open: false,
      id: "themeTextAnim",
    });
    const animHint = document.createElement("p");
    animHint.className = "theme-options-hint";
    animHint.textContent =
      "GSAP לכותרות הסליידר וכותרות הקרוסלות. ברירת מחדל: Staggered Letters — מופעל רק כשמגיעים לכותרת.";
    animToggle.panel.appendChild(animHint);

    const animLabel = document.createElement("label");
    animLabel.className = "theme-options-select-label";
    animLabel.htmlFor = "themeTextAnimation";
    animLabel.textContent = "אפקט";

    const animSelect = document.createElement("select");
    animSelect.id = "themeTextAnimation";
    animSelect.className = "theme-options-select";
    animSelect.setAttribute("aria-label", "אנימציות כותרות");
    TEXT_ANIMATIONS.forEach((key) => {
      const opt = document.createElement("option");
      opt.value = key;
      opt.textContent = textAnimationLabel(key);
      if (key === state.textAnimation) opt.selected = true;
      animSelect.appendChild(opt);
    });
    animSelect.addEventListener("change", () => {
      setTextAnimation(animSelect.value);
    });

    animToggle.panel.appendChild(animLabel);
    animToggle.panel.appendChild(animSelect);
    body.appendChild(animToggle.section);

    const logosToggle = makeToggleSection("לוגואים", {
      open: false,
      id: "themeLogos",
    });
    const logosHint = document.createElement("p");
    logosHint.className = "theme-options-hint";
    logosHint.textContent =
      "בחירה בין הלוגו הכהה (ברירת מחדל בהאדר) ללוגו הבהיר (ברירת מחדל בפוטר).";
    logosToggle.panel.appendChild(logosHint);
    logosToggle.panel.appendChild(
      makeLogoSelect("themeHeaderLogo", "לוגו עליון (האדר)", "header")
    );
    logosToggle.panel.appendChild(
      makeLogoSelect("themeFooterLogo", "לוגו תחתון (פוטר)", "footer")
    );
    body.appendChild(logosToggle.section);

    const extrasToggle = makeToggleSection("אפשרויות נוספות", {
      open: false,
      id: "themeExtras",
    });
    const datesHint = document.createElement("p");
    datesHint.className = "theme-options-hint";
    datesHint.textContent = "עמוד מופע — כמות מועדים";
    extrasToggle.panel.appendChild(datesHint);

    const datesList = document.createElement("div");
    datesList.className = "theme-options-radio-list";
    datesList.setAttribute("role", "radiogroup");
    datesList.setAttribute("aria-label", "עמוד מופע כמות מועדים");

    const datesOptions = [
      {
        value: "default",
        title: "ברירת מחדל",
        desc: "הכמות הנוכחית בעמוד המופע (כולל מועדים זמינים, אזלו ופרה־סייל)",
      },
      {
        value: "medium",
        title: "כמות בינונית",
        desc: "פי 3 מהמועדים הזמינים — 6 מועדים זמינים לרכישה",
      },
      {
        value: "calendar",
        title: "בחירת כרטיסים מלוח שנה",
        desc: "הצגת לוח שנה עם תאריכי המופעים מסומנים — לחיצה על תאריך ממשיכה לשלב הבא",
      },
    ];

    datesOptions.forEach((opt) => {
      const label = document.createElement("label");
      label.className = "theme-options-radio";
      label.innerHTML =
        `<input type="radio" name="themeShowDatesQty" value="${opt.value}">` +
        `<span><strong>${opt.title}</strong><small>${opt.desc}</small></span>`;
      const input = label.querySelector("input");
      input.checked = state.showDatesQty === opt.value;
      input.addEventListener("change", () => {
        if (input.checked) setShowDatesQty(opt.value);
      });
      datesList.appendChild(label);
    });
    extrasToggle.panel.appendChild(datesList);

    const bokehHint = document.createElement("p");
    bokehHint.className = "theme-options-hint";
    bokehHint.textContent = "עמוד בית — סקשן פופולרי";
    extrasToggle.panel.appendChild(bokehHint);

    const bokehCheck = document.createElement("label");
    bokehCheck.className = "theme-options-check";
    bokehCheck.innerHTML =
      '<input type="checkbox">' +
      "<span>רקע מיוחד למופעים פופולריים<small>כשמסומן — רקע bokeh מונפש בסקשן מופעים פופולריים</small></span>";
    const bokehInput = bokehCheck.querySelector("input");
    bokehInput.checked = !!state.popularBokeh;
    bokehInput.addEventListener("change", () => {
      state.popularBokeh = bokehInput.checked;
      applyTheme();
      writeStored();
      document.dispatchEvent(
        new CustomEvent("tickets:popularBokeh", {
          detail: { popularBokeh: state.popularBokeh },
        })
      );
    });
    extrasToggle.panel.appendChild(bokehCheck);
    body.appendChild(extrasToggle.section);

    body.appendChild(demoBlock);
    panelEl.appendChild(header);
    panelEl.appendChild(body);

    document.body.appendChild(tabBtn);
    document.body.appendChild(backdropEl);
    document.body.appendChild(panelEl);

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && open) setOpen(false);
    });
  }

  function boot() {
    state = readStored();
    buildUI();
    applyTheme();
    syncCardLayoutControls();
    syncTextAnimationControls();
    syncShowDatesQtyControls();
    syncLogoControls();
    syncPaletteControls();
    const mobileMq = window.matchMedia("(max-width:960px)");
    function syncMobileThemeChrome() {
      if (mobileMq.matches && open) setOpen(false);
    }
    if (typeof mobileMq.addEventListener === "function") {
      mobileMq.addEventListener("change", syncMobileThemeChrome);
    } else if (typeof mobileMq.addListener === "function") {
      mobileMq.addListener(syncMobileThemeChrome);
    }
    syncMobileThemeChrome();
    // ensure home cards match stored layout after first paint
    document.dispatchEvent(
      new CustomEvent("tickets:cardLayout", {
        detail: { cardLayout: state.cardLayout },
      })
    );
    document.dispatchEvent(
      new CustomEvent("tickets:textAnimation", {
        detail: { textAnimation: state.textAnimation },
      })
    );
    document.dispatchEvent(
      new CustomEvent("tickets:showDatesQty", {
        detail: { showDatesQty: state.showDatesQty },
      })
    );
    document.dispatchEvent(
      new CustomEvent("tickets:popularBokeh", {
        detail: { popularBokeh: !!state.popularBokeh },
      })
    );
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
