'use strict';
/*
 * inventory_lib.js — shared extraction + structural projection used by both
 * generate_inventory.js (writes the doc) and verify_inventory.js (guard check).
 * Reading the ACTUAL repo files is the whole point: the inventory can never
 * describe something the repo does not contain.
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const REPO = path.resolve(__dirname, '..');
const LETTERS = ['A', 'B', 'C', 'D'];
const PAGES_BASE = 'https://enerbartoli.github.io/mod1-knowledge-check/';

function read(f) { return fs.readFileSync(path.join(REPO, f), 'utf8'); }
function exists(f) { return fs.existsSync(path.join(REPO, f)); }
function norm(s) { return String(s == null ? '' : s).replace(/\s+/g, ' ').trim(); }
function fingerprint(text, opts) {
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
  const m = src.match(new RegExp('const\\s+' + name + '\\s*=\\s*([^;\\n]+)'));
  return m ? m[1].trim() : null;
}

function loadBankFlags() {
  // options_authoritative per module, from the guard bank (v2 if present)
  const banks = fs.readdirSync(REPO).filter(f => /^KC_Canonical_QuestionBank_v\d+.*\.json$/.test(f));
  banks.sort((a, b) => (parseInt((a.match(/_v(\d+)/) || [])[1] || 0)) - (parseInt((b.match(/_v(\d+)/) || [])[1] || 0)));
  const bankFile = banks.length ? banks[banks.length - 1] : null;
  const flags = {};
  if (bankFile) {
    const bank = JSON.parse(read(bankFile));
    for (const m of bank.modules) flags[m.module_id] = (m.options_authoritative !== false);
  }
  return { bankFile, flags };
}

function extractModules() {
  const { bankFile, flags } = loadBankFlags();
  const jsFiles = fs.readdirSync(REPO).filter(f => /^mod\d+\.js$/.test(f) || f === 'quiz.js');
  const modules = [];
  for (const f of jsFiles) {
    const id = f === 'quiz.js' ? 'mod1' : f.replace(/\.js$/, '');
    const src = read(f);
    const qLit = extractLiteral(src, 'QUESTIONS', '[', ']');
    const questions = qLit ? eval(qLit) : []; // eslint-disable-line no-eval
    const kLit = extractLiteral(src, 'ANSWER_KEY', '{', '}');
    const key = kLit ? eval('(' + kLit + ')') : {}; // eslint-disable-line no-eval
    const html = id === 'mod1' ? 'index.html' : `${id}.html`;
    modules.push({
      module_id: id,
      js_file: f,
      html_file: exists(html) ? html : null,
      page_url: PAGES_BASE + (id === 'mod1' ? '' : `${id}.html`),
      total_questions: Number(grabConst(src, 'TOTAL_QUESTIONS')) || questions.length,
      pass_threshold: Number(grabConst(src, 'PASS_THRESHOLD')) || null,
      options_authoritative: (flags[id] !== undefined ? flags[id] : null),
      questions: questions.map(q => {
        const opts = {}; LETTERS.forEach(k => opts[k] = q.options[k]);
        return {
          id: 'Q' + q.id,
          fingerprint: fingerprint(q.text, opts),
          text: q.text,
          options: opts,
          correct: (key['Q' + q.id] || null),
          rationale_present: !!(q.rationale && String(q.rationale).trim()),
          slide_refs: q.slideRefs || null
        };
      })
    });
  }
  modules.sort((a, b) => a.module_id.localeCompare(b.module_id));
  return { modules, bankFile };
}

function extractBackend() {
  if (!exists('backend/apps-script.gs')) return null;
  const gs = read('backend/apps-script.gs');
  const handlers = [...gs.matchAll(/function\s+(handleMod\d+Post)\s*\(/g)].map(m => m[1]).sort();
  const routes = [...gs.matchAll(/moduleId\s*===\s*'([^']+)'\s*\)\s*\{\s*return\s+(\w+)/g)]
    .map(m => ({ module: m[1], handler: m[2] }));
  const sheetName = (grabConst(gs, 'SHEET_NAME') || '').replace(/['"]/g, '') || null;
  const quizClosed = /const\s+QUIZ_CLOSED\s*=\s*true/.test(gs) ? true
    : (/const\s+QUIZ_CLOSED\s*=\s*false/.test(gs) ? false : null);
  // header columns from writeHeaders
  const columns = ['Timestamp', 'Full Name', 'Email', 'Role', 'Role (Other)', 'Score', 'Score %', 'Status'];
  for (let i = 1; i <= 16; i++) { columns.push('Q' + i + ' Answer'); columns.push('Q' + i + ' Correct?'); }
  columns.push('Failed Questions', 'Email Sent?', 'User-Agent');
  columns.push('(moduleId — appended, no header)', '(attemptNumber — appended, no header)');
  // email template functions per module
  const emailFns = [...gs.matchAll(/function\s+(emailShell_mod\d+|sendPassEmail_mod\d+|sendFailEmail_mod\d+|sendNotificationEmail_mod\d+|sendEmails)\s*\(/g)]
    .map(m => m[1]).sort();
  return { handlers, routes, sheet_name: sheetName, quiz_closed: quizClosed, columns, email_templates: emailFns };
}

// Deterministic projection used for the staleness hash. Excludes anything volatile
// (generation date, commit SHA, live submission counts) so the guard is stable and
// offline-safe, but includes everything structural about the app.
function buildStructural() {
  const { modules } = extractModules();
  const backend = extractBackend();
  const m = modules.map(x => ({
    module_id: x.module_id, js_file: x.js_file, html_file: x.html_file, page_url: x.page_url,
    total_questions: x.total_questions, pass_threshold: x.pass_threshold,
    options_authoritative: x.options_authoritative,
    questions: x.questions.map(q => ({
      id: q.id, fingerprint: q.fingerprint, text: norm(q.text),
      options: { A: norm(q.options.A), B: norm(q.options.B), C: norm(q.options.C), D: norm(q.options.D) },
      correct: q.correct, rationale_present: q.rationale_present, slide_refs: q.slide_refs
    }))
  }));
  const b = backend ? {
    handlers: backend.handlers, routes: backend.routes, sheet_name: backend.sheet_name,
    quiz_closed: backend.quiz_closed, columns: backend.columns, email_templates: backend.email_templates
  } : null;
  return { modules: m, backend: b };
}
function structuralSha() {
  return crypto.createHash('sha256').update(JSON.stringify(buildStructural())).digest('hex');
}

module.exports = { REPO, LETTERS, PAGES_BASE, read, exists, norm, extractModules, extractBackend, buildStructural, structuralSha };
