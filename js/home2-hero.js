(function () {
  const root = document.querySelector(".hero.hero-v2");
  if (!root) return;

  const slides = [...root.querySelectorAll(".hero-v2-slide")];
  const texts = [...root.querySelectorAll(".hero-v2-text")];
  const bar = root.querySelector(".hero-v2-progress-bar");
  if (!slides.length) return;

  const INTERVAL = 5500;
  root.style.setProperty("--hero-v2-interval", INTERVAL + "ms");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let index = 0;
  let paused = false;
  let touchStartX = 0;
  let touchDeltaX = 0;
  let fallbackTimer = null;

  function clearFallback() {
    if (fallbackTimer) {
      clearTimeout(fallbackTimer);
      fallbackTimer = null;
    }
  }

  function restartProgress() {
    clearFallback();
    if (!bar) return;
    if (reduceMotion) {
      bar.classList.remove("is-running", "is-paused");
      bar.style.transform = "scaleX(1)";
      return;
    }
    bar.style.transform = "";
    bar.classList.remove("is-running", "is-paused");
    void bar.offsetWidth;
    bar.classList.add("is-running");
    if (paused) bar.classList.add("is-paused");
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

    restartProgress();

    if (reduceMotion) {
      clearFallback();
      if (!paused) {
        fallbackTimer = window.setTimeout(() => goTo(index + 1), INTERVAL);
      }
    }
  }

  function pause() {
    paused = true;
    if (bar) bar.classList.add("is-paused");
    clearFallback();
  }

  function resume() {
    paused = false;
    if (bar) bar.classList.remove("is-paused");
    if (reduceMotion) {
      clearFallback();
      fallbackTimer = window.setTimeout(() => goTo(index + 1), INTERVAL);
    }
  }

  if (bar) {
    bar.addEventListener("animationend", () => {
      if (paused || reduceMotion) return;
      goTo(index + 1);
    });
  }

  root.addEventListener("mouseenter", pause);
  root.addEventListener("mouseleave", resume);
  root.addEventListener("focusin", pause);
  root.addEventListener("focusout", (e) => {
    if (!root.contains(e.relatedTarget)) resume();
  });

  root.addEventListener(
    "touchstart",
    (e) => {
      if (!e.changedTouches[0]) return;
      touchStartX = e.changedTouches[0].clientX;
      touchDeltaX = 0;
      pause();
    },
    { passive: true }
  );

  root.addEventListener(
    "touchmove",
    (e) => {
      if (!e.changedTouches[0]) return;
      touchDeltaX = e.changedTouches[0].clientX - touchStartX;
    },
    { passive: true }
  );

  root.addEventListener(
    "touchend",
    () => {
      if (Math.abs(touchDeltaX) > 40) {
        if (touchDeltaX < 0) goTo(index + 1);
        else goTo(index - 1);
      }
      touchDeltaX = 0;
      resume();
    },
    { passive: true }
  );

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) pause();
    else resume();
  });

  goTo(0);
})();
