/**
 * GSAP text animations for hero + carousel titles.
 * Presets inspired by https://gsapify.com/gsap-text-animations/#text-animation-collection
 * Default: Staggered Letters — plays only when the title enters the viewport.
 */
(function initTextAnimations() {
  const STORAGE_KEY = "ticketsThemeOptions";
  const DEFAULT_PRESET = "staggered-letters";
  const SELECTOR_HERO = ".hero-v2-text.is-active h1";
  const SELECTOR_CAROUSEL =
    "#homeSections .section-header .heading-icon h2, .categories-section .section-header h2";

  const PRESETS = {
    "staggered-letters": {
      label: "Staggered Letters",
      split: "chars",
      from: { y: 50, opacity: 0, stagger: 0.03, duration: 0.6, ease: "back.out(1.7)" },
    },
    "fade-in": {
      label: "Fade-In Effect",
      split: "none",
      from: { opacity: 0, y: 30, duration: 1, ease: "power2.out" },
    },
    "scale-up": {
      label: "Scale-Up Effect",
      split: "none",
      from: { scale: 0, opacity: 0, duration: 0.8, ease: "back.out(1.7)" },
    },
    "rotate-in": {
      label: "Rotate-In Effect",
      split: "none",
      from: {
        rotation: -90,
        opacity: 0,
        transformOrigin: "right bottom",
        duration: 1,
        ease: "power3.out",
      },
    },
    "slide-from-left": {
      label: "Slide From Left",
      split: "none",
      from: { x: -120, opacity: 0, duration: 1, ease: "power2.out" },
    },
    "fade-up-words": {
      label: "Fade Up Words",
      split: "words",
      from: { y: 40, opacity: 0, stagger: 0.12, duration: 0.8, ease: "power2.out" },
    },
    "blur-in": {
      label: "Blur In",
      split: "none",
      from: { opacity: 0, filter: "blur(20px)", y: 20, duration: 1, ease: "power2.out" },
    },
    none: {
      label: "ללא אנימציה",
      split: "none",
      from: null,
    },
  };

  window.TICKETS_TEXT_ANIMATION_PRESETS = PRESETS;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const tracked = new WeakMap();
  let observers = [];
  let currentPreset = DEFAULT_PRESET;
  let ready = false;

  function readPreset() {
    const fromDom = document.body?.dataset?.textAnimation;
    if (fromDom && PRESETS[fromDom]) return fromDom;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return DEFAULT_PRESET;
      const v = JSON.parse(raw)?.textAnimation;
      if (v && PRESETS[v]) return v;
    } catch {
      /* ignore */
    }
    return DEFAULT_PRESET;
  }

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

  function splitWords(el, text) {
    el.textContent = "";
    el.setAttribute("aria-label", text);
    const parts = text.split(/(\s+)/);
    const nodes = [];
    parts.forEach((part) => {
      if (!part) return;
      if (/^\s+$/.test(part)) {
        el.appendChild(document.createTextNode(part));
        return;
      }
      const span = document.createElement("span");
      span.className = "gsap-word";
      span.setAttribute("aria-hidden", "true");
      span.textContent = part;
      el.appendChild(span);
      nodes.push(span);
    });
    return nodes;
  }

  function buildTargets(el, preset) {
    const text = originalText(el);
    const keepPending = el.classList.contains("gsap-text-pending");
    restore(el, { keepPending });
    if (!text || !preset?.from) {
      el.classList.add("gsap-text-ready");
      return null;
    }
    if (preset.split === "chars") return splitChars(el, text);
    if (preset.split === "words") return splitWords(el, text);
    return el;
  }

  function presetFor() {
    return PRESETS[currentPreset] || PRESETS[DEFAULT_PRESET];
  }

  function play(el, { force = false } = {}) {
    if (!ready || !window.gsap || reduceMotion) {
      if (el) {
        restore(el);
        el.classList.add("gsap-text-ready");
      }
      return;
    }

    const preset = presetFor();
    let entry = tracked.get(el);
    if (!entry) {
      entry = { played: false, tween: null };
      tracked.set(el, entry);
    }
    if (entry.played && !force) return;

    if (!preset?.from) {
      restore(el);
      el.classList.add("gsap-text-ready");
      entry.played = true;
      return;
    }

    const targets = buildTargets(el, preset);
    if (!targets) return;

    el.classList.add("gsap-text-ready", "gsap-text-playing");
    killTween(el);

    entry.tween = window.gsap.from(targets, {
      ...preset.from,
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
    const preset = presetFor();
    if (!preset?.from || reduceMotion) {
      restore(el);
      el.classList.add("gsap-text-ready");
      return;
    }
    // Hide whole title until Scroll/IO plays gsap.from (avoids flash of full text)
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

    const preset = presetFor();
    if (!preset?.from) return;

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
    const hasSplit = el.querySelector(".gsap-char, .gsap-word");
    if (hasSplit) return originalText(el);
    const plain = (el.textContent || "").replace(/\s+/g, " ").trim();
    if (plain) el.dataset.gsapOriginal = plain;
    return originalText(el);
  }

  function refreshAll() {
    if (!ready) return;
    clearObservers();
    currentPreset = readPreset();
    document.body.dataset.textAnimation = currentPreset;

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

    // https://gsapify.com/gsap-text-animations/ — Wavy Baseline (loop)
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
      currentPreset = readPreset();
      document.body.dataset.textAnimation = currentPreset;
      refreshAll();
      syncPresaleBadgeWavy();
    });

    document.addEventListener("tickets:textAnimation", () => {
      refreshAll();
    });
    document.addEventListener("tickets:cardLayout", () => {
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
