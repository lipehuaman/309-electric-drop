/* =====================================================================
   309 TECHNOLOGY · MAIN
   Vanilla JS. Progressive enhancement: the page is fully readable with
   JS disabled; this layer adds the boot sequence, data-driven cards,
   the command terminal, scroll reveals, theme/lang toggles and form UX.
   ===================================================================== */
(function () {
  "use strict";

  var REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---- safe persistence (never throws -> no console errors anywhere) ---- */
  var store = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };

  /* =================================================================
     i18n
     ================================================================= */
  var lang = store.get("lang") || (navigator.language || "en").slice(0, 2);
  if (lang !== "es") lang = "en";

  function t(key) {
    var dict = window.I18N[lang] || window.I18N.en;
    return dict[key] != null ? dict[key] : (window.I18N.en[key] != null ? window.I18N.en[key] : key);
  }

  function applyLang() {
    document.documentElement.lang = lang;
    $$("[data-i18n]").forEach(function (el) { el.textContent = t(el.getAttribute("data-i18n")); });
    $$("[data-i18n-ph]").forEach(function (el) { el.setAttribute("placeholder", t(el.getAttribute("data-i18n-ph"))); });
    $$("[data-i18n-aria]").forEach(function (el) { el.setAttribute("aria-label", t(el.getAttribute("data-i18n-aria"))); });
    var langBtn = $("[data-lang-toggle] .toggle__text");
    if (langBtn) langBtn.textContent = t("nav.lang");
  }

  /* =================================================================
     THEME (negative = dark default; positive = light)
     ================================================================= */
  var theme = store.get("theme") || "negative";
  function applyTheme() {
    document.documentElement.setAttribute("data-theme", theme);
    var btn = $("[data-theme-toggle]");
    if (btn) btn.setAttribute("aria-pressed", String(theme === "positive"));
  }

  /* =================================================================
     PRODUCT CARDS (rendered from window.PRODUCTS)
     ================================================================= */
  function renderProducts() {
    var grid = $("#merch-grid");
    if (!grid || !window.PRODUCTS) return;
    var frag = document.createDocumentFragment();

    window.PRODUCTS.forEach(function (p) {
      var out = p.status === "soldout";
      var card = document.createElement("article");
      card.className = "card";
      card.setAttribute("data-inview", "");

      var sizesHtml = p.sizes.map(function (s) {
        return '<button type="button" class="size" aria-pressed="false"' +
               (out ? " disabled" : "") +
               ' data-size="' + s + '" aria-label="' + t("card.size") + ' ' + s + '">' + s + '</button>';
      }).join("");

      card.innerHTML =
        '<div class="card__media" style="--gb:' + p.body + ';--gi:' + p.ink + '">' +
          '<span class="card__tag' + (out ? " card__tag--out" : "") + '" data-i18n="' + p.tagKey + '">' + t(p.tagKey) + '</span>' +
          '<svg class="card__garment" viewBox="0 0 100 130" aria-hidden="true"><use href="#garment-' + p.garment + '"></use></svg>' +
          '<svg class="card__chest logo" viewBox="0 0 2178 684" role="img" aria-label="309 logo on ' + p.name + '"><use href="#logo-309"></use></svg>' +
        '</div>' +
        '<div class="card__body">' +
          '<div class="card__head">' +
            '<div><h3 class="card__name">' + p.name + '</h3>' +
            '<span class="card__edition">' + p.edition + '</span></div>' +
            '<span class="card__price">$' + p.price + '</span>' +
          '</div>' +
          '<div class="card__sizes" role="group" aria-label="' + t("card.size") + '">' + sizesHtml + '</div>' +
          '<button type="button" class="btn ' + (out ? "btn--ghost" : "btn--primary") + ' card__action" data-i18n="' +
            (out ? "card.notify" : "card.add") + '">' + t(out ? "card.notify" : "card.add") + '</button>' +
        '</div>';

      // size selection (single-select within the card)
      var sizeBtns = $$(".size", card);
      var picked = null;
      sizeBtns.forEach(function (b) {
        b.addEventListener("click", function () {
          sizeBtns.forEach(function (x) { x.setAttribute("aria-pressed", "false"); });
          b.setAttribute("aria-pressed", "true");
          picked = b.getAttribute("data-size");
        });
      });

      // action
      var action = $(".card__action", card);
      action.addEventListener("click", function () {
        if (out) { announce(t("card.notifyset") + " · " + p.name); return; }
        if (!picked) { announce(t("card.size") + ", " + p.name); flash(card.querySelector(".card__sizes")); return; }
        announce(t("card.added") + ": " + p.name + " (" + picked + ")");
      });

      frag.appendChild(card);
    });

    grid.appendChild(frag);
  }

  function flash(el) {
    if (!el || REDUCED) return;
    el.animate(
      [{ outline: "2px solid var(--accent)", outlineOffset: "4px" }, { outlineOffset: "10px", offset: 1 }],
      { duration: 420, easing: "ease-out" }
    );
  }

  /* =================================================================
     TOAST + ARIA live announcements
     ================================================================= */
  var toastTimer;
  function announce(msg) {
    var live = $("#live");
    if (live) live.textContent = msg;
    var toast = $("#toast");
    if (toast) {
      $("#toast-msg").textContent = msg;
      toast.setAttribute("data-show", "true");
      clearTimeout(toastTimer);
      toastTimer = setTimeout(function () { toast.setAttribute("data-show", "false"); }, 2800);
    }
  }

  /* =================================================================
     COMMAND TERMINAL ("waiting for your command")
     ================================================================= */
  var ROUTES = {
    drop: "#drop", "el drop": "#drop",
    manifesto: "#story", manifiesto: "#story",
    access: "#access", acceso: "#access",
    home: "#top", top: "#top", "309": "#top"
  };

  function setupTerminal() {
    var input = $("#term-input");
    var output = $("#term-output");
    if (!input || !output) return;
    output.textContent = t("hero.term.idle");

    function run(raw) {
      var cmd = (raw || "").trim().toLowerCase();
      if (!cmd) return;
      var target = ROUTES[cmd];
      if (target) {
        output.setAttribute("data-state", "ok");
        output.textContent = t("hero.term.go") + " " + cmd + " →";
        goTo(target);
      } else {
        output.setAttribute("data-state", "error");
        output.textContent = t("hero.term.unknown");
      }
    }

    input.addEventListener("keydown", function (e) {
      if (e.key === "Enter") { e.preventDefault(); run(input.value); input.value = ""; }
    });
    $$("[data-cmd]").forEach(function (chip) {
      chip.addEventListener("click", function () { run(chip.getAttribute("data-cmd")); });
    });
  }

  /* =================================================================
     SMOOTH SCROLL (respects reduced motion)
     ================================================================= */
  function goTo(sel) {
    var el = $(sel);
    if (!el) return;
    el.scrollIntoView({ behavior: REDUCED ? "auto" : "smooth", block: "start" });
    closeMenu();
  }
  function setupAnchors() {
    $$('a[href^="#"]').forEach(function (a) {
      a.addEventListener("click", function (e) {
        var id = a.getAttribute("href");
        if (id.length > 1 && $(id)) { e.preventDefault(); goTo(id); }
      });
    });
  }

  /* =================================================================
     NAV: scrolled state, active link, mobile menu
     ================================================================= */
  var header = $(".site-header");
  var menu = $("#nav-links");
  var burger = $("#nav-burger");

  function onScroll() {
    if (header) header.setAttribute("data-scrolled", String(window.scrollY > 24));
  }
  function closeMenu() {
    if (!menu || !burger) return;
    menu.setAttribute("data-open", "false");
    burger.setAttribute("aria-expanded", "false");
  }
  function setupMenu() {
    if (!burger) return;
    burger.addEventListener("click", function () {
      var open = burger.getAttribute("aria-expanded") === "true";
      burger.setAttribute("aria-expanded", String(!open));
      menu.setAttribute("data-open", String(!open));
    });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeMenu(); });
  }

  function setupActiveLink() {
    var links = $$(".nav__link");
    var map = {};
    links.forEach(function (l) { var id = l.getAttribute("href"); if (id && id[0] === "#") map[id.slice(1)] = l; });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          links.forEach(function (l) { l.setAttribute("aria-current", "false"); });
          var active = map[en.target.id];
          if (active) active.setAttribute("aria-current", "true");
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    ["story", "drop", "access"].forEach(function (id) { var s = $("#" + id); if (s) io.observe(s); });
  }

  /* =================================================================
     SCROLL REVEALS
     ================================================================= */
  function setupReveals() {
    var items = $$("[data-inview]");
    if (REDUCED || !("IntersectionObserver" in window)) {
      items.forEach(function (el) { el.classList.add("in-view"); });
      return;
    }
    // stagger siblings inside a grid
    $$("#merch-grid .card").forEach(function (c, i) { c.style.setProperty("--i", i); });
    var io = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in-view"); obs.unobserve(en.target); }
      });
    }, { threshold: 0.18 });
    items.forEach(function (el) { io.observe(el); });
  }

  /* =================================================================
     SIGNUP FORM (client-side validation + states + live region)
     ================================================================= */
  function setupForm() {
    var form = $("#access-form");
    if (!form) return;
    var field = $("#access-field");
    var input = $("#email");
    var status = $("#form-status");
    var btn = $("#access-submit");
    var EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    function setStatus(state, key) {
      status.setAttribute("data-state", state);
      status.textContent = t(key);
    }
    setStatus("idle", "access.idle");

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var val = input.value.trim();
      if (!val) { invalid("access.empty"); return; }
      if (!EMAIL.test(val)) { invalid("access.invalid"); return; }

      field.setAttribute("data-invalid", "false");
      input.setAttribute("aria-invalid", "false");
      btn.setAttribute("aria-disabled", "true");
      setStatus("loading", "access.loading");

      var delay = REDUCED ? 150 : 900;
      setTimeout(function () {
        btn.setAttribute("aria-disabled", "false");
        setStatus("success", "access.success");
        form.reset();
      }, delay);
    });

    function invalid(key) {
      field.setAttribute("data-invalid", "true");
      input.setAttribute("aria-invalid", "true");
      setStatus("error", key);
      input.focus();
    }

    input.addEventListener("input", function () {
      if (field.getAttribute("data-invalid") === "true" && EMAIL.test(input.value.trim())) {
        field.setAttribute("data-invalid", "false");
        input.setAttribute("aria-invalid", "false");
        setStatus("idle", "access.idle");
      }
    });
  }

  /* =================================================================
     TOGGLES wiring
     ================================================================= */
  function setupToggles() {
    var th = $("[data-theme-toggle]");
    if (th) th.addEventListener("click", function () {
      theme = theme === "negative" ? "positive" : "negative";
      store.set("theme", theme);
      applyTheme();
    });
    var lg = $("[data-lang-toggle]");
    if (lg) lg.addEventListener("click", function () {
      lang = lang === "en" ? "es" : "en";
      store.set("lang", lang);
      applyLang();
      // refresh dynamic strings inside cards/terminal
      var out = $("#term-output");
      if (out && out.getAttribute("data-state") !== "ok") out.textContent = t("hero.term.idle");
      scrambleRefresh();
    });
  }

  /* =================================================================
     TEXT SCRAMBLE (decode effect for secondary text)
     ================================================================= */
  var GLYPHS = "ABCDEFGHJKLMNPQRSTUVWXYZ0123456789/<>*#_[]%".split("");

  function scrambleTo(el, text) {
    text = (text == null ? "" : String(text));
    if (REDUCED) { el.textContent = text; return; }
    if (el._sti) { clearInterval(el._sti); el._sti = null; }
    var frame = 0;
    var settle = text.split("").map(function (ch, i) { return 3 + i + Math.floor(Math.random() * 6); });
    var max = settle.length ? Math.max.apply(null, settle) : 1;
    el._sti = setInterval(function () {
      var out = "";
      for (var i = 0; i < text.length; i++) {
        var ch = text[i];
        if (ch === " ") { out += " "; continue; }
        out += (frame >= settle[i]) ? ch : GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
      }
      el.textContent = out;
      frame++;
      if (frame > max) { clearInterval(el._sti); el._sti = null; el.textContent = text; }
    }, 30);
  }

  function inView(el) {
    var r = el.getBoundingClientRect();
    return r.top < window.innerHeight && r.bottom > 0;
  }

  // observe page scramble targets; decode on first view (loader excluded)
  function scrambleObserve() {
    var els = $$("[data-scramble]").filter(function (el) { return !el.closest(".loader"); });
    els.forEach(function (el) { if (el._starget == null) el._starget = el.textContent.trim(); });
    if (REDUCED || !("IntersectionObserver" in window)) {
      els.forEach(function (el) { el.textContent = el._starget; });
      return;
    }
    var io = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { scrambleTo(en.target, en.target._starget); obs.unobserve(en.target); }
      });
    }, { threshold: 0.4 });
    els.forEach(function (el) { io.observe(el); });
  }

  // replay after a language switch (text changed under the hood)
  function scrambleRefresh() {
    $$("[data-scramble]").forEach(function (el) {
      if (el.closest(".loader")) return;
      el._starget = el.textContent.trim();
      if (inView(el)) scrambleTo(el, el._starget);
    });
  }

  /* =================================================================
     PRELOADER (boot screen): count 000 -> 100, then wipe + reveal
     ================================================================= */
  function runLoader(done) {
    var loader = $("#loader");
    if (!loader) { done(); return; }
    var finished = false;
    document.body.style.overflow = "hidden";

    // decode the loader's own labels right away
    $$("[data-scramble]", loader).forEach(function (el) { scrambleTo(el, el.textContent.trim()); });

    var countEl = $("#loader-count");
    var fillEl = $("#loader-fill");
    var dur = REDUCED ? 200 : 1700;
    var start = performance.now();

    function finish() {
      if (finished) return;
      finished = true;
      document.body.style.overflow = "";
      loader.classList.add("loader--done");
      done();
      var remove = function () { if (loader && loader.parentNode) loader.parentNode.removeChild(loader); };
      if (REDUCED) remove(); else setTimeout(remove, 760);
    }

    function step(now) {
      var p = Math.min(1, (now - start) / dur);
      var eased = 1 - Math.pow(1 - p, 2);
      var pct = Math.round(eased * 100);
      if (countEl) countEl.textContent = ("00" + pct).slice(-3);
      if (fillEl) fillEl.style.right = (100 - pct) + "%";
      if (p < 1) requestAnimationFrame(step); else finish();
    }
    requestAnimationFrame(step);
    setTimeout(finish, 4000); // safety: never trap the user
  }

  /* =================================================================
     BOOT
     ================================================================= */
  function reveal() {
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        document.body.classList.add("is-booted");
        scrambleObserve();
      });
    });
  }

  function boot() {
    applyTheme();
    applyLang();
    renderProducts();
    setupTerminal();
    setupAnchors();
    setupMenu();
    setupActiveLink();
    setupForm();
    setupToggles();
    setupReveals();

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    // boot screen first, then the orchestrated reveal
    runLoader(reveal);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else { boot(); }
})();
