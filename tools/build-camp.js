#!/usr/bin/env node
/* ============================================================
   Build an encrypted camp page for the gregairel.com climb.

   Same crypto as build-protected-page.js (PBKDF2-SHA256 →
   AES-256-GCM), wrapped in the camp gate rather than the FEO1
   gate. The elevation is the password.

   Usage:
     node tools/build-camp.js <source.html> <out.html> <elevation> <slug> <num> "<Camp Name>"

   Example:
     node tools/build-camp.js .../basecamp.src.html basecamp.html 5364 basecamp 2 "Base Camp"

   Keep the plaintext sources OUT of this repo — same rule as
   FEO1. Re-run after any edit, then commit the regenerated file.
   ============================================================ */

'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ITERATIONS = 310000;
const TEMPLATE = path.join(__dirname, 'camp-template.html');

const [sourcePath, outputPath, elevation, slug, num, campName] = process.argv.slice(2);

if (!sourcePath || !outputPath || !elevation || !slug || !num || !campName) {
  console.error('Usage: node tools/build-camp.js <source.html> <out.html> <elevation> <slug> <num> "<Camp Name>"');
  process.exit(1);
}

// Match the browser: lowercase, commas and spaces gone, trailing m dropped.
// Someone will type "6,065 m".
const normalized = String(elevation).toLowerCase().replace(/[,\s]/g, '').replace(/m$/, '');

const plaintext = fs.readFileSync(sourcePath);
const template = fs.readFileSync(TEMPLATE, 'utf8');

const salt = crypto.randomBytes(16);
const iv = crypto.randomBytes(12);
const key = crypto.pbkdf2Sync(normalized, salt, ITERATIONS, 32, 'sha256');

const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
// WebCrypto expects the GCM auth tag appended to the ciphertext.
const payload = Buffer.concat([cipher.update(plaintext), cipher.final(), cipher.getAuthTag()]);

let page = template
  .split('__SALT__').join(salt.toString('base64'))
  .split('__IV__').join(iv.toString('base64'))
  .split('__DATA__').join(payload.toString('base64'))
  .split('__ITER__').join(String(ITERATIONS))
  .split('__CAMP_SLUG__').join(slug)
  .split('__CAMP_NUM__').join(String(num))
  .split('__CAMP_NAME__').join(campName);

for (const token of ['__SALT__', '__IV__', '__DATA__', '__ITER__', '__CAMP_SLUG__', '__CAMP_NUM__', '__CAMP_NAME__']) {
  if (page.includes(token)) {
    console.error(`Template placeholder ${token} was not substituted — aborting.`);
    process.exit(1);
  }
}

// The clue must never survive in the loader. If the plaintext leaks into
// the gate, the encryption has done nothing.
if (/\.html\b/.test(page.replace(payload.toString('base64'), ''))) {
  const leak = page.replace(payload.toString('base64'), '').match(/[a-z-]+\.html/g) || [];
  const allowed = new Set(['index.html']);
  const bad = leak.filter((f) => !allowed.has(f));
  if (bad.length) {
    console.error(`Refusing to write — filename(s) visible in the gate: ${[...new Set(bad)].join(', ')}`);
    process.exit(1);
  }
}

fs.writeFileSync(outputPath, page);

console.log(`Wrote ${outputPath}`);
console.log(`  camp       ${num} — ${campName} (${slug})`);
console.log(`  source     ${plaintext.length.toLocaleString()} bytes`);
console.log(`  encrypted  ${payload.length.toLocaleString()} bytes, ${ITERATIONS.toLocaleString()} rounds`);
console.log(`  key        ${normalized}`);
