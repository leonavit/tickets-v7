/**
 * Mobile categories carousel («מה תרצו לראות»):
 * infinite loop, middle item centered on load, side peeks,
 * auto-slide every 5s (pauses on user interaction / reduced motion).
 * Clones get fresh empty Lottie hosts; icons rebound via refreshCategoryLotties.
 */
(function initCategoryCarousel() {
  const row = document.querySelector(".categories-section .category-row");
  if (!row) return;

  const mq = window.matchMedia("(max-width:960px)");
  const START_INDEX = 2; // middle of 5: תרבות
  const AUTO_MS = 5000;
  let count = 0;
  let built = false;
  let jumping = false;
  let jumpTimer = 0;
  let scrollEndTimer = 0;
  let autoTimer = 0;
  let resumeTimer = 0;
  let logicalIndex = START_INDEX;
  let lastPlayedLogical = -1;

  function cards() {
    return [...row.querySelectorAll(".category-card")];
  }

  function centerDelta(card) {
    const rowRect = row.getBoundingClientRect();
    const cardRect = card.getBoundingClientRect();
    return cardRect.left + cardRect.width / 2 - (rowRect.left + rowRect.width / 2);
  }

  function setSnap(on) {
    row.style.scrollSnapType = on ? "" : "none";
  }

  function scrollToCenter(card, behavior) {
    if (!card) return;
    const instant = !behavior || behavior === "auto" || behavior === "instant";
    const apply = () => {
      const delta = centerDelta(card);
      if (Math.abs(delta) < 0.75) return false;
      // Physical delta works with scrollLeft in both LTR and RTL engines
      row.scrollLeft += delta;
      return true;
    };

    if (instant) {
      setSnap(false);
      apply();
      // Second + third pass for iOS subpixel / RTL scrollLeft quirks
      requestAnimationFrame(() => {
        apply();
        requestAnimationFrame(() => {
          apply();
          setSnap(true);
        });
      });
    } else {
      const delta = centerDelta(card);
      if (Math.abs(delta) >= 0.75) {
        row.scrollTo({ left: row.scrollLeft + delta, behavior: "smooth" });
      }
    }
  }

  function nearestIndex() {
    const list = cards();
    const rowRect = row.getBoundingClientRect();
    const mid = rowRect.left + rowRect.width / 2;
    let best = 0;
    let bestDist = Infinity;
    list.forEach((card, i) => {
      const r = card.getBoundingClientRect();
      const d = Math.abs(r.left + r.width / 2 - mid);
      if (d < bestDist) {
        bestDist = d;
        best = i;
      }
    });
    return best;
  }

  function toLogical(index) {
    if (!count) return 0;
    return ((index % count) + count) % count;
  }

  function markCenter(idx) {
    const list = cards();
    const center = typeof idx === "number" ? idx : nearestIndex();
    logicalIndex = toLogical(center);
    list.forEach((card, i) => {
      const on = i === center;
      card.classList.toggle("is-center", on);
      if (on && !card.classList.contains("is-clone")) {
        card.setAttribute("aria-current", "true");
      } else {
        card.removeAttribute("aria-current");
      }
    });

    const centerCard = list[center];
    if (
      centerCard &&
      !jumping &&
      logicalIndex !== lastPlayedLogical &&
      typeof window.playCategoryCardLottie === "function"
    ) {
      lastPlayedLogical = logicalIndex;
      window.playCategoryCardLottie(centerCard);
    }
  }

  function beginJump(ms) {
    jumping = true;
    window.clearTimeout(jumpTimer);
    jumpTimer = window.setTimeout(() => {
      jumping = false;
      markCenter();
      normalizeLoop();
    }, typeof ms === "number" ? ms : 280);
  }

  /** Only remap when resting on cloned edge strips — never during middle set. */
  function normalizeLoop() {
    if (!built || jumping || !count) return;
    const idx = nearestIndex();
    let target = idx;
    if (idx < count) target = idx + count;
    else if (idx >= count * 2) target = idx - count;
    else {
      markCenter(idx);
      return;
    }
    beginJump(200);
    scrollToCenter(cards()[target], "auto");
    markCenter(target);
  }

  function onScroll() {
    if (jumping) return;
    markCenter();
    window.clearTimeout(scrollEndTimer);
    scrollEndTimer = window.setTimeout(normalizeLoop, 160);
  }

  function canAutoplay() {
    if (!mq.matches || !built || !count) return false;
    if (document.hidden) return false;
    if (!document.querySelector("#home.active")) return false;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
    return true;
  }

  function stopAuto() {
    window.clearInterval(autoTimer);
    autoTimer = 0;
  }

  /**
   * Always step +1 along the infinite strip (forward only).
   * When we enter the after-clone zone, normalizeLoop snaps back to the middle set.
   */
  function advanceAuto() {
    if (!canAutoplay() || jumping) return;
    const list = cards();
    if (!list.length) return;

    let idx = nearestIndex() + 1;
    // Keep a buffer of after-clones; if we somehow pass the end, wrap into middle
    if (idx >= list.length) idx = count;

    beginJump(700);
    scrollToCenter(list[idx], "smooth");
    markCenter(idx);
  }

  function startAuto() {
    stopAuto();
    window.clearTimeout(resumeTimer);
    if (!canAutoplay()) return;
    autoTimer = window.setInterval(advanceAuto, AUTO_MS);
  }

  /** Pause while the user interacts, then resume after a short delay. */
  function pauseAutoTemporarily() {
    stopAuto();
    window.clearTimeout(resumeTimer);
    resumeTimer = window.setTimeout(startAuto, AUTO_MS);
  }

  function prepareClone(card) {
    const clone = card.cloneNode(true);
    clone.classList.add("is-clone");
    clone.setAttribute("aria-hidden", "true");
    clone.tabIndex = -1;
    clone.classList.remove("is-center");
    clone.removeAttribute("aria-current");
    // Fresh Lottie hosts — never copy live SVG / bound state
    clone.querySelectorAll("[data-category-lottie-key]").forEach((el) => {
      el.innerHTML = "";
      delete el.dataset.lottieBound;
      delete el.dataset.lottiePlayed;
      try {
        delete el._categoryLottie;
      } catch (_) {
        el._categoryLottie = null;
      }
    });
    return clone;
  }

  function buildClones() {
    if (built) return;
    const originals = [...row.querySelectorAll(".category-card:not(.is-clone)")];
    count = originals.length;
    if (count < 2) return;

    const before = document.createDocumentFragment();
    const after = document.createDocumentFragment();
    originals.forEach((card) => {
      before.appendChild(prepareClone(card));
      after.appendChild(prepareClone(card));
    });
    row.insertBefore(before, row.firstChild);
    row.appendChild(after);
    built = true;

    if (typeof window.refreshCategoryLotties === "function") {
      window.refreshCategoryLotties();
    }
  }

  function goToLogical(index, behavior) {
    if (!built || !count) return;
    const logical = Math.min(Math.max(index, 0), count - 1);
    const idx = count + logical;
    beginJump();
    scrollToCenter(cards()[idx], behavior || "auto");
    markCenter(idx);
  }

  function recenterCurrent() {
    if (!built || !count) return;
    goToLogical(logicalIndex, "auto");
  }

  function enable() {
    if (row.dataset.categoryCarouselBound === "1") {
      if (!built) {
        buildClones();
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            goToLogical(START_INDEX, "auto");
            startAuto();
          });
        });
      } else {
        startAuto();
      }
      return;
    }
    buildClones();
    row.classList.add("is-category-carousel");
    row.dataset.categoryCarouselBound = "1";
    row.addEventListener("scroll", onScroll, { passive: true });
    row.addEventListener("pointerdown", pauseAutoTemporarily, { passive: true });
    row.addEventListener("touchstart", pauseAutoTemporarily, { passive: true });
    row.addEventListener("wheel", pauseAutoTemporarily, { passive: true });
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        goToLogical(START_INDEX, "auto");
        startAuto();
      });
    });
  }

  function disable() {
    row.removeEventListener("scroll", onScroll);
    row.removeEventListener("pointerdown", pauseAutoTemporarily);
    row.removeEventListener("touchstart", pauseAutoTemporarily);
    row.removeEventListener("wheel", pauseAutoTemporarily);
    window.clearTimeout(scrollEndTimer);
    window.clearTimeout(jumpTimer);
    window.clearTimeout(resumeTimer);
    stopAuto();
    jumping = false;
    lastPlayedLogical = -1;
    row.classList.remove("is-category-carousel");
    delete row.dataset.categoryCarouselBound;
    setSnap(true);
    cards().forEach((card) => {
      card.classList.remove("is-center");
      card.removeAttribute("aria-current");
    });
    if (built) {
      row.querySelectorAll(".category-card.is-clone").forEach((c) => c.remove());
      built = false;
      count = 0;
    }
    row.scrollLeft = 0;
  }

  function sync() {
    if (mq.matches) enable();
    else disable();
  }

  let resizeTimer = 0;
  window.addEventListener("resize", () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      if (!mq.matches) {
        disable();
        return;
      }
      if (!built) enable();
      else {
        recenterCurrent();
        startAuto();
      }
    }, 120);
  });

  window.addEventListener("load", () => {
    if (mq.matches && built) {
      recenterCurrent();
      if (typeof window.refreshCategoryLotties === "function") {
        window.refreshCategoryLotties();
      }
      startAuto();
    }
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stopAuto();
    else startAuto();
  });

  window.addEventListener("hashchange", () => {
    if (canAutoplay()) startAuto();
    else stopAuto();
  });

  sync();
  if (typeof mq.addEventListener === "function") {
    mq.addEventListener("change", sync);
  } else if (typeof mq.addListener === "function") {
    mq.addListener(sync);
  }
})();
