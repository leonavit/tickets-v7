/**
 * GSAP text animations for hero + carousel titles.
 * Staggered Letters — plays only when the title enters the viewport.
 */
(function initTextAnimations() {
  const SELECTOR_HERO = ".hero-v2-text.is-active h1";
  const SELECTOR_CAROUSEL =
    "#homeSections .section-header .heading-icon h2, .categories-section .section-header h2";

  const PRESET = {
    from: { y: 50, opacity: 0, stagger: 0.03, duration: 0.6, ease: "back.out(1.7)" },
  };

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const tracked = new WeakMap();
  let observers = [];
  let ready = false;

  function waitForGsap(cb) {
    if (window.gsap) {
      if (window.ScrollTrigger) window.gsap.registerPlugin(window.ScrollTrigger);
      cb();
      return;
    }
    let tries = 0;
    const id = setInterval(() => {
      tries += 1;
      if (window.gsap) {
        clearInterval(id);
        if (window.ScrollTrigger) window.gsap.registerPlugin(window.ScrollTrigger);
        cb();
      } else if (tries > 80) {
        clearInterval(id);
      }
    }, 50);
  }

  function originalText(el) {
    if (!el.dataset.gsapOriginal) {
      el.dataset.gsapOriginal = (el.textContent || "").replace(/\s+/g, " ").trim();
    }
    return el.dataset.gsapOriginal;
  }

  function killTween(el) {
    const entry = tracked.get(el);
    if (entry?.tween) {
      entry.tween.kill();
      entry.tween = null;
    }
  }

  function restore(el, { keepPending = false } = {}) {
    const text = originalText(el);
    killTween(el);
    el.textContent = text;
    el.classList.remove("gsap-text-ready", "gsap-text-playing");
    if (!keepPending) el.classList.remove("gsap-text-pending");
    if (window.gsap) window.gsap.set(el, { clearProps: "all" });
  }

  function splitChars(el, text) {
    el.textContent = "";
    el.setAttribute("aria-label", text);
    const nodes = [];
    for (const ch of text) {
      const span = document.createElement("span");
      span.className = "gsap-char";
      span.setAttribute("aria-hidden", "true");
      if (ch === " ") {
        span.classList.add("is-space");
        span.innerHTML = "&nbsp;";
      } else {
        span.textContent = ch;
      }
      el.appendChild(span);
      nodes.push(span);
    }
    return nodes;
  }

  function buildTargets(el) {
    const text = originalText(el);
    const keepPending = el.classList.contains("gsap-text-pending");
    restore(el, { keepPending });
    if (!text) {
      el.classList.add("gsap-text-ready");
      return null;
    }
    return splitChars(el, text);
  }

  function play(el, { force = false } = {}) {
    if (!ready || !window.gsap || reduceMotion) {
      if (el) {
        restore(el);
        el.classList.add("gsap-text-ready");
      }
      return;
    }

    let entry = tracked.get(el);
    if (!entry) {
      entry = { played: false, tween: null };
      tracked.set(el, entry);
    }
    if (entry.played && !force) return;

    const targets = buildTargets(el);
    if (!targets) return;

    el.classList.add("gsap-text-ready", "gsap-text-playing");
    killTween(el);

    entry.tween = window.gsap.from(targets, {
      ...PRESET.from,
      immediateRender: true,
      overwrite: true,
      onComplete() {
        el.classList.remove("gsap-text-playing");
      },
    });
    el.classList.remove("gsap-text-pending");
    entry.played = true;
  }

  function isInView(el) {
    const rect = el.getBoundingClientRect();
    const vh = window.innerHeight || document.documentElement.clientHeight;
    return rect.top < vh * 0.88 && rect.bottom > vh * 0.1;
  }

  function armPending(el) {
    if (reduceMotion) {
      restore(el);
      el.classList.add("gsap-text-ready");
      return;
    }
    restore(el);
    el.classList.add("gsap-text-ready", "gsap-text-pending");
  }

  function bindOnce(el) {
    if (reduceMotion) {
      restore(el);
      el.classList.add("gsap-text-ready");
      return;
    }

    armPending(el);

    if (isInView(el)) {
      requestAnimationFrame(() => play(el, { force: true }));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          play(el, { force: true });
          io.unobserve(el);
        });
      },
      { threshold: 0.35, rootMargin: "0px 0px -8% 0px" }
    );
    io.observe(el);
    observers.push(io);
  }

  function clearObservers() {
    observers.forEach((io) => io.disconnect());
    observers = [];
  }

  function syncOriginalFromDom(el) {
    const hasSplit = el.querySelector(".gsap-char");
    if (hasSplit) return originalText(el);
    const plain = (el.textContent || "").replace(/\s+/g, " ").trim();
    if (plain) el.dataset.gsapOriginal = plain;
    return originalText(el);
  }

  function refreshAll() {
    if (!ready) return;
    clearObservers();

    collectTitles().forEach((el) => {
      syncOriginalFromDom(el);
      const entry = tracked.get(el);
      if (entry) {
        killTween(el);
        entry.played = false;
      }
      bindOnce(el);
    });

    document.querySelectorAll(".hero-v2-text:not(.is-active) h1").forEach((el) => {
      syncOriginalFromDom(el);
      armPending(el);
      const entry = tracked.get(el) || { played: false, tween: null };
      entry.played = false;
      tracked.set(el, entry);
    });
  }

  function collectTitles() {
    return [
      ...document.querySelectorAll(SELECTOR_HERO),
      ...document.querySelectorAll(SELECTOR_CAROUSEL),
    ];
  }

  function onHeroSlide() {
    if (!ready) return;
    const active = document.querySelector(SELECTOR_HERO);
    if (!active) return;
    syncOriginalFromDom(active);
    const entry = tracked.get(active) || { played: false, tween: null };
    entry.played = false;
    tracked.set(active, entry);
    if (isInView(active)) play(active, { force: true });
    else bindOnce(active);
  }

  /** GSAPify "Wavy Baseline" loop on the event-page «המכירה בקרוב» badge */
  function syncPresaleBadgeWavy() {
    const badge = document.getElementById("eventHeroBadge");
    if (!badge) return;

    let entry = tracked.get(badge);
    if (entry?.tween) {
      entry.tween.kill();
      entry.tween = null;
    }

    const plain =
      (badge.dataset.gsapOriginal || badge.textContent || "")
        .replace(/\s+/g, " ")
        .trim() || "המכירה בקרוב";
    badge.dataset.gsapOriginal = plain;

    if (!ready || !window.gsap || reduceMotion || badge.hidden) {
      badge.textContent = plain;
      badge.classList.remove("gsap-text-playing");
      return;
    }

    const chars = splitChars(badge, plain);
    if (!chars.length) return;

    entry = entry || { played: true, tween: null };
    tracked.set(badge, entry);
    badge.classList.add("gsap-text-ready", "gsap-text-playing");

    entry.tween = window.gsap.to(chars, {
      y: -6,
      stagger: { each: 0.06, from: "start", repeat: -1, yoyo: true },
      duration: 0.4,
      ease: "sine.inOut",
      overwrite: true,
    });
  }

  function boot() {
    waitForGsap(() => {
      ready = true;
      refreshAll();
      syncPresaleBadgeWavy();
    });

    document.addEventListener("tickets:homeRendered", () => {
      requestAnimationFrame(() => refreshAll());
    });
    document.addEventListener("tickets:heroSlide", onHeroSlide);
    document.addEventListener("tickets:presaleBadge", () => {
      requestAnimationFrame(() => syncPresaleBadgeWavy());
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
