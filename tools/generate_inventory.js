#!/usr/bin/env node
'use strict';
/*
 * generate_inventory.js — Writes audit/APP_INVENTORY.md from the ACTUAL repo state.
 * Never edit the inventory by hand; re-run this. The guard (verify_inventory.js)
 * fails the build if the committed inventory's structural hash no longer matches
 * the repo.
 *
 * Submission counts per module are fetched live (read-only) at generation time and
 * are informational only — they are NOT part of the structural hash, so the build
 * does not break as new submissions arrive or when offline.
 *
 * Usage:  node tools/generate_inventory.js
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const lib = require('./inventory_lib');

const REPO = lib.REPO;
const APPS_SCRIPT = 'https://script.google.com/macros/s/AKfycbwZLIenD2Ef1-B5BSzFDsrFDNezDM_jWuT9JrmYdQTv4wSzswFOxJgyp67Y6z24-r_mOw/exec?action=getData';

function gitHead() {
  try { return execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim(); }
  catch (_) { return '(unknown — not a git checkout)'; }
}
function today() {
  const d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}
function fetchCounts() {
  // Use curl so the environment's HTTPS proxy is honoured (node https ignores it).
  try {
    const out = execSync(`curl -sS -L --max-time 45 "${APPS_SCRIPT}"`, { cwd: REPO, maxBuffer: 10 * 1024 * 1024 }).toString();
    const rows = (JSON.parse(out).rows) || [];
    const counts = {};
    for (const r of rows) { const m = r.module || 'mod1'; counts[m] = (counts[m] || 0) + 1; }
    return { ok: true, counts, total: rows.length };
  } catch (_) { return { ok: false }; }
}

(async () => {
  const { modules, bankFile } = lib.extractModules();
  const backend = lib.extractBackend();
  const sha = lib.structuralSha();
  const counts = fetchCounts();

  const L = [];
  L.push('# App Inventory');
  L.push('');
  L.push('<!-- GENERATED FILE — do not edit by hand. Run: node tools/generate_inventory.js -->');
  L.push(`<!-- structural_sha: ${sha} -->`);
  L.push('');
  L.push(`- Generated: **${today()}**`);
  L.push(`- Commit at generation (HEAD): \`${gitHead()}\``);
  L.push(`- Guard bank: \`${bankFile || '(none)'}\``);
  L.push(`- Structural hash: \`${sha}\` (the drift guard fails the build if this stops matching the repo)`);
  L.push('');
  L.push('## Modules');
  L.push('');
  L.push('| Module | Page URL | JS | Questions | Pass | Options |');
  L.push('|---|---|---|---|---|---|');
  for (const m of modules) {
    const auth = m.options_authoritative === true ? 'authoritative'
      : m.options_authoritative === false ? 'harvested' : 'unknown';
    L.push(`| ${m.module_id} | ${m.page_url} | ${m.js_file} | ${m.total_questions} | ${m.pass_threshold ?? '—'} | ${auth} |`);
  }
  L.push('');
  for (const m of modules) {
    const auth = m.options_authoritative === true ? 'authoritative (bank is source of truth)'
      : m.options_authoritative === false ? 'harvested (deployed page is source of truth)' : 'unknown';
    L.push(`### ${m.module_id}`);
    L.push('');
    L.push(`- Page: ${m.page_url} · JS: \`${m.js_file}\` · HTML: \`${m.html_file || '—'}\``);
    L.push(`- Questions: ${m.total_questions} · Pass threshold: ${m.pass_threshold ?? '—'} · Options: ${auth}`);
    L.push('');
    for (const q of m.questions) {
      L.push(`**${q.id}** · fingerprint \`${q.fingerprint}\` · correct **${q.correct || '?'}** · rationale ${q.rationale_present ? 'yes' : 'no'} · slides ${q.slide_refs || '—'}`);
      L.push('');
      L.push('> ' + q.text.replace(/\n/g, ' '));
      L.push('');
      for (const k of lib.LETTERS) {
        const mark = k === q.correct ? ' ✓' : '';
        L.push(`- **${k}${mark}** ${q.options[k]}`);
      }
      L.push('');
    }
  }
  L.push('## Backend');
  L.push('');
  if (backend) {
    L.push('- File: `backend/apps-script.gs`');
    L.push('- Sheet name: `' + (backend.sheet_name || '—') + '`');
    L.push('- QUIZ_CLOSED: **' + (backend.quiz_closed === null ? 'unknown' : backend.quiz_closed) + '**');
    L.push('');
    L.push('Routing (`doPost`):');
    L.push('');
    for (const r of backend.routes) L.push(`- \`${r.module}\` → \`${r.handler}\``);
    L.push('- `mod1` → inline flow in `doPost` (no dedicated handler)');
    L.push('');
    L.push('Handlers: ' + backend.handlers.map(h => '`' + h + '`').join(', '));
    L.push('');
    L.push('Email template functions: ' + backend.email_templates.map(h => '`' + h + '`').join(', '));
    L.push('');
    L.push('Sheet columns (from `writeHeaders`; moduleId + attemptNumber are appended by each handler without headers):');
    L.push('');
    L.push(backend.columns.map((c, i) => `${i + 1}. ${c}`).join('\n'));
  } else {
    L.push('_backend/apps-script.gs not found._');
  }
  L.push('');
  L.push('## Submissions per module (snapshot, informational — not part of the structural hash)');
  L.push('');
  if (counts.ok) {
    L.push(`_As of ${today()} — total ${counts.total}._`);
    L.push('');
    L.push('| Module | Submissions |');
    L.push('|---|---|');
    for (const m of modules) L.push(`| ${m.module_id} | ${counts.counts[m.module_id] || 0} |`);
  } else {
    L.push('_Live counts unavailable at generation time (offline or endpoint unreachable)._');
  }
  L.push('');

  fs.writeFileSync(path.join(REPO, 'audit', 'APP_INVENTORY.md'), L.join('\n'));
  console.log('wrote audit/APP_INVENTORY.md (structural_sha ' + sha.slice(0, 12) + '…, submissions ' + (counts.ok ? 'live' : 'offline') + ')');
})();
