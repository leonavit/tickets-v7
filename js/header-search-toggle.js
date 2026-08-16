/**
 * Collapse / expand the header search panel with vertical animation.
 * On homepage, open search gets a semi-transparent purple wash after 100px scroll.
 * Search icon is always visible and toggles open/closed.
 * Account menu is click-to-toggle.
 */
(function initHeaderSearchToggle() {
  const row = document.getElementById("headerSearchRow");
  const closeBtn = document.getElementById("searchPanelClose");
  const openBtn = document.getElementById("searchReopenBtn");
  const headerBtn = document.getElementById("headerSearchToggle");
  const form = document.getElementById("homeSearch");
  const panel = row?.querySelector(".header-search-panel");
  if (!row || !closeBtn || !openBtn) return;

  const datePanel = document.getElementById("dateRangePanel");
  const dateDisplay = document.getElementById("dateRangeDisplay");
  const SCROLL_BG_AT = 100;
  const mobileMq = window.matchMedia("(max-width:960px)");

  function isHomeActive() {
    return !!document.getElementById("home")?.classList.contains("active");
  }

  function syncScrollBg() {
    const show =
      isHomeActive() && row.classList.contains("is-open") && window.scrollY >= SCROLL_BG_AT;
    row.classList.toggle("is-scrolled", show);
  }

  function syncToggleUi(open) {
    // Pill reopen button is unused — keep it inert
    openBtn.setAttribute("aria-expanded", String(open));
    openBtn.setAttribute("aria-hidden", "true");
    openBtn.tabIndex = -1;
    if (headerBtn) {
      headerBtn.setAttribute("aria-expanded", String(open));
      headerBtn.setAttribute("aria-hidden", "false");
      headerBtn.tabIndex = 0;
      headerBtn.classList.toggle("is-active", open);
      headerBtn.setAttribute("aria-label", open ? "סגירת חיפוש" : "חיפוש");
    }
  }

  function setOpen(open, { focus = false } = {}) {
    const next = !!open;
    row.classList.toggle("is-open", next);
    row.classList.toggle("is-closed", !next);
    syncToggleUi(next);
    if (panel) panel.inert = !next;
    if (form) form.setAttribute("aria-hidden", String(!next));
    if (!next && datePanel && !datePanel.hidden) {
      datePanel.hidden = true;
      if (dateDisplay) dateDisplay.setAttribute("aria-expanded", "false");
    }
    syncScrollBg();
    // Search overlays — never change layout height / hero overlap
    document.documentElement.style.setProperty("--header-search-h", "0px");
    row.style.setProperty("--header-search-h", "0px");
    if (!focus) return;
    if (next) {
      const focusTarget =
        form?.querySelector("#searchFree") || form?.querySelector("select, input, button");
      if (focusTarget && typeof focusTarget.focus === "function") {
        window.setTimeout(() => focusTarget.focus(), 560);
      }
    } else if (headerBtn) {
      window.setTimeout(() => headerBtn.focus(), 560);
    }
  }

  window.setHeaderSearchOpen = setOpen;

  closeBtn.addEventListener("click", (e) => {
    e.preventDefault();
    setOpen(false, { focus: true });
  });

  // Legacy pill — hidden, but keep handler harmless
  openBtn.addEventListener("click", (e) => {
    e.preventDefault();
    setOpen(true, { focus: true });
  });

  if (headerBtn) {
    headerBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const next = !row.classList.contains("is-open");
      if (next && typeof window.setHeaderAccountOpen === "function") {
        window.setHeaderAccountOpen(false);
      }
      setOpen(next, { focus: true });
    });
  }

  window.addEventListener("scroll", syncScrollBg, { passive: true });
  window.addEventListener("hashchange", syncScrollBg);

  // Mobile: search closed by default; desktop: open
  setOpen(!mobileMq.matches);
  syncScrollBg();
})();

(function initHeaderAccountToggle() {
  const wrap = document.querySelector(".header-account-wrap");
  const btn = document.getElementById("headerAccountToggle");
  const menu = document.getElementById("accountMenu");
  if (!wrap || !btn || !menu) return;

  function setOpen(open) {
    const next = !!open;
    wrap.classList.toggle("is-open", next);
    btn.setAttribute("aria-expanded", String(next));
  }

  window.setHeaderAccountOpen = setOpen;

  btn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    const next = !wrap.classList.contains("is-open");
    if (next && typeof window.setHeaderSearchOpen === "function") {
      window.setHeaderSearchOpen(false);
    }
    setOpen(next);
  });

  menu.addEventListener("click", (e) => {
    if (e.target.closest("[data-route], [data-logout]")) setOpen(false);
  });

  document.addEventListener("click", (e) => {
    if (!wrap.classList.contains("is-open")) return;
    if (e.target.closest(".header-account-wrap")) return;
    setOpen(false);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setOpen(false);
  });

  window.addEventListener("hashchange", () => setOpen(false));
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

/** Mobile menu logo — GSAP enter from bottom → top when the drawer opens */
(function initMobileNavLogoAnim() {
  const panel = document.getElementById("mobileNav");
  const brand = panel?.querySelector(".mobile-nav-brand");
  if (!panel || !brand) return;

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

  function playIn() {
    if (reduce.matches || !window.gsap) {
      brand.style.opacity = "1";
      brand.style.transform = "none";
      return;
    }
    window.gsap.killTweensOf(brand);
    window.gsap.fromTo(
      brand,
      { y: 48, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.55,
        ease: "power3.out",
        overwrite: true,
      }
    );
  }

  function resetOut() {
    if (!window.gsap) return;
    window.gsap.killTweensOf(brand);
    window.gsap.set(brand, { y: 48, opacity: 0 });
  }

  waitForGsap(() => {
    if (window.gsap && !reduce.matches) {
      window.gsap.set(brand, { y: 48, opacity: 0 });
    }

    const mo = new MutationObserver(() => {
      if (panel.classList.contains("is-open")) playIn();
      else resetOut();
    });
    mo.observe(panel, { attributes: true, attributeFilter: ["class"] });
  });
})();
