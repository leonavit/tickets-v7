/**
 * Mobile categories carousel («מה תרצו לראות»):
 * infinite loop, middle item centered on load, side peeks.
 */
(function initCategoryCarousel() {
  const row = document.querySelector(".categories-section .category-row");
  if (!row) return;

  const mq = window.matchMedia("(max-width:960px)");
  const START_INDEX = 2; // middle of 5: תרבות
  let count = 0;
  let built = false;
  let jumping = false;
  let jumpTimer = 0;
  let scrollEndTimer = 0;
  let logicalIndex = START_INDEX;

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
    const delta = centerDelta(card);
    if (Math.abs(delta) < 0.5) return;
    const instant = !behavior || behavior === "auto" || behavior === "instant";
    if (instant) {
      setSnap(false);
      row.scrollBy({ left: delta, behavior: "instant" in Element.prototype ? "instant" : "auto" });
      // Second pass — layout/subpixel after first jump
      const fix = centerDelta(card);
      if (Math.abs(fix) >= 0.5) {
        row.scrollBy({ left: fix, behavior: "auto" });
      }
      setSnap(true);
    } else {
      row.scrollBy({ left: delta, behavior: "smooth" });
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
  }

  function beginJump() {
    jumping = true;
    window.clearTimeout(jumpTimer);
    jumpTimer = window.setTimeout(() => {
      jumping = false;
      markCenter();
    }, 180);
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
    beginJump();
    scrollToCenter(cards()[target], "auto");
    markCenter(target);
  }

  function onScroll() {
    if (jumping) return;
    markCenter();
    window.clearTimeout(scrollEndTimer);
    scrollEndTimer = window.setTimeout(normalizeLoop, 140);
  }

  function buildClones() {
    if (built) return;
    const originals = [...row.querySelectorAll(".category-card:not(.is-clone)")];
    count = originals.length;
    if (count < 2) return;

    const before = document.createDocumentFragment();
    const after = document.createDocumentFragment();
    originals.forEach((card) => {
      const a = card.cloneNode(true);
      a.classList.add("is-clone");
      a.setAttribute("aria-hidden", "true");
      a.tabIndex = -1;
      before.appendChild(a);

      const b = card.cloneNode(true);
      b.classList.add("is-clone");
      b.setAttribute("aria-hidden", "true");
      b.tabIndex = -1;
      after.appendChild(b);
    });
    row.insertBefore(before, row.firstChild);
    row.appendChild(after);
    built = true;
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
          requestAnimationFrame(() => goToLogical(START_INDEX, "auto"));
        });
      }
      return;
    }
    buildClones();
    row.classList.add("is-category-carousel");
    row.dataset.categoryCarouselBound = "1";
    row.addEventListener("scroll", onScroll, { passive: true });
    requestAnimationFrame(() => {
      requestAnimationFrame(() => goToLogical(START_INDEX, "auto"));
    });
  }

  function disable() {
    row.removeEventListener("scroll", onScroll);
    window.clearTimeout(scrollEndTimer);
    window.clearTimeout(jumpTimer);
    jumping = false;
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
      else recenterCurrent(); // keep current item — do NOT reset to start
    }, 120);
  });

  window.addEventListener("load", () => {
    if (mq.matches && built) recenterCurrent();
  });

  sync();
  if (typeof mq.addEventListener === "function") {
    mq.addEventListener("change", sync);
  } else if (typeof mq.addListener === "function") {
    mq.addListener(sync);
  }
})();
