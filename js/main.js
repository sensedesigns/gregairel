/* ============================================
   GREGAIREL.COM — Shared Nav, Footer & Utils
   ============================================ */

(function () {
  'use strict';

  const PAGES = [
    { href: '/index.html', label: 'Home', alt: '/' },
    { href: '/adventures.html', label: 'Adventures' },
  ];

  function isActive(page) {
    const path = window.location.pathname;
    if (path === page.href) return true;
    if (page.alt && path === page.alt) return true;
    if (path.endsWith(page.href)) return true;
    if (page.href === '/index.html' && (path === '/' || path === '' || path.endsWith('/'))) return true;
    return false;
  }

  function buildNav() {
    const links = PAGES.map(
      (p) =>
        `<a href="${p.href}" class="nav__link${isActive(p) ? ' nav__link--active' : ''}">${p.label}</a>`
    ).join('');

    return `
      <nav class="nav" role="navigation" aria-label="Main navigation">
        <div class="nav__inner">
          <a href="/index.html" class="nav__logo">Greg Airel</a>
          <div class="nav__links" id="nav-links">${links}</div>
          <button class="nav__toggle" id="nav-toggle" aria-label="Toggle menu" aria-expanded="false">
            <span></span><span></span><span></span>
          </button>
        </div>
      </nav>
    `;
  }

  function buildFooter() {
    const year = new Date().getFullYear();
    const links = PAGES.map(
      (p) => `<a href="${p.href}" class="footer__link">${p.label}</a>`
    ).join('');

    return `
      <div class="footer">
        <div class="footer__inner">
          <div class="footer__top">
            <div class="footer__brand">Greg Airel</div>
            <div class="footer__links">${links}</div>
          </div>
          <div class="footer__bottom">
            &copy; ${year} Greg Airel. All rights reserved.
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

    // Close menu when a link is clicked
    links.querySelectorAll('.nav__link').forEach(function (link) {
      link.addEventListener('click', function () {
        links.classList.remove('nav__links--open');
        toggle.classList.remove('nav__toggle--active');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    var navEl = document.getElementById('site-nav');
    var footerEl = document.getElementById('site-footer');

    if (navEl) navEl.innerHTML = buildNav();
    if (footerEl) footerEl.innerHTML = buildFooter();

    initMobileMenu();
  });
})();
