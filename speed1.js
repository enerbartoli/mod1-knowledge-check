'use strict';

// ── Config ───────────────────────────────────────────────────────────────────
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwZLIenD2Ef1-B5BSzFDsrFDNezDM_jWuT9JrmYdQTv4wSzswFOxJgyp67Y6z24-r_mOw/exec';

const PASS_THRESHOLD    = 8;  // ≥8/10 = pass
const TOTAL_QUESTIONS   = 10;
const LS_KEY            = 'speed1_quiz_state';

// No answer key, no correct letters and no rationales live in this file. The quiz is
// scored server-side in backend/apps-script.gs (ANSWER_KEY_SPEED1) and the score comes
// back in the POST response, so nothing a participant can read reveals an answer.

// ── Question Bank ───────────────────────────────────────────────────────
const QUESTIONS = [
  {
    id: 1,
    text: 'Which statement describes how the consensus forecast is built?',
    options: {
      A: 'The statistical baseline is replaced by the commercial view each cycle',
      B: 'The baseline and the enrichment layer are added together',
      C: 'Each team submits a forecast and the average of them is taken',
      D: 'Marketing sets the total and Demand Planning splits it to accounts'
    },
    slideRefs: 'Speed Training Session 1 · The equation',
    section: 'The equation'
  },
  {
    id: 2,
    text: 'Which of these does Hasbro Demand Planning own in the operating model?',
    options: {
      A: 'Running the statistical engine that produces the baseline',
      B: 'Building the launch curve for every new product',
      C: 'Governance, planning parameters and final sign-off',
      D: 'Entering commercial events for each account'
    },
    slideRefs: 'Speed Training Session 1 · Who owns what',
    section: 'Who owns what'
  },
  {
    id: 3,
    text: 'A colleague says the new process will change their numbers for the next two months. What is the accurate response?',
    options: {
      A: 'It will, because the statistical baseline replaces the current numbers from the first cycle onwards',
      B: 'It will, but only for accounts that already sit in the Forecasting Range',
      C: 'It will not, because the tool cannot write to the near horizon at all',
      D: 'It will not; the near months are already committed'
    },
    slideRefs: 'Speed Training Session 1 · Two horizons',
    section: 'Two horizons'
  },
  {
    id: 4,
    text: 'An account is showing volume for an item it has never stocked. Where do you look first?',
    options: {
      A: 'The Forecasting Range, which sets who is eligible for volume',
      B: 'The enrichment rows loaded against that account this cycle',
      C: 'The item\'s lifecycle status and whether it has graduated',
      D: 'The base trend adjustment entered by the account owner last cycle'
    },
    slideRefs: 'Speed Training Session 1 · Eligibility',
    section: 'Eligibility'
  },
  {
    id: 5,
    text: 'What is a Level 2.5 Baseline Pre-Adjustment?',
    options: {
      A: 'An enrichment entered at account level and then rolled up to the item',
      B: 'A change to the statistical model used for that item this cycle',
      C: 'A correction to the item total, made before it is split to accounts',
      D: 'A request asking the executive sign-off meeting to overrule the commercial number'
    },
    slideRefs: 'Speed Training Session 1 · Level 2.5 Baseline Pre-Adjustment',
    section: 'Level 2.5 Baseline Pre-Adjustment'
  },
  {
    id: 6,
    text: 'You have lost distribution at one account and expect lower volume from now on. How is that recorded?',
    options: {
      A: 'As an enrichment, dated to each of the weeks the lost distribution affects',
      B: 'As a note to Demand Planning, with nothing entered in the system',
      C: 'As a change to the baseline itself, made by the account owner',
      D: 'As a base trend adjustment, since the level itself has shifted'
    },
    slideRefs: 'Speed Training Session 1 · Enrichment or base trend',
    section: 'Enrichment or base trend'
  },
  {
    id: 7,
    text: 'During the commercial alignment session Demand Planning challenges a number and the commercial team stands behind it. What happens?',
    options: {
      A: 'Demand Planning applies its own number, since it owns the forecast',
      B: 'The number carries forward as the commercial team stated it',
      C: 'The item is removed from the cycle until the two sides agree',
      D: 'The disagreement is recorded and the baseline is used instead'
    },
    slideRefs: 'Speed Training Session 1 · Ownership at commercial alignment',
    section: 'Ownership at commercial alignment'
  },
  {
    id: 8,
    text: 'A supply constraint has eased and you can now serve more volume inside the frozen period. What does the policy allow?',
    options: {
      A: 'Nothing; the period is locked and cannot be changed for any reason',
      B: 'Any change, as long as the market total for the month does not move',
      C: 'A documented change where there is a genuine supply reason',
      D: 'A change only if the executive sign-off meeting is reconvened'
    },
    slideRefs: 'Speed Training Session 1 · The frozen period',
    section: 'The frozen period'
  },
  {
    id: 9,
    text: 'You think the eligibility setup for one of your accounts is wrong. What do you do?',
    options: {
      A: 'Correct the setup yourself before the cycle closes',
      B: 'Enter an enrichment large enough to cancel the unwanted volume',
      C: 'Contact the system vendor directly and ask them to change the record for you',
      D: 'Raise it; eligibility is master data and you do not change it'
    },
    slideRefs: 'Speed Training Session 1 · Where a question goes',
    section: 'Where a question goes'
  },
  {
    id: 10,
    text: 'You agree a promotion in March that will run in October. When should it be captured?',
    options: {
      A: 'In the cycle that opens closest to October, so the dates are certain',
      B: 'Now, and confirmed or adjusted in each cycle until it runs',
      C: 'Only after the funding for it has been formally approved',
      D: 'At the start of the next planning year, with all other events'
    },
    slideRefs: 'Speed Training Session 1 · Capture is continuous',
    section: 'Capture is continuous'
  }
];

const ROLES = [
  'Sales / Commercial / KAM',
  'Marketing / GBT / GPL',
  'Demand Planning',
  'Finance',
  'Supply Chain',
  'Brand Captain',
  'Change Agent / Pilot POC',
  'Other'
];

// ── State ───────────────────────────────────────────────────────────────────
let state = {
  screen: 'welcome',
  questionIndex: 0,
  userData: { name: '', email: '', role: '', roleOther: '' },
  answers: {},
  results: null,
  submitError: null
};

// ── Persistence ────────────────────────────────────────────────────────────
function saveState() {
  try { localStorage.setItem(LS_KEY, JSON.stringify(state)); } catch (_) {}
}
function loadState() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) {
      const saved = JSON.parse(raw);
      if (saved && saved.screen !== 'results' && saved.screen !== 'welcome') return saved;
    }
  } catch (_) {}
  return null;
}
function clearState() {
  try { localStorage.removeItem(LS_KEY); } catch (_) {}
}

// ── DOM helpers ───────────────────────────────────────────────────────────
const $ = id => document.getElementById(id);
const show = el => el && el.classList.remove('hidden');
const hide = el => el && el.classList.add('hidden');

