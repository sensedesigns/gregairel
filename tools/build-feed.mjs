/* ============================================================
   GREGAIREL.COM — RSS feed generator

   Reads /posts.json and writes /feed.xml. Run by the GitHub
   Action in .github/workflows/feed.yml on every push that touches
   posts.json — the feed is never edited by hand.

   Local run: node tools/build-feed.mjs
   ============================================================ */

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const SITE = 'https://gregairel.com';

// `posted` (real publish date) beats `date` (which can be a trip date,
// even a future one) for ordering and pubDate.
const sortKey = (p) => p.posted || p.date;
const posts = JSON.parse(readFileSync(join(root, 'posts.json'), 'utf8'))
  .slice()
  .sort((a, b) => (sortKey(a) < sortKey(b) ? 1 : -1));

const esc = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const abs = (href) => (/^https?:/.test(href) ? href : `${SITE}/${href}`);
const rfc822 = (iso) => new Date(`${iso}T12:00:00Z`).toUTCString();

const items = posts
  .map(
    (p) => `    <item>
      <title>${esc(p.title)}</title>
      <link>${esc(abs(p.href))}</link>
      <guid isPermaLink="true">${esc(abs(p.href))}</guid>
      <pubDate>${rfc822(p.posted || p.date)}</pubDate>
      <dc:creator>${esc(p.author || 'Greg Airel')}</dc:creator>
      <description>${esc(p.excerpt)}</description>
${(p.tags || []).map((t) => `      <category>${esc(t)}</category>`).join('\n')}
    </item>`
  )
  .join('\n');

// The channel's build date is the newest touch on any post.
const newest = posts.reduce(
  (max, p) => ((p.updated || p.date) > max ? p.updated || p.date : max),
  '2026-01-01'
);

const feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>Greg Airel — Blog</title>
    <link>${SITE}/blog.html</link>
    <atom:link href="${SITE}/feed.xml" rel="self" type="application/rss+xml"/>
    <description>Logistics notes, AI experiments, field guides, and the occasional mix.</description>
    <language>en-us</language>
    <lastBuildDate>${rfc822(newest)}</lastBuildDate>
${items}
  </channel>
</rss>
`;

writeFileSync(join(root, 'feed.xml'), feed);
console.log(`feed.xml written — ${posts.length} item(s)`);
