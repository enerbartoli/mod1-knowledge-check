'use strict';

// ── Config ───────────────────────────────────────────────────────────────────
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwZLIenD2Ef1-B5BSzFDsrFDNezDM_jWuT9JrmYdQTv4wSzswFOxJgyp67Y6z24-r_mOw/exec';

const PASS_THRESHOLD    = 8;  // ≥8/10 = pass
const TOTAL_QUESTIONS   = 10;
const LS_KEY            = 'mod7_quiz_state';

const ANSWER_KEY = {
  Q1:'C', Q2:'B', Q3:'D', Q4:'A', Q5:'B',
  Q6:'C', Q7:'D', Q8:'B', Q9:'C', Q10:'A'
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

// ── Question Bank ───────────────────────────────────────────────────────
const QUESTIONS = [
  {
    id: 1,
    text: 'Which forecast array does HERO read from Logility?',
    options: {
      A: 'UA1, so the template always reflects the latest Sales Forecast in Logility.',
      B: 'UA1 through UA6, refreshed each time a template is downloaded.',
      C: 'The Resultant only. Every other array in a template comes from HERO\'s own database.',
      D: 'ADS3, because it is the Consensus Forecast that Logility calculates.'
    },
    slideRefs: '4, 5',
    rationale: 'Only the Resultant, the statistical proposal loaded by Genpact, travels from Logility into HERO. Every other array you see in a template is served from HERO\'s own database. HERO reads the Resultant and never writes it, which is what protects the Genpact proposal from being overwritten.',
    section: 'HERO ↔ Logility Data Flow'
  },
  {
    id: 2,
    text: 'Which statement describes how HERO treats UA1 across the planning horizon?',
    options: {
      A: 'HERO writes UA1 across the full horizon, the same as every other array it manages.',
      B: 'HERO writes UA1 from month +5 onward and suppresses it inside the rolling months 0 to 4.',
      C: 'HERO never writes UA1; it is maintained directly in Logility in every period.',
      D: 'HERO writes UA1 only inside months 0 to 4, where the near-term number matters most.'
    },
    slideRefs: '7',
    rationale: 'UA1 is the one array with a window restriction. HERO writes it from month +5 onward and suppresses it from its exports inside the rolling months 0 to 4. That is deliberate: it is the only array and the only period where HERO and Logility are meant to differ, which gives the commercial team room for Non-Forecast-Related work without touching the Consensus.',
    section: 'The UA1 Window'
  },
  {
    id: 3,
    text: 'Demand Planning enters a Level 2.5 Base Trend Adjustment in the Reconciliation template. Where does it land in the Field Forecast?',
    options: {
      A: 'Nowhere. Demand Planning adjustments reach the Consensus only, never a Field Forecast array.',
      B: 'In UA2, alongside the commercial promotion enrichments.',
      C: 'It is held in HERO for attribution and is not exported until a Brand Captain confirms it.',
      D: 'In UA1, exactly as it would if a Brand Captain or a commercial lead had entered it.'
    },
    slideRefs: '6',
    rationale: 'What routes the value is the template, not the author. A Level 2.5 Base Trend Adjustment entered in the Reconciliation template lands in UA1 regardless of who entered it. The Marketing and Demand Planning exclusion from the Field Forecast applies only to enrichments captured in the Enrichment Capture template.',
    section: 'Template Routing'
  },
  {
    id: 4,
    text: 'You delete a Base Trend Adjustment in HERO. What actually becomes zero?',
    options: {
      A: 'The delta that the adjustment represented. UA1 and the Consensus lose its effect, but neither becomes zero.',
      B: 'UA1 for the affected weeks, which is published to Logility as an explicit zero.',
      C: 'Both UA1 and the Consensus value for the affected weeks.',
      D: 'Nothing at all. Deletions are recorded for audit and take effect at the next cycle.'
    },
    slideRefs: '7',
    rationale: 'Removing a change never sends a zero to the array. It zeroes the delta that the change represented, so UA1 and the Consensus simply lose that delta\'s effect. Neither becomes zero. And on UA1 the removal only takes effect while the affected weeks are still outside the frozen window.',
    section: 'Deleting Adjustments'
  },
  {
    id: 5,
    text: 'You have confirmed that a Base Trend Adjustment is stale and needs to go. How do you clear it?',
    options: {
      A: 'Delete the row from the workbook before uploading.',
      B: 'Enter a numeric zero in the cell.',
      C: 'Clear the cell so it is blank, which instructs HERO to remove the adjustment.',
      D: 'Enter the same value with the opposite sign in the following week.'
    },
    slideRefs: '12',
    rationale: 'Enter a numeric zero. Leaving the cell blank is not a reliable instruction to clear an existing adjustment: the adjustment stays in place and you walk away believing you cleared something you did not. For enrichments there is a second valid route, setting the status to DECLINED, but reconciliation adjustments have no status field.',
    section: 'Clearing Adjustments'
  },
  {
    id: 6,
    text: 'A colleague changed UA1 directly in Logility inside the frozen window. What does HERO now know about that change?',
    options: {
      A: 'It is already in HERO, because the frozen window keeps the two systems aligned.',
      B: 'It reaches HERO at the next Friday export batch.',
      C: 'Nothing, until someone downloads and uploads a template covering that scope.',
      D: 'Nothing, and the change will be overwritten by HERO on the next export.'
    },
    slideRefs: '8',
    rationale: 'Nothing. HERO suppresses UA1 in the frozen window so the edit is not overwritten, but it does not flow back into HERO, its templates, its dashboards, its attribution or its consensus logic. It appears inside HERO only when someone downloads and uploads a template covering that scope.',
    section: 'The Frozen Window'
  },
  {
    id: 7,
    text: 'A line publishes as zero in Logility. What does that tell you about the HERO inputs behind it?',
    options: {
      A: 'The inputs are clean, since Logility would reject anything invalid.',
      B: 'The enrichments were excluded from the Consensus export.',
      C: 'The baseline for that line was removed at source.',
      D: 'Nothing reassuring. Logility floors the published totals, so a negative raw HERO total can publish as zero.'
    },
    slideRefs: '10, 13',
    rationale: 'Nothing reassuring. Logility floors the published totals on both sides, so a negative raw HERO total can publish as zero. A negative sitting underneath positive components never surfaces downstream, nothing errors and nothing is rejected. Review the total Preliminary Consensus Forecast in HERO instead.',
    section: 'Flooring & Zeros'
  },
  {
    id: 8,
    text: 'Last cycle: baseline 1,000 with an L1 Base Trend Adjustment of −200, giving 800. This cycle the baseline is 900, the −200 is still there, and the preliminary forecast reads 700. The commercial reason for the −200 still applies. What do you do?',
    options: {
      A: 'Change the adjustment to −100 so the total returns to the 800 agreed last cycle.',
      B: 'Confirm why the baseline moved, keep the −200, and accept 700.',
      C: 'Clear the adjustment and re-enter it once the baseline movement has been explained.',
      D: 'Raise it with the squad, because a baseline that moves between cycles is a defect.'
    },
    slideRefs: '15',
    rationale: 'Confirm why the source baseline moved, then keep the adjustment and accept 700. Changing the adjustment to force the total back to 800 makes it stop representing its commercial reason and start representing "whatever gets me to last month\'s number". A baseline movement is a prompt to investigate, not evidence of an error.',
    section: 'Scenario — Baseline Movement'
  },
  {
    id: 9,
    text: 'A material shows baseline 0 this cycle with a Level 2.5 Base Trend Adjustment of −24,258 still authored against it, so the preliminary forecast reads −24,258. You have confirmed with the source owner that the baseline was removed on purpose and the adjustment existed only to offset that old baseline. What do you do?',
    options: {
      A: 'Leave it. Logility floors the total to zero, so the published number is already correct.',
      B: 'Enter +24,258 in the same weeks so the two adjustments net to zero.',
      C: 'Replace the adjustment with a numeric zero in a fresh template.',
      D: 'Wait for the next cycle, when HERO will clear the adjustment automatically once the baseline stays at zero.'
    },
    slideRefs: '16',
    rationale: 'Once the removal is confirmed and the adjustment existed only to offset that baseline, clear it with a numeric zero in a fresh template. Adding a positive adjustment to cancel the negative leaves two adjustments where there should be none and destroys the traceability. If the baseline should still have been there, the case goes to the squad instead.',
    section: 'Scenario — Orphaned Adjustment'
  },
  {
    id: 10,
    text: 'You download a fresh template at cycle start and find that baseline and previous-cycle values have moved across many SKUs, several partners and more than one brand, with no business event behind it. What is the correct first action?',
    options: {
      A: 'Stop, capture examples, and escalate with the evidence before making corrections.',
      B: 'Restore the previous cycle\'s totals with Base Trend Adjustments so the forecast stays stable, then report it.',
      C: 'Compare against the workbook you saved last cycle to work out which values are wrong.',
      D: 'Correct the largest movements now and leave the smaller ones for the squad to investigate.'
    },
    slideRefs: '14, 18',
    rationale: 'Stop, capture examples and escalate with the evidence. One odd row is a question you can work through; the same unexpected pattern across many items, partners or brands is a systemic signal. Broad compensating adjustments during an open investigation restore the number you expected and make it impossible to tell later which changes were genuine decisions.',
    section: 'Scenario — Systemic Movement'
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
    if (sel.value === 'mod1') { window.location.href = 'index.html'; return; }
    if (sel.value === 'mod2') { window.location.href = 'mod2.html'; return; }
    if (sel.value === 'mod4') { window.location.href = 'mod4.html'; return; }
    if (sel.value === 'mod5') { window.location.href = 'mod5.html'; return; }
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

// ── Question ────────────────────────────────────────────────────────────
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
    module:    'mod7',
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

// ── Results ───────────────────────────────────────────────────────────────
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

// ── Util ──────────────────────────────────────────────────────────────────
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

// ════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════──
function closeDrillDown(event) {
  if (event && event.target !== $('drill-modal')) return;
  $('drill-modal').classList.add('hidden');
  document.body.style.overflow = '';
}


// ── Pending users placeholder — full dashboard block served from mod5.js pattern ──
