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
    <svg class="hunt-banner__doll" viewBox="0 0 100 112" width="20" height="22" aria-hidden="true" focusable="false">
      <path d="M50 6C24 6 12 32 12 62c0 30 16 44 38 44s38-14 38-44C88 32 76 6 50 6Z" fill="#C6362F"/>
      <ellipse cx="50" cy="56" rx="29" ry="31" fill="#EFE3CC"/>
      <path d="M25 40c5-6 13-8 19-5" fill="none" stroke="#14100E" stroke-width="3.4" stroke-linecap="round"/>
      <path d="M75 40c-5-6-13-8-19-5" fill="none" stroke="#14100E" stroke-width="3.4" stroke-linecap="round"/>
      <circle cx="37" cy="54" r="13" fill="#EFE3CC" stroke="#14100E" stroke-width="2"/>
      <circle cx="63" cy="54" r="13" fill="#EFE3CC" stroke="#14100E" stroke-width="2"/>
      <circle cx="37" cy="54" r="10.5" fill="#14100E"/>
    </svg>
  `;

  function buildBanner() {
    if (HUNT_PAGE.test(document.body.className)) return '';
    return `
      <div class="hunt-banner" id="hunt-banner">
        <div class="hunt-banner__inner">
          ${DARUMA_MARK}
          <span>There's a scavenger hunt hidden in this site.</span>
          <span class="hunt-banner__long">Ten stops, two routes, a reward for everyone who finishes.</span>
          <a href="/climb.html" rel="nofollow">Start the hunt &rarr;</a>
        </div>
      </div>
    `;
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
    syncNavHeight();
    window.addEventListener('resize', syncNavHeight, { passive: true });
  });
})();