function setScreen(name) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const target = $(`screen-${name}`);
  if (target) target.classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ── Navigation ─────────────────────────────────────────────────────────────
function goWelcome() { state.screen = 'welcome'; setScreen('welcome'); }
function goIdentity() { state.screen = 'identity'; setScreen('identity'); saveState(); }
function goQuestion(index) {
  state.questionIndex = index;
  state.screen = 'question';
  renderQuestion(index);
  setScreen('question');
  saveState();
}
function goConfirm() { state.screen = 'confirm'; renderConfirm(); setScreen('confirm'); saveState(); }
function goResults(results) {
  state.screen = 'results';
  state.results = results;
  renderResults(results);
  setScreen('results');
  clearState();
}

// ── Welcome ───────────────────────────────────────────────────────────────
function initWelcome() {
  $('btn-start').addEventListener('click', () => {
    const sel = $('module-select');
    if (!sel || !sel.value) {
      const err = $('module-select-error');
      if (err) err.style.display = 'block';
      return;
    }
    var _cur = (document.body.dataset && document.body.dataset.module) || null;
    var _target = (window.HERO_MODULES || []).find(function(m){ return m.id === sel.value; });
    if (_target && _target.id !== _cur) { window.location.href = _target.url; return; }
    const err = $('module-select-error');
    if (err) err.style.display = 'none';
    goIdentity();
  });
}

// ── Identity ────────────────────────────────────────────────────────────
function initIdentity() {
  const grid = $('role-grid');
  ROLES.forEach(role => {
    const label = document.createElement('label');
    label.className = 'role-option';
    label.innerHTML = `
      <input type="radio" name="role" value="${role}">
      <span class="radio-dot"></span>
      <span>${role}</span>
    `;
    label.addEventListener('click', () => selectRole(role, label));
    grid.appendChild(label);
  });
  $('btn-begin').addEventListener('click', submitIdentity);
}

function selectRole(role, labelEl) {
  document.querySelectorAll('.role-option').forEach(l => l.classList.remove('selected'));
  labelEl.classList.add('selected');
  state.userData.role = role;
  const wrap = $('other-text-wrap');
  if (role === 'Other') { show(wrap); } else { hide(wrap); state.userData.roleOther = ''; }
}

function submitIdentity() {
  let valid = true;
  const nameEl = $('input-name'), emailEl = $('input-email');
  const nameErr = $('err-name'), emailErr = $('err-email'), roleErr = $('err-role');

  if (!nameEl.value.trim()) { nameEl.classList.add('error'); nameErr.classList.add('visible'); valid = false; }
  else { nameEl.classList.remove('error'); nameErr.classList.remove('visible'); }

  const emailVal = emailEl.value.trim();
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal);
  if (!emailOk) { emailEl.classList.add('error'); emailErr.classList.add('visible'); valid = false; }
  else { emailEl.classList.remove('error'); emailErr.classList.remove('visible'); }

  if (!state.userData.role) { roleErr.classList.add('visible'); valid = false; }
  else { roleErr.classList.remove('visible'); }

  if (!valid) return;
  state.userData.name  = nameEl.value.trim();
  state.userData.email = emailVal;
  if (state.userData.role === 'Other') {
    state.userData.roleOther = ($('input-role-other').value || '').trim();
  }
  goQuestion(0);
}

// ── Question ─────────────────────────────────────────────────────────────
function renderQuestion(index) {
  const q   = QUESTIONS[index];
  const num = index + 1;
  const pct = Math.round((num - 1) / TOTAL_QUESTIONS * 100);

  $('q-num').textContent = `Question ${num} of ${TOTAL_QUESTIONS}`;
  $('q-section').textContent = q.section;
  $('q-progress-fill').style.width = `${pct}%`;
  $('q-text').textContent = q.text;

  const list = $('options-list');
  list.innerHTML = '';
  ['A', 'B', 'C', 'D'].forEach(letter => {
    const card = document.createElement('div');
    card.className = 'option-card';
    if (state.answers[`Q${q.id}`] === letter) card.classList.add('selected');
    card.innerHTML = `
      <div class="option-letter">${letter}</div>
      <div class="option-text">${escHtml(q.options[letter])}</div>
    `;
    card.addEventListener('click', () => selectOption(q.id, letter));
    list.appendChild(card);
  });

  updateNextBtn(index);
  index === 0 ? hide($('btn-back')) : show($('btn-back'));
}

function selectOption(qId, letter) {
  state.answers[`Q${qId}`] = letter;
  document.querySelectorAll('.option-card').forEach((card, i) => {
    const l = ['A', 'B', 'C', 'D'][i];
    card.classList.toggle('selected', l === letter);
  });
  updateNextBtn(state.questionIndex);
  saveState();
}

function updateNextBtn(index) {
  const q       = QUESTIONS[index];
  const hasAns  = !!state.answers[`Q${q.id}`];
  const nextBtn = $('btn-next');
  nextBtn.disabled = !hasAns;
  nextBtn.textContent = index === TOTAL_QUESTIONS - 1 ? 'Review & Submit' : 'Next →';
}

function initQuestion() {
  $('btn-next').addEventListener('click', () => {
    if (state.questionIndex < TOTAL_QUESTIONS - 1) goQuestion(state.questionIndex + 1);
    else goConfirm();
  });
  $('btn-back').addEventListener('click', () => {
    if (state.questionIndex > 0) goQuestion(state.questionIndex - 1);
    else goIdentity();
  });
}

// ── Confirm ───────────────────────────────────────────────────────────────
function renderConfirm() {
  const answered = Object.keys(state.answers).length;
  $('confirm-answered').textContent = `${answered} of ${TOTAL_QUESTIONS} questions answered`;
  $('confirm-name').textContent = state.userData.name;
}
function initConfirm() {
  $('btn-submit').addEventListener('click', submitQuiz);
  $('btn-go-back').addEventListener('click', () => goQuestion(TOTAL_QUESTIONS - 1));
}

