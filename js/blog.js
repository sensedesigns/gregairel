/* ============================================================
   GREGAIREL.COM — Blog index

   Posts live in the POSTS array below; the page renders itself
   from it. To publish: write the post page under posts/, then
   append an entry here. Tags and filtering come along free.
   ============================================================ */

(function (window, document) {
  'use strict';

  // Newest first is handled at render time — append anywhere.
  // Shape of an entry:
  // {
  //   title:   'The post title',
  //   href:    'posts/the-post-slug.html',
  //   date:    '2026-09-01',                  // ISO, used for sorting + display
  //   tags:    ['logistics', 'ai'],           // lowercase, short
  //   excerpt: 'One or two sentences shown in the list.'
  // }
  var POSTS = [
    {
      title: 'Patagonia W Trek — A Personal Field Guide',
      href: 'w-trek.html',
      date: '2026-03-11',
      tags: ['adventures', 'field guides'],
      excerpt: 'Five days on the W circuit, written up afterwards — terrain day by day, the gear that earned its weight, and what to pack for a March departure.',
      image: 'img/day2-towers.jpg',
      imageAlt: 'The granite towers of Torres del Paine above the glacial lake at their base'
    },
    {
      title: 'Everest Base Camp — A Personal Field Guide',
      href: 'ebc.html',
      date: '2025-03-10',
      tags: ['adventures', 'field guides'],
      excerpt: 'Ten days through the Khumbu — Lukla to Base Camp on foot, a helicopter out, and a pre-dawn climb up Kala Patthar to 5,555 m for the view everyone comes for.',
      image: 'img/khumbu-icefall.jpg',
      imageAlt: 'The Khumbu Icefall — a river of broken glacier ice below Everest'
    },
    {
      title: 'Japan 2027 — A Field Guide in Progress',
      href: 'japan.html',
      date: '2027-03-24',
      tags: ['adventures', 'field guides'],
      excerpt: 'The plan, published while it is still a plan: ten nights riding the cherry blossom front south from Tokyo to Kyoto, with the full write-up to follow in April 2027.',
      image: 'img/japan-chureito.jpg',
      imageAlt: 'Chureito Pagoda above Fujiyoshida with early cherry blossoms and snow-capped Mount Fuji'
    }
  ];

  function track(name, params) {
    if (typeof window.gtag === 'function') window.gtag('event', name, params || {});
  }

  function fmtDate(iso) {
    var d = new Date(iso + 'T12:00:00');
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  function allTags() {
    var seen = {};
    POSTS.forEach(function (p) { (p.tags || []).forEach(function (t) { seen[t] = (seen[t] || 0) + 1; }); });
    return Object.keys(seen).sort().map(function (t) { return { tag: t, count: seen[t] }; });
  }

  function render(activeTag) {
    var tagHost = document.getElementById('blog-tags');
    var listHost = document.getElementById('blog-list');
    var emptyHost = document.getElementById('blog-empty');
    if (!listHost || !emptyHost) return;

    // Tag chips — hidden entirely until there are posts to filter.
    var tags = allTags();
    if (tagHost) {
      tagHost.innerHTML = '';
      tagHost.hidden = tags.length === 0;
      if (tags.length) {
        var chips = [{ tag: null, label: 'All (' + POSTS.length + ')' }].concat(
          tags.map(function (t) { return { tag: t.tag, label: t.tag + ' (' + t.count + ')' }; })
        );
        chips.forEach(function (c) {
          var b = document.createElement('button');
          b.type = 'button';
          b.className = 'brand-chip' + ((c.tag === activeTag) ? ' brand-chip--on' : '');
          b.textContent = c.label;
          b.addEventListener('click', function () {
            var url = new URL(window.location.href);
            if (c.tag) { url.searchParams.set('tag', c.tag); } else { url.searchParams.delete('tag'); }
            window.history.replaceState(null, '', url);
            if (c.tag) track('blog_filter', { tag: c.tag });
            render(c.tag);
          });
          tagHost.appendChild(b);
        });
      }
    }

    // Post rows.
    var posts = POSTS
      .filter(function (p) { return !activeTag || (p.tags || []).indexOf(activeTag) !== -1; })
      .sort(function (a, b) { return a.date < b.date ? 1 : -1; });

    listHost.innerHTML = '';
    posts.forEach(function (p, i) {
      var row = document.createElement('div');
      row.className = 'row reveal reveal--in' + (p.image ? ' row--thumbed' : '');
      row.innerHTML =
        '<span class="row__i">' + String(i + 1).padStart(2, '0') + '</span>' +
        (p.image
          ? '<a href="' + p.href + '" class="row__thumb-link" tabindex="-1" aria-hidden="true"><img class="row__thumb" loading="lazy" alt=""></a>'
          : '') +
        '<div>' +
        '  <div class="row__name"><a href="' + p.href + '" class="text-link"></a></div>' +
        '  <div class="row__type"></div>' +
        '  <p class="row__desc"></p>' +
        '  <div class="brands"></div>' +
        '</div>' +
        '<span class="row__arrow">&rarr;</span>';
      row.querySelector('.row__name a').textContent = p.title;
      if (p.image) {
        var thumb = row.querySelector('.row__thumb');
        thumb.src = p.image;
        thumb.alt = p.imageAlt || '';
      }
      row.querySelector('.row__type').textContent = fmtDate(p.date);
      row.querySelector('.row__desc').textContent = p.excerpt || '';
      var chipHost = row.querySelector('.brands');
      (p.tags || []).forEach(function (t) {
        var chip = document.createElement('button');
        chip.type = 'button';
        chip.className = 'brand-chip';
        chip.textContent = t;
        chip.addEventListener('click', function () {
          var url = new URL(window.location.href);
          url.searchParams.set('tag', t);
          window.history.replaceState(null, '', url);
          track('blog_filter', { tag: t });
          render(t);
        });
        chipHost.appendChild(chip);
      });
      listHost.appendChild(row);
    });

    // Empty states: no posts at all vs. nothing under this tag.
    emptyHost.hidden = posts.length !== 0;
    if (POSTS.length === 0) {
      emptyHost.innerHTML =
        '<p class="lede">Nothing published yet.</p>' +
        '<p style="margin-top:1.6rem">The blog is built, the tags are wired, the filters work — the only thing missing is the writing. First posts are on the way; expect logistics, AI experiments, and the occasional trail report.</p>' +
        '<p class="note" style="margin-top:1.5rem">Coming soon. The daruma’s left eye is already inked on this one.</p>';
    } else {
      emptyHost.innerHTML =
        '<p class="lede">Nothing under that tag.</p>' +
        '<p style="margin-top:1.6rem"><button class="text-link" type="button" style="background:none;border:0;padding:0;cursor:pointer" id="blog-clear">Show everything</button></p>';
      var clear = document.getElementById('blog-clear');
      if (clear) clear.addEventListener('click', function () {
        var url = new URL(window.location.href);
        url.searchParams.delete('tag');
        window.history.replaceState(null, '', url);
        render(null);
      });
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    var params = new URLSearchParams(window.location.search);
    render(params.get('tag') || null);
  });
})(window, document);
