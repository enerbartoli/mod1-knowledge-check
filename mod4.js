'use strict';

// ── Config ────────────────────────────────────────────────────────────────────
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwZLIenD2Ef1-B5BSzFDsrFDNezDM_jWuT9JrmYdQTv4wSzswFOxJgyp67Y6z24-r_mOw/exec';

const PASS_THRESHOLD    = 8;  // ≥8/10 = pass
const TOTAL_QUESTIONS   = 10;
const LS_KEY            = 'mod4_quiz_state';

const ANSWER_KEY = {
  Q1:'B', Q2:'C', Q3:'A', Q4:'D', Q5:'A',
  Q6:'B', Q7:'A', Q8:'C', Q9:'B', Q10:'D'
};

function scoreAnswers(answers) {
  let score = 0;
  const failedQNums = [];
  for (let i = 1; i <= TOTAL_QUESTIONS; i++) {
    const key = 'Q' + i;
    if ((answers[key] || '').toUpperCase() === ANSWER_KEY[key]) {
      score++;
    } else {
      failedQNums.push(i);
    }
  }
  const percent = Math.round((score / TOTAL_QUESTIONS) * 10000) / 100;
  return { score, total: TOTAL_QUESTIONS, percent, pass: score >= PASS_THRESHOLD, failed_questions: failedQNums };
}

