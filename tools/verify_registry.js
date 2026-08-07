#!/usr/bin/env node
'use strict';
/*
 * verify_registry.js — Part of the drift guard. Fails the build (never warns) if the
 * module set drifts between the canonical bank and the surfaces that must mirror it:
 *   - modules.js (window.HERO_MODULES) — drives the nav menu and dashboard filters
 *   - dashboard-data.js (DASH_MODULE_REGISTRY) — drives dashboard drill-down
 *   - every quiz page — must render the menu/filters dynamically (no hardcoded module lists)
 *
 * Criterion, same as the fingerprint guard: a module that exists in the bank must appear
 * everywhere. Fails closed. Fix by re-running: node tools/generate_registry.js
 */
const fs = require('fs');
const path = require('path');

const REPO = path.resolve(__dirname, '..');
const fail = [];

function read(f) { return fs.readFileSync(path.join(REPO, f), 'utf8'); }
function exists(f) { return fs.existsSync(path.join(REPO, f)); }
function newestBank() {
  const banks = fs.readdirSync(REPO).filter(f => /^KC_Canonical_QuestionBank_v\d+.*\.json$/.test(f));
  banks.sort((a, b) => (parseInt((a.match(/_v(\d+)/) || [])[1] || 0)) - (parseInt((b.match(/_v(\d+)/) || [])[1] || 0)));
  return banks[banks.length - 1];
}
function evalLiteral(src, decl, open, close) {
  const s = src.indexOf(decl); if (s < 0) return undefined;
  const o = src.indexOf(open, s);
  let d = 0, inStr = false, sc = '', esc = false, end = -1;
  for (let i = o; i < src.length; i++) { const c = src[i];
    if (inStr) { if (esc) esc = false; else if (c === '\\') esc = true; else if (c === sc) inStr = false; continue; }
    if (c === "'" || c === '"' || c === '`') { inStr = true; sc = c; continue; }
    if (c === open) d++; else if (c === close) { d--; if (d === 0) { end = i; break; } } }
  return eval('(' + src.slice(o, end + 1) + ')'); // eslint-disable-line no-eval
}
const setEq = (a, b) => a.length === b.length && a.every(x => b.includes(x));

const bankFile = newestBank();
const bank = JSON.parse(read(bankFile));
const bankIds = bank.modules.map(m => m.module_id).sort();
const correctByMod = {};
bank.modules.forEach(m => { correctByMod[m.module_id] = {}; m.questions.forEach(q => { correctByMod[m.module_id][q.id] = q.correct; }); });

// 1) modules.js
if (!exists('modules.js')) {
  fail.push('modules.js is missing. Run: node tools/generate_registry.js');
} else {
  const reg = evalLiteral(read('modules.js'), 'window.HERO_MODULES', '[', ']') || [];
  const regIds = reg.map(m => m.id).sort();
  if (!setEq(regIds, bankIds)) fail.push(`modules.js HERO_MODULES set ${JSON.stringify(regIds)} != bank set ${JSON.stringify(bankIds)}`);
  reg.forEach(m => {
    ['id', 'label', 'url', 'total', 'pass'].forEach(k => {
      if (m[k] === undefined || m[k] === null || m[k] === '') fail.push(`modules.js ${m.id}: missing field ${k}`);
    });
  });
}

// 2) dashboard-data.js
if (!exists('dashboard-data.js')) {
  fail.push('dashboard-data.js is missing. Run: node tools/generate_registry.js');
} else {
  const dreg = evalLiteral(read('dashboard-data.js'), 'DASH_MODULE_REGISTRY', '{', '}') || {};
  const dIds = Object.keys(dreg).sort();
  if (!setEq(dIds, bankIds)) fail.push(`dashboard-data.js DASH_MODULE_REGISTRY set ${JSON.stringify(dIds)} != bank set ${JSON.stringify(bankIds)}`);
  // answerKey must match bank correct (prevents the stale-key drift we hit before)
  Object.keys(dreg).forEach(id => {
    if (!correctByMod[id]) return;
    const ak = dreg[id].answerKey || {};
    Object.keys(correctByMod[id]).forEach(qid => {
      if (ak[qid] !== correctByMod[id][qid]) fail.push(`dashboard-data.js ${id} ${qid}: answerKey ${ak[qid]} != bank correct ${correctByMod[id][qid]}`);
    });
  });
}

// 3) pages render menu + filters dynamically (no hardcoded module lists)
const pages = ['index.html'].concat(bank.modules.filter(m => m.module_id !== 'mod1').map(m => `${m.module_id}.html`));
pages.forEach(p => {
  if (!exists(p)) { fail.push(`page ${p} missing`); return; }
  const h = read(p);
  if (!/<script src="modules\.js">/.test(h)) fail.push(`${p}: does not load modules.js`);
  if (/<option value="mod\d+"/.test(h)) fail.push(`${p}: has a hardcoded module <option> — the menu must be built from modules.js`);
  if (/class="mod-filter-check"/.test(h)) fail.push(`${p}: has a hardcoded mod-filter-check — filters must be built from modules.js`);
  if (!/id="dash-mod-filters"/.test(h)) fail.push(`${p}: missing the dynamic filter host <div id="dash-mod-filters">`);
  if (!/id="module-select"/.test(h)) fail.push(`${p}: missing <select id="module-select">`);
});

if (fail.length) {
  console.error('\nREGISTRY GUARD FAILED — ' + fail.length + ' problem(s):\n');
  fail.forEach(f => console.error('  ✗ ' + f));
  console.error('\nThe module set has drifted from ' + bankFile + '. Re-run: node tools/generate_registry.js (and rebuild pages if needed).');
  process.exit(1);
}
console.log('registry guard OK — nav menu + dashboard filters + drill-down all match ' + bankFile + ' (' + bankIds.join(', ') + ').');
process.exit(0);
