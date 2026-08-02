/* ============================================================
   GREGAIREL.COM — Summit certificate

   Shared by triumph.html (expert) and summited.html (novice).
   Runs the Daruma ceremony, renders the certificate, and posts
   the reward claim and leaderboard row to a single Google Form.

   Gated on the full localStorage breadcrumb. Without that check
   these pages are a free-coffee URL the moment someone shares one.
   ============================================================ */

(function (window, document) {
  'use strict';

  var FORM = 'https://docs.google.com/forms/d/e/' +
             '1FAIpQLScaV9O5r4bBVD_hTSXDo_7r6tZKHIa66bjDjAT8futWqG0bSA/formResponse';

  // Sheet column order is B..K. Every one of these is short-answer and
  // not required on the form itself — Google validates server-side and
  // silently drops the whole POST otherwise, and no-cors hides the error.
  var ENTRY = {
    display_name:  'entry.1924959842',
    email:         'entry.18784996',
    total_seconds: 'entry.309717275',
    hints_used:    'entry.1236822973',
    track:         'entry.1206248409',
    reward_type:   'entry.1924746027',
    reward_detail: 'entry.503028360',
    run_id:        'entry.2039201146',
    hp:            'entry.1056290916',
    full_name:     'entry.924798813'
  };

  var REWARDS = [
    { id: 'coffee',  name: "Coffee's on me",     note: 'A Starbucks eGift card.' },
    { id: 'drinks',  name: 'Drinks are on me',   note: 'A $25 eGift card of your choosing.' },
    { id: 'give',    name: 'Give it away',       note: 'I donate it instead. Name the nonprofit.',
      detail: { label: 'Which nonprofit?', type: 'input', max: 80 } },
    { id: 'other',   name: 'Something else',     note: 'Make a case. No promises.',
      detail: { label: 'What did you have in mind?', type: 'textarea', max: 200 } }
  ];

  // Commas break the CSV parse for every row beneath them. Quotes and
  // newlines do the same. Strip rather than escape.
  function clean(s) {
    return String(s || '').trim().replace(/[,"\n\r]/g, '').slice(0, 20);
  }

  var Cert = {};

  /* ------------------------------------------------------------
     The ceremony. Roughly six seconds.
     ------------------------------------------------------------ */

  Cert.ceremony = function (host, opts) {
    opts = opts || {};
    var reduced = window.Hunt.reduced();

    host.innerHTML = '';
    var doll = window.Hunt.svg({ label: 'Daruma, both eyes opening' });
    // The left eye was inked back at climb.html, when the goal was set.
    doll.querySelector('.daruma__eye--l').classList.add('daruma__eye--open');
    host.appendChild(doll);

    function wait(ms) {
      return new Promise(function (r) { window.setTimeout(r, reduced ? 0 : ms); });
    }

    function lightStrip() {
      var pips = document.querySelectorAll('.hunt-strip__pip');
      var chain = Promise.resolve();
      Array.prototype.forEach.call(pips, function (pip) {
        chain = chain.then(function () {
          var eye = pip.querySelector('.daruma__eye--r');
          if (eye) eye.classList.add('daruma__eye--open');
          pip.classList.add('hunt-strip__pip--lit');
          return wait(120);
        });
      });
      return chain;
    }

    host.classList.add('ceremony--in');

    return wait(900)                                   // 1. fade in
      .then(function () { window.Hunt.wobble(doll); return wait(1200); })  // 2. settle
      .then(function () { return wait(600); })          // 3. held pause
      .then(function () { return window.Hunt.ink(doll, 'right'); })        // 4. right eye
      .then(function () {                               // 5. warm glow
        doll.classList.add('daruma--glow');
        return wait(1100);
      })
      .then(lightStrip)                                 // 6. the strip
      .then(function () {                               // 7. certificate
        if (opts.onDone) opts.onDone(doll);
      });
  };

  /* ------------------------------------------------------------
     Reward form
     ------------------------------------------------------------ */

  Cert.buildForm = function (host, trackName) {
    var form = document.createElement('form');
    form.className = 'form';
    form.style.maxWidth = '38rem';
    form.style.margin = '0 auto';
    form.noValidate = true;

    function field(label, type, name, required) {
      var g = document.createElement('div');
      g.className = 'form__group';
      var l = document.createElement('label');
      l.className = 'form__label';
      l.textContent = label;
      l.htmlFor = 'f-' + name;
      var i = document.createElement('input');
      i.className = 'form__input';
      i.type = type;
      i.id = 'f-' + name;
      i.name = name;
      if (required) i.required = true;
      g.appendChild(l);
      g.appendChild(i);
      form.appendChild(g);
      return i;
    }

    var first = field('First name', 'text', 'first', true);
    var last  = field('Last name', 'text', 'last', true);
    var email = field('Email', 'email', 'email', true);

    // Reward selection — nothing pre-selected.
    var rl = document.createElement('p');
    rl.className = 'form__label';
    rl.textContent = 'Pick your reward';
    form.appendChild(rl);

    var grid = document.createElement('div');
    grid.className = 'reward-grid';
    var detailHost = document.createElement('div');
    detailHost.className = 'form__group';

    var detailInput = null;

    REWARDS.forEach(function (r) {
      var lab = document.createElement('label');
      lab.className = 'reward';
      var radio = document.createElement('input');
      radio.type = 'radio';
      radio.name = 'reward';
      radio.value = r.id;
      var n = document.createElement('strong');
      n.className = 'reward__name';
      n.textContent = r.name;
      var note = document.createElement('span');
      note.className = 'reward__note';
      note.textContent = r.note;
      lab.appendChild(radio);
      lab.appendChild(n);
      lab.appendChild(note);
      grid.appendChild(lab);

      radio.addEventListener('change', function () {
        // Conditional fields hide AND clear, so a stale nonprofit name
        // can never ride along with a coffee claim.
        detailHost.innerHTML = '';
        detailInput = null;
        if (r.detail) {
          var dl = document.createElement('label');
          dl.className = 'form__label';
          dl.textContent = r.detail.label;
          dl.htmlFor = 'f-detail';
          detailInput = document.createElement(r.detail.type === 'textarea' ? 'textarea' : 'input');
          detailInput.className = r.detail.type === 'textarea' ? 'form__textarea' : 'form__input';
          detailInput.id = 'f-detail';
          detailInput.maxLength = r.detail.max;
          detailHost.appendChild(dl);
          detailHost.appendChild(detailInput);
        }
        submit.disabled = false;
      });
    });

    form.appendChild(grid);
    form.appendChild(detailHost);

    // Leaderboard opt-out. Unchecked still submits the row so the
    // completion count stays honest — the name just becomes Anonymous.
    var showWrap = document.createElement('label');
    showWrap.className = 'reward';
    showWrap.style.marginBottom = '1.4rem';
    var show = document.createElement('input');
    show.type = 'checkbox';
    show.checked = true;
    show.style.position = 'static';
    show.style.opacity = '1';
    show.style.marginRight = '0.6rem';
    showWrap.appendChild(show);
    showWrap.appendChild(document.createTextNode('Show me on the leaderboard'));
    form.appendChild(showWrap);

    // Honeypot — offscreen, not focusable.
    var hpWrap = document.createElement('div');
    hpWrap.className = 'hp-field';
    hpWrap.setAttribute('aria-hidden', 'true');
    var hp = document.createElement('input');
    hp.type = 'text';
    hp.tabIndex = -1;
    hp.autocomplete = 'off';
    hpWrap.appendChild(hp);
    form.appendChild(hpWrap);

    var submit = document.createElement('button');
    submit.type = 'submit';
    submit.className = 'btn btn--primary';
    submit.textContent = 'Claim it';
    submit.disabled = true;
    form.appendChild(submit);

    var status = document.createElement('p');
    status.className = 'note';
    status.style.marginTop = '1.2rem';
    form.appendChild(status);

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var f = clean(first.value);
      var l = clean(last.value);
      var picked = form.querySelector('input[name="reward"]:checked');

      if (!f || !l || !email.value.trim() || !picked) {
        status.textContent = 'Everything above is needed before I can send it.';
        return;
      }
      if (hp.value) return; // bot

      var display = l ? f + ' ' + l[0].toUpperCase() + '.' : f;
      var full = (f + ' ' + l).trim();

      var data = new FormData();
      data.append(ENTRY.display_name,  show.checked ? display : 'Anonymous');
      data.append(ENTRY.email,         email.value.trim());
      // Computed fields go as explicit 0, never empty string.
      data.append(ENTRY.total_seconds, String(window.Hunt.elapsed() || 0));
      data.append(ENTRY.hints_used,    String(window.Hunt.hints() || 0));
      data.append(ENTRY.track,         trackName);
      data.append(ENTRY.reward_type,   picked.value);
      data.append(ENTRY.reward_detail, detailInput ? detailInput.value.trim() : '');
      data.append(ENTRY.run_id,        window.Hunt.runId());
      data.append(ENTRY.hp,            '');
      data.append(ENTRY.full_name,     full);

      try { window.localStorage.setItem('hunt_handle', show.checked ? display : 'Anonymous'); } catch (err) {}

      if (typeof window.gtag === 'function') {
        window.gtag('event', 'reward_claimed', { reward_type: picked.value });
        window.gtag('event', 'hunt_complete', {
          track: trackName,
          total_seconds: window.Hunt.elapsed() || 0,
          hints_used: window.Hunt.hints() || 0
        });
      }

      // The response is opaque, so success can never be confirmed.
      // Show the result optimistically rather than waiting on it.
      fetch(FORM, { method: 'POST', mode: 'no-cors', body: data }).catch(function () {});

      form.querySelectorAll('input, textarea, button').forEach(function (el) { el.disabled = true; });
      status.textContent = 'Sent. Your reward will land in your inbox over the next few days.';
    });

    host.appendChild(form);
  };

  window.Cert = Cert;
})(window, document);
