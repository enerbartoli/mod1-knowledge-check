'use strict';

// ── Config ────────────────────────────────────────────────────────────────────
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwZLIenD2Ef1-B5BSzFDsrFDNezDM_jWuT9JrmYdQTv4wSzswFOxJgyp67Y6z24-r_mOw/exec';

const PASS_THRESHOLD    = 12; // ≥12/15 = pass
const TOTAL_QUESTIONS   = 15;
const LS_KEY            = 'mod5_quiz_state';

const ANSWER_KEY = {
  Q1:'A', Q2:'B', Q3:'C', Q4:'D', Q5:'A',
  Q6:'B', Q7:'C', Q8:'D', Q9:'A', Q10:'B',
  Q11:'C', Q12:'D', Q13:'A', Q14:'B', Q15:'C'
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
    text: 'Reconciliation, as defined in MOD 5, is the meeting where the team:',
    options: {
      A: 'Tells the story of the number, challenges whether it is believable, decides what moves forward, and creates accountability for the forecast.',
      B: 'Builds the next month\'s forecast line by line from scratch.',
      C: 'Reviews aggregate variance vs the Financial Forecast only.',
      D: 'Confirms the Daybreak baseline before it is loaded to Logility.'
    },
    slideRefs: '20',
    rationale: 'The training mantra defines reconciliation as TELL → CHALLENGE → DECIDE → SIGN OFF. It is a decision meeting, not a build session and not a confirmation step.',
    section: 'Reconciliation Defined'
  },
  {
    id: 2,
    text: 'Which description matches the UK reconciliation standard for what happens in the room?',
    options: {
      A: 'Typing forecast changes into the template live so the room sees the impact in real time.',
      B: 'A structured challenge against three named references, focused on material exceptions, ending in decisions with named owners and due dates.',
      C: 'A line-by-line review of every SKU in the portfolio to confirm the build.',
      D: 'An open-ended discussion to surface concerns without committing to specific actions.'
    },
    slideRefs: '21, 30, 31',
    rationale: 'Reconciliation is structured challenge against the three references, exception-based, decision-focused with named owners and due dates. No live forecast entry, no line-by-line rebuild, no open-ended debate.',
    section: 'UK Standard'
  },
  {
    id: 3,
    text: 'In what order do the four UK reconciliation sessions run, and who owns each?',
    options: {
      A: 'Marketing+DP → Brand Captain → KAM → Market Leader.',
      B: 'DP → Marketing → Brand Captain → Sign-Off.',
      C: 'Brand Captain (Baseline) → KAM (Commercial) → Marketing + DP → Market Leader (Sign-Off).',
      D: 'KAM → Brand Captain → Market Leader → Marketing + DP.'
    },
    slideRefs: '23, 63',
    rationale: 'The cascade is fixed: Captain at L2.5 first → KAM at L1 → Marketing+DP for the top-down challenge → Market Leader for sign-off.',
    section: 'Session Cascade'
  },
  {
    id: 4,
    text: 'What is the rule about starting one session before the previous one finishes?',
    options: {
      A: 'Sessions can run in parallel as long as each owner is in the room.',
      B: 'Marketing + DP can start before KAM finishes, because Marketing operates top-down.',
      C: 'Sign-Off can begin once any two earlier sessions have closed.',
      D: 'If the prior session has not closed, the next session does not start.'
    },
    slideRefs: '23',
    rationale: 'Strict sequencing — the handoff between sessions is a hard gate. If Captain has not finished at 2.5, Commercial does not start; if Commercial has not confirmed L1, Marketing+DP does not start; and so on.',
    section: 'Session Cascade'
  },
  {
    id: 5,
    text: 'Why does the UK pilot use three references rather than formal guardrails?',
    options: {
      A: 'The UK has not yet defined formal guardrail thresholds, so the team triangulates using AIM Shipment Revenue, prior-year actuals, and POS Glidepath instead.',
      B: 'The three references are a UK-only experiment that permanently replaces guardrails.',
      C: 'The three references and guardrails are the same thing, just renamed.',
      D: 'Guardrails were removed from the program globally because they were too restrictive.'
    },
    slideRefs: '18, 24',
    rationale: 'Other markets use formal guardrails. The UK has not yet defined them, so the team triangulates using AIM at BU/Brand, historical actuals at Brand × Forecasting Partner, and POS Glidepath at SKU.',
    section: 'Three References'
  },
  {
    id: 6,
    text: 'Which reference answers the question "Is the brand at this partner congruent with what we actually ship?"',
    options: {
      A: 'AIM Shipment Revenue Forecast at BU / Brand.',
      B: 'Historical actuals at Brand × Forecasting Partner.',
      C: 'POS Glidepath at SKU.',
      D: 'The Financial Forecast.'
    },
    slideRefs: '24, 26',
    rationale: 'Each reference has a grain and a question. Historical actuals at Brand × Forecasting Partner answers brand-at-partner congruence. AIM answers totals at BU/Brand; POS answers SKU-level consumer signal.',
    section: 'Three References'
  },
  {
    id: 7,
    text: 'Which statement correctly describes the AIM Shipment Revenue Forecast?',
    options: {
      A: 'AIM is updated weekly and refreshed in real time.',
      B: 'AIM is a fully enriched forecast that already includes promos, listings, and supply events.',
      C: 'AIM is a naive statistical baseline with statistical bounds; actuals fall within those bounds roughly 8 out of 10 times when there is no exceptional stimulus.',
      D: 'AIM replaces the Consensus Forecast once a quarter has closed.'
    },
    slideRefs: '25',
    rationale: 'AIM does not bake in past or future stimuli — its objectivity is its strength and its weakness. Statistical bounds hold roughly 8 out of 10 times when there is no exceptional stimulus. Refresh is monthly, not real-time.',
    section: 'Three References'
  },
  {
    id: 8,
    text: 'On the POS Pace Chart, the projected red dashed line sits below the green target line for an SKU. What should the KAM do?',
    options: {
      A: 'Reduce the SKU\'s Sales Forecast by the gap percentage immediately during the session.',
      B: 'Escalate to leadership before doing anything else.',
      C: 'Ignore the gap — the Pace Chart is for Marketing, not for KAMs.',
      D: 'Read the gap as a miss-risk signal: open the SKU for review, look for a named driver (promo, OOS, channel shift, listing), and decide whether to enrich at L1 or route to R&O.'
    },
    slideRefs: '27',
    rationale: 'The tool flags where to look, not what to do — a gap is a signal, not an order. The KAM looks for a named driver and routes via Enrichment at L1 or R&O.',
    section: 'POS Pace Chart'
  },
  {
    id: 9,
    text: 'What is the correct drill order when reconciling movements?',
    options: {
      A: 'BU / Brand total first (AIM and historical totals); drill to Brand × Forecasting Partner only when the total flags; drill to SKU vs POS Glidepath only when Brand × Partner flags.',
      B: 'SKU level first, then Brand × Partner, then BU / Brand total.',
      C: 'Brand × Partner first, then SKU, then BU / Brand total.',
      D: 'All three levels reviewed in parallel, then converged.'
    },
    slideRefs: '28',
    rationale: 'Drill is permission-based. Start at the BU/Brand total and drill only when the level above tells you to. Drilling to SKU first creates noise without context.',
    section: 'Drill Order'
  },
  {
    id: 10,
    text: 'In the 7-part decision narrative, what does the final beat capture?',
    options: {
      A: 'The driver and the evidence.',
      B: 'The decision and a named owner with a due date — never "the team."',
      C: 'The size of the movement and its timing.',
      D: 'The next cycle\'s outlook for the brand.'
    },
    slideRefs: '29, 31',
    rationale: 'Step 7 is "Who owns next?" — a named person and a date. If a row leaves the room without an owner and a due date, it is not a decision; it is a parking-lot item.',
    section: '7-Part Narrative'
  },
  {
    id: 11,
    text: 'Which of the eight meeting-behavior rules acts as the UK substitute for formal guardrails?',
    options: {
      A: 'Come prepared, or don\'t comment.',
      B: 'Challenge the number, not the person.',
      C: 'Cite a reference or move to R&O — do not opine.',
      D: 'Material exceptions only — don\'t drift.'
    },
    slideRefs: '30',
    rationale: 'Rule 5 (Cite a reference or move to R&O) is the explicit UK substitute for guardrails — every challenge must cite one of the three references, otherwise the item is routed to R&O.',
    section: 'Meeting Behavior'
  },
  {
    id: 12,
    text: 'The Brand Captain in Session 1 finds that the current consensus for Brand A is +30 units/week above the Daybreak baseline at Level 2.5, driven by a confirmed listing expansion at FP-1 effective W26. What is the Captain\'s correct action?',
    options: {
      A: 'Wait for Session 2 and ask the KAM at FP-1 to capture it as an Enrichment.',
      B: 'Override the Daybreak baseline directly by replacing the source data.',
      C: 'Route the gap to R&O for next cycle.',
      D: 'Load the +30 units/week as a Base Trend Adjustment at L2.5 in HERO, document the driver and evidence, and lock the L3 baseline so Daybreak + Base Trend = consensus.'
    },
    slideRefs: '33, 35, 37',
    rationale: 'Session 1 is ANCHOR → RECONCILE → NEUTRALIZE → DISAGGREGATE. Deltas vs consensus are neutralized as Base Trend Adjustments at L2.5 by the Captain. With a named driver and evidence, the item is not waiting on the KAM and not an R&O.',
    section: 'Session 1 — Brand Captain'
  },
  {
    id: 13,
    text: 'A KAM in Session 2 identifies that a brand at their Forecasting Partner has been gradually widening distribution for two cycles, with no specific account-level event. The shift looks structural. Which bucket does this belong in, and who acts?',
    options: {
      A: 'Base Trend at L2.5 — the KAM flags it back to the Brand Captain, who owns it next cycle.',
      B: 'Enrichment at L1 — the KAM captures it this cycle.',
      C: 'R&O — log with options and resolve later.',
      D: 'Both Enrichment and Base Trend — captured at both levels for traceability.'
    },
    slideRefs: '42',
    rationale: 'Structural brand-level shifts belong in Base Trend (Captain at L2.5, next cycle). A specific account-level event would be an Enrichment (KAM, this cycle). Two-bucket entries get rejected.',
    section: 'Session 2 — KAM'
  },
  {
    id: 14,
    text: 'Marketing + DP in Session 3 want to apply an adjustment that lifts Brand B by +8,000 units in Q3 based on a confirmed campaign. Where does this adjustment land?',
    options: {
      A: 'At Level 1 directly, bypassing the Captain\'s L2.5 baseline.',
      B: 'At Level 2.5 via the Enrichment Capture Template (ECT); the backend disaggregates to Level 1 across partners using baseline disaggregation rules.',
      C: 'At Level 3 only, leaving partners untouched.',
      D: 'At Level 1 by re-opening the KAM\'s enrichments from Session 2.'
    },
    slideRefs: '52',
    rationale: 'Marketing / DP enrichments enter at L2.5 via the Enrichment Capture Template (ECT) and disaggregate to L1 across partners using baseline disaggregation rules. Marketing + DP cannot re-open the Captain\'s Base Trend or the KAM\'s L1 enrichments — if either needs to move, the item routes back to that owner.',
    section: 'Session 3 — Marketing & DP'
  },
  {
    id: 15,
    text: 'At Executive Sign-Off, how many key movements are presented and how long does each get?',
    options: {
      A: 'Eight to ten movements, ten minutes each.',
      B: 'Every movement larger than 1% of BU, no time limit.',
      C: 'Three to five material movements, told in the 7-part narrative, five minutes each.',
      D: 'The full Sales Forecast, line by line.'
    },
    slideRefs: '54, 59',
    rationale: 'Three to five material movements, each told in the 7-part narrative in five minutes. If a movement does not fit in five minutes, it is not ready for sign-off and goes back to Session 3.',
    section: 'Session 4 — Sign-Off'
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
    if (sel.value === 'mod4') { window.location.href = 'mod4.html'; return; }
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
    module:    'mod5',
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