// ── Submit ─────────────────────────────────────────────────────────────
async function submitQuiz() {
  const payload = {
    name:      state.userData.name,
    email:     state.userData.email,
    role:      state.userData.role,
    roleOther: state.userData.roleOther,
    answers:   state.answers,
    module:    'speed1',
    userAgent: navigator.userAgent,
    quizUrl:   window.location.href
  };

  const submitBtn = $('btn-submit');
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<span class="spinner"></span> Submitting…';
  hide($('submit-error'));

  // The score is computed by the Apps Script and read back from its response.
  // Content-Type text/plain keeps this a simple request, so there is no preflight.
  //
  // A result is accepted ONLY when the server actually returns a score. Anything else is
  // a submission that did not land: no sheet row, no email. The most likely such case is
  // the window between this page going live and the Apps Script being redeployed with the
  // speedN handlers — until then doPost falls through to the MOD 1 flow, which rejects a
  // ten-answer payload and returns {error} rather than a score. Treating that as success
  // would show a pass screen for a submission that was never recorded and, because
  // goResults() clears the saved state, would throw the participant's answers away too.
  let result = null;
  let failure = null;
  try {
    const res  = await fetch(APPS_SCRIPT_URL, {
      method:  'POST',
      headers: { 'Content-Type': 'text/plain' },
      body:    JSON.stringify(payload)
    });
    const data = await res.json();
    if (data && typeof data.score === 'number') result = data;
    else failure = (data && data.error) ? data.error : 'The scoring service did not return a result.';
  } catch (err) {
    failure = err.message;
  }

  if (!result) {
    // Stay on this screen, keep the saved state, and say so plainly. Nothing is cleared,
    // so the answers survive a refresh and the participant can retry without redoing the
    // quiz. Retrying after a successful-but-unreadable write would add a second attempt
    // row, which is visible and harmless; a false pass or lost answers would not be.
    console.warn('Submission was not recorded:', failure);
    submitBtn.disabled = false;
    submitBtn.textContent = 'Submit Answers';
    const errEl = $('submit-error');
    if (errEl) {
      errEl.textContent = 'We could not record your answers just yet. Nothing has been lost — your answers are '
        + 'saved on this device, so you can close this page and come back to it. Please try again in a few '
        + 'minutes, and tell the Demand Planning team if it keeps happening.';
      show(errEl);
    }
    saveState();
    return;
  }

  try {
    goResults(result);
  } catch (err) {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Submit Answers';
    const errEl = $('submit-error');
    if (errEl) { errEl.textContent = 'Error showing results: ' + err.message; show(errEl); }
    console.error('goResults error:', err);
  }
}

// ── Results ───────────────────────────────────────────────────────────────
function renderResults(data) {
  // Only ever called with a server-scored result — submitQuiz() does not navigate here
  // otherwise, so there is no "submitted, score unknown" state to render.
  const { score, total, percent, pass, failed_questions } = data;
  const pctDisplay = Math.round(percent);

  $('result-score').textContent = `${score} / ${total}`;
  $('result-score').className   = `score-number ${pass ? 'pass' : 'fail'}`;
  $('result-pct').textContent   = `${pctDisplay}%`;

  const badge = $('result-badge');
  badge.textContent = pass ? 'PASSED ✓' : 'BELOW THRESHOLD';
  badge.className   = `pass-badge ${pass ? 'pass' : 'fail'}`;

  $('result-message').textContent = pass
    ? 'Great work — you\'ve met the 80% threshold. Check your email for your confirmation.'
    : 'You\'re below the 80% threshold. Check your email for the questions to review, then retake when ready.';

  const missedSection = $('missed-section');
  if (failed_questions && failed_questions.length > 0 && !pass) {
    missedSection.classList.remove('hidden');
    $('missed-title').textContent = 'Check your email for detailed feedback on the questions to review.';
    $('failed-list').innerHTML = '';
  } else {
    missedSection.classList.add('hidden');
  }
}

function initResults() {
  $('btn-retake').addEventListener('click', retakeQuiz);
}

function retakeQuiz() {
  clearState();
  state = {
    screen: 'welcome',
    questionIndex: 0,
    userData: { name: '', email: '', role: '', roleOther: '' },
    answers: {},
    results: null,
    submitError: null
  };
  $('input-name').value = '';
  $('input-email').value = '';
  $('input-role-other').value = '';
  document.querySelectorAll('.role-option').forEach(l => l.classList.remove('selected'));
  hide($('other-text-wrap'));
  goWelcome();
}

// ── Resume ───────────────────────────────────────────────────────────────
function checkResume(saved) {
  if (!saved) return false;
  const banner = $('resume-banner');
  if (!banner) return false;
  banner.classList.remove('hidden');
  $('btn-resume').addEventListener('click', () => {
    state = saved;
    banner.classList.add('hidden');
    if (state.screen === 'question')   goQuestion(state.questionIndex);
    else if (state.screen === 'confirm') goConfirm();
    else if (state.screen === 'identity') { goIdentity(); restoreIdentityFields(); }
  });
  $('btn-discard').addEventListener('click', () => { clearState(); banner.classList.add('hidden'); });
  return true;
}

function restoreIdentityFields() {
  if (state.userData.name)  $('input-name').value  = state.userData.name;
  if (state.userData.email) $('input-email').value = state.userData.email;
  if (state.userData.role) {
    document.querySelectorAll('.role-option').forEach(label => {
      const input = label.querySelector('input');
      if (input && input.value === state.userData.role) selectRole(state.userData.role, label);
    });
  }
  if (state.userData.roleOther) $('input-role-other').value = state.userData.roleOther;
}

// ── Util ───────────────────────────────────────────────────────────────────
function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ── Boot ───────────────────────────────────────────────────────────────────
function init() {
  initWelcome();
  initIdentity();
  initQuestion();
  initConfirm();
  initResults();
  initDashboard();

  const saved = loadState();
  checkResume(saved);
  setScreen('welcome');
}
document.addEventListener('DOMContentLoaded', init);

// ══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════──
// DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════──

const DASH_HASH   = '3112727bdedc9e678230b70a47eb12222f8e6da33f24a9c5539f50cf4c84359c';
const DASH_LS_KEY = 'mod1_dash_unlocked'; // shared session key — same password across all modules
const DASH_EXPIRY = 8 * 60 * 60 * 1000;

let dashAllRows     = [];
let dashRows        = [];
let dashFiltered    = [];
let dashModules     = new Set();
let dashLastUpdated = null;

function initDashboard() {
  $('btn-open-dashboard').addEventListener('click', () => { setScreen('dashboard'); checkDashAuth(); });
  $('btn-open-dashboard-welcome').addEventListener('click', () => { setScreen('dashboard'); checkDashAuth(); });
  $('btn-dash-back').addEventListener('click', () => setScreen('results'));
  $('btn-dash-to-quiz').addEventListener('click', () => setScreen('welcome'));
  $('btn-dash-logout').addEventListener('click', dashLogout);
  $('dash-pwd-btn').addEventListener('click', dashTryUnlock);
  $('dash-pwd-input').addEventListener('keydown', e => { if (e.key === 'Enter') dashTryUnlock(); });
  $('dash-filter-btn').addEventListener('click', applyDateFilter);
  $('dash-clear-btn').addEventListener('click', clearDateFilter);
  $('dash-lookup-btn').addEventListener('click', runLookup);
  $('dash-lookup-input').addEventListener('keydown', e => { if (e.key === 'Enter') runLookup(); });

  document.querySelectorAll('.mod-filter-check').forEach(cb => {
    cb.addEventListener('change', () => {
      dashModules = new Set([...document.querySelectorAll('.mod-filter-check:checked')].map(c => c.value));
      dashRows     = filterByModules(dashAllRows, dashModules);
      dashFiltered = dashRows;
      populateRoleFilter();
      const from = $('dash-date-from').value, to = $('dash-date-to').value, role = $('dash-role-filter').value;
      if (from || to || role) applyDateFilter(); else renderDash();
    });
  });

  $('btn-dash-refresh').addEventListener('click', refreshDash);
  $('btn-pending-refresh').addEventListener('click', renderPendingUsers);
  $('pending-select-all').addEventListener('change', function() {
    const checked = this.checked;
    document.querySelectorAll('.pending-user-cb').forEach(cb => { cb.checked = checked; });
    updatePendingCount();
  });
  $('btn-send-reminders').addEventListener('click', sendReminderEmails);
}

