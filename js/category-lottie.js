/**
 * Category card Lottie icons.
 * Frame 0 is fully trimmed (invisible) — rest on the last frame so icons always show.
 */
(function initCategoryLotties() {
  function getData(key) {
    const map = {
      music: "CATEGORY_LOTTIE_MUSIC",
      standup: "CATEGORY_LOTTIE_STANDUP",
      culture: "CATEGORY_LOTTIE_CULTURE",
      sports: "CATEGORY_LOTTIE_SPORTS",
      kids: "CATEGORY_LOTTIE_KIDS",
    };
    const globalName = map[key] || map.music;
    return window[globalName] || null;
  }

  function shuffle(list) {
    const arr = list.slice();
    for (let i = arr.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = arr[i];
      arr[i] = arr[j];
      arr[j] = tmp;
    }
    return arr;
  }

  function showRestFrame(anim) {
    try {
      const last = Math.max(0, (anim.totalFrames || 1) - 1);
      anim.goToAndStop(last, true);
    } catch (_) {}
  }

  function playAnim(anim) {
    if (!anim) return;
    try {
      anim.stop();
      anim.goToAndPlay(0, true);
    } catch (_) {}
  }

  function isLottiePurple(k) {
    if (!Array.isArray(k) || k.length < 3) return false;
    const [r, g, b] = k;
    return r < 0.2 && g < 0.15 && b > 0.2 && b < 0.4;
  }

  function recolorLottiePurpleToWhite(data) {
    function walk(node) {
      if (!node || typeof node !== "object") return;
      if (Array.isArray(node)) {
        node.forEach(walk);
        return;
      }
      if (node.c && typeof node.c === "object" && node.c.a === 0 && isLottiePurple(node.c.k)) {
        node.c.k = [1, 1, 1, node.c.k[3] ?? 1];
      }
      Object.values(node).forEach(walk);
    }
    walk(data);
    return data;
  }

  function bindNode(el, io, homePlayers) {
    if (!el || el.dataset.lottieBound === "1") return;
    if (!window.lottie) return;

    const animationData = getData(el.getAttribute("data-category-lottie-key"));
    if (!animationData) return;

    let data = JSON.parse(JSON.stringify(animationData));
    if (el.closest(".categories-section")) {
      data = recolorLottiePurpleToWhite(data);
    }

    el.dataset.lottieBound = "1";
    el.innerHTML = "";

    const anim = window.lottie.loadAnimation({
      container: el,
      renderer: "svg",
      loop: false,
      autoplay: false,
      animationData: data,
      rendererSettings: {
        preserveAspectRatio: "xMidYMid meet",
        progressiveLoad: false,
      },
    });

    el._categoryLottie = anim;

    anim.addEventListener("DOMLoaded", () => {
      showRestFrame(anim);
    });
    anim.addEventListener("complete", () => {
      showRestFrame(anim);
    });

    const play = () => playAnim(anim);

    const card = el.closest(".category-card");
    const isClone = !!(card && card.classList.contains("is-clone"));
    if (card) {
      card.addEventListener("pointerenter", play);
      card.addEventListener("focusin", play);
      if (card.closest(".categories-section") && !isClone && homePlayers) {
        homePlayers.push({ el, play, card });
      }
    }

    const megaCard = el.closest(".mega-cat-card");
    if (megaCard) {
      megaCard.addEventListener("pointerenter", play);
      megaCard.addEventListener("focusin", play);
      el.dataset.lottiePlayed = "1";
      showRestFrame(anim);
    } else if (io) {
      io.observe(el);
    } else {
      requestAnimationFrame(() => showRestFrame(anim));
    }
  }

  function ensureIo() {
    if (!("IntersectionObserver" in window)) return null;
    return new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const anim = entry.target._categoryLottie;
          if (!anim) return;
          if (entry.isIntersecting) {
            if (!entry.target.dataset.lottiePlayed) {
              entry.target.dataset.lottiePlayed = "1";
              playAnim(anim);
            } else {
              showRestFrame(anim);
            }
          }
        });
      },
      { threshold: 0.2, rootMargin: "40px 0px" }
    );
  }

  let sharedIo = null;
  let desktopTickerStarted = false;

  function refreshCategoryLotties() {
    if (!window.lottie) return;
    const homePlayers = [];
    if (!sharedIo) sharedIo = ensureIo();

    const nodes = [...document.querySelectorAll("[data-category-lottie-key]")];
    nodes.forEach((el) => bindNode(el, sharedIo, homePlayers));

    nodes.forEach((el) => {
      const anim = el._categoryLottie;
      if (!anim || !el.querySelector("svg")) return;
      if (!el.dataset.lottiePlayed) showRestFrame(anim);
    });

    document.querySelectorAll(".categories-section .category-card").forEach((card) => {
      if (card.classList.contains("is-clone")) return;
      const lord = card.querySelector(".category-lottie lord-icon");
      if (!lord) return;
      const play = () => {
        try {
          if (lord.playerInstance) lord.playerInstance.playFromBeginning();
          else if (typeof lord.play === "function") lord.play();
        } catch (_) {}
      };
      homePlayers.push({ el: lord, play, card });
    });

    startDesktopTicker(homePlayers);
  }

  function startDesktopTicker(homePlayers) {
    if (desktopTickerStarted) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const desktopCats = window.matchMedia("(min-width:961px)");
    if (reduceMotion || !homePlayers.length || !desktopCats.matches) return;
    desktopTickerStarted = true;

    const section = document.querySelector(".categories-section");
    let queue = shuffle(homePlayers);
    let cursor = 0;
    let timer = null;
    let sectionVisible = true;
    let lastPlayed = null;

    const nextQueue = () => {
      queue = shuffle(homePlayers);
      if (queue.length > 1 && lastPlayed && queue[0] === lastPlayed) {
        queue.push(queue.shift());
      }
      cursor = 0;
    };

    const tick = () => {
      if (document.hidden || !sectionVisible || !homePlayers.length) return;
      if (cursor >= queue.length) nextQueue();
      const item = queue[cursor];
      cursor += 1;
      if (!item) return;
      lastPlayed = item;
      item.play();
    };

    const start = () => {
      if (timer || document.hidden || !sectionVisible) return;
      timer = window.setInterval(tick, 5000);
    };

    const stop = () => {
      if (!timer) return;
      clearInterval(timer);
      timer = null;
    };

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) stop();
      else start();
    });

    if (section && "IntersectionObserver" in window) {
      const sectionIo = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            sectionVisible = entry.isIntersecting;
            if (sectionVisible) start();
            else stop();
          });
        },
        { threshold: 0.2 }
      );
      sectionIo.observe(section);
    } else {
      start();
    }

    window.setTimeout(() => {
      if (sectionVisible && !document.hidden) tick();
      start();
    }, 1200);
  }

  /** Play icon for a category card (used when carousel centers an item). */
  window.playCategoryCardLottie = function playCategoryCardLottie(card) {
    if (!card) return;
    const lord = card.querySelector(".category-lottie lord-icon");
    if (lord) {
      try {
        if (lord.playerInstance) lord.playerInstance.playFromBeginning();
        else if (typeof lord.play === "function") lord.play();
      } catch (_) {}
      return;
    }
    const el = card.querySelector("[data-category-lottie-key]");
    const anim = el && el._categoryLottie;
    if (!anim) return;
    el.dataset.lottiePlayed = "1";
    playAnim(anim);
  };

  window.refreshCategoryLotties = refreshCategoryLotties;

  function boot() {
    refreshCategoryLotties();

    const megaItem = document.querySelector(".nav-item.has-mega");
    if (megaItem) {
      const playMegaIcons = () => {
        megaItem.querySelectorAll(".mega-cat-card .category-lottie").forEach((el) => {
          playAnim(el._categoryLottie);
        });
      };
      megaItem.addEventListener("pointerenter", playMegaIcons);
      megaItem.addEventListener("focusin", playMegaIcons);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
