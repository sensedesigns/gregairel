/* ============================================================
   GREGAIREL.COM — Page date manifest

   Derives every page's "posted" (first commit) and "updated"
   (last commit) dates from git history and writes them to
   /page-dates.json, which the shared footer renders per page.

   Run by .github/workflows/page-dates.yml on every push that
   touches HTML — the dates are never edited by hand.

   Local run: node tools/build-page-dates.mjs
   ============================================================ */

import { execSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const git = (args) => execSync(`git ${args}`, { cwd: root, encoding: 'utf8' }).trim();

// Pages that must never be advertised in the public manifest —
// listing them here is how someone would discover they exist.
const UNLISTED = ['dulce.html', 'hemingway.html'];

const pages = git('ls-files "*.html"')
  .split('\n')
  .filter((f) => f && !f.startsWith('tools/') && !f.includes('_template') && !UNLISTED.includes(f));

const manifest = {};
for (const file of pages) {
  const log = git(`log --follow --diff-filter=A --format=%as -- "${file}"`).split('\n');
  const posted = log[log.length - 1] || null;
  const updated = git(`log -1 --format=%as -- "${file}"`) || posted;
  if (posted) manifest['/' + file] = { posted, updated };
}

writeFileSync(join(root, 'page-dates.json'), JSON.stringify(manifest, null, 2) + '\n');
console.log(`page-dates.json written — ${Object.keys(manifest).length} page(s)`);