function checkDashAuth() {
  const stored = localStorage.getItem(DASH_LS_KEY);
  if (stored && Date.now() - parseInt(stored) < DASH_EXPIRY) {
    showDashContent();
  } else {
    show($('dash-gate'));
    hide($('dash-content'));
    $('dash-pwd-input').value = '';
    hide($('dash-pwd-error'));
  }
}

async function dashTryUnlock() {
  const pwd  = $('dash-pwd-input').value;
  const hash = await sha256(pwd);
  if (hash === DASH_HASH) {
    localStorage.setItem(DASH_LS_KEY, Date.now().toString());
    hide($('dash-pwd-error'));
    showDashContent();
  } else {
    show($('dash-pwd-error'));
    $('dash-pwd-input').select();
  }
}

function dashLogout() {
  localStorage.removeItem(DASH_LS_KEY);
  hide($('dash-content'));
  show($('dash-gate'));
  $('dash-pwd-input').value = '';
}

async function sha256(str) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function showDashContent() {
  hide($('dash-gate'));
  show($('dash-content'));

  $('dash-table-wrap').innerHTML = '<p class="muted" style="font-size:13px;">Loading…</p>';
  $('dash-kpis').innerHTML = '';

  try {
    const res  = await fetch(APPS_SCRIPT_URL + '?action=getData');
    const data = await res.json();
    dashAllRows  = (data.rows || []).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    dashLastUpdated = new Date();
    updateLastUpdatedLabel();
    dashModules  = new Set([...document.querySelectorAll('.mod-filter-check:checked')].map(c => c.value));
    dashRows     = filterByModules(dashAllRows, dashModules);
    dashFiltered = dashRows;
    populateRoleFilter();
    renderDash();
  } catch (err) {
    $('dash-table-wrap').innerHTML = '<p style="color:var(--coral);font-size:13px;">Failed to load data. Make sure the Apps Script is deployed and the Sheet has data.</p>';
  }
}

function populateRoleFilter() {
  const select  = $('dash-role-filter');
  const current = select.value;
  const rolesInData = [...new Set(dashRows.map(r => r.role).filter(Boolean))];
  const allRoles = ROLES.filter(r => r !== 'Other').concat(rolesInData.filter(r => !ROLES.includes(r)));
  select.innerHTML = '<option value="">All roles</option>' +
    allRoles.map(r => `<option value="${escHtml(r)}" ${r === current ? 'selected' : ''}>${escHtml(r)}</option>`).join('');
}

function applyDateFilter() {
  const from = $('dash-date-from').value;
  const to   = $('dash-date-to').value;
  const role = $('dash-role-filter').value;

  dashFiltered = dashRows.filter(r => {
    const d = new Date(r.timestamp);
    if (from && d < new Date(from + 'T00:00:00')) return false;
    if (to   && d > new Date(to   + 'T23:59:59')) return false;
    if (role && r.role !== role) return false;
    return true;
  });

  const label = [];
  if (from) label.push('From ' + from);
  if (to)   label.push('To ' + to);
  if (role) label.push('Role: ' + role);
  $('dash-filter-label').textContent = label.length
    ? label.join(' · ') + ' — ' + dashFiltered.length + ' submission(s)'
    : '';
  renderDash();
}

function clearDateFilter() {
  $('dash-date-from').value   = '';
  $('dash-date-to').value     = '';
  $('dash-role-filter').value = '';
  dashFiltered = dashRows;
  $('dash-filter-label').textContent = '';
  renderDash();
}

function renderDash() {
  renderKPIs();
  renderDonut();
  renderHistogram();
  renderHeatmap();
  renderTable();
  // Main-programme panels see main-track rows only; the Speed section below sees
  // Speed rows only. Neither track's figures can absorb the other's submissions.
  const mainRows = HERO_TRACK.main(dashFiltered);
  renderPassRateByRole(mainRows);
  renderFirstAttemptPassRate(mainRows);
  renderAttemptsToPAss(mainRows);
  renderPendingUsers();
  if (window.HERO_SPEED_DASH) HERO_SPEED_DASH.render(dashFiltered);
}

function renderKPIs() {
  const rows     = HERO_TRACK.main(dashFiltered);
  const total    = rows.length;
  const passes   = rows.filter(r => r.status === 'Pass').length;
  const fails    = total - passes;
  const avgPct   = total ? Math.round(rows.reduce((s, r) => s + (r.percent || 0), 0) / total) : 0;
  const passRate = total ? Math.round((passes / total) * 100) : 0;

  const kpis = [
    { val: total,          label: 'Submissions', color: 'var(--white)' },
    { val: passes,         label: 'Passed',       color: 'var(--teal)' },
    { val: fails,          label: 'Need retry',   color: 'var(--coral)' },
    { val: avgPct + '%',   label: 'Avg score',    color: 'var(--yellow)' },
    { val: passRate + '%', label: 'Pass rate',    color: 'var(--teal)' },
  ];

  $('dash-kpis').innerHTML = kpis.map(k =>
    `<div class="kpi-card" style="padding:14px 8px;">
      <div class="kpi-val" style="color:${k.color};font-size:26px;">${k.val}</div>
      <div class="kpi-label">${k.label}</div>
    </div>`
  ).join('');
}

function renderDonut() {
  const canvas = $('chart-donut');
  const ctx    = canvas.getContext('2d');
  const rows   = HERO_TRACK.main(dashFiltered);
  const passes = rows.filter(r => r.status === 'Pass').length;
  const fails  = rows.length - passes;
  const total  = rows.length || 1;
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);

  const cx = W / 2, cy = H / 2, outer = 80, inner = 50;
  let start = -Math.PI / 2;
  [{ val: passes, color: '#14B8A6' }, { val: fails, color: '#F87171' }].forEach(s => {
    const angle = (s.val / total) * 2 * Math.PI;
    ctx.beginPath(); ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, outer, start, start + angle);
    ctx.closePath(); ctx.fillStyle = s.color; ctx.fill();
    start += angle;
  });

  ctx.beginPath(); ctx.arc(cx, cy, inner, 0, 2 * Math.PI);
  ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--navy-mid').trim() || '#1E2A4A';
  ctx.fill();

  ctx.fillStyle = '#fff'; ctx.font = 'bold 22px Calibri, sans-serif';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(rows.length, cx, cy - 8);
  ctx.font = '11px Calibri, sans-serif'; ctx.fillStyle = '#94A3B8';
  ctx.fillText('total', cx, cy + 12);

  $('chart-donut-legend').innerHTML =
    `<span style="color:#14B8A6;">● Pass ${passes}</span>
     <span style="color:#F87171;">● Fail ${fails}</span>`;
}

