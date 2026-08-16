/**
 * Category card Lottie icons.
 * trigger=in, state=in-dynamic
 * colors primary:#1d104a secondary:#e72173 (baked into JSON)
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

  function boot() {
    if (!window.lottie) return;

    const nodes = [...document.querySelectorAll("[data-category-lottie-key]")];
    if (!nodes.length) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const homePlayers = [];

    const io =
      "IntersectionObserver" in window
        ? new IntersectionObserver(
            (entries) => {
              entries.forEach((entry) => {
                const anim = entry.target._categoryLottie;
                if (!anim || entry.target.dataset.lottiePlayed) return;
                if (entry.isIntersecting) {
                  entry.target.dataset.lottiePlayed = "1";
                  anim.goToAndPlay(0, true);
                  io.unobserve(entry.target);
                }
              });
            },
            { threshold: 0.35 }
          )
        : null;

    nodes.forEach((el) => {
      if (el.dataset.lottieBound) return;
      el.dataset.lottieBound = "1";

      const animationData = getData(el.getAttribute("data-category-lottie-key"));
      if (!animationData) return;

      const anim = window.lottie.loadAnimation({
        container: el,
        renderer: "svg",
        loop: false,
        autoplay: false,
        animationData: JSON.parse(JSON.stringify(animationData)),
        rendererSettings: {
          preserveAspectRatio: "xMidYMid meet",
          progressiveLoad: false,
        },
      });

      el._categoryLottie = anim;

      anim.addEventListener("DOMLoaded", () => {
        anim.goToAndStop(0, true);
      });
      anim.addEventListener("complete", () => {
        try {
          anim.goToAndStop(Math.max(0, anim.totalFrames - 1), true);
        } catch (_) {}
      });

      const play = () => {
        anim.stop();
        anim.goToAndPlay(0, true);
      };

      const card = el.closest(".category-card");
      const isClone = !!(card && card.classList.contains("is-clone"));
      if (card) {
        card.addEventListener("pointerenter", play);
        card.addEventListener("focusin", play);
        if (card.closest(".categories-section") && !isClone) {
          homePlayers.push({ el, play, card });
        }
      }

      const megaCard = el.closest(".mega-cat-card");
      if (megaCard) {
        megaCard.addEventListener("pointerenter", play);
        megaCard.addEventListener("focusin", play);
        // mega icons are off-screen until open — skip IO autoplay
        el.dataset.lottiePlayed = "1";
      } else if (io && !isClone) {
        io.observe(el);
      } else if (!isClone) {
        requestAnimationFrame(play);
      } else {
        try {
          anim.goToAndStop(0, true);
        } catch (_) {}
        el.dataset.lottiePlayed = "1";
      }
    });

    const megaItem = document.querySelector(".nav-item.has-mega");
    if (megaItem) {
      const playMegaIcons = () => {
        megaItem.querySelectorAll(".mega-cat-card .category-lottie").forEach((el) => {
          const anim = el._categoryLottie;
          if (!anim) return;
          anim.stop();
          anim.goToAndPlay(0, true);
        });
      };
      megaItem.addEventListener("pointerenter", playMegaIcons);
      megaItem.addEventListener("focusin", playMegaIcons);
    }

    // Home category cubes: every 5s play a random icon — desktop only
    const desktopCats = window.matchMedia("(min-width:961px)");
    if (!reduceMotion && homePlayers.length && desktopCats.matches) {
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
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
