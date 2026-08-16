(function () {
  const root = document.querySelector(".hero.hero-v2");
  if (!root) return;

  const slides = [...root.querySelectorAll(".hero-v2-slide")];
  const texts = [...root.querySelectorAll(".hero-v2-text")];
  const dots = [...root.querySelectorAll(".hero-v2-dot")];
  if (!slides.length) return;

  const INTERVAL = 5500;
  root.style.setProperty("--hero-v2-interval", INTERVAL + "ms");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let index = 0;
  let paused = false;
  let dragging = false;
  let dragStartX = 0;
  let dragDeltaX = 0;
  let didDrag = false;
  let fallbackTimer = null;
  let activeProgress = null;

  function clearFallback() {
    if (fallbackTimer) {
      clearTimeout(fallbackTimer);
      fallbackTimer = null;
    }
  }

  function getProgressEl(dot) {
    return dot ? dot.querySelector(".hero-v2-dot-progress") : null;
  }

  function restartProgress() {
    clearFallback();
    dots.forEach((dot) => {
      const ring = getProgressEl(dot);
      if (!ring) return;
      ring.classList.remove("is-running", "is-paused");
      ring.style.strokeDashoffset = "";
    });

    activeProgress = getProgressEl(dots[index]);
    if (!activeProgress) return;

    if (reduceMotion) {
      activeProgress.style.strokeDashoffset = "0";
      return;
    }

    void activeProgress.getBoundingClientRect();
    activeProgress.classList.add("is-running");
    if (paused) activeProgress.classList.add("is-paused");
  }

  function goTo(next) {
    const total = slides.length;
    index = ((next % total) + total) % total;

    slides.forEach((slide, i) => {
      const on = i === index;
      slide.classList.toggle("is-active", on);
      slide.setAttribute("aria-hidden", on ? "false" : "true");
    });

    texts.forEach((el, i) => {
      const on = i === index;
      el.classList.toggle("is-active", on);
      if (on) el.removeAttribute("hidden");
      else el.setAttribute("hidden", "");
    });

    dots.forEach((dot, i) => {
      const on = i === index;
      dot.classList.toggle("is-active", on);
      dot.setAttribute("aria-selected", on ? "true" : "false");
    });

    restartProgress();

    document.dispatchEvent(
      new CustomEvent("tickets:heroSlide", { detail: { index } })
    );

    if (reduceMotion) {
      clearFallback();
      if (!paused) {
        fallbackTimer = window.setTimeout(() => goTo(index + 1), INTERVAL);
      }
    }
  }

  function pause() {
    paused = true;
    if (activeProgress) activeProgress.classList.add("is-paused");
    clearFallback();
  }

  function resume() {
    paused = false;
    if (activeProgress) activeProgress.classList.remove("is-paused");
    if (reduceMotion) {
      clearFallback();
      fallbackTimer = window.setTimeout(() => goTo(index + 1), INTERVAL);
    }
  }

  dots.forEach((dot) => {
    const ring = getProgressEl(dot);
    if (!ring) return;
    ring.addEventListener("animationend", (e) => {
      if (e.target !== ring) return;
      if (!dot.classList.contains("is-active")) return;
      if (paused || reduceMotion) return;
      goTo(index + 1);
    });
  });

  root.addEventListener("mouseenter", pause);
  root.addEventListener("mouseleave", () => {
    if (!dragging) resume();
  });
  root.addEventListener("focusin", pause);
  root.addEventListener("focusout", (e) => {
    if (!root.contains(e.relatedTarget) && !dragging) resume();
  });

  function endDrag() {
    if (!dragging) return;
    dragging = false;
    root.classList.remove("is-dragging");

    if (Math.abs(dragDeltaX) > 40) {
      if (dragDeltaX < 0) goTo(index + 1);
      else goTo(index - 1);
    }

    dragDeltaX = 0;

    const stillHovered = root.matches(":hover");
    const stillFocused = root.contains(document.activeElement);
    if (!stillHovered && !stillFocused) resume();
  }

  root.addEventListener("pointerdown", (e) => {
    if (e.button !== 0) return;
    if (e.target.closest("button, a, input, select, textarea, label")) return;
    dragging = true;
    didDrag = false;
    dragStartX = e.clientX;
    dragDeltaX = 0;
    root.classList.add("is-dragging");
    pause();
    try {
      root.setPointerCapture(e.pointerId);
    } catch (_) {}
  });

  root.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    dragDeltaX = e.clientX - dragStartX;
    if (Math.abs(dragDeltaX) > 8) didDrag = true;
  });

  root.addEventListener("pointerup", endDrag);
  root.addEventListener("pointercancel", endDrag);

  root.addEventListener(
    "click",
    (e) => {
      if (!didDrag) return;
      e.preventDefault();
      e.stopPropagation();
      didDrag = false;
    },
    true
  );

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) pause();
    else resume();
  });

  dots.forEach((dot) => {
    dot.addEventListener("click", (e) => {
      e.stopPropagation();
      const next = Number(dot.dataset.slideTo);
      if (!Number.isFinite(next)) return;
      goTo(next);
    });
  });

  /* Sync hero overlap with the header search row height */
  const searchRow = document.querySelector(".site-header-v3 .header-search-row");
  function syncSearchOverlap() {
    // Search overlays the page — keep hero metrics stable
    const root = document.documentElement;
    root.style.setProperty("--header-search-h", "0px");
    if (searchRow) searchRow.style.setProperty("--header-search-h", "0px");
  }
  syncSearchOverlap();
  if (typeof ResizeObserver !== "undefined" && searchRow) {
    new ResizeObserver(syncSearchOverlap).observe(searchRow);
  } else {
    window.addEventListener("resize", syncSearchOverlap);
  }

  goTo(0);
})();