function renderHistogram() {
  const canvas = $('chart-hist');
  const ctx    = canvas.getContext('2d');
  const rows   = HERO_TRACK.main(dashFiltered);

  const modPassThreshold = Object.fromEntries((window.HERO_MODULES || []).map(function(m){ return [m.id, m.pass]; }));
  const passes = rows.filter(r => {
    const thr = modPassThreshold[r.module || 'mod1'] || 13;
    return (r.score || 0) >= thr;
  }).length;
  const fails = rows.length - passes;

  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);

  if (!rows.length) return;

  const modIds = [...new Set(rows.map(r => r.module || 'mod1'))];
  if (modIds.length === 1) {
    const mod = modIds[0];
    const thr = modPassThreshold[mod] || 13;
    let buckets;
    if (mod === 'mod4') {
      buckets = [
        { label: '0-2',  min: 0, max: 2 },
        { label: '3-4',  min: 3, max: 4 },
        { label: '5-6',  min: 5, max: 6 },
        { label: '7',    min: 7, max: 7 },
        { label: '8-9',  min: 8, max: 9 },
        { label: '10',   min: 10, max: 10 },
      ];
    } else {
      buckets = [
        { label: '0-4',   min: 0,  max: 4  },
        { label: '5-8',   min: 5,  max: 8  },
        { label: '9-10',  min: 9,  max: 10 },
        { label: '11',    min: 11, max: 11 },
        { label: '12-13', min: 12, max: 13 },
        { label: '14-15', min: 14, max: 15 },
      ];
    }
    buckets.forEach(b => { b.count = rows.filter(r => r.score >= b.min && r.score <= b.max).length; });

    const maxCount = Math.max(...buckets.map(b => b.count), 1);
    const padL = 24, padR = 8, padT = 10, padB = 32;
    const chartW = W - padL - padR, chartH = H - padT - padB;
    const barW = chartW / buckets.length, gap = 6;

    buckets.forEach((b, i) => {
      const bh = (b.count / maxCount) * chartH;
      const x  = padL + i * barW + gap / 2;
      const y  = padT + chartH - bh;
      const isPass = b.min >= thr;

      ctx.fillStyle = isPass ? '#14B8A6' : '#2D3E6F';
      ctx.beginPath();
      ctx.roundRect(x, y, barW - gap, Math.max(bh, 1), [4, 4, 0, 0]);
      ctx.fill();

      if (b.count > 0) {
        ctx.fillStyle = '#fff'; ctx.font = 'bold 11px Calibri, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(b.count, x + (barW - gap) / 2, y - 4);
      }

      ctx.fillStyle = '#94A3B8'; ctx.font = '10px Calibri, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(b.label, x + (barW - gap) / 2, H - padB + 14);
    });

    const thresholdBucketIdx = buckets.findIndex(b => b.min >= thr);
    if (thresholdBucketIdx > 0) {
      const padL2 = 24, padT2 = 10, chartH2 = H - padT2 - 32;
      ctx.strokeStyle = '#FFC72C'; ctx.setLineDash([4, 3]); ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(padL2 + thresholdBucketIdx * barW, padT2);
      ctx.lineTo(padL2 + thresholdBucketIdx * barW, padT2 + chartH2);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  } else {
    const total = rows.length || 1;
    const padL = 40, padR = 40, padT = 20, padB = 32;
    const chartW = W - padL - padR, chartH = H - padT - padB;
    const barW = chartW / 2 - 10;

    [[passes, '#14B8A6', 'Pass'], [fails, '#F87171', 'Fail']].forEach(([count, color, label], i) => {
      const bh = (count / total) * chartH;
      const x  = padL + i * (barW + 20);
      const y  = padT + chartH - bh;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.roundRect(x, y, barW, Math.max(bh, 1), [4, 4, 0, 0]);
      ctx.fill();
      if (count > 0) {
        ctx.fillStyle = '#fff'; ctx.font = 'bold 12px Calibri, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(count, x + barW / 2, y - 5);
      }
      ctx.fillStyle = '#94A3B8'; ctx.font = '11px Calibri, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(label, x + barW / 2, H - padB + 14);
    });
  }
}

function renderHeatmap() {
  const rows = HERO_TRACK.main(dashFiltered);
  if (!rows.length) { $('dash-heatmap').innerHTML = '<p class="muted" style="font-size:13px;">No data.</p>'; return; }

  const modIds = [...new Set(rows.map(r => r.module || 'mod1'))].sort();
  const multiMod = modIds.length > 1;
  let html = '';

  modIds.forEach(mod => {
    const modInfo = DASH_MODULE_REGISTRY[mod];
    if (!modInfo) return;
    const modRows = rows.filter(r => (r.module || 'mod1') === mod);
    const total   = modRows.length || 1;
    const failCount = {};
    for (let i = 1; i <= modInfo.totalQ; i++) failCount[i] = 0;
    modRows.forEach(r => {
      String(r.failed || '').split(',').forEach(s => {
        const n = parseInt(s.trim());
        if (n >= 1 && n <= modInfo.totalQ) failCount[n]++;
      });
    });
    if (multiMod) {
      html += `<div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:var(--teal);margin:12px 0 6px;padding-bottom:4px;border-bottom:1px solid var(--navy-light);">${modInfo.label}</div>`;
    }
    html += Object.entries(failCount).map(([q, count]) => {
      const pct   = Math.round((count / total) * 100);
      const color = pct >= 50 ? '#F87171' : pct >= 25 ? '#FFC72C' : '#14B8A6';
      return `<div class="heatmap-row" style="cursor:pointer;" title="Q${q} — ${pct}% failed · click for details" onclick="showDrillDown(${q}, '${mod}')">
        <span class="heatmap-label">Q${q}</span>
        <div class="heatmap-bar-track">
          <div class="heatmap-bar-fill" style="width:${pct}%;background:${color};"></div>
        </div>
        <span class="heatmap-pct" style="color:${color};">${pct}%</span>
      </div>`;
    }).join('');
  });

  $('dash-heatmap').innerHTML = html;
}

