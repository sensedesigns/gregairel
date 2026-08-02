/* ============================================================
   GREGAIREL.COM — Camp furniture

   Timed hints and the forfeit exit, shared by every decrypted
   camp payload. This file only ever runs inside an encrypted
   page, so the answers it handles are already behind the gate.

   Encryption and a canvas both create real failure modes for
   legitimate players. Without an exit, more humans quit in
   frustration than bots are stopped.
   ============================================================ */

(function (window, document) {
  'use strict';

  var STEP = 180000; // three minutes between hint stages

  var Camp = {};

  Camp.init = function (cfg) {
    var host = document.getElementById('hint-host');
    if (!host) return;

    var stack = document.createElement('div');
    stack.className = 'hint-stack';
    host.appendChild(stack);

    var opened = 0;

    cfg.hints.forEach(function (text, i) {
      var row = document.createElement('div');
      row.className = 'hint';

      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'text-link';
      btn.style.cssText = 'background:none;border:0;padding:0;cursor:pointer';
      btn.textContent = 'Hint ' + (i + 1);

      var lock = document.createElement('span');
      lock.className = 'hint__lock';

      var body = document.createElement('p');
      body.style.marginTop = '0.6rem';
      body.hidden = true;
      body.textContent = text;

      row.appendChild(btn);
      row.appendChild(lock);
      row.appendChild(body);
      stack.appendChild(row);

      // Stage i unlocks i * 3 minutes after the camp opens.
      var readyAt = Date.now() + i * STEP;

      function tick() {
        var left = Math.ceil((readyAt - Date.now()) / 1000);
        if (left > 0) {
          btn.disabled = true;
          lock.textContent = ' — in ' + Math.floor(left / 60) + 'm ' + (left % 60) + 's';
          window.setTimeout(tick, 1000);
        } else {
          btn.disabled = false;
          lock.textContent = '';
        }
      }
      tick();

      btn.addEventListener('click', function () {
        if (body.hidden) {
          body.hidden = false;
          opened++;
          window.Hunt.countHint(cfg.num, i + 1);
          btn.disabled = true;
        }
      });
    });

    // The escape hatch.
    var out = document.createElement('div');
    out.className = 'hint';
    var give = document.createElement('button');
    give.type = 'button';
    give.className = 'text-link';
    give.style.cssText = 'background:none;border:0;padding:0;cursor:pointer';
    give.textContent = 'Show me the answer and take me off the leaderboard';
    var reveal = document.createElement('p');
    reveal.style.marginTop = '0.6rem';
    reveal.hidden = true;
    out.appendChild(give);
    out.appendChild(reveal);
    stack.appendChild(out);

    give.addEventListener('click', function () {
      if (!reveal.hidden) return;
      reveal.hidden = false;
      reveal.textContent = 'Next: ' + cfg.answer + '.html, at ' + cfg.elevation + ' m. ' +
                           'You keep climbing — you just do not place.';
      give.disabled = true;
      window.Hunt.forfeit(cfg.num);
    });
  };

  window.Camp = Camp;
})(window, document);
