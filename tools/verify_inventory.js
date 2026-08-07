#!/usr/bin/env node
'use strict';
/*
 * verify_inventory.js — Part of the drift guard. Fails the build if
 * audit/APP_INVENTORY.md is stale relative to the repo (structural hash mismatch)
 * or missing. Offline-safe: it recomputes the STRUCTURAL projection only (no live
 * submission counts, no dates), so it never depends on the network.
 *
 * Fix a failure by re-running:  node tools/generate_inventory.js  (then commit).
 */
const fs = require('fs');
const path = require('path');
const lib = require('./inventory_lib');

const INV = path.join(lib.REPO, 'audit', 'APP_INVENTORY.md');

if (!fs.existsSync(INV)) {
  console.error('DRIFT GUARD FAILED — audit/APP_INVENTORY.md is missing. Run: node tools/generate_inventory.js');
  process.exit(1);
}
const md = fs.readFileSync(INV, 'utf8');
const m = md.match(/<!--\s*structural_sha:\s*([0-9a-f]{64})\s*-->/);
if (!m) {
  console.error('DRIFT GUARD FAILED — no structural_sha marker in audit/APP_INVENTORY.md. Regenerate it: node tools/generate_inventory.js');
  process.exit(1);
}
const embedded = m[1];
const actual = lib.structuralSha();
if (embedded !== actual) {
  console.error('DRIFT GUARD FAILED — APP_INVENTORY.md is STALE.');
  console.error('  embedded structural_sha: ' + embedded);
  console.error('  repo structural_sha:     ' + actual);
  console.error('  The inventory no longer matches the repo. Regenerate and commit:');
  console.error('    node tools/generate_inventory.js');
  process.exit(1);
}
console.log('inventory guard OK — APP_INVENTORY.md matches repo (structural_sha ' + actual.slice(0, 12) + '…).');
process.exit(0);