function runLookup() {
  const query  = $('dash-lookup-input').value.trim().toLowerCase();
  const result = $('dash-lookup-result');
  if (!query) { result.innerHTML = ''; return; }

  const matches = dashRows.filter(r => r.email.toLowerCase().includes(query) || r.name.toLowerCase().includes(query));
  if (!matches.length) {
    result.innerHTML = `<p style="color:var(--gray-muted);font-size:13px;">No submissions found for "${escHtml(query)}".</p>`;
    return;
  }

  result.innerHTML = matches.map(r => {
    const d    = new Date(r.timestamp);
    const date = d.toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' });
    const statusColor = r.status === 'Pass' ? 'var(--teal)' : 'var(--coral)';
    return `<div class="lookup-card" style="margin-bottom:8px;">
      <div class="lc-name">${escHtml(r.name)}</div>
      <div class="lc-row">Email: <span>${escHtml(r.email)}</span></div>
      <div class="lc-row">Role: <span>${escHtml(r.role)}</span></div>
      <div class="lc-row">Score: <span>${r.score}/${TOTAL_QUESTIONS} (${Math.round(r.percent)}%)</span></div>
      <div class="lc-row">Status: <span style="color:${statusColor};font-weight:700;">${r.status}</span></div>
      <div class="lc-row">Submitted: <span>${date}</span></div>
      ${r.failed ? `<div class="lc-row">Failed Qs: <span style="color:var(--coral);">${escHtml(r.failed)}</span></div>` : ''}
    </div>`;
  }).join('');
}

function renderTable() {
  const rows = HERO_TRACK.main(dashFiltered);
  $('dash-count').textContent = rows.length + ' record(s)';

  if (!rows.length) {
    $('dash-table-wrap').innerHTML = '<p class="muted" style="font-size:13px;">No submissions in this date range.</p>';
    return;
  }

  $('dash-table-wrap').innerHTML = `
    <table class="dash-table">
      <thead>
        <tr>
          <th>Date</th><th>Name</th><th>Email</th><th>Role</th>
          <th>Module</th><th>Score</th><th>%</th><th>Status</th>
        </tr>
      </thead>
      <tbody>
        ${rows.map(r => {
          const d    = new Date(r.timestamp);
          const date = d.toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' });
          const modInfo = DASH_MODULE_REGISTRY[r.module || 'mod1'];
          const modLabel = modInfo ? modInfo.label.split(' — ')[0] : (r.module || 'MOD 1');
          const modTotal = modInfo ? modInfo.totalQ : TOTAL_QUESTIONS;
          const statusClass = r.status === 'Pass' ? 'status-pass' : 'status-fail';
          return `<tr>
            <td style="white-space:nowrap;">${date}</td>
            <td>${escHtml(r.name)}</td>
            <td style="color:var(--gray-muted);">${escHtml(r.email)}</td>
            <td style="color:var(--gray-muted);">${escHtml(r.role)}</td>
            <td style="color:var(--gray-muted);">${escHtml(modLabel)}</td>
            <td style="font-weight:700;">${r.score}/${modTotal}</td>
            <td>${Math.round(r.percent)}%</td>
            <td class="${statusClass}">${r.status}</td>
          </tr>`;
        }).join('')}
      </tbody>
    </table>`;
}

// ── Module filter helpers ─────────────────────────────────────────────────────
function filterByModules(rows, mods) {
  if (!mods || !mods.size) return rows;
  return rows.filter(r => mods.has(r.module || 'mod1'));
}

function updateLastUpdatedLabel() {
  const el = $('dash-last-updated');
  if (!el || !dashLastUpdated) return;
  const t = dashLastUpdated.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  el.textContent = 'Last updated: ' + t;
}

function refreshDash() { showDashContent(); }

// ── Pass rate by role — any attempt ────────────────────────────────────────
function renderPassRateByRole(rows) {
  const el = $('dash-role-pass');
  if (!el) return;
  if (!rows.length) { el.innerHTML = '<p class="muted" style="font-size:13px;">No data yet.</p>'; return; }

  const roleMap = {};
  rows.forEach(r => {
    const role = r.role || 'Unknown';
    if (!roleMap[role]) roleMap[role] = { unique: new Set(), passed: new Set() };
    roleMap[role].unique.add(r.email);
    if (r.status === 'Pass') roleMap[role].passed.add(r.email);
  });

  const entries = Object.entries(roleMap).map(([role, d]) => {
    const n = d.unique.size, p = d.passed.size;
    return { role, n, p, rate: n ? p / n : 0 };
  }).sort((a, b) => b.rate - a.rate);

  const allUnique = new Set(rows.map(r => r.email));
  const allPassed = new Set(rows.filter(r => r.status === 'Pass').map(r => r.email));
  const totalRate = allUnique.size ? allPassed.size / allUnique.size : 0;

  el.innerHTML = renderRoleBars([
    { role: 'Total', n: allUnique.size, p: allPassed.size, rate: totalRate, isTotal: true },
    ...entries
  ]);
}

// ── Pass rate by role — first attempt ────────────────────────────────────
function renderFirstAttemptPassRate(rows) {
  const el = $('dash-role-first');
  if (!el) return;
  if (!rows.length) { el.innerHTML = '<p class="muted" style="font-size:13px;">No data yet.</p>'; return; }

  const firstByEmail = {};
  rows.forEach(r => {
    if (!firstByEmail[r.email] || new Date(r.timestamp) < new Date(firstByEmail[r.email].timestamp)) {
      firstByEmail[r.email] = r;
    }
  });
  const firstAttempts = Object.values(firstByEmail);

  const roleMap = {};
  firstAttempts.forEach(r => {
    const role = r.role || 'Unknown';
    if (!roleMap[role]) roleMap[role] = { n: 0, p: 0 };
    roleMap[role].n++;
    if (r.status === 'Pass') roleMap[role].p++;
  });

  const entries = Object.entries(roleMap).map(([role, d]) => ({
    role, n: d.n, p: d.p, rate: d.n ? d.p / d.n : 0
  })).sort((a, b) => b.rate - a.rate);

  const totalN = firstAttempts.length;
  const totalP = firstAttempts.filter(r => r.status === 'Pass').length;

  el.innerHTML = renderRoleBars([
    { role: 'Total', n: totalN, p: totalP, rate: totalN ? totalP / totalN : 0, isTotal: true },
    ...entries
  ]);
}

function renderRoleBars(entries) {
  return entries.map(e => {
    const pct   = e.n ? Math.round(e.rate * 100) : 0;
    const color = e.isTotal ? 'var(--yellow)'
                : pct >= 70 ? '#14B8A6'
                : pct >= 40 ? '#FFC72C'
                : '#F87171';
    const label = e.n ? `${pct}% (${e.p} / ${e.n})` : 'No data';
    return `<div class="role-bar-row${e.isTotal ? ' role-bar-total' : ''}">
      <span class="role-bar-label">${escHtml(e.role)}</span>
      <div class="role-bar-track">
        <div class="role-bar-fill" style="width:${pct}%;background:${color};"></div>
      </div>
      <span class="role-bar-val" style="color:${color};">${label}</span>
    </div>`;
  }).join('');
}

