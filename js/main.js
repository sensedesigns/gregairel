/* ============================================
   GREGAIREL.COM — Shared Nav, Footer & Utils
   ============================================ */

(function () {
  'use strict';

  const PAGES = [
    { href: '/index.html', label: 'Home', alt: '/' },
    { href: '/about.html', label: 'About' },
    { href: '/ventures.html', label: 'Ventures' },
    { href: '/projects.html', label: 'Projects' },
    { href: '/adventures.html', label: 'Adventures' },
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
      </nav>
    `;
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
  });
})();
