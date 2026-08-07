#!/usr/bin/env node
'use strict';
/*
 * generate_manifest.js — Produces APP_MANIFEST.md and APP_MANIFEST.json from the
 * ACTUAL repo state, so documentation can never drift from what is deployed.
 *
 * It reads the real quiz pages (quiz.js=mod1, modN.js=modN), the HTML titles,
 * the Apps Script backend (routing + handlers + thresholds), and the canonical
 * bank in use, then writes a human manifest and a machine manifest.
 *
 * Run:  node tools/generate_manifest.js
 * No external dependencies. Pass a timestamp as argv[2] if you want a fixed date;
 * otherwise the current date is stamped.
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const REPO = path.resolve(__dirname, '..');
const LETTERS = ['A', 'B', 'C', 'D'];
const STAMP = process.argv[2] || new Date().toISOString().slice(0, 10);

function read(f) { return fs.readFileSync(path.join(REPO, f), 'utf8'); }
function exists(f) { return fs.existsSync(path.join(REPO, f)); }
function norm(s) { return String(s == null ? '' : s).replace(/\s+/g, ' ').trim(); }
function fp(text, opts) {
  return crypto.createHash('sha1')
    .update(norm(text + '|' + LETTERS.map(k => `${k}:${opts[k]}`).join('|')))
    .digest('hex').slice(0, 12);
}
function extractLiteral(src, decl, open, close) {
  const s = src.indexOf('const ' + decl); if (s < 0) return null;
  const o = src.indexOf(open, s); if (o < 0) return null;
  let d = 0, inStr = false, sc = '', esc = false;
  for (let i = o; i < src.length; i++) {
    const c = src[i];
    if (inStr) { if (esc) esc = false; else if (c === '\\') esc = true; else if (c === sc) inStr = false; continue; }
    if (c === "'" || c === '"' || c === '`') { inStr = true; sc = c; continue; }
    if (c === open) d++; else if (c === close) { d--; if (d === 0) return src.slice(o, i + 1); }
  }
  return null;
}
function grabConst(src, name) {
  const re = new RegExp('const\\s+' + name + '\\s*=\\s*([^;\\n]+)');
  const m = src.match(re); return m ? m[1].trim() : null;
}

// discover quiz pages
const jsFiles = fs.readdirSync(REPO).filter(f => /^mod\d+\.js$/.test(f) || f === 'quiz.js');
const modules = [];
for (const f of jsFiles.sort()) {
  const id = f === 'quiz.js' ? 'mod1' : f.replace(/\.js$/, '');
  const src = read(f);
  const qLit = extractLiteral(src, 'QUESTIONS', '[', ']');
  const questions = qLit ? eval(qLit) : []; // eslint-disable-line no-eval
  const kLit = extractLiteral(src, 'ANSWER_KEY', '{', '}');
  const answerKey = kLit ? eval('(' + kLit + ')') : null; // eslint-disable-line no-eval
  const html = id === 'mod1' ? 'index.html' : `${id}.html`;
  let title = null;
  if (exists(html)) {
    const h = read(html);
    const tm = h.match(/<title>([^<]*)<\/title>/i);
    title = tm ? norm(tm[1]) : null;
  }
  modules.push({
    module_id: id,
    js_file: f,
    html_file: exists(html) ? html : null,
    title,
    pass_threshold: Number(grabConst(src, 'PASS_THRESHOLD')) || null,
    total_questions: Number(grabConst(src, 'TOTAL_QUESTIONS')) || questions.length,
    ls_key: (grabConst(src, 'LS_KEY') || '').replace(/['"]/g, '') || null,
    posts_module: (src.match(/module:\s*'([^']+)'/) || [])[1] || null,
    client_answer_key_present: !!answerKey,
    questions: questions.map(q => ({
      id: 'Q' + q.id,
      section: q.section || null,
      slide_refs: q.slideRefs || null,
      fingerprint: fp(q.text, { A: q.options.A, B: q.options.B, C: q.options.C, D: q.options.D }),
      client_key: answerKey ? (answerKey['Q' + q.id] || null) : null
    }))
  });
}

// backend
let backend = { file: null, routes: [], handlers: [], thresholds: {} };
if (exists('backend/apps-script.gs')) {
  const gs = read('backend/apps-script.gs');
  backend.file = 'backend/apps-script.gs';
  backend.routes = [...gs.matchAll(/moduleId\s*===\s*'([^']+)'\s*\)\s*\{\s*return\s+(\w+)/g)]
    .map(m => ({ module: m[1], handler: m[2] }));
  backend.handlers = [...gs.matchAll(/function\s+(handleMod\d+Post)\s*\(/g)].map(m => m[1]);
  for (const m of gs.matchAll(/const\s+(PASS_THRESHOLD_MOD\d+|TOTAL_QUESTIONS_MOD\d+)\s*=\s*(\d+)/g)) {
    backend.thresholds[m[1]] = Number(m[2]);
  }
  backend.reminder_endpoint = /action === 'sendReminders'/.test(gs);
  backend.getData_endpoint = /action === 'getData'/.test(gs);
}

// canonical banks present
const banks = fs.readdirSync(REPO).filter(f => /^KC_Canonical_QuestionBank_v.*\.json$/.test(f)).sort();
const guardBank = banks.find(b => b.includes('v2')) || banks[banks.length - 1] || null;

const manifest = {
  generated_on: STAMP,
  generator: 'tools/generate_manifest.js',
  note: 'Derived from actual repo files. Do not edit by hand — re-run the generator.',
  pages_base_url: 'https://enerbartoli.github.io/mod1-knowledge-check/',
  canonical_banks: banks,
  guard_bank: guardBank,
  modules,
  backend
};
fs.writeFileSync(path.join(REPO, 'APP_MANIFEST.json'), JSON.stringify(manifest, null, 2));

// markdown
const L = [];
L.push('# App Manifest');
L.push('');
L.push(`_Generated ${STAMP} by \`tools/generate_manifest.js\` from the actual repo files. Do not edit by hand — re-run the generator._`);
L.push('');
L.push('Pages base URL: ' + manifest.pages_base_url);
L.push('');
L.push('## Modules');
L.push('');
L.push('| Module | Page | JS | Questions | Pass | Posts as | Client key in JS |');
L.push('|---|---|---|---|---|---|---|');
for (const m of modules) {
  L.push(`| ${m.module_id} | ${m.html_file || '—'} | ${m.js_file} | ${m.total_questions} | ${m.pass_threshold ?? '—'} | ${m.posts_module || '—'} | ${m.client_answer_key_present ? 'yes' : 'no'} |`);
}
L.push('');
for (const m of modules) {
  L.push(`### ${m.module_id} — ${m.title || '(no title)'}`);
  L.push('');
  L.push(`- JS: \`${m.js_file}\` · HTML: \`${m.html_file || '—'}\` · localStorage key: \`${m.ls_key || '—'}\``);
  L.push(`- Questions: ${m.total_questions} · Pass threshold: ${m.pass_threshold ?? '—'}`);
  L.push('');
  L.push('| Q | section | slides | fingerprint | client key |');
  L.push('|---|---|---|---|---|');
  for (const q of m.questions) {
    L.push(`| ${q.id} | ${q.section || ''} | ${q.slide_refs || ''} | \`${q.fingerprint}\` | ${q.client_key || ''} |`);
  }
  L.push('');
}
L.push('## Backend (' + (backend.file || 'not found') + ')');
L.push('');
if (backend.file) {
  L.push('Routing (`doPost`):');
  L.push('');
  for (const r of backend.routes) L.push(`- \`${r.module}\` → \`${r.handler}\``);
  L.push('- \`mod1\` → inline flow in \`doPost\` (no dedicated handler)');
  L.push('');
  L.push('Per-module handlers found: ' + (backend.handlers.join(', ') || 'none'));
  L.push('');
  L.push('Thresholds/constants:');
  L.push('');
  for (const [k, v] of Object.entries(backend.thresholds)) L.push(`- \`${k}\` = ${v}`);
  L.push('');
  L.push(`Endpoints: getData=${backend.getData_endpoint ? 'yes' : 'no'} · sendReminders=${backend.reminder_endpoint ? 'yes' : 'no'}`);
  L.push('');
  L.push('> Note: the authoritative answer keys live server-side in this file (`ANSWER_KEY_*`). Client JS also carries a key for the instant results screen; the guard checks they agree with the canonical bank.');
}
L.push('');
L.push('## Canonical banks in repo');
L.push('');
for (const b of banks) L.push(`- \`${b}\`${b === guardBank ? '  ← used by the drift guard' : ''}`);
L.push('');
fs.writeFileSync(path.join(REPO, 'APP_MANIFEST.md'), L.join('\n'));

console.log('wrote APP_MANIFEST.md and APP_MANIFEST.json (' + modules.length + ' modules, backend ' + (backend.file ? 'parsed' : 'absent') + ')');
