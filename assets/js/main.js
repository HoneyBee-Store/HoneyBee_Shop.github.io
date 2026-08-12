/* ==========================================================================
   Abdullah Meshal — Portfolio
   Vanilla JS only. No build step, no dependencies beyond Bootstrap's bundle.
   ========================================================================== */
(function () {
  'use strict';

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------------------------------------------
     1. Theme toggle (light / dark, persisted in localStorage)
     The initial theme is applied by the inline script in <head>;
     here we only wire up the button and keep the icon in sync.
  --------------------------------------------------------------- */
  var themeToggle = document.getElementById('themeToggle');

  function currentTheme() {
    return document.documentElement.getAttribute('data-bs-theme') || 'light';
  }

  function syncToggleUI(theme) {
    if (!themeToggle) return;
    var icon = themeToggle.querySelector('i');
    var isDark = theme === 'dark';
    if (icon) icon.className = isDark ? 'bi bi-sun' : 'bi bi-moon-stars';
    themeToggle.setAttribute('aria-label', isDark ? 'Switch to light theme' : 'Switch to dark theme');
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-bs-theme', theme);
    // Only persist a deliberate choice, so the OS preference keeps working
    // for visitors who never touch the toggle.
    try { localStorage.setItem('theme', theme); } catch (e) { /* storage blocked */ }
    syncToggleUI(theme);
  }

  if (themeToggle) {
    syncToggleUI(currentTheme());
    themeToggle.addEventListener('click', function () {
      applyTheme(currentTheme() === 'dark' ? 'light' : 'dark');
    });
  }

  // Follow the OS theme until the visitor picks one explicitly.
  if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
      var stored = null;
      try { stored = localStorage.getItem('theme'); } catch (err) { /* storage blocked */ }
      if (stored) return;
      var theme = e.matches ? 'dark' : 'light';
      document.documentElement.setAttribute('data-bs-theme', theme);
      syncToggleUI(theme);
    });
  }

  /* ---------------------------------------------------------------
     2. Navbar: shadow on scroll + active section highlighting
  --------------------------------------------------------------- */
  var nav = document.getElementById('siteNav');
  var navLinks = Array.prototype.slice.call(
    document.querySelectorAll('.site-nav .nav-link[href^="#"]')
  );
  var sections = navLinks
    .map(function (link) { return document.querySelector(link.getAttribute('href')); })
    .filter(Boolean);

  function setActiveLink(id) {
    navLinks.forEach(function (link) {
      var isActive = link.getAttribute('href') === '#' + id;
      link.classList.toggle('active', isActive);
      if (isActive) {
        link.setAttribute('aria-current', 'true');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  }

  if ('IntersectionObserver' in window && sections.length) {
    var visible = new Map();

    var sectionObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          visible.set(entry.target.id, entry.intersectionRatio);
        } else {
          visible.delete(entry.target.id);
        }
      });

      // Pick the section closest to the top of the viewport among visible ones.
      var best = null;
      var bestTop = Infinity;
      visible.forEach(function (_ratio, id) {
        var el = document.getElementById(id);
        if (!el) return;
        var top = Math.abs(el.getBoundingClientRect().top);
        if (top < bestTop) { bestTop = top; best = id; }
      });

      if (best) setActiveLink(best);
    }, {
      rootMargin: '-35% 0px -50% 0px',
      threshold: [0, 0.25, 0.5, 1]
    });

    sections.forEach(function (section) { sectionObserver.observe(section); });
  }

  /* ---------------------------------------------------------------
     3. Back-to-top button + navbar scroll state
  --------------------------------------------------------------- */
  var backToTop = document.getElementById('backToTop');
  var ticking = false;

  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    if (nav) nav.classList.toggle('is-scrolled', y > 8);
    if (backToTop) backToTop.classList.toggle('is-visible', y > 500);
    ticking = false;
  }

  window.addEventListener('scroll', function () {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(onScroll);
    }
  }, { passive: true });
  onScroll();

  if (backToTop) {
    backToTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
      // Return focus to the top of the page for keyboard/screen-reader users.
      var brand = document.querySelector('.navbar-brand');
      if (brand) brand.focus({ preventScroll: true });
    });
  }

  /* ---------------------------------------------------------------
     4. Close the mobile menu after choosing a link
  --------------------------------------------------------------- */
  var collapseEl = document.getElementById('navLinks');
  if (collapseEl && window.bootstrap) {
    navLinks.forEach(function (link) {
      link.addEventListener('click', function () {
        if (collapseEl.classList.contains('show')) {
          bootstrap.Collapse.getOrCreateInstance(collapseEl).hide();
        }
      });
    });
  }

  /* ---------------------------------------------------------------
     5. Fade-in on scroll
  --------------------------------------------------------------- */
  var revealables = document.querySelectorAll('.reveal');

  if (!('IntersectionObserver' in window) || prefersReducedMotion) {
    revealables.forEach(function (el) { el.classList.add('is-visible'); });
  } else {
    var revealObserver = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -60px 0px', threshold: 0.08 });

    revealables.forEach(function (el) { revealObserver.observe(el); });
  }

  /* ---------------------------------------------------------------
     6. Contact form → mailto (no backend)
  --------------------------------------------------------------- */
  var form = document.getElementById('contactForm');
  var formStatus = document.getElementById('formStatus');
  var EMAIL = 'khaledehmide3@gmail.com';

  if (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      form.classList.add('was-validated');

      if (!form.checkValidity()) {
        if (formStatus) formStatus.textContent = 'Please complete the highlighted fields.';
        var firstInvalid = form.querySelector(':invalid');
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      var name = form.elements.name.value.trim();
      var email = form.elements.email.value.trim();
      var subject = form.elements.subject.value.trim();
      var message = form.elements.message.value.trim();

      var body = message + '\n\n—\n' + name + '\n' + email;
      var href = 'mailto:' + EMAIL +
        '?subject=' + encodeURIComponent(subject) +
        '&body=' + encodeURIComponent(body);

      window.location.href = href;

      if (formStatus) {
        formStatus.textContent = 'Opening your email app… if nothing happens, write to ' + EMAIL + '.';
      }
    });
  }

  /* ---------------------------------------------------------------
     7. Monogram fallback if the profile photo has not been added yet.
     Keeps the hero looking deliberate rather than broken.
  --------------------------------------------------------------- */
  var MONOGRAM = 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">' +
    '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">' +
    '<stop offset="0%" stop-color="#1e3a8a"/><stop offset="100%" stop-color="#3b82f6"/>' +
    '</linearGradient></defs>' +
    '<rect width="400" height="400" fill="url(#g)"/>' +
    '<text x="50%" y="50%" text-anchor="middle" dominant-baseline="central" ' +
    'font-family="system-ui, -apple-system, Segoe UI, sans-serif" font-size="150" ' +
    'font-weight="700" fill="#ffffff" letter-spacing="6">KE</text></svg>'
  );

  document.querySelectorAll('img').forEach(function (img) {
    img.addEventListener('error', function handleError() {
      img.removeEventListener('error', handleError);
      img.src = MONOGRAM;
    });
  });

  /* ---------------------------------------------------------------
     8. Footer year
  --------------------------------------------------------------- */
  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
})();