// ── Attempts to pass ──────────────────────────────────────────────────
function renderAttemptsToPAss(rows) {
  const canvas = $('chart-attempts');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const byEmail = {};
  rows.forEach(r => {
    if (!byEmail[r.email]) byEmail[r.email] = [];
    byEmail[r.email].push(r);
  });

  const passers = [];
  let notYetPassed = 0;
  Object.values(byEmail).forEach(attempts => {
    attempts.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    const firstPass = attempts.findIndex(r => r.status === 'Pass');
    if (firstPass === -1) notYetPassed++;
    else passers.push(firstPass + 1);
  });

  const buckets = [
    { label: '1',  min: 1, max: 1 },
    { label: '2',  min: 2, max: 2 },
    { label: '3',  min: 3, max: 3 },
    { label: '4+', min: 4, max: Infinity }
  ];
  buckets.forEach(b => { b.count = passers.filter(n => n >= b.min && n <= b.max).length; });

  const note = $('chart-attempts-note');
  if (note) {
    note.textContent = notYetPassed > 0
      ? `${notYetPassed} ${notYetPassed === 1 ? 'person has' : 'people have'} attempted without passing yet.`
      : '';
  }

  const total = passers.length || 1;
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);

  const padL = 24, padR = 8, padT = 24, padB = 32;
  const chartW = W - padL - padR, chartH = H - padT - padB;
  const maxCount = Math.max(...buckets.map(b => b.count), 1);
  const barW = chartW / buckets.length, gap = 10;

  buckets.forEach((b, i) => {
    const pct = Math.round((b.count / total) * 100);
    const bh  = (b.count / maxCount) * chartH;
    const x   = padL + i * barW + gap / 2;
    const y   = padT + chartH - bh;

    ctx.fillStyle = '#14B8A6';
    ctx.beginPath(); ctx.roundRect(x, y, barW - gap, Math.max(bh, 1), [4, 4, 0, 0]); ctx.fill();

    if (b.count > 0) {
      ctx.fillStyle = '#fff'; ctx.font = 'bold 11px Calibri, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${pct}% (${b.count})`, x + (barW - gap) / 2, y - 4);
    }

    ctx.fillStyle = '#94A3B8'; ctx.font = '11px Calibri, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(b.label, x + (barW - gap) / 2, H - padB + 14);
  });

  ctx.fillStyle = '#94A3B8'; ctx.font = '10px Calibri, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Attempts to pass', W / 2, H - 2);
}

// ── Question drill-down modal ───────────────────────────────────────────
function showDrillDown(qNum, moduleId) {
  moduleId = moduleId || 'speed1';
  const modInfo = DASH_MODULE_REGISTRY[moduleId];
  if (!modInfo) return;
  const q = modInfo.questions.find(x => x.id === qNum);
  if (!q) return;

  const correctLetter = modInfo.answerKey['Q' + qNum];
  const rows = dashFiltered.filter(r => (r.module || 'mod1') === moduleId);

  let failCount = 0;
  rows.forEach(r => {
    const nums = String(r.failed || '').split(',').map(s => parseInt(s.trim())).filter(Boolean);
    if (nums.includes(qNum)) failCount++;
  });
  const failPct = rows.length ? Math.round((failCount / rows.length) * 100) : 0;

  const picks = { A: 0, B: 0, C: 0, D: 0 };
  let hasAnswerData = false, totalWithAnswers = 0;
  rows.forEach(r => {
    if (!r.answers) return;
    const given = (r.answers['Q' + qNum] || '').toUpperCase();
    if (!['A', 'B', 'C', 'D'].includes(given)) return;
    picks[given]++; totalWithAnswers++; hasAnswerData = true;
  });

  const optionsHTML = ['A', 'B', 'C', 'D'].map(letter => {
    const isCorrect = letter === correctLetter;
    const count     = picks[letter] || 0;
    const pct       = totalWithAnswers ? Math.round((count / totalWithAnswers) * 100) : 0;
    const cls       = isCorrect ? 'correct' : (count > 0 ? 'wrong-picked' : 'not-picked');
    const statHTML  = hasAnswerData
      ? (isCorrect
          ? `<div class="drill-option-stat">✓ Correct — ${count} selected (${pct}%)</div>`
          : `<div class="drill-option-stat">${count} selected (${pct}%)</div>`)
      : (isCorrect ? `<div class="drill-option-stat">✓ Correct answer</div>` : '');
    return `<div class="drill-option ${cls}">
      <span class="drill-option-letter">${letter}</span>
      <div class="drill-option-text"><div>${escHtml(q.options[letter])}</div>${statHTML}</div>
    </div>`;
  }).join('');

  $('drill-content').innerHTML = `
    <div class="drill-q-num">Question ${qNum} · ${escHtml(modInfo.label)} · ${escHtml(q.section)}</div>
    <div class="drill-q-text">${escHtml(q.text)}</div>
    <div class="drill-fail-rate">${failPct}% failure rate (${failCount} of ${rows.length} submission${rows.length !== 1 ? 's' : ''})</div>
    ${optionsHTML}
    <div class="drill-slide-ref">📖 Slide${q.slideRefs.includes(',') ? 's' : ''} ${escHtml(q.slideRefs)}</div>
  `;
  $('drill-modal').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeDrillDown(event) {
  if (event && event.target !== $('drill-modal')) return;
  $('drill-modal').classList.add('hidden');
  document.body.style.overflow = '';
}


// ── Pending users ────────────────────────────────────────────────────────
// Main programme only — the reminder tool covers the seven-module programme, and
// mixing Speed sessions in would change what its headline counts mean.
let pendingActiveModules = new Set(HERO_TRACK.mainModules().map(function(m){ return m.id; }));
let pendingViewType = 'never'; // 'never' | 'failed'

function computePendingBuckets() {
  const attemptedMap = {};
  const infoMap      = {};

  dashAllRows.forEach(r => {
    const mod = r.module || 'mod1';
    const em  = (r.email || '').toLowerCase().trim();
    if (!infoMap[em])      infoMap[em]      = { name: r.name, email: em, passed: new Set() };
    if (!attemptedMap[em]) attemptedMap[em] = new Set();
    if (!infoMap[em].name) infoMap[em].name = r.name;
    attemptedMap[em].add(mod);
    if (r.status === 'Pass') infoMap[em].passed.add(mod);
  });

  const neverAttempted = {};
  const failedOnly     = {};

  Object.keys(infoMap).forEach(em => {
    const info      = infoMap[em];
    const attempted = attemptedMap[em] || new Set();
    [...pendingActiveModules].forEach(mod => {
      if (info.passed.has(mod)) return;
      if (!attempted.has(mod)) {
        if (!neverAttempted[em]) neverAttempted[em] = { name: info.name, email: em, mods: [] };
        neverAttempted[em].mods.push(mod);
      } else {
        if (!failedOnly[em]) failedOnly[em] = { name: info.name, email: em, mods: [] };
        failedOnly[em].mods.push(mod);
      }
    });
  });

  return { neverAttempted, failedOnly };
}

function renderPendingUsers() {
  const allMods   = HERO_TRACK.mainModules().map(function(m){ return m.id; });
  const modLabels = Object.fromEntries((window.HERO_MODULES || []).map(function(m){ return [m.id, m.short]; }));

  const { neverAttempted, failedOnly } = computePendingBuckets();

  const neverPerMod  = {};
  const failedPerMod = {};
  allMods.forEach(m => {
    neverPerMod[m]  = Object.values(neverAttempted).filter(u => u.mods.includes(m)).length;
    failedPerMod[m] = Object.values(failedOnly).filter(u => u.mods.includes(m)).length;
  });

  // View toggle
  const toggleEl = $('pending-view-toggle');
  if (toggleEl) {
    const nTotal = Object.keys(neverAttempted).length;
    const fTotal = Object.keys(failedOnly).length;
    toggleEl.innerHTML = '';
    [
      { key: 'never',  label: 'Never taken the test',   count: nTotal },
      { key: 'failed', label: 'Taken — not yet passed', count: fTotal }
    ].forEach(t => {
      const active = pendingViewType === t.key;
      const btn = document.createElement('button');
      btn.dataset.type = t.key;
      btn.style.cssText = `padding:7px 18px;font-size:12px;font-weight:700;border-radius:20px;cursor:pointer;margin-right:4px;` +
        `border:1.5px solid ${active ? 'var(--yellow)' : 'var(--navy-light)'};` +
        `background:${active ? 'var(--yellow)' : 'transparent'};` +
        `color:${active ? 'var(--navy-dark)' : 'var(--gray-muted)'};`;
      btn.innerHTML = `${escHtml(t.label)} <span style="background:${active ? 'rgba(0,0,0,.15)' : 'var(--navy-light)'};border-radius:10px;padding:1px 7px;margin-left:4px;">${t.count}</span>`;
      btn.addEventListener('click', () => { pendingViewType = t.key; renderPendingUsers(); });
      toggleEl.appendChild(btn);
    });
  }

  // Module tabs
  const tabsEl = $('pending-mod-tabs');
  if (tabsEl) {
    tabsEl.innerHTML = allMods.map(m => {
      const active = pendingActiveModules.has(m);
      const count  = pendingViewType === 'never' ? neverPerMod[m] : failedPerMod[m];
      return `<button class="pending-tab${active ? ' pending-tab-active' : ''}" data-mod="${m}"
        style="padding:5px 12px;font-size:11px;font-weight:700;border-radius:16px;border:1.5px solid ${active ? 'var(--teal)' : 'var(--navy-light)'};
        background:${active ? 'var(--teal)' : 'transparent'};color:${active ? 'var(--navy-dark)' : 'var(--gray-muted)'};cursor:pointer;">
        ${modLabels[m]} <span style="background:${active ? 'rgba(0,0,0,.15)' : 'var(--navy-light)'};border-radius:10px;padding:1px 6px;margin-left:3px;">${count}</span>
      </button>`;
    }).join('');
    tabsEl.querySelectorAll('.pending-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        const m = btn.dataset.mod;
        if (pendingActiveModules.has(m)) pendingActiveModules.delete(m);
        else pendingActiveModules.add(m);
        renderPendingUsers();
      });
    });
  }

  // User list for current view
  const source  = pendingViewType === 'never' ? neverAttempted : failedOnly;
  const entries = Object.values(source).sort((a, b) => a.name.localeCompare(b.name));
  const listEl  = $('pending-user-list');
  if (!listEl) return;

  if (!entries.length) {
    const msg = pendingViewType === 'never'
      ? 'All participants have at least one attempt for the selected modules.'
      : 'No participants have outstanding failed attempts for the selected modules.';
    listEl.innerHTML = `<p style="color:var(--teal);font-size:13px;padding:8px 0;">${msg}</p>`;
    const btn = $('btn-send-reminders');
    if (btn) btn.disabled = true;
    if ($('pending-selected-count')) $('pending-selected-count').textContent = '';
    return;
  }

  listEl.innerHTML = entries.map(u => {
    const modBadges = u.mods.map(m =>
      `<span style="font-size:11px;background:var(--navy-light);color:var(--gray-muted);border-radius:4px;padding:2px 8px;">${modLabels[m]}</span>`
    ).join(' ');
    return `<label style="display:flex;align-items:center;gap:12px;padding:10px 12px;border-radius:8px;cursor:pointer;border:1px solid var(--navy-light);margin-bottom:6px;background:var(--navy-mid);">
      <input type="checkbox" class="pending-user-cb" value="${escHtml(u.email)}"
        data-name="${escHtml(u.name)}" data-modules="${escHtml(u.mods.join(','))}" data-type="${pendingViewType}"
        style="width:15px;height:15px;accent-color:var(--teal);" onchange="updatePendingCount()">
      <div style="flex:1;min-width:0;">
        <div style="font-size:14px;font-weight:600;color:var(--white);">${escHtml(u.name)}</div>
        <div style="font-size:12px;color:var(--gray-muted);margin-top:2px;">${escHtml(u.email)}</div>
      </div>
      <div style="display:flex;gap:4px;flex-wrap:wrap;justify-content:flex-end;">${modBadges}</div>
    </label>`;
  }).join('');

  updatePendingCount();
}