// ── Question Bank ─────────────────────────────────────────────────────────────
const QUESTIONS = [
  {
    id: 1,
    text: 'Why do DI, FAN, and Amazon need to be discussed as a separate group in MOD 4?',
    options: {
      A: 'They are the three customer segments that contribute the highest revenue in the UK market.',
      B: 'Their historical demand behaves erratically — discontinuous and opportunistic — so a history-based statistical model cannot predict it adequately, and each one needs a tailored handling approach.',
      C: 'They are the three account groups that are out of scope for the UK pilot.',
      D: 'They are the only customer groups that have a dedicated KAM assigned in the UK.'
    },
    slideRefs: '5',
    rationale: 'The three are not grouped by revenue, scope, or coverage. They are grouped because their demand history is erratic, discontinuous, and opportunistic — DI is program-driven, FAN is event-driven, Amazon has highly irregular ordering rhythm — which is exactly what a history-based statistical baseline cannot project well. That is why each one needs its own handling model.',
    section: 'DI, FAN & Amazon'
  },
  {
    id: 2,
    text: 'In the UK pilot, who owns the DI forecast number and how is it built?',
    options: {
      A: 'Daybreak generates the baseline; the KAM reviews and adjusts using the standard enrichment flow.',
      B: 'Demand Planning builds the DI number from statistical extrapolation; the KAM validates.',
      C: 'The KAM owns the number and builds it partner-by-partner from account knowledge — committed programs, signed orders, customer plans.',
      D: 'The regional category team owns it; the KAM validates timing only.'
    },
    slideRefs: '6',
    rationale: 'For DI there is no Daybreak baseline by default. The KAM builds the forecast bottom-up by Forecasting Partner using account knowledge — committed programs, signed orders, customer plans — not statistical extrapolation. DP facilitates but the account team carries the build.',
    section: 'Direct Import (DI)'
  },
  {
    id: 3,
    text: 'For FAN items, which team builds the forecast volume, and what does the KAM do?',
    options: {
      A: 'The regional category team allocates volumes per client based on the launch plan; the KAM validates timing and feasibility at their account but does not re-cut the volume.',
      B: 'The KAM builds the forecast bottom-up partner-by-partner, the same way DI is built.',
      C: 'Daybreak builds the baseline; the KAM enriches as needed.',
      D: 'Marketing owns the number; KAMs are not involved.'
    },
    slideRefs: '7',
    rationale: 'FAN volume sits with the team that owns the moment — the regional category team. KAMs validate timing and feasibility at their account but do not re-cut the FAN number.',
    section: 'FAN Items'
  },
  {
    id: 4,
    text: 'Where does the full DI or FAN forecast volume land in the Reconciliation Template?',
    options: {
      A: 'Split between the Daybreak baseline at L3 and Enrichment lines at L1.',
      B: 'As a separate Sales Forecast line outside the template.',
      C: 'In the same Enrichment lines used for promos and listings.',
      D: 'As Base Trend enrichment at Level 1, because there is no Daybreak baseline at SKU level underneath.'
    },
    slideRefs: '6, 7',
    rationale: 'Both DI and FAN have no underlying Daybreak baseline. The entire forecast volume is captured as Base Trend enrichment at L1 — the L1 lock is essentially all-Base-Trend with no statistical signal to challenge against.',
    section: 'Reconciliation Template'
  },
  {
    id: 5,
    text: 'Which statement correctly describes the Evergreen exception for DI?',
    options: {
      A: 'Sales Operations designates specific DI products as Evergreen; designated items behave like standard Carry-Forward items, with a Daybreak baseline that the KAM enriches on top.',
      B: 'Any DI item with 12 months of stable history is automatically designated Evergreen by Demand Planning.',
      C: 'The KAM nominates Evergreen items at the start of each cycle; DP confirms.',
      D: 'Evergreen is a UK-only exception that does not apply in NA or EU markets.'
    },
    slideRefs: '6',
    rationale: 'Evergreen is owned by Sales Operations — not by KAM, not by DP. Evergreen items behave like standard CF (Daybreak baseline applies, KAM enriches on top). The Evergreen list must be confirmed before each cycle.',
    section: 'Direct Import (DI)'
  },
  {
    id: 6,
    text: 'Why are FAN items deliberately handled outside the Daybreak baseline?',
    options: {
      A: 'FAN items have insufficient shipment history for the statistical engine to process them.',
      B: 'FAN demand is tied to one-off cultural moments (franchise releases, film tie-ins, time-limited campaigns) with no reliable repeat pattern — keeping them out of the baseline protects the statistical engine for standard CF items.',
      C: 'FAN volume is too small to justify the model\'s run-time.',
      D: 'FAN items are excluded by Daybreak\'s licensing terms.'
    },
    slideRefs: '7',
    rationale: 'FAN history contains one-off spikes (franchise releases, film tie-ins, time-limited campaigns) that would create false signals downstream and pollute the baseline for standard CF items. The exception is deliberate.',
    section: 'FAN Items'
  },
  {
    id: 7,
    text: 'How is Amazon treated in the UK pilot?',
    options: {
      A: 'As a standard customer — Daybreak generates the brand-level baseline, statistical disaggregation assigns Amazon\'s share, and the Amazon KAM reviews and adjusts using the standard Enrichment and Base Trend tools.',
      B: 'Bottom-up by KAM, with no baseline — the same as DI.',
      C: 'Bottom-up by the regional category team — the same as FAN.',
      D: 'Outside the pilot scope; Amazon joins after the July cycle.'
    },
    slideRefs: '8',
    rationale: 'For the pilot, Amazon is deliberately treated as a standard customer so the team learns the standard flow first. Daybreak generates the baseline; statistical disaggregation assigns Amazon\'s share; the Amazon KAM reviews and adjusts.',
    section: 'Amazon'
  },
  {
    id: 8,
    text: 'Across DI, FAN, and Amazon, what is Demand Planning\'s role?',
    options: {
      A: 'Demand Planning owns the forecast number for all three patterns end-to-end.',
      B: 'Demand Planning is not involved; the KAM or the category team owns the volume on its own.',
      C: 'Demand Planning facilitates and challenges but does not own the volume — the KAM carries the build for DI and Amazon; the regional category team owns the volume for FAN.',
      D: 'Demand Planning owns DI and FAN; the KAM owns Amazon.'
    },
    slideRefs: '6, 7, 8',
    rationale: 'In all three models DP plays the same role — facilitate and challenge. DP does not carry the build. DI is built bottom-up by the KAM partner-by-partner. FAN volume is owned by the regional category team. Amazon (under pilot treatment) is owned by the Amazon KAM in the standard Session 2 flow.',
    section: 'Demand Planning Role'
  },
  {
    id: 9,
    text: 'A KAM is reviewing a DI account and finds an item that has shipped with a stable, repeating pattern for 18 months. The KAM wants the item to start from a Daybreak baseline rather than be built bottom-up. What should happen?',
    options: {
      A: 'The KAM flags it directly in HERO as Evergreen and the Daybreak baseline applies from the next cycle.',
      B: 'The KAM raises the item with Sales Operations for Evergreen designation; if approved, the item behaves like a standard CF with a Daybreak baseline. Until then, it stays in the DI bottom-up flow.',
      C: 'Demand Planning re-classifies the item as Carry-Forward and applies the standard CF flow.',
      D: 'The Brand Captain converts the item to Carry-Forward at Level 2.5 and locks the new treatment.'
    },
    slideRefs: '6',
    rationale: 'Evergreen designation is owned by Sales Ops — not by the KAM, DP, or Captain. Until Sales Ops designates the item Evergreen, it stays in the DI bottom-up flow.',
    section: 'Direct Import (DI)'
  },
  {
    id: 10,
    text: 'A KAM at FP-2 receives a FAN allocation from the regional category team for a franchise release in week 30. The KAM believes the allocation is too high for their account and wants to adjust it down. What is the correct action?',
    options: {
      A: 'Re-cut the FAN volume to match the KAM\'s account view and submit the revised number.',
      B: 'Drop the FAN volume to zero for the account and capture the rest as Enrichment.',
      C: 'Push the allocation back to Demand Planning and ask DP to reset the baseline.',
      D: 'Validate timing and feasibility at the account, raise the magnitude concern back to the regional category team (the volume owner), and do not unilaterally re-cut the FAN number.'
    },
    slideRefs: '7',
    rationale: 'For FAN, the regional category team owns the number. KAMs validate timing and feasibility but do not re-cut. Magnitude concerns route back to the volume owner, not to DP or the baseline.',
    section: 'FAN Items'
  }
];

