/**
 * Collapse / expand the header search panel with vertical animation.
 * On homepage, open search gets a semi-transparent purple wash after 100px scroll.
 */
(function initHeaderSearchToggle() {
  const row = document.getElementById("headerSearchRow");
  const closeBtn = document.getElementById("searchPanelClose");
  const openBtn = document.getElementById("searchReopenBtn");
  const form = document.getElementById("homeSearch");
  const panel = row?.querySelector(".header-search-panel");
  if (!row || !closeBtn || !openBtn) return;

  const datePanel = document.getElementById("dateRangePanel");
  const dateDisplay = document.getElementById("dateRangeDisplay");
  const SCROLL_BG_AT = 100;

  function isHomeActive() {
    return !!document.getElementById("home")?.classList.contains("active");
  }

  function syncScrollBg() {
    const show =
      isHomeActive() && row.classList.contains("is-open") && window.scrollY >= SCROLL_BG_AT;
    row.classList.toggle("is-scrolled", show);
  }

  function setOpen(open, { focus = false } = {}) {
    const next = !!open;
    row.classList.toggle("is-open", next);
    row.classList.toggle("is-closed", !next);
    openBtn.setAttribute("aria-expanded", String(next));
    openBtn.setAttribute("aria-hidden", String(next));
    openBtn.tabIndex = next ? -1 : 0;
    if (panel) panel.inert = !next;
    if (form) form.setAttribute("aria-hidden", String(!next));
    if (!next && datePanel && !datePanel.hidden) {
      datePanel.hidden = true;
      if (dateDisplay) dateDisplay.setAttribute("aria-expanded", "false");
    }
    syncScrollBg();
    if (!focus) return;
    if (next) {
      const focusTarget =
        form?.querySelector("#searchFree") || form?.querySelector("select, input, button");
      if (focusTarget && typeof focusTarget.focus === "function") {
        window.setTimeout(() => focusTarget.focus(), 320);
      }
    } else {
      window.setTimeout(() => openBtn.focus(), 320);
    }
  }

  closeBtn.addEventListener("click", (e) => {
    e.preventDefault();
    setOpen(false, { focus: true });
  });

  openBtn.addEventListener("click", (e) => {
    e.preventDefault();
    setOpen(true, { focus: true });
  });

  window.addEventListener("scroll", syncScrollBg, { passive: true });
  window.addEventListener("hashchange", syncScrollBg);

  setOpen(true);
  syncScrollBg();
})();

/** Light GSAP hover on the search submit button — desktop / above tablet only */
(function initSearchSubmitHover() {
  const btn = document.getElementById("searchSubmitBtn");
  if (!btn) return;

  const desktop = window.matchMedia("(min-width: 961px)");
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

  function waitForGsap(cb) {
    if (window.gsap) {
      cb();
      return;
    }
    let tries = 0;
    const id = setInterval(() => {
      tries += 1;
      if (window.gsap) {
        clearInterval(id);
        cb();
      } else if (tries > 80) {
        clearInterval(id);
      }
    }, 50);
  }

  function canAnimate() {
    return desktop.matches && !reduce.matches;
  }

  function reset() {
    if (!window.gsap) return;
    window.gsap.killTweensOf(btn);
    window.gsap.set(btn, { scale: 1, y: 0, clearProps: "filter" });
  }

  waitForGsap(() => {
    window.gsap.set(btn, { transformOrigin: "50% 50%" });

    btn.addEventListener("mouseenter", () => {
      if (!canAnimate()) return;
      window.gsap.to(btn, {
        scale: 0.96,
        y: 2,
        duration: 0.2,
        ease: "power2.out",
        overwrite: true,
      });
    });

    btn.addEventListener("mouseleave", () => {
      if (!window.gsap) return;
      window.gsap.to(btn, {
        scale: 1,
        y: 0,
        duration: 0.25,
        ease: "power2.out",
        overwrite: true,
      });
    });

    desktop.addEventListener("change", (e) => {
      if (!e.matches) reset();
    });
  });
})();
