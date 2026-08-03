/* ============================================================
   GREGAIREL.COM — Novice track, "Both Eyes Open"

   Ten Daruma hidden across the existing site. One shared script,
   one small <div data-daruma="N"> per stop. Existing pages are
   otherwise untouched.

   Collected in order the letters spell TRIUMPHANT.

   Riddles require reading the page they sit on — clicking a nav
   item is never enough.
   ============================================================ */

(function (window, document) {
  'use strict';

  var STOPS = [
    {
      n: 1, letter: 'T',
      hint: "Use the nav at the top. The Ventures page is where all five companies get counted.",
      riddle: 'Protect ya neck. But first: two entities were filed on the same day in 2017. ' +
              'Go where all five of them get counted.',
      next: 'ventures.html'
    },
    {
      n: 2, letter: 'R',
      hint: "Nine entities, one canopy — that line is the heading on the Projects page.",
      riddle: 'Five here. But Wu came nine deep, and so does this canopy. ' +
              'Find the page that counts nine.',
      next: 'projects.html'
    },
    {
      n: 3, letter: 'I',
      hint: "The one who walks uphill is Adventures. It is in the nav.",
      riddle: 'Bodhidharma faced a wall for nine years. You have found your nine. ' +
              'Now follow the one who walks uphill instead.',
      next: 'adventures.html'
    },
    {
      n: 4, letter: 'U',
      hint: "Lukla sits at 2,860 m and Base Camp at 5,364 m — that is the 2.7 km. Open the Everest Base Camp guide.",
      riddle: 'Two expeditions. One of them gained 2.7 vertical kilometres from an airstrip. ' +
              'Read that guide.',
      next: 'ebc.html'
    },
    {
      n: 5, letter: 'M',
      hint: "Stay on this page. Scroll down to the section called Kala Patthar, And The Way Out.",
      riddle: 'The airstrip sits at 2,860 m, and it is the last place on the whole trip ' +
              'you will see a wheel. So keep walking. The next doll waits at the point ' +
              'where the trek finally turns around.',
      next: 'ebc.html, further down'
    },
    {
      n: 6, letter: 'P',
      hint: "Granite and towers means Patagonia. Open the W Trek field guide.",
      riddle: 'Up before dawn to 5,555 m, then off the glacier by helicopter from Gorak Shep. ' +
              'Nepal is done. Go where the granite is — and where the big one comes first, ' +
              'on day one.',
      next: 'w-trek.html'
    },
    {
      n: 7, letter: 'H',
      hint: "Stay on this page. Scroll down to the Packing List.",
      riddle: 'Weight is the whole game here — you will feel the difference between a ' +
              '25 lb pack and a 35 lb pack on day four, when your knees are already ' +
              'screaming. Read down to the list of what actually earns its place.',
      next: 'w-trek.html, further down'
    },
    {
      n: 8, letter: 'A',
      hint: "Where you would send word is the Contact page.",
      riddle: 'Day six trades the trail for a catamaran across the lake to Puerto Natales. ' +
              'The walking is finished. Find the page where you would send word.',
      next: 'contact.html'
    },
    {
      n: 9, letter: 'N',
      hint: "You have all nine letters. The button below is the last step.",
      riddle: 'Every trail ends with someone to tell about it. ' +
              'Nine down. Say the word and the last eye opens.',
      next: 'summited.html'
    },
    {
      n: 10, letter: 'T',
      riddle: 'Both eyes open.',
      next: null
    }
  ];

  function stop(n) {
    for (var i = 0; i < STOPS.length; i++) if (STOPS[i].n === n) return STOPS[i];
    return null;
  }

  /* ---------- the panel ---------- */

  function openPanel(cfg, isNew) {
    var wrap = document.createElement('div');
    wrap.className = 'daruma-panel';
    wrap.setAttribute('role', 'dialog');
    wrap.setAttribute('aria-modal', 'true');
    wrap.setAttribute('aria-label', 'Daruma found');

    var card = document.createElement('div');
    card.className = 'daruma-panel__card';

    var doll = window.Hunt.svg({ label: 'Daruma, left eye opening' });
    card.appendChild(doll);

    var letter = document.createElement('div');
    letter.className = 'daruma-panel__letter';
    letter.textContent = cfg.letter;
    card.appendChild(letter);

    var count = document.createElement('p');
    count.className = 'label';
    count.textContent = window.Hunt.letters().length + ' of 10 — ' + window.Hunt.word();
    card.appendChild(count);

    var riddle = document.createElement('p');
    riddle.style.marginTop = '1.4rem';
    riddle.textContent = cfg.riddle;
    card.appendChild(riddle);

    // A timed nudge. The riddles are meant to be readable, but a player
    // who cannot find the next page should not be stuck there forever.
    if (cfg.hint) {
      var hintWrap = document.createElement('p');
      hintWrap.className = 'gate-note';
      hintWrap.style.marginTop = '1.2rem';
      var hintBtn = document.createElement('button');
      hintBtn.type = 'button';
      hintBtn.className = 'text-link';
      hintBtn.style.cssText = 'background:none;border:0;padding:0;cursor:pointer';
      hintBtn.disabled = true;
      var hintBody = document.createElement('span');
      hintBody.style.display = 'block';
      hintBody.style.marginTop = '0.5rem';
      hintWrap.appendChild(hintBtn);
      hintWrap.appendChild(hintBody);
      card.appendChild(hintWrap);

      var readyAt = Date.now() + 30000; // 30s
      (function tickHint() {
        var left = Math.ceil((readyAt - Date.now()) / 1000);
        if (left > 0) {
          hintBtn.textContent = 'Hint unlocks in ' + left + 's';
          window.setTimeout(tickHint, 1000);
        } else {
          hintBtn.disabled = false;
          hintBtn.textContent = 'Show me a hint';
        }
      })();

      hintBtn.addEventListener('click', function () {
        hintBody.textContent = cfg.hint;
        hintBtn.disabled = true;
        hintBtn.textContent = 'Hint';
        window.Hunt.countHint(cfg.n, 1);
      });
    }

    var gate = document.createElement('p');
    gate.className = 'gate-note';
    card.appendChild(gate);

    var close = document.createElement('button');
    close.className = 'btn btn--primary';
    close.style.marginTop = '1.6rem';
    close.type = 'button';
    close.textContent = 'Keep climbing';
    card.appendChild(close);

    wrap.appendChild(card);
    document.body.appendChild(wrap);

    // The left eye inks on arrival — the goal was set back at the trailhead.
    if (isNew) window.Hunt.ink(doll, 'left');
    else doll.querySelector('.daruma__eye--l').classList.add('daruma__eye--open');

    // Acclimatisation. Framed as altitude, not as a rate limiter.
    function tickGate() {
      var left = window.Hunt.gateRemaining();
      if (left > 0) {
        gate.textContent = 'Catch your breath — ' + left + 's before the next stop.';
        window.setTimeout(tickGate, 1000);
      } else {
        gate.textContent = cfg.next ? 'Next stop: ' + cfg.next : '';
      }
    }
    tickGate();

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
    var n = parseInt(host.getAttribute('data-daruma'), 10);
    var cfg = stop(n);
    if (!cfg) return;

    // Only visible to someone actually running the novice track.
    if (window.Hunt.trackOf() !== 'novice') return;

    var found = window.Hunt.letters();
    var already = found.some(function (e) { return e.i === n; });

    // Stops appear one at a time, in order. Anything past the player's
    // current position stays out of the document entirely.
    if (!already && found.length + 1 !== n) return;

    var btn = document.createElement('button');
    btn.className = 'daruma-find';
    btn.type = 'button';
    btn.setAttribute('aria-label', already ? 'Daruma, already found' : 'A Daruma doll');
    btn.appendChild(window.Hunt.svg({
      label: 'Daruma',
      left: already ? 'open' : 'blank'
    }));

    btn.addEventListener('click', function () {
      var isNew = window.Hunt.addLetter(n, cfg.letter);
      if (isNew) {
        btn.querySelector('.daruma__eye--l').classList.add('daruma__eye--open');
        window.Hunt.clear('novice-' + n, n);
      }
      openPanel(cfg, isNew);
    });

    host.appendChild(btn);
  }

  document.addEventListener('DOMContentLoaded', function () {
    if (!window.Hunt) return;
    Array.prototype.forEach.call(
      document.querySelectorAll('[data-daruma]'),
      mount
    );
  });
})(window, document);
