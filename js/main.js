/* ============================================
   GREGAIREL.COM — Shared Nav, Footer & Utils
   ============================================ */

(function () {
  'use strict';

  const PAGES = [
    { href: '/index.html', label: 'Home', alt: '/' },
    { href: '/bio.html', label: 'Bio' },
    { href: '/ventures.html', label: 'Ventures' },
    { href: '/projects.html', label: 'Projects' },
    { href: '/adventures.html', label: 'Adventures' },
    { href: '/art.html', label: 'Art' },
    { href: '/media.html', label: 'Media' },
    { href: '/contact.html', label: 'Contact' },
  ];

  function isActive(page) {
    const path = window.location.pathname;
    if (path === page.href) return true;
    if (page.alt && path === page.alt) return true;
    if (path.endsWith(page.href)) return true;
    if (page.href === '/index.html' && (path === '/' || path === '' || path.endsWith('/'))) return true;
    return false;
  }

  // The banner promotes the climb, so it stays off the climb's own pages —
  // camps, certificates, the leaderboard and the decoys included.
  const HUNT_PAGE = /\bpage-(climb|camp|summited|triumph|leaderboard|decoy|404)\b/;

  // Self-contained Daruma, left eye inked. Fills are inline because this
  // banner runs on every page, including the ones that never load hunt.css.
  const DARUMA_MARK = `
    <svg class="hunt-banner__doll" viewBox="0 0 512 512" width="22" height="22" aria-hidden="true" focusable="false">
      <path fill="#EA5553" d="M456.972,138.767C428.238,62.138,358.88,0,255.999,0C153.122,0,83.759,62.138,55.026,138.767c-28.707,76.562-57.42,162.69-26.314,253.608C59.811,483.288,184.222,512,255.999,512s196.188-28.712,227.293-119.625C514.392,301.457,485.684,215.329,456.972,138.767z"/>
      <path fill="#FCE4C1" d="M387.588,113.646c-4.464-7.443-13.718-17.123-27.514-20.336c-30.56-7.121-77.698-4.785-104.075-4.785c-26.372,0-73.515-2.335-104.075,4.785c-13.791,3.213-23.05,12.893-27.514,20.336c-14.351,23.922-46.302,121.016-39.477,148.333c4.785,19.142,15.851,31.552,28.749,36.379c38.693,14.465,104.636,9.083,142.317,9.083s103.629,5.382,142.317-9.083c12.898-4.827,23.964-17.237,28.749-36.379C433.89,234.663,401.944,137.568,387.588,113.646z"/>
      <path fill="#F5E48F" d="M131.515,372.039c0-11.964,9.083-26.32,26.118-26.32c17.024,0,21.571,15.55,21.571,25.121c0,9.571-4.547,52.634,3.405,76.561c7.946,23.927-15.893,26.32-24.976,11.964C148.544,445.009,131.515,416.302,131.515,372.039z"/>
      <path fill="#F5E48F" d="M383.679,372.039c0-11.964-9.082-26.32-26.112-26.32c-17.029,0-21.571,15.55-21.571,25.121c0,9.571,4.542,52.634-3.41,76.561c-7.947,23.927,15.893,26.32,24.981,11.964C366.65,445.009,383.679,416.302,383.679,372.039z"/>
      <path fill="#EFCFA4" d="M177.942,247.628c-31.661,0-57.42-25.759-57.42-57.421c0-31.666,25.759-57.425,57.42-57.425c31.666,0,57.42,25.759,57.42,57.425C235.362,221.869,209.608,247.628,177.942,247.628z"/>
      <path fill="#FFFFFF" d="M221.011,190.208c0,23.782-19.282,43.064-43.069,43.064c-23.782,0-43.064-19.282-43.064-43.064c0-23.787,19.282-43.069,43.064-43.069C201.729,147.139,221.011,166.421,221.011,190.208z"/>
      <path fill="#EFCFA4" d="M334.055,247.628c31.666,0,57.42-25.759,57.42-57.421c0-31.666-25.754-57.425-57.42-57.425c-31.661,0-57.42,25.759-57.42,57.425C276.635,221.869,302.395,247.628,334.055,247.628z"/>
      <path fill="#FFFFFF" d="M290.991,190.208c0,23.782,19.282,43.064,43.064,43.064c23.787,0,43.064-19.282,43.064-43.064c0-23.787-19.277-43.069-43.064-43.069C310.273,147.139,290.991,166.421,290.991,190.208z"/>
      <circle cx="177.94" cy="190.21" r="30" fill="#40220F"/>
    </svg>
  `;

  // The banner alternates between the hunt pitch and the door to
  // G-Funk's Realm. Both messages live here so the rotation swaps
  // markup wholesale instead of patching text nodes.
  const COARSE_POINTER = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;

  const BANNER_MESSAGES = [
    `${DARUMA_MARK}
     <span>There's a scavenger hunt hidden in this site.</span>
     <a href="/climb.html" rel="nofollow">Start the hunt &rarr;</a>`,
    COARSE_POINTER
      ? `<span style="font-size:17px" aria-hidden="true">🕹️</span>
         <span style="letter-spacing:0.04em">Enter 90s mode: swipe &uarr; &uarr; &darr; &darr; &larr; &rarr; &larr; &rarr; then tap twice.</span>`
      : `<span style="font-size:17px" aria-hidden="true">🕹️</span>
         <span>Enter 90s mode with the Konami code.</span>
         <span class="hunt-banner__long" style="letter-spacing:0.08em">&uarr; &uarr; &darr; &darr; &larr; &rarr; &larr; &rarr; B A</span>`,
  ];

  function buildBanner() {
    if (HUNT_PAGE.test(document.body.className)) return '';
    const dots = BANNER_MESSAGES.map(
      (_, n) => `<button class="hunt-banner__dot${n === 0 ? ' hunt-banner__dot--on' : ''}" type="button" aria-label="Banner message ${n + 1}"></button>`
    ).join('');
    return `
      <div class="hunt-banner" id="hunt-banner">
        <div class="hunt-banner__inner" id="hunt-banner-inner">
          ${BANNER_MESSAGES[0]}
        </div>
        <div class="hunt-banner__dots" id="hunt-banner-dots">${dots}</div>
      </div>
    `;
  }

  function initBannerRotation() {
    const banner = document.getElementById('hunt-banner');
    const inner = document.getElementById('hunt-banner-inner');
    const dotsHost = document.getElementById('hunt-banner-dots');
    if (!banner || !inner || !dotsHost || BANNER_MESSAGES.length < 2) return;

    let i = 0;
    let timer = null;
    const dots = Array.prototype.slice.call(dotsHost.children);
    inner.style.transition = 'opacity 0.4s';

    function paint() {
      dots.forEach(function (d, n) { d.classList.toggle('hunt-banner__dot--on', n === i); });
    }
    function show(n) {
      i = (n + BANNER_MESSAGES.length) % BANNER_MESSAGES.length;
      inner.style.opacity = '0';
      window.setTimeout(function () {
        inner.innerHTML = BANNER_MESSAGES[i];
        inner.style.opacity = '1';
        paint();
      }, 420);
    }
    function schedule() {
      if (timer) window.clearInterval(timer);
      timer = window.setInterval(function () { show(i + 1); }, 9000);
    }

    dots.forEach(function (d, n) {
      d.addEventListener('click', function () { show(n); schedule(); });
    });

    // Swiping the banner pages through its messages — and stays out
    // of the Konami listener's way (stopPropagation), so the door
    // code gets entered on the page, never on its own hint.
    let sx = null;
    banner.addEventListener('touchstart', function (e) {
      sx = e.touches[0].clientX;
      e.stopPropagation();
    }, { passive: true });
    banner.addEventListener('touchend', function (e) {
      e.stopPropagation();
      if (sx === null) return;
      const dx = e.changedTouches[0].clientX - sx;
      sx = null;
      if (Math.abs(dx) > 30) { show(dx < 0 ? i + 1 : i - 1); schedule(); }
    }, { passive: true });

    schedule();
  }

  function buildNav() {
    const links = PAGES.map(
      (p) =>
        `<a href="${p.href}" class="nav__link${isActive(p) ? ' nav__link--active' : ''}">${p.label}</a>`
    ).join('');

    return `
      <nav class="nav" id="nav" role="navigation" aria-label="Main navigation">
        <div class="nav__inner">
          <a href="/index.html" class="nav__logo">Greg Airel</a>
          <div class="nav__links" id="nav-links">${links}</div>
          <button class="nav__toggle" id="nav-toggle" aria-label="Toggle menu" aria-expanded="false">
            <span></span><span></span><span></span>
          </button>
        </div>
        ${buildBanner()}
      </nav>
    `;
  }

  // Every page offset is calc()'d off --nav-height, so growing the fixed
  // block means measuring it once and letting the rest follow.
  function syncNavHeight() {
    const nav = document.getElementById('nav');
    if (!nav) return;
    const h = Math.round(nav.getBoundingClientRect().height);
    if (h > 0) document.documentElement.style.setProperty('--nav-height', h + 'px');
  }

  function buildFooter() {
    const year = new Date().getFullYear();
    const links = PAGES.filter((p) => p.label !== 'Home')
      .map((p) => `<a href="${p.href}" class="footer__link">${p.label}</a>`)
      .join('');

    return `
      <div class="footer">
        <div class="footer__inner">
          <div class="footer__top">
            <div class="footer__brand">Greg Airel</div>
            <div class="footer__links">${links}</div>
          </div>
          <div class="footer__bottom">
            <span>&copy; ${year} Greg Airel. All rights reserved.</span>
            <span class="flux">Always in flux</span>
          </div>
        </div>
      </div>
    `;
  }

  function initMobileMenu() {
    const toggle = document.getElementById('nav-toggle');
    const links = document.getElementById('nav-links');
    if (!toggle || !links) return;

    toggle.addEventListener('click', function () {
      const open = links.classList.toggle('nav__links--open');
      toggle.classList.toggle('nav__toggle--active');
      toggle.setAttribute('aria-expanded', open);
    });

    links.querySelectorAll('.nav__link').forEach(function (link) {
      link.addEventListener('click', function () {
        links.classList.remove('nav__links--open');
        toggle.classList.remove('nav__toggle--active');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // Hairline under the nav only once the page has moved.
  function initNavScroll() {
    const nav = document.getElementById('nav');
    if (!nav) return;
    const onScroll = function () {
      nav.classList.toggle('nav--scrolled', window.scrollY > 24);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  function initReveal() {
    const targets = document.querySelectorAll('.reveal');
    if (!targets.length || !('IntersectionObserver' in window)) {
      targets.forEach(function (el) { el.classList.add('reveal--in'); });
      return;
    }
    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal--in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    targets.forEach(function (el, i) {
      el.style.transitionDelay = (i % 4) * 70 + 'ms';
      io.observe(el);
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    var navEl = document.getElementById('site-nav');
    var footerEl = document.getElementById('site-footer');

    if (navEl) navEl.innerHTML = buildNav();
    if (footerEl) footerEl.innerHTML = buildFooter();

    initMobileMenu();
    initNavScroll();
    initReveal();
    initBannerRotation();
    syncNavHeight();
    window.addEventListener('resize', syncNavHeight, { passive: true });
  });

  // == G-Funk's Realm ==========================================
  // ↑ ↑ ↓ ↓ ← → ← → B A drops you into the 1998 version of this
  // site. Keyboard on desktop; on touch screens the arrows are
  // swipes and B A is two taps. Some doors need a code.
  //
  // Analytics: gfunk_attempt fires once per page once someone gets
  // five steps deep (↑↑↓↓← is nobody's accident), gfunk_realm fires
  // on the full code. Attempts without entries = people who knew
  // there was a code but not which one.
  (function () {
    var CODE = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
                'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
    var at = 0;
    var attemptLogged = false;
    function log(name, params) {
      if (typeof gtag === 'function') gtag('event', name, params || {});
    }
    function feed(k) {
      if (k === CODE[at]) { at++; } else { at = (k === CODE[0]) ? 1 : 0; }
      if (at === 5 && !attemptLogged) {
        attemptLogged = true;
        log('gfunk_attempt', { entered_from: window.location.pathname });
      }
      if (at === CODE.length) {
        at = 0;
        log('gfunk_realm', { entered_from: window.location.pathname });
        window.location.href = '/realm.html';
      }
    }
    document.addEventListener('keydown', function (e) {
      feed(e.key.length === 1 ? e.key.toLowerCase() : e.key);
    });
    // Touch path: a swipe is its arrow, a tap stands in for whichever
    // of B/A the sequence expects next. Scrolling feeds the machine
    // harmless noise — it just resets.
    var t0 = null;
    document.addEventListener('touchstart', function (e) {
      if (e.touches.length === 1) t0 = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }, { passive: true });
    document.addEventListener('touchend', function (e) {
      if (!t0) return;
      var dx = e.changedTouches[0].clientX - t0.x;
      var dy = e.changedTouches[0].clientY - t0.y;
      t0 = null;
      if (Math.abs(dx) < 24 && Math.abs(dy) < 24) {
        feed(CODE[at] === 'b' || CODE[at] === 'a' ? CODE[at] : 'tap');
      } else if (Math.abs(dy) > Math.abs(dx)) {
        feed(dy < 0 ? 'ArrowUp' : 'ArrowDown');
      } else {
        feed(dx < 0 ? 'ArrowLeft' : 'ArrowRight');
      }
    }, { passive: true });
  })();
})();
