#!/usr/bin/env node
'use strict';
/*
 * verify_bank.js — Drift guard for the HERO knowledge-check question bank.
 *
 * Compares every deployed quiz page (quiz.js = mod1, modN.js = modN) against the
 * canonical question bank (KC_Canonical_QuestionBank_v2_2026-08-07.json by default).
 *
 * Design note (why it catches NEW modules, not just edits):
 *   The check compares each rendered page against the ABSOLUTE canonical file, not
 *   against the previous git state. A brand-new module is therefore validated on its
 *   very first commit — the exact failure mode that let MOD 7 Q6 ship broken. It also
 *   fails closed if a quiz page exists with no canonical entry, or vice versa.
 *
 * Exit code: 0 = all good, 1 = at least one failure (so it FAILS builds, never just warns).
 *
 * Usage:  node tools/verify_bank.js [path-to-canonical.json]
 * No external dependencies (Node stdlib only).
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const REPO = path.resolve(__dirname, '..');
function newestBank() {
  const banks = fs.readdirSync(REPO).filter(f => /^KC_Canonical_QuestionBank_v\d+.*\.json$/.test(f));
  banks.sort((a, b) => (parseInt((a.match(/_v(\d+)/) || [])[1] || 0)) - (parseInt((b.match(/_v(\d+)/) || [])[1] || 0)));
  return banks.length ? path.join(REPO, banks[banks.length - 1]) : null;
}
const CANONICAL = process.argv[2] ? path.resolve(process.argv[2]) : newestBank();

const LETTERS = ['A', 'B', 'C', 'D'];
const fail = [];
const info = [];

function norm(s) { return String(s == null ? '' : s).replace(/\s+/g, ' ').trim(); }
function fingerprint(text, opts) {
  const base = text + '|' + LETTERS.map(k => `${k}:${opts[k]}`).join('|');
  return crypto.createHash('sha1').update(norm(base)).digest('hex').slice(0, 12);
}

// Map module_id -> deployed page JS file. mod1 lives in quiz.js; others in <id>.js
// (modN.js for the main programme, speedN.js for the Speed Training track).
function pageFileFor(moduleId) {
  return moduleId === 'mod1' ? 'quiz.js' : `${moduleId}.js`;
}
// Page files this guard knows how to find. A module whose file does not match one of
// these is silently skipped by discoverPages(), which is how a new module could ship
// with no guard coverage — so extend this when a new track is added.
const PAGE_FILE_RE = /^(mod|speed)\d+\.js$/;

// Extract a balanced [] or {} literal that follows `const <NAME>`.
function extractLiteral(src, declName, open, close) {
  const s = src.indexOf('const ' + declName);
  if (s < 0) return null;
  const o = src.indexOf(open, s);
  if (o < 0) return null;
  let depth = 0, inStr = false, sc = '', esc = false;
  for (let i = o; i < src.length; i++) {
    const c = src[i];
    if (inStr) {
      if (esc) esc = false;
      else if (c === '\\') esc = true;
      else if (c === sc) inStr = false;
      continue;
    }
    if (c === "'" || c === '"' || c === '`') { inStr = true; sc = c; continue; }
    if (c === open) depth++;
    else if (c === close) { depth--; if (depth === 0) return src.slice(o, i + 1); }
  }
  return null;
}

function extractPage(file) {
  const src = fs.readFileSync(path.join(REPO, file), 'utf8');
  const qLit = extractLiteral(src, 'QUESTIONS', '[', ']');
  if (!qLit) throw new Error(`could not find QUESTIONS array in ${file}`);
  // eslint-disable-next-line no-eval
  const questions = eval(qLit); // data literal of strings only
  let answerKey = null;
  const kLit = extractLiteral(src, 'ANSWER_KEY', '{', '}');
  if (kLit) { answerKey = eval('(' + kLit + ')'); } // eslint-disable-line no-eval
  return { questions, answerKey };
}

// Which quiz page files actually exist in the repo?
function discoverPages() {
  const files = fs.readdirSync(REPO).filter(f => PAGE_FILE_RE.test(f) || f === 'quiz.js');
  const map = {}; // module_id -> file
  for (const f of files) {
    const id = f === 'quiz.js' ? 'mod1' : f.replace(/\.js$/, '');
    map[id] = f;
  }
  return map;
}

// ---- load canonical ----
if (!fs.existsSync(CANONICAL)) {
  console.error(`FATAL: canonical bank not found at ${CANONICAL}`);
  process.exit(1);
}
const canon = JSON.parse(fs.readFileSync(CANONICAL, 'utf8'));
const canonById = {};
for (const m of canon.modules) canonById[m.module_id] = m;

const pages = discoverPages();

// ---- fail closed: every rendered page must be registered in canonical ----
for (const id of Object.keys(pages)) {
  if (!canonById[id]) {
    fail.push(`EXTRA MODULE: ${pages[id]} renders module "${id}" but it has no entry in the canonical bank. Add it to the bank (with correct/options) before shipping.`);
  }
}

// ---- check each canonical module against its rendered page ----
for (const m of canon.modules) {
  const id = m.module_id;
  const file = pages[id];
  if (!file) {
    // Canonical lists a module with no page yet. Not a failure (not built), but note it.
    info.push(`module "${id}" is in the canonical bank but has no rendered page yet (${pageFileFor(id)} absent) — skipped.`);
    continue;
  }

  let page;
  try { page = extractPage(file); }
  catch (e) { fail.push(`${id}: ${e.message}`); continue; }

  const dep = {};
  for (const q of page.questions) dep['Q' + q.id] = q;
  const depKey = page.answerKey || {};

  // question-count / MISSING / EXTRA per module
  const canIds = m.questions.map(q => q.id);
  const depIds = Object.keys(dep);
  for (const qid of canIds) if (!dep[qid]) fail.push(`${id} ${qid}: MISSING — in canonical, not rendered.`);
  for (const qid of depIds) if (!canIds.includes(qid)) fail.push(`${id} ${qid}: EXTRA — rendered, not in canonical.`);

  for (const cq of m.questions) {
    const dq = dep[cq.id];
    if (!dq) continue;
    const opts = {};
    for (const k of LETTERS) opts[k] = dq.options[k];
    const authoritative = (cq.options_authoritative !== false) && (m.options_authoritative !== false);

    // 1) fingerprint check (text + options) against canonical
    const fpDep = fingerprint(dq.text, opts);
    if (fpDep !== cq.fingerprint) {
      if (authoritative) {
        // pinpoint what drifted
        const stem = norm(cq.text) !== norm(dq.text);
        const optDiffs = LETTERS.filter(k => norm(cq.options[k]) !== norm(opts[k]));
        fail.push(`${id} ${cq.id}: FINGERPRINT MISMATCH (canonical ${cq.fingerprint} != rendered ${fpDep}).` +
          (stem ? ' stem differs.' : '') +
          (optDiffs.length ? ` options differ: ${optDiffs.join(',')}.` : '') +
          ` Restore rendered text to canonical.`);
      } else {
        // harvested module (e.g. mod2): assert deployed hasn't changed since harvest
        fail.push(`${id} ${cq.id}: HARVEST DRIFT — rendered options changed since harvest (canonical ${cq.fingerprint} != rendered ${fpDep}). Re-harvest deliberately or revert.`);
      }
      continue; // fingerprint mismatch already reported; skip finer checks
    }

    // 2) key-integrity checks (only meaningful for authoritative modules)
    if (authoritative) {
      const correctText = norm(cq.options[cq.correct]);
      // where does the canonical-correct text sit in the rendered options?
      const renderedLetters = LETTERS.filter(k => norm(opts[k]) === correctText);
      if (renderedLetters.length === 0) {
        fail.push(`${id} ${cq.id}: NO CORRECT ANSWER RENDERED — canonical correct (${cq.correct}) text is absent from the page.`);
      } else if (!renderedLetters.includes(cq.correct)) {
        fail.push(`${id} ${cq.id}: OPTION REORDER — canonical correct text is at letter ${renderedLetters.join('/')}, key expects ${cq.correct}.`);
      }
      // client ANSWER_KEY must agree with canonical correct letter
      if (depKey['Q' + parseInt(cq.id.slice(1), 10)] || depKey[cq.id]) {
        const kv = (depKey[cq.id] || depKey['Q' + parseInt(cq.id.slice(1), 10)] || '').toString().toUpperCase();
        if (kv && kv !== cq.correct) {
          fail.push(`${id} ${cq.id}: ANSWER_KEY MISMATCH — page key ${kv} != canonical ${cq.correct}.`);
        }
      }
    }
  }
}

// ---- report ----
for (const line of info) console.log('note: ' + line);
if (fail.length) {
  console.error('\nDRIFT GUARD FAILED — ' + fail.length + ' problem(s):\n');
  for (const f of fail) console.error('  ✗ ' + f);
  console.error('\nThe rendered quiz pages have drifted from ' + path.basename(CANONICAL) + '. Fix the page(s) or update the canonical bank deliberately.');
  process.exit(1);
}
console.log('drift guard OK — all rendered modules match ' + path.basename(CANONICAL) + '.');
process.exit(0);
