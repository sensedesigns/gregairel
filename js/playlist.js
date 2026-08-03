/* ============================================================
   GREGAIREL.COM — Reading soundtrack

   Offers the reader a playlist a short while after they land.
   Shown once, then remembered — nobody wants this twice.
   ============================================================ */

(function (window, document) {
  'use strict';

  var DELAY = 30000;                 // let them actually start reading first
  var KEY = 'playlist_offer_seen';

  var LISTS = [
    {
      id: 'calm',
      name: 'Something calm',
      note: 'Recommended. Stays out of the way while you read.',
      url: 'https://open.spotify.com/playlist/3oDqW6beamRGygYA2nxkYW'
    },
    {
      id: 'rnb',
      name: 'R&B and soul',
      note: 'A bit more going on. Still comfortable.',
      url: 'https://open.spotify.com/playlist/78mjJBo6yVDV5ic4WxHkpr'
    },
    {
      id: 'alltime',
      name: 'My all-time list',
      note: 'No theme, no restraint, thirty years deep. If you are feeling adventurous.',
      url: 'https://open.spotify.com/playlist/4eOcwRoUvuxsAMFakc19ht'
    }
  ];

  function seen() {
    try { return window.localStorage.getItem(KEY) === '1'; } catch (e) { return false; }
  }
  function remember() {
    try { window.localStorage.setItem(KEY, '1'); } catch (e) {}
  }

  function track(name, params) {
    if (typeof window.gtag === 'function') window.gtag('event', name, params || {});
  }

  function build() {
    var wrap = document.createElement('div');
    wrap.className = 'soundtrack';
    wrap.setAttribute('role', 'dialog');
    wrap.setAttribute('aria-label', 'Reading soundtrack');

    var head = document.createElement('div');
    head.className = 'soundtrack__head';
    var title = document.createElement('strong');
    title.textContent = 'Something to read to?';
    var close = document.createElement('button');
    close.className = 'soundtrack__close';
    close.type = 'button';
    close.setAttribute('aria-label', 'No thanks');
    close.textContent = '×';
    head.appendChild(title);
    head.appendChild(close);
    wrap.appendChild(head);

    var blurb = document.createElement('p');
    blurb.className = 'soundtrack__blurb';
    blurb.textContent = 'Three of mine, on the house. Opens in Spotify.';
    wrap.appendChild(blurb);

    LISTS.forEach(function (p) {
      var a = document.createElement('a');
      a.className = 'soundtrack__pick';
      a.href = p.url;
      a.target = '_blank';
      a.rel = 'noopener';
      var n = document.createElement('span');
      n.className = 'soundtrack__name';
      n.textContent = p.name;
      var d = document.createElement('span');
      d.className = 'soundtrack__note';
      d.textContent = p.note;
      a.appendChild(n);
      a.appendChild(d);
      a.addEventListener('click', function () {
        track('playlist_opened', { playlist: p.id });
        dismiss();
      });
      wrap.appendChild(a);
    });

    function dismiss() {
      wrap.classList.remove('soundtrack--in');
      window.setTimeout(function () { wrap.remove(); }, 300);
      remember();
    }

    close.addEventListener('click', function () {
      track('playlist_dismissed', {});
      dismiss();
    });

    document.body.appendChild(wrap);
    // Next frame, so the entrance transition actually runs.
    window.requestAnimationFrame(function () {
      window.requestAnimationFrame(function () { wrap.classList.add('soundtrack--in'); });
    });
    track('playlist_offered', {});
  }

  if (seen()) return;

  document.addEventListener('DOMContentLoaded', function () {
    window.setTimeout(function () {
      if (!seen()) build();
    }, DELAY);
  });
})(window, document);
