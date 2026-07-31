#!/usr/bin/env node
/* ============================================================
   Build a password-protected page for gregairel.com

   Takes a plaintext HTML page, encrypts it (PBKDF2-SHA256 →
   AES-256-GCM), and writes a standalone gate page that holds
   nothing but ciphertext. The real page is only ever assembled
   in the visitor's browser, after the right password.

   Usage:
     node tools/build-protected-page.js <source.html> <output.html> <password>

   Example:
     node tools/build-protected-page.js \
       "C:/Users/grega/Downloads/feo1-binary-star.html" \
       feo1-binary-star.html \
       2STARS

   Keep the plaintext source OUT of this repo. Re-run this script
   after any edit to it, then commit the regenerated output.
   ============================================================ */

'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ITERATIONS = 310000; // PBKDF2 rounds — slows down offline guessing
const TEMPLATE = path.join(__dirname, 'gate-template.html');

const [sourcePath, outputPath, password] = process.argv.slice(2);

if (!sourcePath || !outputPath || !password) {
  console.error('Usage: node tools/build-protected-page.js <source.html> <output.html> <password>');
  process.exit(1);
}

// Match the browser side: trimmed + uppercased, so autocapitalize on a
// phone keyboard and stray whitespace never cause a false rejection.
const normalized = password.trim().toUpperCase();

const plaintext = fs.readFileSync(sourcePath);
const template = fs.readFileSync(TEMPLATE, 'utf8');

const salt = crypto.randomBytes(16);
const iv = crypto.randomBytes(12);
const key = crypto.pbkdf2Sync(normalized, salt, ITERATIONS, 32, 'sha256');

const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
// WebCrypto expects the GCM auth tag appended to the ciphertext.
const payload = Buffer.concat([cipher.update(plaintext), cipher.final(), cipher.getAuthTag()]);

const page = template
  .replace('__SALT__', salt.toString('base64'))
  .replace('__IV__', iv.toString('base64'))
  .replace('__DATA__', payload.toString('base64'))
  .replace('__ITER__', String(ITERATIONS));

for (const token of ['__SALT__', '__IV__', '__DATA__', '__ITER__']) {
  if (page.includes(token)) {
    console.error(`Template placeholder ${token} was not substituted — aborting.`);
    process.exit(1);
  }
}

fs.writeFileSync(outputPath, page);

console.log(`Wrote ${outputPath}`);
console.log(`  source     ${sourcePath} (${plaintext.length.toLocaleString()} bytes)`);
console.log(`  encrypted  ${payload.length.toLocaleString()} bytes, ${ITERATIONS.toLocaleString()} PBKDF2 rounds`);
console.log(`  password   ${normalized} (case-insensitive)`);
