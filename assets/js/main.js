/* ==========================================================================
   HoneyBee Shop — Product showcase
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
     6. Footer year
  --------------------------------------------------------------- */
  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  /* ---------------------------------------------------------------
     7. Image lightbox — click a product photo or stock thumbnail
     to view it full-size in a popup.
  --------------------------------------------------------------- */
  var lightbox = document.getElementById('imageLightbox');
  var lightboxImg = document.getElementById('lightboxImg');
  var lightboxLabel = document.getElementById('lightboxLabel');

  if (lightbox && lightboxImg && window.bootstrap) {
    var lightboxInstance = bootstrap.Modal.getOrCreateInstance(lightbox);
    document.querySelectorAll('.product-img-wrap img, .stock-thumb, .about-img').forEach(function (img) {
      img.addEventListener('click', function () {
        lightboxImg.src = img.currentSrc || img.src;
        lightboxImg.alt = img.alt || '';
        if (lightboxLabel) lightboxLabel.textContent = img.alt || '';
        lightboxInstance.show();
      });
    });
  }

  /* ---------------------------------------------------------------
     8. Stock status, live from a published Google Sheet CSV.
     Sheet row 1 -> stock table row 1, row 2 -> row 2, and so on, by
     POSITION (not by name). The sheet owner edits the sheet any time;
     this just re-reads it on every page load. If the fetch fails for
     any reason, the static fallback already in the HTML stays as-is.
  --------------------------------------------------------------- */
  var STOCK_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vR-h_ML3tYQUjEUHcDNQCudQjS15svCFAaR0-9g1LegaZij19T03bMjx7DUTSONiCJMzf7aPKGSNhy-/pub?output=csv';

  function parseCsv(text) {
    var rows = [];
    var row = [];
    var field = '';
    var inQuotes = false;

    for (var i = 0; i < text.length; i++) {
      var c = text[i];
      if (inQuotes) {
        if (c === '"') {
          if (text[i + 1] === '"') { field += '"'; i++; }
          else { inQuotes = false; }
        } else {
          field += c;
        }
      } else if (c === '"') {
        inQuotes = true;
      } else if (c === ',') {
        row.push(field); field = '';
      } else if (c === '\n' || c === '\r') {
        if (c === '\r' && text[i + 1] === '\n') i++;
        row.push(field); field = '';
        if (row.length > 1 || row[0] !== '') rows.push(row);
        row = [];
      } else {
        field += c;
      }
    }
    if (field !== '' || row.length) { row.push(field); rows.push(row); }
    return rows;
  }

  function applyStockData(rows) {
    var trs = document.querySelectorAll('#stock tbody tr');

    // A row only counts as real data if its status cell mentions "stock" —
    // this skips a header row ("Product,Status") or any stray blank line.
    var dataRows = rows.filter(function (r) {
      return (r[1] || '').toLowerCase().indexOf('stock') !== -1;
    });

    dataRows.forEach(function (r, i) {
      if (i >= trs.length) return;
      var name = (r[0] || '').trim();
      var status = (r[1] || '').trim().toLowerCase();
      var isOut = status.indexOf('out') !== -1;

      var nameCell = trs[i].querySelector('.stock-name');
      if (nameCell && name) nameCell.textContent = name;

      var badge = trs[i].querySelector('.badge');
      if (badge) {
        badge.textContent = isOut ? 'Out of Stock' : 'In Stock';
        badge.classList.toggle('status-out', isOut);
        badge.classList.toggle('status-in', !isOut);
      }
    });
  }

  if (STOCK_CSV_URL && document.getElementById('stock')) {
    fetch(STOCK_CSV_URL, { cache: 'no-store' })
      .then(function (res) {
        if (!res.ok) throw new Error('Stock sheet request failed: ' + res.status);
        return res.text();
      })
      .then(function (text) { applyStockData(parseCsv(text)); })
      .catch(function (err) {
        console.warn('Could not load live stock status, showing default.', err);
      });
  }
})();
