/**
 * Theme Options — builder-style side panel (colors, layout, site gate, etc.).
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
    "bg",
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
    bg: "רקע אתר (body)",
  };

  /** Site palette — dark only. */
  const PALETTE_DARK = {
    brandDark: "#f00358",
    brandPink: "#f00358",
    brandBorder: "#f00358",
    line: "#3d3560",
    dash: "#b0aec0",
    ink: "#03051A",
    searchBg: "#03051A",
    headerBg: "#03051A",
    headerFg: "#ffffff",
    carouselBgA: "#03051A",
    carouselBgB: "#03051A",
    categoriesBg: "#03051A",
    footerBg: "#03051A",
    carouselHeadingA: "#ffffff",
    carouselBtnA: "#f00358",
    carouselHeadingB: "#ffffff",
    carouselBtnB: "#f00358",
    bg: "#03051A",
    soft: "#1d1640",
    muted: "#a8a4b8",
    pageFg: "#f5f2ff",
    chromeBg: "#03051A",
    logoId: "cutout",
  };

  const PALETTE_SUBTITLE = "סגול-ורוד-כהה";

  const DEFAULTS = {
    ...PALETTE_DARK,
    paletteId: "dark",
    logoId: "cutout",
    cardLayout: "popular-special",
    textAnimation: "staggered-letters",
    showDatesQty: "medium",
    popularBokeh: false,
    disableSiteLogin: true,
  };

  const CARD_LAYOUTS = ["popular", "all-flip", "all-simple", "popular-special", "popular-special-flip"];
  const SHOW_DATES_QTY = ["default", "medium", "calendar"];
  const LOGO_VARIANTS = ["light", "pink", "gradient", "cutout", "tickets"];
  const LOGO_SRC = {
    light: "assets/images/logowhite.png",
    pink: "assets/images/logo-pink.png",
    gradient: "assets/images/logo-gradient.png",
    cutout: "assets/images/logo-cutout.png",
    tickets: "assets/images/logo-tickets.png",
  };
  const LOGO_META = {
    light: { title: "בהיר על כהה", subtitle: "טקסט לבן" },
    pink: { title: "ורוד עם טקסט בהיר", subtitle: "כרטיס ורוד" },
    gradient: { title: "גרדיאנט", subtitle: "כרטיס ורוד-סגול" },
    cutout: { title: "ורוד עם חיתוך", subtitle: "ברירת מחדל · מיקרופון שקוף" },
    tickets: { title: "לוגו כרטיסים", subtitle: "כרטיס ורוד עם טקסט בהיר" },
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

  function readStored() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { ...DEFAULTS };
      const parsed = JSON.parse(raw);
      const next = { ...DEFAULTS, ...parsed };
      if (!CARD_LAYOUTS.includes(next.cardLayout)) {
        next.cardLayout = DEFAULTS.cardLayout;
      }
      if (!TEXT_ANIMATIONS.includes(next.textAnimation)) {
        next.textAnimation = DEFAULTS.textAnimation;
      }
      if (!SHOW_DATES_QTY.includes(next.showDatesQty)) {
        next.showDatesQty = DEFAULTS.showDatesQty;
      }
      if (!LOGO_VARIANTS.includes(next.logoId)) {
        const legacy =
          (LOGO_VARIANTS.includes(parsed.headerLogo) && parsed.headerLogo) ||
          (LOGO_VARIANTS.includes(parsed.footerLogo) && parsed.footerLogo) ||
          DEFAULTS.logoId;
        next.logoId = legacy;
      }
      delete next.headerLogo;
      delete next.footerLogo;
      if (parsed.paletteId !== "dark") {
        Object.assign(next, PALETTE_DARK);
      }
      next.paletteId = "dark";
      /* Solid brand fill #f00358 — replace legacy gradient pinks */
      const legacyBrand = new Set(["#e72173", "#a91854", "#c31c61", "#c8145d"]);
      if (legacyBrand.has(String(next.brandDark || "").toLowerCase())) {
        next.brandDark = PALETTE_DARK.brandDark;
      }
      if (legacyBrand.has(String(next.brandPink || "").toLowerCase())) {
        next.brandPink = PALETTE_DARK.brandPink;
      }
      if (legacyBrand.has(String(next.brandBorder || "").toLowerCase())) {
        next.brandBorder = PALETTE_DARK.brandBorder;
      }
      if (legacyBrand.has(String(next.carouselBtnA || "").toLowerCase())) {
        next.carouselBtnA = PALETTE_DARK.carouselBtnA;
      }
      if (legacyBrand.has(String(next.carouselBtnB || "").toLowerCase())) {
        next.carouselBtnB = PALETTE_DARK.carouselBtnB;
      }
      next.popularBokeh = !!next.popularBokeh;
      next.disableSiteLogin = !!next.disableSiteLogin;
      delete next.hideDemoMode;
      delete next.hideFontStatus;
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
      const { hideDemoMode, hideFontStatus, ...payload } = state;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      /* ignore */
    }
  }

  let lastEmittedPaletteId = null;

  function applyTheme() {
    const root = document.documentElement;
    const palette = PALETTE_DARK;
    root.style.setProperty("--brand-dark", state.brandDark);
    root.style.setProperty("--brand-pink", state.brandPink);
    root.style.setProperty("--brand-border", state.brandBorder || palette.brandBorder);
    /* Solid brand fill (no gradient) for primary buttons sitewide */
    root.style.setProperty("--brand-gradient", state.brandDark || palette.brandDark);
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
      state.categoriesBg || palette.categoriesBg || "#03051A"
    );
    root.style.setProperty(
      "--footer-bg",
      state.footerBg || palette.footerBg || palette.chromeBg || "#03051A"
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
    document.body.classList.add("theme-palette-dark");
    document.body.classList.remove("theme-palette-light");
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
    document.body.classList.toggle("site-login-disabled", !!state.disableSiteLogin);
    applyLogos();
    document.dispatchEvent(
      new CustomEvent("tickets:siteLoginSetting", {
        detail: { disableSiteLogin: !!state.disableSiteLogin },
      })
    );
    if (typeof window.applySiteLoginGate === "function") {
      window.applySiteLoginGate();
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
    return LOGO_SRC[LOGO_VARIANTS.includes(variant) ? variant : DEFAULTS.logoId];
  }

  function applyLogos() {
    const id = LOGO_VARIANTS.includes(state.logoId) ? state.logoId : DEFAULTS.logoId;
    state.logoId = id;
    const src = logoSrc(id);
    document.querySelectorAll("[data-site-logo]").forEach((img) => {
      img.src = src;
    });
  }

  function setLogo(value, { persist = true } = {}) {
    if (!LOGO_VARIANTS.includes(value)) return;
    state.logoId = value;
    applyTheme();
    syncLogoControls();
    if (persist) writeStored();
  }

  function syncLogoControls() {
    if (!panelEl) return;
    panelEl.querySelectorAll('input[name="themeLogoId"]').forEach((input) => {
      input.checked = input.value === state.logoId;
    });
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
    return PALETTE_DARK;
  }

  function colorDefault(key) {
    const palette = activePaletteColors();
    return palette[key] != null ? palette[key] : DEFAULTS[key];
  }

  function applyPaletteColors(palette) {
    COLOR_KEYS.forEach((key) => {
      if (palette[key] != null) state[key] = palette[key];
    });
    ["bg", "soft", "muted", "pageFg", "chromeBg"].forEach((key) => {
      if (palette[key] != null) state[key] = palette[key];
    });
    if (palette.logoId != null && LOGO_VARIANTS.includes(palette.logoId)) {
      state.logoId = palette.logoId;
    }
  }

  function syncPaletteControls() {
    if (!panelEl) return;
    const subtitle = panelEl.querySelector("#themePaletteToggle .theme-options-block-subtitle");
    if (subtitle) subtitle.textContent = PALETTE_SUBTITLE;
  }

  function resetColors() {
    state.paletteId = "dark";
    applyPaletteColors(PALETTE_DARK);
    applyTheme();
    syncColorControls();
    syncLogoControls();
    syncPaletteControls();
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

    const paletteToggle = makeToggleSection("פלטה", {
      open: false,
      id: "themePalette",
      subtitle: PALETTE_SUBTITLE,
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
    list.appendChild(colorRow("רקע אתר (body)", "bg"));
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

    const loginBlock = document.createElement("section");
    loginBlock.className = "theme-options-block";
    const loginCheck = document.createElement("label");
    loginCheck.className = "theme-options-check";
    loginCheck.innerHTML =
      '<input type="checkbox">' +
      "<span>כבה בקשת התחברות<small>כשמסומן — שער ההתחברות לא מוצג והאתר נפתח ישירות</small></span>";
    const loginCheckbox = loginCheck.querySelector("input");
    loginCheckbox.checked = !!state.disableSiteLogin;
    loginCheckbox.addEventListener("change", () => {
      state.disableSiteLogin = loginCheckbox.checked;
      applyTheme();
      writeStored();
    });
    loginBlock.appendChild(loginCheck);

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
    logosHint.textContent = "בחרו גרסת לוגו אחת לאתר (האדר, תפריט מובייל ופוטר).";
    logosToggle.panel.appendChild(logosHint);

    const logosList = document.createElement("div");
    logosList.className = "theme-options-radio-list theme-options-logo-pick";
    logosList.setAttribute("role", "group");
    logosList.setAttribute("aria-label", "בחירת לוגו");
    LOGO_VARIANTS.forEach((id) => {
      const meta = LOGO_META[id];
      const label = document.createElement("label");
      label.className = "theme-options-check";
      label.innerHTML =
        `<input type="checkbox" name="themeLogoId" value="${id}">` +
        `<span><strong>${meta.title}</strong><small>${meta.subtitle}</small></span>`;
      const input = label.querySelector("input");
      input.checked = state.logoId === id;
      input.addEventListener("change", () => {
        if (input.checked) setLogo(id);
        else if (state.logoId === id) input.checked = true;
      });
      logosList.appendChild(label);
    });
    logosToggle.panel.appendChild(logosList);
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

    body.appendChild(loginBlock);
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
    const mobileMq = window.matchMedia("(max-width:1179px)");
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
