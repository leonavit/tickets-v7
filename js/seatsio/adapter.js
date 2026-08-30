/**
 * Isolated Seats.io browser-renderer adapter.
 * Ticket-S UI talks only to this module — not to seatsio.* directly.
 *
 * Docs: https://docs.seats.io/docs/renderer/embed-a-floor-plan/
 */
(function (global) {
  let scriptPromise = null;

  function getConfig() {
    return global.TicketsSeatsioConfig || {};
  }

  function cdnUrl(cfg) {
    const region = (cfg.region || "eu").toLowerCase();
    const map = cfg.cdnByRegion || {};
    return map[region] || map.eu || "https://cdn-eu.seatsio.net/chart.js";
  }

  function validateConfig(cfg) {
    const missing = [];
    if (!cfg.workspaceKey) missing.push("workspaceKey (public)");
    if (!cfg.eventKey) missing.push("eventKey");
    return missing;
  }

  function loadScript(cfg) {
    if (global.seatsio && global.seatsio.SeatingChart) {
      return Promise.resolve(global.seatsio);
    }
    if (scriptPromise) return scriptPromise;
    const src = cdnUrl(cfg);
    scriptPromise = new Promise((resolve, reject) => {
      const existing = document.querySelector('script[data-seatsio-cdn="1"]');
      if (existing) {
        existing.addEventListener("load", () => resolve(global.seatsio));
        existing.addEventListener("error", () =>
          reject(new Error("SEATSIO_CDN_LOAD_FAILED"))
        );
        return;
      }
      const s = document.createElement("script");
      s.src = src;
      s.async = true;
      s.dataset.seatsioCdn = "1";
      s.onload = () => {
        if (global.seatsio && global.seatsio.SeatingChart) resolve(global.seatsio);
        else reject(new Error("SEATSIO_GLOBAL_MISSING"));
      };
      s.onerror = () => reject(new Error("SEATSIO_CDN_LOAD_FAILED: " + src));
      document.head.appendChild(s);
    });
    return scriptPromise;
  }

  /**
   * Normalize a Seats.io bookable object into Ticket-S summary shape.
   * Uses official object fields when present (labels, category, pricing).
   */
  function normalizeObject(object) {
    if (!object) return null;
    const labels = object.labels || {};
    const section =
      labels.section ||
      object.section ||
      (object.category && (object.category.label || object.category.key)) ||
      "אזור";
    const row = labels.row || object.row || "—";
    const seat =
      labels.own ||
      labels.seat ||
      object.seat ||
      object.label ||
      "—";
    let price = 0;
    if (object.pricing && object.pricing.price != null) {
      price = Number(object.pricing.price);
    } else if (object.price != null) {
      price = Number(object.price);
    } else if (object.category) {
      const key = object.category.key != null ? object.category.key : object.category;
      const cfg = getConfig();
      const match = (cfg.pricingCategories || []).find(
        (c) => String(c.category) === String(key)
      );
      if (match) price = Number(match.price) || 0;
    }
    const categoryLabel =
      (object.category && (object.category.label || object.category.key)) ||
      "";
    return {
      id: String(object.label || object.id || `${section}-${row}-${seat}`),
      label: String(object.label || ""),
      sectionName: String(section),
      row: String(row),
      seat: String(seat),
      price: price,
      category: categoryLabel,
      source: "seats.io",
      raw: object,
    };
  }

  /**
   * Local interactive demo map — used ONLY when Seats.io keys are missing,
   * so the purchase flow stays demonstrable. Replaced automatically once
   * workspaceKey + eventKey are set.
   */
  function createLocalDemoAdapter(containerEl, options) {
    const cfg = getConfig();
    const areaLabel = (options && options.areaLabel) || "אולם";
    const price =
      Number((options && options.price) || 0) ||
      (cfg.pricingCategories && cfg.pricingCategories[0]
        ? cfg.pricingCategories[0].price
        : 219);
    const rowSizes = (options && options.rows) || [
      12, 14, 14, 16, 16, 16, 18, 18,
    ];
    const selected = new Map();
    let destroyed = false;
    let zoom = 1;

    containerEl.innerHTML = "";
    containerEl.classList.add("seat-map-fallback");
    containerEl.dataset.provider = "local-demo";
    containerEl.classList.remove("seatsio-chart-host");

    const viewport = document.createElement("div");
    viewport.className = "hall-viewport seat-map-fallback-viewport";
    viewport.id = "hallViewport";

    const canvas = document.createElement("div");
    canvas.className = "hall-canvas hall-canvas-single seat-map-fallback-canvas";
    canvas.id = "hallCanvas";

    const wrap = document.createElement("div");
    wrap.className = "hall-single-wrap";

    const stage = document.createElement("div");
    stage.className = "hall-stage main";
    stage.textContent = "במה";

    const block = document.createElement("div");
    block.className = "hall-block orchestra";
    block.dataset.price = String(price);
    block.dataset.block = areaLabel;

    const blockLabel = document.createElement("span");
    blockLabel.className = "hall-block-label";
    blockLabel.textContent = areaLabel;
    block.appendChild(blockLabel);

    const rowsWrap = document.createElement("div");
    rowsWrap.className = "hall-seat-rows";

    let n = 0;
    rowSizes.forEach((cols, rIdx) => {
      const rowNum = rIdx + 1;
      const rowEl = document.createElement("div");
      rowEl.className = "hall-seat-row";
      const rowLabel = document.createElement("span");
      rowLabel.className = "hall-row-label";
      rowLabel.textContent = String(rowNum);
      rowLabel.setAttribute("aria-hidden", "true");
      rowEl.appendChild(rowLabel);
      for (let c = 1; c <= cols; c++) {
        n += 1;
        const taken = n % 11 === 0 || n % 17 === 0;
        const id = `${areaLabel}-r${rowNum}-c${c}`;
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "seat";
        if (taken) {
          btn.classList.add("taken");
          btn.disabled = true;
        }
        btn.dataset.seat = id;
        btn.dataset.row = String(rowNum);
        btn.dataset.col = String(c);
        btn.dataset.block = areaLabel;
        btn.dataset.price = String(price);
        btn.textContent = String(c);
        btn.setAttribute(
          "aria-label",
          `${areaLabel}, שורה ${rowNum}, מושב ${c}, ${price} שקלים`
        );
        btn.addEventListener("click", (ev) => {
          ev.preventDefault();
          ev.stopPropagation();
          if (btn.disabled || destroyed) return;
          const on = !btn.classList.contains("selected");
          btn.classList.toggle("selected", on);
          const norm = {
            id: id,
            label: id,
            sectionName: areaLabel,
            row: String(rowNum),
            seat: String(c),
            price: price,
            category: "",
            source: "local-demo",
          };
          if (on) selected.set(id, norm);
          else selected.delete(id);
          options &&
            options.onSelectionChange &&
            options.onSelectionChange([...selected.values()]);
        });
        rowEl.appendChild(btn);
      }
      rowsWrap.appendChild(rowEl);
    });

    block.appendChild(rowsWrap);
    wrap.appendChild(stage);
    wrap.appendChild(block);
    canvas.appendChild(wrap);
    viewport.appendChild(canvas);
    containerEl.appendChild(viewport);

    function setZoom(next) {
      zoom = Math.min(1.8, Math.max(0.55, next));
      canvas.style.transform = `scale(${zoom})`;
      canvas.style.transformOrigin = "center top";
      viewport.classList.toggle("is-zoom-pan", zoom > 1);
    }
    setZoom(1);

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

    options &&
      options.onChartRendered &&
      options.onChartRendered({ provider: "local-demo" });

    return {
      provider: "local-demo",
      chart: null,
      ready: true,
      getSelection: () => [...selected.values()],
      deselectById(id) {
        const btn = canvas.querySelector(
          `.seat[data-seat="${CSS.escape(id)}"]`
        );
        if (btn && btn.classList.contains("selected")) btn.click();
        else {
          selected.delete(id);
          options &&
            options.onSelectionChange &&
            options.onSelectionChange([...selected.values()]);
        }
      },
      destroy() {
        destroyed = true;
        selected.clear();
        containerEl.innerHTML = "";
        containerEl.classList.remove("seat-map-fallback");
      },
    };
  }

  /**
   * Mount Seats.io SeatingChart into containerEl (must have an id for divId).
   * Falls back to a local demo seat grid when public keys are not configured.
   * @returns {Promise<{provider, chart, getSelection, deselectById, destroy}>}
   */
  async function mount(containerEl, options) {
    const cfg = getConfig();
    const missing = validateConfig(cfg);
    if (missing.length) {
      console.warn(
        "[TicketsSeatsio] Missing configuration — showing local demo seats.",
        "\nRequired:",
        missing.join(", "),
        "\nSet values in js/seatsio/config.js or URL params:",
        "\n  ?seatsioWorkspaceKey=PUBLIC_KEY&seatsioEventKey=EVENT_KEY&seatsioRegion=eu"
      );
      return createLocalDemoAdapter(containerEl, options || {});
    }

    try {
      await loadScript(cfg);
    } catch (err) {
      console.warn(
        "[TicketsSeatsio] CDN load failed — showing local demo seats.",
        err
      );
      return createLocalDemoAdapter(containerEl, options || {});
    }

    if (!containerEl.id) containerEl.id = "seat-map";
    containerEl.innerHTML = "";
    containerEl.classList.add("seatsio-chart-host");
    containerEl.dataset.provider = "seats.io";

    const selected = new Map();

    function emitChange() {
      const list = [...selected.values()];
      options && options.onSelectionChange && options.onSelectionChange(list);
    }

    const pricingPrices = (cfg.pricingCategories || []).map((c) => ({
      category: c.category,
      price: c.price,
    }));

    const chartConfig = {
      divId: containerEl.id,
      workspaceKey: cfg.workspaceKey,
      event: cfg.eventKey,
      session: cfg.session || "continue",
      language: cfg.language || "he",
      pricing: {
        prices: pricingPrices,
        priceFormatter: cfg.priceFormatter || ((p) => "₪" + p),
      },
      onObjectSelected: function (object) {
        const norm = normalizeObject(object);
        if (!norm) return;
        selected.set(norm.id, norm);
        options && options.onObjectSelected && options.onObjectSelected(norm, object);
        emitChange();
      },
      onObjectDeselected: function (object) {
        const norm = normalizeObject(object);
        if (!norm) return;
        selected.delete(norm.id);
        if (object && object.label) selected.delete(String(object.label));
        options &&
          options.onObjectDeselected &&
          options.onObjectDeselected(norm, object);
        emitChange();
      },
      onChartRendered: function (chart) {
        options && options.onChartRendered && options.onChartRendered(chart);
      },
    };

    try {
      const chart = new global.seatsio.SeatingChart(chartConfig).render();
      return {
        provider: "seats.io",
        chart: chart,
        ready: true,
        getSelection: () => [...selected.values()],
        deselectById(id) {
          const item = selected.get(id);
          const label = (item && (item.label || item.id)) || id;
          if (chart && typeof chart.deselectObjects === "function") {
            return chart.deselectObjects([label]);
          }
          selected.delete(id);
          emitChange();
          return Promise.resolve();
        },
        destroy() {
          try {
            if (chart && typeof chart.destroy === "function") chart.destroy();
          } catch (_) {}
          selected.clear();
          if (containerEl) {
            containerEl.innerHTML = "";
            containerEl.classList.remove("seatsio-chart-host");
          }
        },
      };
    } catch (err) {
      console.warn(
        "[TicketsSeatsio] Renderer failed — showing local demo seats.",
        err
      );
      return createLocalDemoAdapter(containerEl, options || {});
    }
  }

  global.TicketsSeatsioAdapter = {
    mount,
    normalizeObject,
    loadScript,
    validateConfig,
    getConfig,
    createLocalDemoAdapter,
  };
})(typeof window !== "undefined" ? window : globalThis);
