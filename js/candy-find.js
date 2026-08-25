/* ============================================================
   GREGAIREL.COM — Tres Dulces

   A private three-candy hunt. Invisible to everyone until the
   activation page (dulce.html) sets the flag; then three wrapped
   candies appear across the site, findable in any order. The
   third find reveals the way to the last stop.

   Fully standalone — shares nothing with the Daruma hunt except
   the panel CSS classes that hunt.css already ships. Never touch
   Hunt.* state from here.
   ============================================================ */

(function (window, document) {
  'use strict';

  var FLAG = 'val_hunt';   // '1' once dulce.html has been visited
  var KEY = 'val_candy';   // JSON array of found candy ids

  // Nudges point at whichever pages are still unfound.
  var PAGES = {
    1: 'the home page, where an eye stays open',
    2: 'a painting that got its name from a story',
    3: 'a trip that has not happened yet'
  };

  function read(k) { try { return window.localStorage.getItem(k); } catch (e) { return null; } }
  function write(k, v) { try { window.localStorage.setItem(k, v); } catch (e) {} }
  function found() {
    try {
      var a = JSON.parse(read(KEY) || '[]');
      return Array.isArray(a) ? a : [];
    } catch (e) { return []; }
  }
  function track(name, params) {
    if (typeof window.gtag === 'function') window.gtag('event', name, params || {});
  }

  /* ---------- the candy ---------- */

  // A wrapped hard candy in the tricolor — banded body, twisted ends.
  function candySvg() {
    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 64 40');
    svg.setAttribute('class', 'candy');
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', 'Un dulce');
    svg.setAttribute('width', '64');
    svg.setAttribute('height', '40');
    svg.innerHTML =
      // wrapper twists — neutral, so the tricolor reads as the candy body
      '<path d="M15 20 L4 12 L7 20 L4 28 Z" fill="#D8DCE6" opacity="0.9"/>' +
      '<path d="M49 20 L60 12 L57 20 L60 28 Z" fill="#D8DCE6" opacity="0.9"/>' +
      '<line x1="6.5" y1="15" x2="12" y2="19" stroke="#0a0d1c" stroke-width="1" opacity="0.25"/>' +
      '<line x1="6.5" y1="25" x2="12" y2="21" stroke="#0a0d1c" stroke-width="1" opacity="0.25"/>' +
      '<line x1="57.5" y1="15" x2="52" y2="19" stroke="#0a0d1c" stroke-width="1" opacity="0.25"/>' +
      '<line x1="57.5" y1="25" x2="52" y2="21" stroke="#0a0d1c" stroke-width="1" opacity="0.25"/>' +
      // body — the tricolor in three vertical bands
      '<ellipse cx="32" cy="20" rx="18" ry="13" fill="#2E5FA3"/>' +
      '<path d="M21.5 9.7 A18 13 0 0 0 21.5 30.3 L26.5 26.6 A12 8.7 0 0 1 26.5 13.4 Z" fill="#F4D03F"/>' +
      '<path d="M42.5 9.7 A18 13 0 0 1 42.5 30.3 L37.5 26.6 A12 8.7 0 0 0 37.5 13.4 Z" fill="#CF3A2B"/>' +
      // gloss — a soft arc, not an eye
      '<path d="M23 12.5 Q32 8.5 41 12.5" stroke="#FFFFFF" stroke-width="2" fill="none" opacity="0.3" stroke-linecap="round"/>';
    return svg;
  }

  // hunt.css is service-worker cached, so this page carries its own rules.
  function injectStyles() {
    var style = document.createElement('style');
    style.textContent =
      '.candy-find{display:inline-block;width:34px;vertical-align:middle;' +
      'background:none;border:0;padding:0;line-height:0;cursor:pointer;' +
      'transition:transform .25s ease}' +
      '.candy-find:hover{transform:translateY(-2px) scale(1.1)}' +
      '.candy-find:focus-visible{outline:2px solid var(--brass,#C6A15B);outline-offset:4px;border-radius:4px}' +
      '.candy-find .candy{width:100%;height:auto}' +
      '.candy-blank{font-family:ui-monospace,Menlo,Consolas,monospace;' +
      'letter-spacing:.12em;color:var(--brass,#C6A15B);white-space:nowrap}';
    document.head.appendChild(style);
  }

  /* ---------- the panel ---------- */

  function openPanel(n) {
    var got = found();
    var done = got.length >= 3;

    var wrap = document.createElement('div');
    wrap.className = 'daruma-panel';
    wrap.setAttribute('role', 'dialog');
    wrap.setAttribute('aria-modal', 'true');
    wrap.setAttribute('aria-label', 'Dulce encontrado');

    var card = document.createElement('div');
    card.className = 'daruma-panel__card';

    var icon = candySvg();
    icon.style.width = '110px';
    icon.style.height = 'auto';
    card.appendChild(icon);

    var count = document.createElement('p');
    count.className = 'label';
    count.style.marginTop = '1.2rem';
    count.textContent = got.length + ' of 3 dulces';
    card.appendChild(count);

    var body = document.createElement('p');
    body.style.marginTop = '1.4rem';

    if (done) {
      body.textContent =
        'While the hunt is coming to an end, the journey is just getting started. ' +
        'To finish your hunt, go to ';
      var url = document.createElement('span');
      url.className = 'candy-blank';
      url.textContent = 'gregairel.com/h______y.html';
      body.appendChild(url);
      var rest = document.createElement('span');
      rest.textContent =
        ' — all lowercase, and you’ll have to type it in yourself. ' +
        'It’s the place we first had dinner. It also happens to be named ' +
        'after a famous author.';
      body.appendChild(rest);
    } else {
      var remaining = [];
      for (var id in PAGES) {
        if (got.indexOf(parseInt(id, 10)) === -1) remaining.push(PAGES[id]);
      }
      body.textContent =
        (got.length === 1 ? 'One dulce down. ' : 'Two down, one to go. ') +
        'Still hidden: ' + remaining.join('; ') + '.';
    }
    card.appendChild(body);

    var close = document.createElement('button');
    close.className = 'btn btn--primary';
    close.style.marginTop = '1.6rem';
    close.type = 'button';
    close.textContent = done ? 'Nos vemos allá' : 'Seguimos';
    card.appendChild(close);

    wrap.appendChild(card);
    document.body.appendChild(wrap);

    function dismiss() {
      wrap.remove();
      document.removeEventListener('keydown', onKey);
    }
    function onKey(e) { if (e.key === 'Escape') dismiss(); }

    close.addEventListener('click', dismiss);
    wrap.addEventListener('click', function (e) { if (e.target === wrap) dismiss(); });
    document.addEventListener('keydown', onKey);
    close.focus();
  }

  /* ---------- mounting ---------- */

  function mount(host) {
    var n = parseInt(host.getAttribute('data-candy'), 10);
    if (!PAGES[n]) return;

    // Only ever visible after the activation page has been visited.
    if (read(FLAG) !== '1') return;

    var btn = document.createElement('button');
    btn.className = 'candy-find';
    btn.type = 'button';
    var already = found().indexOf(n) !== -1;
    btn.setAttribute('aria-label', already ? 'A candy, already found' : 'A wrapped candy');
    btn.appendChild(candySvg());

    btn.addEventListener('click', function () {
      var got = found();
      if (got.indexOf(n) === -1) {
        got.push(n);
        write(KEY, JSON.stringify(got));
        track('candy_found', { candy: n });
        if (got.length === 3) track('val_hunt_complete');
      }
      // Re-clicking a found candy re-opens the panel so the final
      // message can always be read again.
      openPanel(n);
    });

    host.appendChild(btn);
  }

  document.addEventListener('DOMContentLoaded', function () {
    if (read(FLAG) !== '1') return;
    injectStyles();
    Array.prototype.forEach.call(document.querySelectorAll('[data-candy]'), mount);
  });
})(window, document);
