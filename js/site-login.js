/**
 * Small site-access login gate.
 * Demo user: leon / 1234
 * Can be disabled from site settings (ticketsThemeOptions.disableSiteLogin).
 */
(function initSiteLogin() {
  const STORAGE_KEY = "ticketsSiteAuthV1";
  const THEME_KEY = "ticketsThemeOptions";
  const USER = "leon";
  const PASS = "1234";

  const gate = document.getElementById("siteLoginGate");
  const form = document.getElementById("siteLoginForm");
  const userInput = document.getElementById("siteLoginUser");
  const passInput = document.getElementById("siteLoginPass");
  const errorEl = document.getElementById("siteLoginError");
  if (!gate || !form || !userInput || !passInput) return;

  function isLoginDisabled() {
    try {
      const raw = localStorage.getItem(THEME_KEY);
      if (!raw) return true; // default: gate off for all visitors
      const parsed = JSON.parse(raw);
      if (parsed && Object.prototype.hasOwnProperty.call(parsed, "disableSiteLogin")) {
        return !!parsed.disableSiteLogin;
      }
      return true;
    } catch {
      return true;
    }
  }

  function isAuthed() {
    try {
      return sessionStorage.getItem(STORAGE_KEY) === "1";
    } catch {
      return false;
    }
  }

  function unlock() {
    document.documentElement.classList.add("site-auth-ok");
    document.body.classList.remove("site-locked");
    if (errorEl) errorEl.hidden = true;
  }

  function unlockAndRemember() {
    try {
      sessionStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* ignore */
    }
    unlock();
  }

  function lock() {
    document.documentElement.classList.remove("site-auth-ok");
    document.body.classList.add("site-locked");
  }

  function applyGate() {
    if (isLoginDisabled() || isAuthed()) {
      unlock();
      if (isLoginDisabled()) {
        /* keep session optional; gate stays off while setting is on */
      }
      return;
    }
    lock();
    window.setTimeout(() => {
      try {
        userInput.focus();
      } catch {
        /* ignore */
      }
    }, 50);
  }

  window.applySiteLoginGate = applyGate;

  applyGate();

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (isLoginDisabled()) {
      unlock();
      return;
    }
    const user = String(userInput.value || "").trim();
    const pass = String(passInput.value || "");
    if (user === USER && pass === PASS) {
      unlockAndRemember();
      return;
    }
    if (errorEl) errorEl.hidden = false;
    passInput.value = "";
    passInput.focus();
  });

  userInput.addEventListener("input", () => {
    if (errorEl) errorEl.hidden = true;
  });
  passInput.addEventListener("input", () => {
    if (errorEl) errorEl.hidden = true;
  });

  document.addEventListener("tickets:siteLoginSetting", applyGate);
})();
