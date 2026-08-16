/* ============================================================
   GREGAIREL.COM — Blog index

   Posts live in /posts.json; the page renders itself from it and
   the RSS feed is generated from the same file by GitHub Actions.
   To publish: write the post page (copy posts/_template.html),
   append an entry to posts.json, push. Everything else follows.
   ============================================================ */

(function (window, document) {
  'use strict';

  // Posts live in /posts.json — one source of truth shared with the
  // RSS feed generator (tools/build-feed.mjs, run by GitHub Actions).
  // To publish: copy posts/_template.html, write the post, append an
  // entry to posts.json. The feed rebuilds itself on push.
  var POSTS = [];

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
      if (/^https?:/.test(p.href)) {
        row.querySelectorAll('a[href]').forEach(function (a) {
          a.target = '_blank'; a.rel = 'noopener';
        });
      }
      if (p.image) {
        var thumb = row.querySelector('.row__thumb');
        thumb.src = p.image;
        thumb.alt = p.imageAlt || '';
      }
      var dateLine = fmtDate(p.date);
      if (p.updated && p.updated !== p.date) dateLine += ' · Updated ' + fmtDate(p.updated);
      row.querySelector('.row__type').textContent = dateLine;
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

  // schema.org Blog markup, built from the same data the page renders.
  // Injected after fetch — Google processes JSON-LD added by script.
  function injectSchema() {
    var abs = function (h) { return /^https?:/.test(h) ? h : 'https://gregairel.com/' + h; };
    var ld = {
      '@context': 'https://schema.org',
      '@type': 'Blog',
      '@id': 'https://gregairel.com/blog.html',
      name: 'Greg Airel — Blog',
      author: { '@id': 'https://gregairel.com/#person' },
      blogPost: POSTS.map(function (p) {
        return {
          '@type': 'BlogPosting',
          headline: p.title,
          url: abs(p.href),
          datePublished: p.date,
          dateModified: p.updated || p.date,
          author: { '@type': 'Person', name: p.author || 'Greg Airel', url: 'https://gregairel.com/' },
          image: p.image ? abs(p.image) : undefined,
          keywords: (p.tags || []).join(', '),
          description: p.excerpt
        };
      })
    };
    var s = document.createElement('script');
    s.type = 'application/ld+json';
    s.textContent = JSON.stringify(ld);
    document.head.appendChild(s);
  }

  document.addEventListener('DOMContentLoaded', function () {
    var params = new URLSearchParams(window.location.search);
    fetch('posts.json')
      .then(function (r) { return r.json(); })
      .then(function (data) { POSTS = data; injectSchema(); })
      .catch(function () { /* leave POSTS empty — the coming-soon state renders */ })
      .then(function () { render(params.get('tag') || null); });
  });
})(window, document);
