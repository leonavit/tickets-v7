/**
 * Small site-access login gate.
 * Demo user: leon / 1234
 */
(function initSiteLogin() {
  const STORAGE_KEY = "ticketsSiteAuthV1";
  const USER = "leon";
  const PASS = "1234";

  const gate = document.getElementById("siteLoginGate");
  const form = document.getElementById("siteLoginForm");
  const userInput = document.getElementById("siteLoginUser");
  const passInput = document.getElementById("siteLoginPass");
  const errorEl = document.getElementById("siteLoginError");
  if (!gate || !form || !userInput || !passInput) return;

  function isAuthed() {
    try {
      return sessionStorage.getItem(STORAGE_KEY) === "1";
    } catch {
      return false;
    }
  }

  function unlock() {
    try {
      sessionStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* ignore */
    }
    document.body.classList.remove("site-locked");
    if (errorEl) errorEl.hidden = true;
  }

  function lock() {
    document.body.classList.add("site-locked");
  }

  if (isAuthed()) {
    unlock();
  } else {
    lock();
    window.setTimeout(() => userInput.focus(), 50);
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const user = String(userInput.value || "").trim();
    const pass = String(passInput.value || "");
    if (user === USER && pass === PASS) {
      unlock();
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
})();