function updatePendingCount() {
  const checked = document.querySelectorAll('.pending-user-cb:checked').length;
  const total   = document.querySelectorAll('.pending-user-cb').length;
  const cnt = $('pending-selected-count');
  if (cnt) cnt.textContent = checked ? `${checked} of ${total} selected` : '';
  const btn = $('btn-send-reminders');
  if (btn) btn.disabled = checked === 0;
  const selAll = $('pending-select-all');
  if (selAll) selAll.checked = total > 0 && checked === total;
}

async function sendReminderEmails() {
  const checkboxes = [...document.querySelectorAll('.pending-user-cb:checked')];
  if (!checkboxes.length) return;

  const recipients = checkboxes.map(cb => ({
    name:    cb.dataset.name,
    email:   cb.value,
    modules: cb.dataset.modules.split(',').filter(Boolean),
    type:    cb.dataset.type || pendingViewType
  }));

  const btn    = $('btn-send-reminders');
  const status = $('pending-send-status');
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span> Sending…';
  if (status) status.textContent = '';

  try {
    const url = APPS_SCRIPT_URL + '?action=sendReminders&data=' + encodeURIComponent(JSON.stringify({ recipients }));
    const res  = await fetch(url);
    const data = await res.json();
    if (data.ok) {
      if (status) {
        status.style.color = 'var(--teal)';
        status.textContent = `✓ ${data.sent} reminder${data.sent !== 1 ? 's' : ''} sent. You will receive a summary shortly.`;
      }
      document.querySelectorAll('.pending-user-cb').forEach(cb => { cb.checked = false; });
      updatePendingCount();
    } else {
      if (status) { status.style.color = 'var(--coral)'; status.textContent = 'Error: ' + (data.error || data.status || JSON.stringify(data)); }
    }
  } catch(err) {
    if (status) { status.style.color = 'var(--coral)'; status.textContent = 'Network error — check Apps Script is deployed.'; }
  } finally {
    btn.disabled = false;
    btn.innerHTML = '✉ Send Reminder Emails';
    updatePendingCount();
  }
}