const ROLES = [
  'Sales / Commercial / KAM',
  'Marketing / GBT / GPL',
  'Demand Planning',
  'Finance',
  'Supply Chain',
  'Brand Captain',
  'Other'
];

// ── State ──────────────────────────────────────────────────────────────────────
let state = {
  screen: 'welcome',
  questionIndex: 0,
  userData: { name: '', email: '', role: '', roleOther: '' },
  answers: {},
  results: null,
  submitError: null
};

// ── Persistence ────────────────────────────────────────────────────────────────
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

// ── DOM helpers ────────────────────────────────────────────────────────────────
const $ = id => document.getElementById(id);
const show = el => el && el.classList.remove('hidden');
const hide = el => el && el.classList.add('hidden');

function setScreen(name) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const target = $(`screen-${name}`);
  if (target) target.classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ── Navigation ─────────────────────────────────────────────────────────────────
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

// ── Welcome ────────────────────────────────────────────────────────────────────
function initWelcome() {
  $('btn-start').addEventListener('click', () => {
    const sel = $('module-select');
    if (!sel || !sel.value) {
      const err = $('module-select-error');
      if (err) err.style.display = 'block';
      return;
    }
    if (sel.value === 'mod1') { window.location.href = 'index.html'; return; }
    if (sel.value === 'mod2') { window.location.href = 'mod2.html'; return; }
    if (sel.value === 'mod5') { window.location.href = 'mod5.html'; return; }
    const err = $('module-select-error');
    if (err) err.style.display = 'none';
    goIdentity();
  });
}

// ── Identity ───────────────────────────────────────────────────────────────────
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

// ── Question ───────────────────────────────────────────────────────────────────
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

// ── Confirm ────────────────────────────────────────────────────────────────────
function renderConfirm() {
  const answered = Object.keys(state.answers).length;
  $('confirm-answered').textContent = `${answered} of ${TOTAL_QUESTIONS} questions answered`;
  $('confirm-name').textContent = state.userData.name;
}
function initConfirm() {
  $('btn-submit').addEventListener('click', submitQuiz);
  $('btn-go-back').addEventListener('click', () => goQuestion(TOTAL_QUESTIONS - 1));
}

// ── Submit ─────────────────────────────────────────────────────────────────────
async function submitQuiz() {
  const payload = {
    name:      state.userData.name,
    email:     state.userData.email,
    role:      state.userData.role,
    roleOther: state.userData.roleOther,
    answers:   state.answers,
    module:    'mod4',
    userAgent: navigator.userAgent,
    quizUrl:   window.location.href
  };

  const submitBtn = $('btn-submit');
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<span class="spinner"></span> Submitting…';
  hide($('submit-error'));

  const result = scoreAnswers(state.answers);

  fetch(APPS_SCRIPT_URL, {
    method:  'POST',
    mode:    'no-cors',
    headers: { 'Content-Type': 'text/plain' },
    body:    JSON.stringify(payload)
  }).catch(() => {});

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

// ── Results ────────────────────────────────────────────────────────────────────
function renderResults(data) {
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

// ── Resume ─────────────────────────────────────────────────────────────────────
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

// ── Util ───────────────────────────────────────────────────────────────────────
function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ── Boot ───────────────────────────────────────────────────────────────────────
function init() {
  initWelcome();
  initIdentity();
  initQuestion();
  initConfirm();
  initResults();

  const saved = loadState();
  checkResume(saved);
  setScreen('welcome');
}
document.addEventListener('DOMContentLoaded', init);
