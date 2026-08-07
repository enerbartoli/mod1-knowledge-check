// ═══════════════════════════════════════════════════════════════════════════════
// MOD 1 Knowledge Check — Google Apps Script Backend
// Deploy as: Web App → Execute as: Me → Who has access: Anyone
// ═══════════════════════════════════════════════════════════════════════════════

// ── Configuration ─────────────────────────────────────────────────────────────
const RENE_EMAIL     = 'herotoolnotifications@gmail.com';
const RENE_COPY_EMAIL = 'Rene.bartoli@hasbro.com';
const SHEET_NAME     = 'MOD 1 Quiz Responses';
const PASS_THRESHOLD = 13;   // ≥13 / 16 = pass
const TOTAL_QUESTIONS = 16;

// QUIZ_CLOSED flag — flip to true to stop accepting submissions after the pilot
const QUIZ_CLOSED = false;
const QUIZ_URL    = 'https://enerbartoli.github.io/mod1-knowledge-check/';

// ── Answer Key (server-side only — never exposed to the browser) ──────────────
const ANSWER_KEY = {
  Q1: 'A', Q2: 'B', Q3: 'C', Q4: 'A',  Q5: 'C',  Q6: 'A',  Q7: 'D',  Q8: 'C',
  Q9: 'D', Q10: 'B', Q11: 'B', Q12: 'C', Q13: 'D', Q14: 'B', Q15: 'D', Q16: 'A'
};

// ── Slide references for fail-email feedback ───────────────────────────────────
const SLIDE_REFS = {
  Q1: '2, 4',  Q2: '4, 5',  Q3: '8, 10',  Q4: '11',   Q5: '12, 13',
  Q6: '14',   Q7: '15',    Q8: '10, 16', Q9: '16',   Q10: '17, 19, 20, 21',
  Q11: '22',  Q12: '25',   Q13: '32',    Q14: '33',  Q15: '33',  Q16: '33'
};

// ── Question text (for fail-email body) ───────────────────────────────────────
const QUESTION_TEXT = {
  Q1:  'Why is Hasbro implementing the new Forecast Enrichment process now?',
  Q2:  'Which statement best describes the role of the Daybreak statistical baseline in the new process?',
  Q3:  'Which statement is correct about the Daybreak statistical baseline?',
  Q4:  'Which statement correctly describes the three-party operating model that produces the baseline?',
  Q5:  'Which SKUs are treated using Daybreak\'s standard machine-learning forecasting approach?',
  Q6:  'How is an NPI\'s forecast generated during its cold-start phase (0–8 weeks of history)?',
  Q7:  'Why are UK Fan items handled without a statistical baseline?',
  Q8:  'At which planning level is the Daybreak statistical baseline generated?',
  Q9:  'What is the purpose of forecast disaggregation in the new process?',
  Q10: 'How does the disaggregation method differ between a Carry-Forward item and an NPI item?',
  Q11: 'What is the purpose of the Forecasting Range?',
  Q12: 'Which statement best describes when an enrichment should be applied to the baseline?',
  Q13: 'What is the purpose of the Joint Marketing & Demand Planning Reconciliation Session?',
  Q14: 'In the UK pilot, which statement correctly describes the scope split between Key Account Managers (KAMs) and Brand Captains?',
  Q15: 'In the 2026 UK pilot, how does HERO present the starting forecast to Brand Captains at the beginning of each cycle?',
  Q16: 'In the 2027 target operating model, how does the Brand Captain\'s role differ from the 2026 pilot?'
};

// ══════════════════════════════════════════════════════════════════════════════
// MOD 2 — Enrichment Practice (additive — all MOD 1 constants above unchanged)
// ══════════════════════════════════════════════════════════════════════════════

const ANSWER_KEY_MOD2 = {
  Q1:'A', Q2:'B', Q3:'C', Q4:'C', Q5:'D',
  Q6:'B', Q7:'A', Q8:'C', Q9:'A', Q10:'A',
  Q11:'D', Q12:'C', Q13:'A', Q14:'D', Q15:'B'
};
const TOTAL_QUESTIONS_MOD2 = 15;
const PASS_THRESHOLD_MOD2  = 12;
const QUIZ_URL_MOD2        = 'https://enerbartoli.github.io/mod1-knowledge-check/mod2.html';

const SLIDE_REFS_MOD2 = {
  Q1:'4, 5, 6', Q2:'4',       Q3:'7, 8',        Q4:'9, 10',
  Q5:'11, 12, 13, 14',        Q6:'24',           Q7:'35',
  Q8:'29',      Q9:'26',      Q10:'37',          Q11:'34',
  Q12:'39',     Q13:'44',     Q14:'51',          Q15:'54'
};

const QUESTION_TEXT_MOD2 = {
  Q1:  'A carry-forward item shows two consecutive years of stable seasonal demand, with no confirmed commercial event, no supply issue, and no distribution change in scope. The Daybreak baseline and the Resultant Forecast track the same seasonal shape at L3. What is the correct action?',
  Q2:  'You are reviewing a scenario where the total demand at L3 looks correct against history, but the customer-level split at L2 routes most of the volume to inactive partners. Where does the issue live?',
  Q3:  'An item shipped near zero for several months in 2025 because of a confirmed stockout. The Daybreak baseline now projects 2026 demand at a fraction of the pre-stockout run-rate, because the model learned the suppression as true decline. What is the correct action?',
  Q4:  'A Warm Start NPI with under 12 months of history has 16 weeks of actuals below the 2026 Resultant plan, and Daybreak has slashed the 2027 baseline by more than half. After reviewing together, you and the Brand Captain agree Daybreak\'s drop is too aggressive and the SKU can still rebound. What is the correct action?',
  Q5:  'A carry-forward item is exclusive to a single retailer — that retailer absorbs ~100% of actuals across the past two years. The Current Resultant disaggregation routes a large share to other customers with no recent history, while the Moving Average method routes ~100% to the exclusive partner. What is the correct action?',
  Q6:  'Which statement correctly describes the difference between a Set and a Base Trend enrichment?',
  Q7:  'A customer pulls confirmed annual demand into a specific order window, with offsetting reductions in the months from which demand is being moved. The full-year total does not change. Which enrichment approach is correct?',
  Q8:  'A customer is adding new stores to its distribution. The initial pipeline fill ships in one window (F1), and ongoing replenishment continues in those new stores afterwards. Which enrichment approach is correct?',
  Q9:  'An established carry-forward item has a future confirmed retail promotion that is not already reflected in baseline behavior. The promo will generate incremental units in a specific ship window. Which enrichment is correct?',
  Q10: 'A customer has provided a specific pre-order quantity and timing for a new item with no comparable history. What is the correct way to capture it?',
  Q11: 'An NPI\'s stat baseline already includes the channel-fill volume in its launch shape, but the team needs the fill visible as a discrete set for allocation traceability. What is the correct approach in F1?',
  Q12: 'Last year a deal spike inflated demand for a specific period, and the promotion is not repeating this year. The baseline is now projecting the spike forward as if it were normal seasonality. What is the correct action?',
  Q13: 'A specific customer has discontinued an item that remains active at other customers. The baseline is still allocating volume to the dropped customer based on past proportions. What is the correct action?',
  Q14: 'A customer is changing its buying route from Domestic to Direct Import. Total demand is unchanged — only the channel is moving. The volume in scope currently sits in the baseline. What is the correct approach?',
  Q15: 'At the BU/brand level the L3 total is accurate against history, but the L2 customer split allocates too much volume to a customer with declining actuals. What is the correct path?'
};

const RATIONALES_MOD2 = {
  Q1:  'Two consecutive years of clean history that converge with the baseline mean the model is fit-for-purpose at L3 — adding an enrichment without a missing event would introduce noise without adding value.',
  Q2:  'When L3 totals are right but the customer mix is wrong, the issue lives in the L2 disaggregation logic — adding an enrichment at L3 would inflate the total instead of fixing the split.',
  Q3:  'Stockout-suppressed history is contaminated input, not a true demand signal, so cleansing the affected months at source rebuilds the baseline durably and avoids re-doing the same correction every cycle.',
  Q4:  'When the team has assessed that Daybreak\'s reduction is too aggressive — not enough history for a structural reset — the correct path is to recalculate demand with commercial knowledge and lock the agreed view via an L2.5 Base Trend adjustment using the Brand Captain\'s template.',
  Q5:  'For an exclusive item, Moving Average over recent actuals captures the real customer mix while Current Resultant fragments to inactive partners — switching the disaggregation method is the direct fix, no L3 enrichment needed.',
  Q6:  'Sets are for one-time events because they cleanse out of history after they ship; Base Trend is for structural changes that should repeat because it permanently enters the baseline.',
  Q7:  'A ladder moves existing demand between weeks and creates none, which is what Demand Phase Shift is for, authored as a positive and negative pair. This was ratified on 16 July 2026 and it explicitly rules out SET and base trend for a timing move. SET is reserved for a true set build, and only a set build that also pulls demand forward carries a SET on both legs. A base trend would push the timing shift permanently into next year\'s baseline, and doing nothing leaves the forecast on the old phasing even though the annual total is right.',
  Q8:  'The new-store fill is one-time (Set, cleanses out) and the higher run-rate is structural (Base Trend, enters baseline) — using a single enrichment type for both would either contaminate next year\'s baseline or leave the ongoing lift uncaptured.',
  Q9:  'A confirmed, incremental, time-bounded promo is exactly what the promo enrichment type was built for — base trend would inflate next year\'s baseline, and a set would over-capture by extending beyond the promo window.',
  Q10: 'Pre-orders are entered at confirmed quantity only — adding speculative volume beyond the commitment undermines the rationale for using the enrichment type in the first place.',
  Q11: 'The launch baseline already carries the fill, so the negative Base Trend removes the excess the model encoded and the positive SET restores the agreed fill on the same weeks. The launch-week total is unchanged and the fill is visible as a discrete line for allocation. What stops the model replicating the fill next year is the SET: cleansing runs in the opposite direction, so cleansed history is shipments minus the SET, which leaves replenishment. Two offsetting SETs would hold the total just as well but would net to zero in cleansing and the model would relearn the fill.',
  Q12: 'A non-repeating historical spike that the model is echoing forward needs to be removed structurally — negative base trend corrects it now, and flagging the period for historical cleansing prevents the same correction from being needed next cycle.',
  Q13: 'A customer exit is a structural change — base trend removes the phantom volume while the forecasting-range update prevents the model from continuing to route demand to a customer that no longer takes the item.',
  Q14: 'Channel shift is a routing change, not new demand — the channel-shift functionality moves baseline volume cleanly between channels, while creating offsetting enrichments would distort total demand.',
  Q15: 'When L3 is right, no enrichment is needed — enriching at L1 to fix an L2 split would inflate L3 total demand, so the correct path is a disaggregation adjustment routed through DP/Genpact.'
};

// ── CORS helper ───────────────────────────────────────────────────────────────
function buildResponse(data, statusCode) {
  statusCode = statusCode || 200;
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// Handle CORS pre-flight (OPTIONS) — Apps Script doesn't support OPTIONS natively,
// but including doGet lets us test the endpoint from a browser.
function doGet(e) {
  if (e && e.parameter && e.parameter.action === 'getData') {
    var ss    = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet || sheet.getLastRow() < 2) return buildResponse({ rows: [] });

    var data = sheet.getDataRange().getValues();
    var rows = [];
    for (var i = 1; i < data.length; i++) {
      var r = data[i];
      var ans = {};
      for (var qi = 1; qi <= 16; qi++) {
        var a = String(r[8 + (qi - 1) * 2] || '').toUpperCase().trim();
        if (a) ans['Q' + qi] = a;
      }
      rows.push({
        timestamp:  r[0] ? new Date(r[0]).toISOString() : '',
        name:       r[1] || '',
        email:      r[2] || '',
        role:       r[3] || '',
        score:      r[5] || 0,
        percent:    r[6] || 0,
        status:     r[7] || '',
        failed:     r[40] || '',
        module:     r[43] || 'mod1',
        attempt:    r[44] || 1,
        answers:    ans
      });
    }
    return buildResponse({ rows: rows });
  }
  if (e && e.parameter && e.parameter.action === 'sendReminders') {
    return handleSendReminders(e);
  }
  return buildResponse({ status: 'MOD 1 Quiz backend is running.' });
}

// ── Main entry point ──────────────────────────────────────────────────────────
function doPost(e) {
  try {
    // 1. Parse
    if (!e || !e.postData || !e.postData.contents) {
      return buildResponse({ error: 'Empty request body.' }, 400);
    }

    var payload;
    try {
      payload = JSON.parse(e.postData.contents);
    } catch (parseErr) {
      return buildResponse({ error: 'Invalid JSON payload.' }, 400);
    }

    // 2. Check quiz-closed flag
    if (QUIZ_CLOSED) {
      return buildResponse({ error: 'This quiz is no longer accepting submissions.' }, 403);
    }

    // 3. Route by module (minimum change — MOD 1 flow below is unchanged)
    var moduleId = String(payload.module || 'mod1').toLowerCase();
    if (moduleId === 'mod2') { return handleMod2Post(payload); }
    if (moduleId === 'mod4') { return handleMod4Post(payload); }
    if (moduleId === 'mod5') { return handleMod5Post(payload); }
    if (moduleId === 'mod7') { return handleMod7Post(payload); }
    if (moduleId === 'mod3') { return handleMod3Post(payload); }

    // 3. Validate required fields
    var validationError = validatePayload(payload);
    if (validationError) {
      return buildResponse({ error: validationError }, 400);
    }

    // 4. Score
    var scoreResult = scoreSubmission(payload.answers);

    // 5. Append to Sheet
    var sheetUrl = appendToSheet(payload, scoreResult);

    // 6. Send emails
    var emailSent = sendEmails(payload, scoreResult, sheetUrl);

    // 7. Return result to frontend (no correct answers exposed)
    return buildResponse({
      score:            scoreResult.score,
      total:            TOTAL_QUESTIONS,
      percent:          scoreResult.percent,
      pass:             scoreResult.pass,
      failed_questions: scoreResult.failedQNums
    });

  } catch (err) {
    Logger.log('doPost error: ' + err.message + '\n' + err.stack);
    return buildResponse({ error: 'Server error. Please try again.' }, 500);
  }
}

// ── Validation ────────────────────────────────────────────────────────────────
function validatePayload(p) {
  if (!p.name || String(p.name).trim().length < 2) return 'Name is required.';

  var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!p.email || !emailRe.test(String(p.email).trim())) return 'Valid email is required.';

  if (!p.role) return 'Role is required.';

  if (!p.answers || typeof p.answers !== 'object') return 'Answers are required.';

  for (var i = 1; i <= TOTAL_QUESTIONS; i++) {
    var key = 'Q' + i;
    var val = p.answers[key];
    if (!val || !['A','B','C','D'].includes(String(val).toUpperCase())) {
      return 'Answer for ' + key + ' is missing or invalid.';
    }
  }
  return null;
}

// ── Scoring ───────────────────────────────────────────────────────────────────
function scoreSubmission(answers) {
  var score = 0;
  var results = {};
  var failedQNums = [];

  for (var i = 1; i <= TOTAL_QUESTIONS; i++) {
    var key = 'Q' + i;
    var given   = String(answers[key] || '').toUpperCase();
    var correct = ANSWER_KEY[key];
    var isCorrect = given === correct;
    results[key] = { given: given, correct: isCorrect };
    if (isCorrect) {
      score++;
    } else {
      failedQNums.push(i);
    }
  }

  var percent = Math.round((score / TOTAL_QUESTIONS) * 10000) / 100; // e.g. 81.25
  return {
    score:       score,
    percent:     percent,
    pass:        score >= PASS_THRESHOLD,
    results:     results,
    failedQNums: failedQNums
  };
}

// ── Sheet ─────────────────────────────────────────────────────────────────────
function appendToSheet(payload, scoreResult) {
  var ss    = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    writeHeaders(sheet);
  }

  // Ensure headers exist (first run)
  if (sheet.getLastRow() === 0) writeHeaders(sheet);

  var now  = new Date();
  var row  = [
    now,                                                      // A: Timestamp
    payload.name.trim(),                                      // B: Full Name
    payload.email.trim().toLowerCase(),                       // C: Email
    payload.role,                                             // D: Role
    payload.roleOther || '',                                  // E: Role (Other detail)
    scoreResult.score,                                        // F: Score
    scoreResult.percent,                                      // G: Score %
    scoreResult.pass ? 'Pass' : 'Fail'                        // H: Status
  ];

  // Q1–Q16 answer + correct? pairs (columns I onward)
  for (var i = 1; i <= TOTAL_QUESTIONS; i++) {
    var key = 'Q' + i;
    var r   = scoreResult.results[key];
    row.push(r.given);    // Answer
    row.push(r.correct);  // Correct?
  }

  // Failed questions list, email sent flag, user-agent
  row.push(scoreResult.failedQNums.join(', '));    // Failed Questions
  row.push(true);                                  // Email Sent? (set to true; update to false on error if needed)
  row.push((payload.userAgent || '').slice(0, 200));

  sheet.appendRow(row);

  return ss.getUrl();
}

function writeHeaders(sheet) {
  var headers = [
    'Timestamp', 'Full Name', 'Email', 'Role', 'Role (Other)',
    'Score', 'Score %', 'Status'
  ];
  for (var i = 1; i <= TOTAL_QUESTIONS; i++) {
    headers.push('Q' + i + ' Answer');
    headers.push('Q' + i + ' Correct?');
  }
  headers.push('Failed Questions', 'Email Sent?', 'User-Agent');
  sheet.appendRow(headers);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
}

// ── Email ─────────────────────────────────────────────────────────────────────
function sendEmails(payload, scoreResult, sheetUrl) {
  var name    = payload.name.trim();
  var email   = payload.email.trim().toLowerCase();
  var score   = scoreResult.score;
  var total   = TOTAL_QUESTIONS;
  var pct     = scoreResult.percent;
  var pass    = scoreResult.pass;
  var failed  = scoreResult.failedQNums;

  try {
    if (pass) {
      sendPassEmail(email, name, score, total, pct);
    } else {
      sendFailEmail(email, name, score, total, pct, failed);
    }
    sendNotificationEmail(payload, scoreResult, sheetUrl);
    return true;
  } catch (err) {
    Logger.log('Email error: ' + err.message);
    return false;
  }
}

function emailShell(contentHtml) {
  return '<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body style="margin:0;padding:0;background:#f0f4f8;font-family:Arial,sans-serif;">' +
    '<table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f4f8;padding:32px 0;">' +
    '<tr><td align="center">' +
    '<table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">' +
    '<tr><td style="background:#0d1b2e;padding:28px 40px;text-align:center;">' +
    '<p style="margin:0;color:#00c9a7;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">Forecast Enrichment Programme · HERO Deployment</p>' +
    '<p style="margin:8px 0 0;color:#ffffff;font-size:20px;font-weight:700;">MOD 1 Knowledge Check</p>' +
    '</td></tr>' +
    '<tr><td style="padding:40px;">' + contentHtml + '</td></tr>' +
    '<tr><td style="background:#f8f9fa;padding:20px 40px;border-top:1px solid #e9ecef;text-align:center;">' +
    '<p style="margin:0;color:#6c757d;font-size:12px;">Rene Bartoli · Demand Planning · Forecast Enrichment Program</p>' +
    '</td></tr>' +
    '</table></td></tr></table></body></html>';
}

function sendPassEmail(toEmail, name, score, total, pct) {
  var subject = '✓ MOD 1 Knowledge Check — Passed';

  var content =
    '<div style="text-align:center;margin-bottom:32px;">' +
    '<div style="display:inline-block;background:#d4edda;border-radius:50%;width:72px;height:72px;line-height:72px;font-size:36px;">✓</div>' +
    '<h2 style="margin:16px 0 4px;color:#0d1b2e;font-size:24px;">Well done, ' + name + '!</h2>' +
    '<p style="margin:0;color:#6c757d;font-size:15px;">You\'ve passed the knowledge check</p>' +
    '</div>' +
    '<table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f9fa;border-radius:8px;margin-bottom:28px;">' +
    '<tr>' +
    '<td style="padding:20px;text-align:center;border-right:1px solid #e9ecef;">' +
    '<p style="margin:0;font-size:32px;font-weight:700;color:#00c9a7;">' + score + '/' + total + '</p>' +
    '<p style="margin:4px 0 0;font-size:12px;color:#6c757d;text-transform:uppercase;letter-spacing:1px;">Score</p>' +
    '</td>' +
    '<td style="padding:20px;text-align:center;border-right:1px solid #e9ecef;">' +
    '<p style="margin:0;font-size:32px;font-weight:700;color:#00c9a7;">' + Math.round(pct) + '%</p>' +
    '<p style="margin:4px 0 0;font-size:12px;color:#6c757d;text-transform:uppercase;letter-spacing:1px;">Accuracy</p>' +
    '</td>' +
    '<td style="padding:20px;text-align:center;">' +
    '<p style="margin:0;font-size:32px;font-weight:700;color:#00c9a7;">PASS</p>' +
    '<p style="margin:4px 0 0;font-size:12px;color:#6c757d;text-transform:uppercase;letter-spacing:1px;">Status</p>' +
    '</td>' +
    '</tr></table>' +
    '<p style="color:#495057;font-size:15px;line-height:1.6;">You\'ve met the <strong>80% threshold</strong> to advance to the next module.</p>' +
    '<div style="background:#e8f8f5;border-left:4px solid #00c9a7;border-radius:4px;padding:16px 20px;margin:24px 0;">' +
    '<p style="margin:0;color:#0d1b2e;font-size:14px;font-weight:700;">What\'s next</p>' +
    '<p style="margin:6px 0 0;color:#495057;font-size:14px;">MOD 2 — Hands-On Enrichment Practice. Dates to be confirmed.</p>' +
    '</div>' +
    '<p style="color:#6c757d;font-size:14px;line-height:1.6;">If you have questions about MOD 1 concepts, revisit the facilitator deck in the project SharePoint or reach out to the Demand Planning team.</p>';

  MailApp.sendEmail({
    to:       toEmail,
    subject:  subject,
    htmlBody: emailShell(content)
  });
}

function sendFailEmail(toEmail, name, score, total, pct, failedQNums) {
  var subject = 'MOD 1 Knowledge Check — Please review and retry';

  var missedRows = failedQNums.map(function(num) {
    var key = 'Q' + num;
    var qText = QUESTION_TEXT[key] || '';
    var refs  = SLIDE_REFS[key] || '';
    var slideLabel = refs.indexOf(',') > -1 ? 'Slides' : 'Slide';
    return '<tr style="border-bottom:1px solid #e9ecef;">' +
      '<td style="padding:12px 8px;color:#0d1b2e;font-weight:700;font-size:13px;white-space:nowrap;">Q' + num + '</td>' +
      '<td style="padding:12px 8px;color:#495057;font-size:13px;line-height:1.5;">' + qText + '</td>' +
      '<td style="padding:12px 8px;color:#00c9a7;font-size:13px;white-space:nowrap;">' + slideLabel + ' ' + refs + '</td>' +
      '</tr>';
  }).join('');

  var content =
    '<div style="text-align:center;margin-bottom:32px;">' +
    '<div style="display:inline-block;background:#fff3cd;border-radius:50%;width:72px;height:72px;line-height:72px;font-size:36px;">📋</div>' +
    '<h2 style="margin:16px 0 4px;color:#0d1b2e;font-size:24px;">Hi ' + name + '</h2>' +
    '<p style="margin:0;color:#6c757d;font-size:15px;">A little more review needed</p>' +
    '</div>' +
    '<table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f9fa;border-radius:8px;margin-bottom:28px;">' +
    '<tr>' +
    '<td style="padding:20px;text-align:center;border-right:1px solid #e9ecef;">' +
    '<p style="margin:0;font-size:32px;font-weight:700;color:#ffd60a;">' + score + '/' + total + '</p>' +
    '<p style="margin:4px 0 0;font-size:12px;color:#6c757d;text-transform:uppercase;letter-spacing:1px;">Score</p>' +
    '</td>' +
    '<td style="padding:20px;text-align:center;border-right:1px solid #e9ecef;">' +
    '<p style="margin:0;font-size:32px;font-weight:700;color:#ffd60a;">' + Math.round(pct) + '%</p>' +
    '<p style="margin:4px 0 0;font-size:12px;color:#6c757d;text-transform:uppercase;letter-spacing:1px;">Accuracy</p>' +
    '</td>' +
    '<td style="padding:20px;text-align:center;">' +
    '<p style="margin:0;font-size:32px;font-weight:700;color:#dc3545;">RETRY</p>' +
    '<p style="margin:4px 0 0;font-size:12px;color:#6c757d;text-transform:uppercase;letter-spacing:1px;">Status</p>' +
    '</td>' +
    '</tr></table>' +
    '<p style="color:#495057;font-size:15px;line-height:1.6;">No worries — the goal is for everyone to fully land MOD 1 before moving to hands-on practice.</p>' +
    '<h3 style="color:#0d1b2e;font-size:16px;font-weight:700;margin:24px 0 12px;">Questions to Review to Better Your Understanding</h3>' +
    '<table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e9ecef;border-radius:8px;overflow:hidden;margin:20px 0;">' +
    '<tr style="background:#0d1b2e;">' +
    '<th style="padding:10px 8px;color:#00c9a7;font-size:11px;text-transform:uppercase;letter-spacing:1px;text-align:left;">#</th>' +
    '<th style="padding:10px 8px;color:#00c9a7;font-size:11px;text-transform:uppercase;letter-spacing:1px;text-align:left;">Question</th>' +
    '<th style="padding:10px 8px;color:#00c9a7;font-size:11px;text-transform:uppercase;letter-spacing:1px;text-align:left;">Review</th>' +
    '</tr>' +
    missedRows +
    '</table>' +
    '<div style="background:#fff3cd;border-left:4px solid #ffd60a;border-radius:4px;padding:16px 20px;margin:24px 0;">' +
    '<p style="margin:0;color:#0d1b2e;font-size:14px;font-weight:700;">Note</p>' +
    '<p style="margin:6px 0 0;color:#495057;font-size:14px;">I\'m deliberately not sharing the correct answers here — go back to the material and find them yourself. That\'s where the learning sticks.</p>' +
    '</div>' +
    '<div style="text-align:center;margin-top:28px;">' +
    '<a href="' + QUIZ_URL + '" style="display:inline-block;background:#ffd60a;color:#0d1b2e;font-weight:700;font-size:15px;padding:14px 32px;border-radius:8px;text-decoration:none;">Retake the Quiz →</a>' +
    '</div>';

  MailApp.sendEmail({
    to:       toEmail,
    subject:  subject,
    htmlBody: emailShell(content)
  });
}

function sendNotificationEmail(payload, scoreResult, sheetUrl) {
  var name       = payload.name.trim();
  var email      = payload.email.trim().toLowerCase();
  var role       = payload.role + (payload.roleOther ? ' (' + payload.roleOther + ')' : '');
  var score      = scoreResult.score;
  var total      = TOTAL_QUESTIONS;
  var pct        = scoreResult.percent;
  var status     = scoreResult.pass ? 'PASS' : 'FAIL';
  var failedNums = scoreResult.failedQNums.join(', ') || 'none';

  var subject = '[MOD 1 Quiz] ' + name + ' — ' + score + '/' + total + ' — ' + status;
  var body =
    name + ' (' + email + ', ' + role + ') just submitted the MOD 1 Knowledge Check.\n\n' +
    'Score: ' + score + ' / ' + total + ' (' + pct + '%)\n' +
    'Status: ' + status + '\n' +
    'Failed questions: ' + failedNums + '\n\n' +
    'Full row written to the Sheet:\n' + sheetUrl;

  MailApp.sendEmail({
    to:      RENE_EMAIL,
    cc:      RENE_COPY_EMAIL,
    subject: subject,
    body:    body
  });
}

// ══════════════════════════════════════════════════════════════════════════════
// MOD 2 HANDLERS (additive — all MOD 1 functions above are unchanged)
// ══════════════════════════════════════════════════════════════════════════════

function handleMod2Post(payload) {
  try {
    var validationError = validatePayload_mod2(payload);
    if (validationError) return buildResponse({ error: validationError }, 400);

    var scoreResult = scoreSubmission_mod2(payload.answers);
    var sheetUrl    = appendToSheet_mod2(payload, scoreResult);
    sendEmails_mod2(payload, scoreResult, sheetUrl);

    return buildResponse({
      score:            scoreResult.score,
      total:            TOTAL_QUESTIONS_MOD2,
      percent:          scoreResult.percent,
      pass:             scoreResult.pass,
      failed_questions: scoreResult.failedQNums
    });
  } catch (err) {
    Logger.log('handleMod2Post error: ' + err.message + '\n' + err.stack);
    return buildResponse({ error: 'Server error. Please try again.' }, 500);
  }
}

function validatePayload_mod2(p) {
  if (!p.name || String(p.name).trim().length < 2) return 'Name is required.';
  var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!p.email || !emailRe.test(String(p.email).trim())) return 'Valid email is required.';
  if (!p.role) return 'Role is required.';
  if (!p.answers || typeof p.answers !== 'object') return 'Answers are required.';
  for (var i = 1; i <= TOTAL_QUESTIONS_MOD2; i++) {
    var key = 'Q' + i;
    var val = p.answers[key];
    if (!val || !['A','B','C','D'].includes(String(val).toUpperCase())) {
      return 'Answer for ' + key + ' is missing or invalid.';
    }
  }
  return null;
}

function scoreSubmission_mod2(answers) {
  var score = 0;
  var results = {};
  var failedQNums = [];
  for (var i = 1; i <= TOTAL_QUESTIONS_MOD2; i++) {
    var key     = 'Q' + i;
    var given   = String(answers[key] || '').toUpperCase();
    var correct = ANSWER_KEY_MOD2[key];
    var isCorrect = given === correct;
    results[key] = { given: given, correct: isCorrect };
    if (isCorrect) { score++; } else { failedQNums.push(i); }
  }
  var percent = Math.round((score / TOTAL_QUESTIONS_MOD2) * 10000) / 100;
  return { score: score, percent: percent, pass: score >= PASS_THRESHOLD_MOD2, results: results, failedQNums: failedQNums };
}

function computeAttemptNumber(emailLower, moduleId, sheet) {
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return 1;
  var count = 1;
  var data = sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).getValues();
  for (var i = 0; i < data.length; i++) {
    var rowEmail  = String(data[i][2]  || '').toLowerCase(); // col C = email
    var rowModule = String(data[i][43] || '').toLowerCase(); // col AR = module
    if (rowEmail === emailLower && rowModule === moduleId) count++;
  }
  return count;
}

function appendToSheet_mod2(payload, scoreResult) {
  var ss    = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) { sheet = ss.insertSheet(SHEET_NAME); writeHeaders(sheet); }
  if (sheet.getLastRow() === 0) writeHeaders(sheet);

  var moduleId      = 'mod2';
  var attemptNumber = computeAttemptNumber(String(payload.email).trim().toLowerCase(), moduleId, sheet);

  var now = new Date();
  var row = [
    now, payload.name.trim(), payload.email.trim().toLowerCase(), payload.role,
    payload.roleOther || '', scoreResult.score, scoreResult.percent,
    scoreResult.pass ? 'Pass' : 'Fail'
  ];

  // Q1–Q15 answer + correct pairs
  for (var i = 1; i <= TOTAL_QUESTIONS_MOD2; i++) {
    var key = 'Q' + i;
    var r   = scoreResult.results[key];
    row.push(r.given);
    row.push(r.correct);
  }
  // Q16 placeholder blanks — preserves column alignment with MOD 1 sheet layout
  row.push('');
  row.push('');

  row.push(scoreResult.failedQNums.join(', '));
  row.push(true);
  row.push((payload.userAgent || '').slice(0, 200));
  row.push(moduleId);
  row.push(attemptNumber);

  sheet.appendRow(row);
  return ss.getUrl();
}

function sendEmails_mod2(payload, scoreResult, sheetUrl) {
  var name  = payload.name.trim();
  var email = payload.email.trim().toLowerCase();
  try {
    if (scoreResult.pass) {
      sendPassEmail_mod2(email, name, scoreResult.score, TOTAL_QUESTIONS_MOD2, scoreResult.percent);
    } else {
      sendFailEmail_mod2(email, name, scoreResult.score, TOTAL_QUESTIONS_MOD2, scoreResult.percent, scoreResult.failedQNums);
    }
    sendNotificationEmail_mod2(payload, scoreResult, sheetUrl);
    return true;
  } catch (err) {
    Logger.log('MOD 2 email error: ' + err.message);
    return false;
  }
}

function emailShell_mod2(contentHtml) {
  return '<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body style="margin:0;padding:0;background:#f0f4f8;font-family:Arial,sans-serif;">' +
    '<table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f4f8;padding:32px 0;">' +
    '<tr><td align="center">' +
    '<table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">' +
    '<tr><td style="background:#0d1b2e;padding:28px 40px;text-align:center;">' +
    '<p style="margin:0;color:#00c9a7;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">Forecast Enrichment Programme · HERO Deployment</p>' +
    '<p style="margin:8px 0 0;color:#ffffff;font-size:20px;font-weight:700;">MOD 2 Knowledge Check</p>' +
    '</td></tr>' +
    '<tr><td style="padding:40px;">' + contentHtml + '</td></tr>' +
    '<tr><td style="background:#f8f9fa;padding:20px 40px;border-top:1px solid #e9ecef;text-align:center;">' +
    '<p style="margin:0;color:#6c757d;font-size:12px;">Rene Bartoli · Demand Planning · Forecast Enrichment Program</p>' +
    '</td></tr>' +
    '</table></td></tr></table></body></html>';
}

function sendPassEmail_mod2(toEmail, name, score, total, pct) {
  var subject = '✓ MOD 2 Knowledge Check — Passed';
  var content =
    '<div style="text-align:center;margin-bottom:32px;">' +
    '<div style="display:inline-block;background:#d4edda;border-radius:50%;width:72px;height:72px;line-height:72px;font-size:36px;">✓</div>' +
    '<h2 style="margin:16px 0 4px;color:#0d1b2e;font-size:24px;">Well done, ' + name + '!</h2>' +
    '<p style="margin:0;color:#6c757d;font-size:15px;">You\'ve passed the MOD 2 knowledge check</p>' +
    '</div>' +
    '<table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f9fa;border-radius:8px;margin-bottom:28px;">' +
    '<tr>' +
    '<td style="padding:20px;text-align:center;border-right:1px solid #e9ecef;">' +
    '<p style="margin:0;font-size:32px;font-weight:700;color:#00c9a7;">' + score + '/' + total + '</p>' +
    '<p style="margin:4px 0 0;font-size:12px;color:#6c757d;text-transform:uppercase;letter-spacing:1px;">Score</p>' +
    '</td>' +
    '<td style="padding:20px;text-align:center;border-right:1px solid #e9ecef;">' +
    '<p style="margin:0;font-size:32px;font-weight:700;color:#00c9a7;">' + Math.round(pct) + '%</p>' +
    '<p style="margin:4px 0 0;font-size:12px;color:#6c757d;text-transform:uppercase;letter-spacing:1px;">Accuracy</p>' +
    '</td>' +
    '<td style="padding:20px;text-align:center;">' +
    '<p style="margin:0;font-size:32px;font-weight:700;color:#00c9a7;">PASS</p>' +
    '<p style="margin:4px 0 0;font-size:12px;color:#6c757d;text-transform:uppercase;letter-spacing:1px;">Status</p>' +
    '</td>' +
    '</tr></table>' +
    '<p style="color:#495057;font-size:15px;line-height:1.6;">You\'ve met the <strong>80% threshold</strong> for MOD 2 — Enrichment Practice.</p>' +
    '<div style="background:#e8f8f5;border-left:4px solid #00c9a7;border-radius:4px;padding:16px 20px;margin:24px 0;">' +
    '<p style="margin:0;color:#0d1b2e;font-size:14px;font-weight:700;">You\'re ready</p>' +
    '<p style="margin:6px 0 0;color:#495057;font-size:14px;">You have now completed both modules. You\'re ready for hands-on enrichment practice in HERO.</p>' +
    '</div>' +
    '<p style="color:#6c757d;font-size:14px;line-height:1.6;">If you have questions about MOD 2 concepts, revisit the facilitator deck in the project SharePoint or reach out to the Demand Planning team.</p>';
  MailApp.sendEmail({ to: toEmail, subject: subject, htmlBody: emailShell_mod2(content) });
}

function sendFailEmail_mod2(toEmail, name, score, total, pct, failedQNums) {
  var subject = 'MOD 2 Knowledge Check — Please review and retry';

  var missedRows = failedQNums.map(function(num) {
    var key        = 'Q' + num;
    var qText      = QUESTION_TEXT_MOD2[key] || '';
    var refs       = SLIDE_REFS_MOD2[key] || '';
    var rationale  = RATIONALES_MOD2[key] || '';
    var slideLabel = refs.indexOf(',') > -1 ? 'Slides' : 'Slide';
    return '<tr style="border-bottom:1px solid #e9ecef;">' +
      '<td style="padding:12px 8px;color:#0d1b2e;font-weight:700;font-size:13px;white-space:nowrap;">Q' + num + '</td>' +
      '<td style="padding:12px 8px;font-size:13px;line-height:1.5;">' +
        '<div style="color:#495057;">' + qText + '</div>' +
        '<div style="color:#6c757d;font-style:italic;margin-top:6px;font-size:12px;">' + rationale + '</div>' +
      '</td>' +
      '<td style="padding:12px 8px;color:#00c9a7;font-size:13px;white-space:nowrap;">' + slideLabel + ' ' + refs + '</td>' +
      '</tr>';
  }).join('');

  var content =
    '<div style="text-align:center;margin-bottom:32px;">' +
    '<div style="display:inline-block;background:#fff3cd;border-radius:50%;width:72px;height:72px;line-height:72px;font-size:36px;">📋</div>' +
    '<h2 style="margin:16px 0 4px;color:#0d1b2e;font-size:24px;">Hi ' + name + '</h2>' +
    '<p style="margin:0;color:#6c757d;font-size:15px;">A little more review needed</p>' +
    '</div>' +
    '<table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f9fa;border-radius:8px;margin-bottom:28px;">' +
    '<tr>' +
    '<td style="padding:20px;text-align:center;border-right:1px solid #e9ecef;">' +
    '<p style="margin:0;font-size:32px;font-weight:700;color:#ffd60a;">' + score + '/' + total + '</p>' +
    '<p style="margin:4px 0 0;font-size:12px;color:#6c757d;text-transform:uppercase;letter-spacing:1px;">Score</p>' +
    '</td>' +
    '<td style="padding:20px;text-align:center;border-right:1px solid #e9ecef;">' +
    '<p style="margin:0;font-size:32px;font-weight:700;color:#ffd60a;">' + Math.round(pct) + '%</p>' +
    '<p style="margin:4px 0 0;font-size:12px;color:#6c757d;text-transform:uppercase;letter-spacing:1px;">Accuracy</p>' +
    '</td>' +
    '<td style="padding:20px;text-align:center;">' +
    '<p style="margin:0;font-size:32px;font-weight:700;color:#dc3545;">RETRY</p>' +
    '<p style="margin:4px 0 0;font-size:12px;color:#6c757d;text-transform:uppercase;letter-spacing:1px;">Status</p>' +
    '</td>' +
    '</tr></table>' +
    '<p style="color:#495057;font-size:15px;line-height:1.6;">No worries — the goal is for everyone to fully land MOD 2 before working in HERO.</p>' +
    '<h3 style="color:#0d1b2e;font-size:16px;font-weight:700;margin:24px 0 12px;">Questions to Review to Better Your Understanding</h3>' +
    '<table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e9ecef;border-radius:8px;overflow:hidden;margin:20px 0;">' +
    '<tr style="background:#0d1b2e;">' +
    '<th style="padding:10px 8px;color:#00c9a7;font-size:11px;text-transform:uppercase;letter-spacing:1px;text-align:left;">#</th>' +
    '<th style="padding:10px 8px;color:#00c9a7;font-size:11px;text-transform:uppercase;letter-spacing:1px;text-align:left;">Question &amp; Rationale</th>' +
    '<th style="padding:10px 8px;color:#00c9a7;font-size:11px;text-transform:uppercase;letter-spacing:1px;text-align:left;">Review</th>' +
    '</tr>' +
    missedRows +
    '</table>' +
    '<div style="background:#fff3cd;border-left:4px solid #ffd60a;border-radius:4px;padding:16px 20px;margin:24px 0;">' +
    '<p style="margin:0;color:#0d1b2e;font-size:14px;font-weight:700;">Note</p>' +
    '<p style="margin:6px 0 0;color:#495057;font-size:14px;">I\'m deliberately not sharing the correct answers here — go back to the material and find them yourself. That\'s where the learning sticks.</p>' +
    '</div>' +
    '<div style="text-align:center;margin-top:28px;">' +
    '<a href="' + QUIZ_URL_MOD2 + '" style="display:inline-block;background:#ffd60a;color:#0d1b2e;font-weight:700;font-size:15px;padding:14px 32px;border-radius:8px;text-decoration:none;">Retake the Quiz →</a>' +
    '</div>';

  MailApp.sendEmail({ to: toEmail, subject: subject, htmlBody: emailShell_mod2(content) });
}

function sendNotificationEmail_mod2(payload, scoreResult, sheetUrl) {
  var name        = payload.name.trim();
  var email       = payload.email.trim().toLowerCase();
  var role        = payload.role + (payload.roleOther ? ' (' + payload.roleOther + ')' : '');
  var score       = scoreResult.score;
  var total       = TOTAL_QUESTIONS_MOD2;
  var pct         = scoreResult.percent;
  var status      = scoreResult.pass ? 'PASS' : 'FAIL';
  var failedCount = scoreResult.failedQNums.length;
  var failedList  = failedCount > 0
    ? '  (' + scoreResult.failedQNums.map(function(n) { return 'Q' + n; }).join(', ') + ')'
    : '';

  var subject = '[MOD 2 Quiz] ' + name + ' — ' + score + '/' + total + ' — ' + status;
  var body =
    name + ' (' + email + ', ' + role + ') just submitted the MOD 2 Knowledge Check.\n\n' +
    'Score: ' + score + ' / ' + total + ' (' + pct + '%)\n' +
    'Status: ' + status + '\n' +
    'Questions failed: ' + failedCount + ' of ' + total + failedList + '\n\n' +
    'Full row written to the Sheet:\n' + sheetUrl;

  MailApp.sendEmail({ to: RENE_EMAIL, cc: RENE_COPY_EMAIL, subject: subject, body: body });
}

// ══════════════════════════════════════════════════════════════════════════════
// MOD 4 — Exceptions & Customer Variations (additive)
// ══════════════════════════════════════════════════════════════════════════════

const ANSWER_KEY_MOD4 = {
  Q1:'B', Q2:'C', Q3:'A', Q4:'A', Q5:'A',
  Q6:'B', Q7:'A', Q8:'C', Q9:'B', Q10:'D'
};
const TOTAL_QUESTIONS_MOD4 = 10;
const PASS_THRESHOLD_MOD4  = 8;
const QUIZ_URL_MOD4        = 'https://enerbartoli.github.io/mod1-knowledge-check/mod4.html';

const SLIDE_REFS_MOD4 = {
  Q1:'5',     Q2:'6',     Q3:'7',     Q4:'6, 7',  Q5:'6',
  Q6:'7',     Q7:'8',     Q8:'6, 7, 8', Q9:'6',   Q10:'7'
};

const QUESTION_TEXT_MOD4 = {
  Q1: 'Why do DI, FAN, and Amazon need to be discussed as a separate group in MOD 4?',
  Q2: 'In the UK pilot, who owns the DI forecast number and how is it built?',
  Q3: 'For FAN items, which team builds the forecast volume, and what does the KAM do?',
  Q4: 'In the UK pilot, DI and FAN are not forecast statistically, so Daybreak produces no baseline for them. In the US, DI is forecast statistically. Where does the full forecast volume land in the Reconciliation Template in each case?',
  Q5: 'Which statement correctly describes the Evergreen designation?',
  Q6: 'Why are FAN items deliberately handled outside the Daybreak baseline?',
  Q7: 'How is Amazon treated in the UK pilot?',
  Q8: 'Across DI, FAN, and Amazon, what is Demand Planning\'s role?',
  Q9: 'A Key Account Manager (KAM) is reviewing an account in a segment the market has agreed not to forecast statistically, so its items are built bottom-up. One item has shipped a stable, repeating pattern for 18 months, and the KAM wants it to start from a Daybreak baseline instead. What should happen?',
  Q10:'A KAM at FP-2 receives a FAN allocation from the regional category team for a franchise release in week 30. The KAM believes the allocation is too high for their account and wants to adjust it down. What is the correct action?'
};

const RATIONALES_MOD4 = {
  Q1: 'The three are not grouped by revenue, scope, or coverage. They are grouped because their demand history is erratic, discontinuous, and opportunistic — DI is program-driven, FAN is event-driven, Amazon has highly irregular ordering rhythm — which is exactly what a history-based statistical baseline cannot project well. That is why each one needs its own handling model.',
  Q2: 'For DI there is no Daybreak baseline by default. The KAM builds the forecast bottom-up by Forecasting Partner using account knowledge — committed programs, signed orders, customer plans — not statistical extrapolation. DP facilitates but the account team carries the build.',
  Q3: 'FAN volume sits with the team that owns the moment — the regional category team. KAMs validate timing and feasibility at their account but do not re-cut the FAN number.',
  Q4: 'What decides this is not the channel or the item class, it is whether the market agreed to forecast that segment statistically. Where there is no Daybreak baseline, the full volume enters as Base Trend at Level 1, and the Level 1 lock is essentially all Base Trend with no statistical signal to challenge against. Where there is a baseline, as with DI in the US, the segment behaves like any other: the resultant is the starting point and the team layers enrichments and Base Trend on top. The resultant itself is never overwritten in either case.',
  Q5: 'Sales Operations owns the Evergreen designation. Not the Key Account Manager, not Demand Planning, not the Brand Captain. Once an item is designated, it stops being built bottom-up and sits on a Daybreak baseline that the KAM enriches on top, like any Carry-Forward item. The designation is not automatic and it is not a market-specific quirk: what varies by market is which segments start outside the statistical model in the first place.',
  Q6: 'FAN history contains one-off spikes (franchise releases, film tie-ins, time-limited campaigns) that would create false signals downstream and pollute the baseline for standard CF items. The exception is deliberate.',
  Q7: 'For the pilot, Amazon is deliberately treated as a standard customer so the team learns the standard flow first. Daybreak generates the baseline; statistical disaggregation assigns Amazon\'s share; the Amazon KAM reviews and adjusts.',
  Q8: 'In all three models DP plays the same role — facilitate and challenge. DP does not carry the build. DI is built bottom-up by the KAM partner-by-partner. FAN volume is owned by the regional category team. Amazon (under pilot treatment) is owned by the Amazon KAM in the standard Session 2 flow.',
  Q9: 'Evergreen designation is owned by Sales Ops — not by the KAM, DP, or Captain. Until Sales Ops designates the item Evergreen, it stays in the DI bottom-up flow.',
  Q10:'For FAN, the regional category team owns the number. KAMs validate timing and feasibility but do not re-cut. Magnitude concerns route back to the volume owner, not to DP or the baseline.'
};

function handleMod4Post(payload) {
  try {
    var validationError = validatePayload_mod4(payload);
    if (validationError) return buildResponse({ error: validationError }, 400);

    var scoreResult = scoreSubmission_mod4(payload.answers);
    var sheetUrl    = appendToSheet_mod4(payload, scoreResult);
    sendEmails_mod4(payload, scoreResult, sheetUrl);

    return buildResponse({
      score:            scoreResult.score,
      total:            TOTAL_QUESTIONS_MOD4,
      percent:          scoreResult.percent,
      pass:             scoreResult.pass,
      failed_questions: scoreResult.failedQNums
    });
  } catch (err) {
    Logger.log('handleMod4Post error: ' + err.message + '\n' + err.stack);
    return buildResponse({ error: 'Server error. Please try again.' }, 500);
  }
}

function validatePayload_mod4(p) {
  if (!p.name || String(p.name).trim().length < 2) return 'Name is required.';
  var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!p.email || !emailRe.test(String(p.email).trim())) return 'Valid email is required.';
  if (!p.role) return 'Role is required.';
  if (!p.answers || typeof p.answers !== 'object') return 'Answers are required.';
  for (var i = 1; i <= TOTAL_QUESTIONS_MOD4; i++) {
    var key = 'Q' + i;
    var val = p.answers[key];
    if (!val || !['A','B','C','D'].includes(String(val).toUpperCase())) {
      return 'Answer for ' + key + ' is missing or invalid.';
    }
  }
  return null;
}

function scoreSubmission_mod4(answers) {
  var score = 0;
  var results = {};
  var failedQNums = [];
  for (var i = 1; i <= TOTAL_QUESTIONS_MOD4; i++) {
    var key     = 'Q' + i;
    var given   = String(answers[key] || '').toUpperCase();
    var correct = ANSWER_KEY_MOD4[key];
    var isCorrect = given === correct;
    results[key] = { given: given, correct: isCorrect };
    if (isCorrect) { score++; } else { failedQNums.push(i); }
  }
  var percent = Math.round((score / TOTAL_QUESTIONS_MOD4) * 10000) / 100;
  return { score: score, percent: percent, pass: score >= PASS_THRESHOLD_MOD4, results: results, failedQNums: failedQNums };
}

function appendToSheet_mod4(payload, scoreResult) {
  var ss    = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) { sheet = ss.insertSheet(SHEET_NAME); writeHeaders(sheet); }
  if (sheet.getLastRow() === 0) writeHeaders(sheet);

  var moduleId      = 'mod4';
  var attemptNumber = computeAttemptNumber(String(payload.email).trim().toLowerCase(), moduleId, sheet);

  var now = new Date();
  var row = [
    now, payload.name.trim(), payload.email.trim().toLowerCase(), payload.role,
    payload.roleOther || '', scoreResult.score, scoreResult.percent,
    scoreResult.pass ? 'Pass' : 'Fail'
  ];

  // Q1–Q10 answer + correct pairs
  for (var i = 1; i <= TOTAL_QUESTIONS_MOD4; i++) {
    var key = 'Q' + i;
    var r   = scoreResult.results[key];
    row.push(r.given);
    row.push(r.correct);
  }
  // Q11–Q16 placeholder blanks — preserves column alignment (6 blank pairs)
  for (var j = 0; j < 6; j++) {
    row.push('');
    row.push('');
  }

  row.push(scoreResult.failedQNums.join(', '));
  row.push(true);
  row.push((payload.userAgent || '').slice(0, 200));
  row.push(moduleId);
  row.push(attemptNumber);

  sheet.appendRow(row);
  return ss.getUrl();
}

function sendEmails_mod4(payload, scoreResult, sheetUrl) {
  var name  = payload.name.trim();
  var email = payload.email.trim().toLowerCase();
  try {
    if (scoreResult.pass) {
      sendPassEmail_mod4(email, name, scoreResult.score, TOTAL_QUESTIONS_MOD4, scoreResult.percent);
    } else {
      sendFailEmail_mod4(email, name, scoreResult.score, TOTAL_QUESTIONS_MOD4, scoreResult.percent, scoreResult.failedQNums);
    }
    sendNotificationEmail_mod4(payload, scoreResult, sheetUrl);
    return true;
  } catch (err) {
    Logger.log('MOD 4 email error: ' + err.message);
    return false;
  }
}

function emailShell_mod4(contentHtml) {
  return '<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body style="margin:0;padding:0;background:#f0f4f8;font-family:Arial,sans-serif;">' +
    '<table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f4f8;padding:32px 0;">' +
    '<tr><td align="center">' +
    '<table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">' +
    '<tr><td style="background:#0d1b2e;padding:28px 40px;text-align:center;">' +
    '<p style="margin:0;color:#00c9a7;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">Forecast Enrichment Programme · HERO Deployment</p>' +
    '<p style="margin:8px 0 0;color:#ffffff;font-size:20px;font-weight:700;">MOD 4 Knowledge Check</p>' +
    '</td></tr>' +
    '<tr><td style="padding:40px;">' + contentHtml + '</td></tr>' +
    '<tr><td style="background:#f8f9fa;padding:20px 40px;border-top:1px solid #e9ecef;text-align:center;">' +
    '<p style="margin:0;color:#6c757d;font-size:12px;">Rene Bartoli · Demand Planning · Forecast Enrichment Program</p>' +
    '</td></tr>' +
    '</table></td></tr></table></body></html>';
}

function sendPassEmail_mod4(toEmail, name, score, total, pct) {
  var subject = '✓ MOD 4 Knowledge Check — Passed';
  var content =
    '<div style="text-align:center;margin-bottom:32px;">' +
    '<div style="display:inline-block;background:#d4edda;border-radius:50%;width:72px;height:72px;line-height:72px;font-size:36px;">✓</div>' +
    '<h2 style="margin:16px 0 4px;color:#0d1b2e;font-size:24px;">Well done, ' + name + '!</h2>' +
    '<p style="margin:0;color:#6c757d;font-size:15px;">You\'ve passed the MOD 4 knowledge check</p>' +
    '</div>' +
    '<table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f9fa;border-radius:8px;margin-bottom:28px;">' +
    '<tr>' +
    '<td style="padding:20px;text-align:center;border-right:1px solid #e9ecef;">' +
    '<p style="margin:0;font-size:32px;font-weight:700;color:#00c9a7;">' + score + '/' + total + '</p>' +
    '<p style="margin:4px 0 0;font-size:12px;color:#6c757d;text-transform:uppercase;letter-spacing:1px;">Score</p>' +
    '</td>' +
    '<td style="padding:20px;text-align:center;border-right:1px solid #e9ecef;">' +
    '<p style="margin:0;font-size:32px;font-weight:700;color:#00c9a7;">' + Math.round(pct) + '%</p>' +
    '<p style="margin:4px 0 0;font-size:12px;color:#6c757d;text-transform:uppercase;letter-spacing:1px;">Accuracy</p>' +
    '</td>' +
    '<td style="padding:20px;text-align:center;">' +
    '<p style="margin:0;font-size:32px;font-weight:700;color:#00c9a7;">PASS</p>' +
    '<p style="margin:4px 0 0;font-size:12px;color:#6c757d;text-transform:uppercase;letter-spacing:1px;">Status</p>' +
    '</td>' +
    '</tr></table>' +
    '<p style="color:#495057;font-size:15px;line-height:1.6;">You\'ve met the <strong>80% threshold</strong> for MOD 4 — Exceptions &amp; Customer Variations.</p>' +
    '<div style="background:#e8f8f5;border-left:4px solid #00c9a7;border-radius:4px;padding:16px 20px;margin:24px 0;">' +
    '<p style="margin:0;color:#0d1b2e;font-size:14px;font-weight:700;">What\'s next</p>' +
    '<p style="margin:6px 0 0;color:#495057;font-size:14px;">Hands-on enrichment practice in HERO for DI / FAN / Amazon patterns. Continue with MOD 5 — Reconciliation &amp; Decision Narrative.</p>' +
    '</div>' +
    '<p style="color:#6c757d;font-size:14px;line-height:1.6;">If you have questions about MOD 4 concepts, revisit the facilitator deck in the project SharePoint or reach out to the Demand Planning team.</p>';
  MailApp.sendEmail({ to: toEmail, subject: subject, htmlBody: emailShell_mod4(content) });
}

function sendFailEmail_mod4(toEmail, name, score, total, pct, failedQNums) {
  var subject = 'MOD 4 Knowledge Check — Please review and retry';

  var missedRows = failedQNums.map(function(num) {
    var key        = 'Q' + num;
    var qText      = QUESTION_TEXT_MOD4[key] || '';
    var refs       = SLIDE_REFS_MOD4[key] || '';
    var rationale  = RATIONALES_MOD4[key] || '';
    var slideLabel = refs.indexOf(',') > -1 ? 'Slides' : 'Slide';
    return '<tr style="border-bottom:1px solid #e9ecef;">' +
      '<td style="padding:12px 8px;color:#0d1b2e;font-weight:700;font-size:13px;white-space:nowrap;">Q' + num + '</td>' +
      '<td style="padding:12px 8px;font-size:13px;line-height:1.5;">' +
        '<div style="color:#495057;">' + qText + '</div>' +
        '<div style="color:#6c757d;font-style:italic;margin-top:6px;font-size:12px;">' + rationale + '</div>' +
      '</td>' +
      '<td style="padding:12px 8px;color:#00c9a7;font-size:13px;white-space:nowrap;">' + slideLabel + ' ' + refs + '</td>' +
      '</tr>';
  }).join('');

  var content =
    '<div style="text-align:center;margin-bottom:32px;">' +
    '<div style="display:inline-block;background:#fff3cd;border-radius:50%;width:72px;height:72px;line-height:72px;font-size:36px;">📋</div>' +
    '<h2 style="margin:16px 0 4px;color:#0d1b2e;font-size:24px;">Hi ' + name + '</h2>' +
    '<p style="margin:0;color:#6c757d;font-size:15px;">A little more review needed</p>' +
    '</div>' +
    '<table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f9fa;border-radius:8px;margin-bottom:28px;">' +
    '<tr>' +
    '<td style="padding:20px;text-align:center;border-right:1px solid #e9ecef;">' +
    '<p style="margin:0;font-size:32px;font-weight:700;color:#ffd60a;">' + score + '/' + total + '</p>' +
    '<p style="margin:4px 0 0;font-size:12px;color:#6c757d;text-transform:uppercase;letter-spacing:1px;">Score</p>' +
    '</td>' +
    '<td style="padding:20px;text-align:center;border-right:1px solid #e9ecef;">' +
    '<p style="margin:0;font-size:32px;font-weight:700;color:#ffd60a;">' + Math.round(pct) + '%</p>' +
    '<p style="margin:4px 0 0;font-size:12px;color:#6c757d;text-transform:uppercase;letter-spacing:1px;">Accuracy</p>' +
    '</td>' +
    '<td style="padding:20px;text-align:center;">' +
    '<p style="margin:0;font-size:32px;font-weight:700;color:#dc3545;">RETRY</p>' +
    '<p style="margin:4px 0 0;font-size:12px;color:#6c757d;text-transform:uppercase;letter-spacing:1px;">Status</p>' +
    '</td>' +
    '</tr></table>' +
    '<p style="color:#495057;font-size:15px;line-height:1.6;">No worries — the goal is for everyone to fully land MOD 4 before working with DI / FAN / Amazon in HERO.</p>' +
    '<h3 style="color:#0d1b2e;font-size:16px;font-weight:700;margin:24px 0 12px;">Questions to Review to Better Your Understanding</h3>' +
    '<table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e9ecef;border-radius:8px;overflow:hidden;margin:20px 0;">' +
    '<tr style="background:#0d1b2e;">' +
    '<th style="padding:10px 8px;color:#00c9a7;font-size:11px;text-transform:uppercase;letter-spacing:1px;text-align:left;">#</th>' +
    '<th style="padding:10px 8px;color:#00c9a7;font-size:11px;text-transform:uppercase;letter-spacing:1px;text-align:left;">Question &amp; Rationale</th>' +
    '<th style="padding:10px 8px;color:#00c9a7;font-size:11px;text-transform:uppercase;letter-spacing:1px;text-align:left;">Review</th>' +
    '</tr>' +
    missedRows +
    '</table>' +
    '<div style="background:#fff3cd;border-left:4px solid #ffd60a;border-radius:4px;padding:16px 20px;margin:24px 0;">' +
    '<p style="margin:0;color:#0d1b2e;font-size:14px;font-weight:700;">Note</p>' +
    '<p style="margin:6px 0 0;color:#495057;font-size:14px;">I\'m deliberately not sharing the correct answers here — go back to the material and find them yourself. That\'s where the learning sticks.</p>' +
    '</div>' +
    '<div style="text-align:center;margin-top:28px;">' +
    '<a href="' + QUIZ_URL_MOD4 + '" style="display:inline-block;background:#ffd60a;color:#0d1b2e;font-weight:700;font-size:15px;padding:14px 32px;border-radius:8px;text-decoration:none;">Retake the Quiz →</a>' +
    '</div>';

  MailApp.sendEmail({ to: toEmail, subject: subject, htmlBody: emailShell_mod4(content) });
}

function sendNotificationEmail_mod4(payload, scoreResult, sheetUrl) {
  var name        = payload.name.trim();
  var email       = payload.email.trim().toLowerCase();
  var role        = payload.role + (payload.roleOther ? ' (' + payload.roleOther + ')' : '');
  var score       = scoreResult.score;
  var total       = TOTAL_QUESTIONS_MOD4;
  var pct         = scoreResult.percent;
  var status      = scoreResult.pass ? 'PASS' : 'FAIL';
  var failedCount = scoreResult.failedQNums.length;
  var failedList  = failedCount > 0
    ? '  (' + scoreResult.failedQNums.map(function(n) { return 'Q' + n; }).join(', ') + ')'
    : '';

  var subject = '[MOD 4 Quiz] ' + name + ' — ' + score + '/' + total + ' — ' + status;
  var body =
    name + ' (' + email + ', ' + role + ') just submitted the MOD 4 Knowledge Check.\n\n' +
    'Score: ' + score + ' / ' + total + ' (' + pct + '%)\n' +
    'Status: ' + status + '\n' +
    'Questions failed: ' + failedCount + ' of ' + total + failedList + '\n\n' +
    'Full row written to the Sheet:\n' + sheetUrl;

  MailApp.sendEmail({ to: RENE_EMAIL, cc: RENE_COPY_EMAIL, subject: subject, body: body });
}

// ══════════════════════════════════════════════════════════════════════════════
// MOD 5 — Reconciliation & Decision Narrative (additive)
// ══════════════════════════════════════════════════════════════════════════════

const ANSWER_KEY_MOD5 = {
  Q1:'A', Q2:'B', Q3:'C', Q4:'D', Q5:'A',
  Q6:'B', Q7:'C', Q8:'D', Q9:'A', Q10:'B',
  Q11:'C', Q12:'D', Q13:'A', Q14:'B', Q15:'C'
};
const TOTAL_QUESTIONS_MOD5 = 15;
const PASS_THRESHOLD_MOD5  = 12;
const QUIZ_URL_MOD5        = 'https://enerbartoli.github.io/mod1-knowledge-check/mod5.html';

const SLIDE_REFS_MOD5 = {
  Q1:'20',        Q2:'21, 30, 31',  Q3:'23, 63',    Q4:'23',        Q5:'18, 24',
  Q6:'24, 26',    Q7:'25',          Q8:'27',        Q9:'28',        Q10:'29, 31',
  Q11:'30',       Q12:'33, 35, 37', Q13:'42',       Q14:'52',       Q15:'54, 59'
};

const QUESTION_TEXT_MOD5 = {
  Q1: 'Reconciliation, as defined in MOD 5, is the meeting where the team:',
  Q2: 'Which description matches the UK reconciliation standard for what happens in the room?',
  Q3: 'In what order do the four UK reconciliation sessions run, and who owns each?',
  Q4: 'What is the rule about starting one session before the previous one finishes?',
  Q5: 'Why does the UK pilot use three references rather than formal guardrails?',
  Q6: 'Which reference answers the question "Is the brand at this partner congruent with what we actually ship?"',
  Q7: 'Which statement correctly describes the AIM Shipment Revenue Forecast?',
  Q8: 'On the POS Pace Chart, the projected red dashed line sits below the green target line for an SKU. What should the KAM do?',
  Q9: 'What is the correct drill order when reconciling movements?',
  Q10:'In the 7-part decision narrative, what does the final beat capture?',
  Q11:'Which of the eight meeting-behavior rules acts as the UK substitute for formal guardrails?',
  Q12:'The Brand Captain in Session 1 finds that the current consensus for Brand A is +30 units/week above the Daybreak baseline at Level 2.5, driven by a confirmed listing expansion at FP-1 effective W26. What is the Captain\'s correct action?',
  Q13:'A KAM in Session 2 identifies that a brand at their Forecasting Partner has been gradually widening distribution for two cycles, with no specific account-level event. The shift looks structural. Which bucket does this belong in, and who acts?',
  Q14:'Marketing + DP in Session 3 want to apply an adjustment that lifts Brand B by +8,000 units in Q3 based on a confirmed campaign. Where does this adjustment land?',
  Q15:'At Executive Sign-Off, how many key movements are presented and how long does each get?'
};

const RATIONALES_MOD5 = {
  Q1: 'The training mantra defines reconciliation as TELL → CHALLENGE → DECIDE → SIGN OFF. It is a decision meeting, not a build session and not a confirmation step.',
  Q2: 'Reconciliation is structured challenge against the three references, exception-based, decision-focused with named owners and due dates. No live forecast entry, no line-by-line rebuild, no open-ended debate.',
  Q3: 'The cascade is fixed: Captain at L2.5 first → KAM at L1 → Marketing+DP for the top-down challenge → Market Leader for sign-off.',
  Q4: 'Strict sequencing — the handoff between sessions is a hard gate. If Captain has not finished at 2.5, Commercial does not start; if Commercial has not confirmed L1, Marketing+DP does not start; and so on.',
  Q5: 'Other markets use formal guardrails. The UK has not yet defined them, so the team triangulates using AIM at BU/Brand, historical actuals at Brand × Forecasting Partner, and POS Glidepath at SKU.',
  Q6: 'Each reference has a grain and a question. Historical actuals at Brand × Forecasting Partner answers brand-at-partner congruence. AIM answers totals at BU/Brand; POS answers SKU-level consumer signal.',
  Q7: 'AIM does not bake in past or future stimuli — its objectivity is its strength and its weakness. Statistical bounds hold roughly 8 out of 10 times when there is no exceptional stimulus. Refresh is monthly, not real-time.',
  Q8: 'The tool flags where to look, not what to do — a gap is a signal, not an order. The KAM looks for a named driver and routes via Enrichment at L1 or R&O.',
  Q9: 'Drill is permission-based. Start at the BU/Brand total and drill only when the level above tells you to. Drilling to SKU first creates noise without context.',
  Q10:'Step 7 is "Who owns next?" — a named person and a date. If a row leaves the room without an owner and a due date, it is not a decision; it is a parking-lot item.',
  Q11:'Rule 5 (Cite a reference or move to R&O) is the explicit UK substitute for guardrails — every challenge must cite one of the three references, otherwise the item is routed to R&O.',
  Q12:'Session 1 is ANCHOR → RECONCILE → NEUTRALIZE → DISAGGREGATE. Deltas vs consensus are neutralized as Base Trend Adjustments at L2.5 by the Captain. With a named driver and evidence, the item is not waiting on the KAM and not an R&O.',
  Q13:'Structural brand-level shifts belong in Base Trend (Captain at L2.5, next cycle). A specific account-level event would be an Enrichment (KAM, this cycle). Two-bucket entries get rejected.',
  Q14:'Marketing / DP enrichments enter at L2.5 via the Enrichment Capture Template (ECT) and disaggregate to L1 across partners using baseline disaggregation rules. Marketing + DP cannot re-open the Captain\'s Base Trend or the KAM\'s L1 enrichments — if either needs to move, the item routes back to that owner.',
  Q15:'Three to five material movements, each told in the 7-part narrative in five minutes. If a movement does not fit in five minutes, it is not ready for sign-off and goes back to Session 3.'
};

function handleMod5Post(payload) {
  try {
    var validationError = validatePayload_mod5(payload);
    if (validationError) return buildResponse({ error: validationError }, 400);

    var scoreResult = scoreSubmission_mod5(payload.answers);
    var sheetUrl    = appendToSheet_mod5(payload, scoreResult);
    sendEmails_mod5(payload, scoreResult, sheetUrl);

    return buildResponse({
      score:            scoreResult.score,
      total:            TOTAL_QUESTIONS_MOD5,
      percent:          scoreResult.percent,
      pass:             scoreResult.pass,
      failed_questions: scoreResult.failedQNums
    });
  } catch (err) {
    Logger.log('handleMod5Post error: ' + err.message + '\n' + err.stack);
    return buildResponse({ error: 'Server error. Please try again.' }, 500);
  }
}

function validatePayload_mod5(p) {
  if (!p.name || String(p.name).trim().length < 2) return 'Name is required.';
  var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!p.email || !emailRe.test(String(p.email).trim())) return 'Valid email is required.';
  if (!p.role) return 'Role is required.';
  if (!p.answers || typeof p.answers !== 'object') return 'Answers are required.';
  for (var i = 1; i <= TOTAL_QUESTIONS_MOD5; i++) {
    var key = 'Q' + i;
    var val = p.answers[key];
    if (!val || !['A','B','C','D'].includes(String(val).toUpperCase())) {
      return 'Answer for ' + key + ' is missing or invalid.';
    }
  }
  return null;
}

function scoreSubmission_mod5(answers) {
  var score = 0;
  var results = {};
  var failedQNums = [];
  for (var i = 1; i <= TOTAL_QUESTIONS_MOD5; i++) {
    var key     = 'Q' + i;
    var given   = String(answers[key] || '').toUpperCase();
    var correct = ANSWER_KEY_MOD5[key];
    var isCorrect = given === correct;
    results[key] = { given: given, correct: isCorrect };
    if (isCorrect) { score++; } else { failedQNums.push(i); }
  }
  var percent = Math.round((score / TOTAL_QUESTIONS_MOD5) * 10000) / 100;
  return { score: score, percent: percent, pass: score >= PASS_THRESHOLD_MOD5, results: results, failedQNums: failedQNums };
}

function appendToSheet_mod5(payload, scoreResult) {
  var ss    = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) { sheet = ss.insertSheet(SHEET_NAME); writeHeaders(sheet); }
  if (sheet.getLastRow() === 0) writeHeaders(sheet);

  var moduleId      = 'mod5';
  var attemptNumber = computeAttemptNumber(String(payload.email).trim().toLowerCase(), moduleId, sheet);

  var now = new Date();
  var row = [
    now, payload.name.trim(), payload.email.trim().toLowerCase(), payload.role,
    payload.roleOther || '', scoreResult.score, scoreResult.percent,
    scoreResult.pass ? 'Pass' : 'Fail'
  ];

  // Q1–Q15 answer + correct pairs
  for (var i = 1; i <= TOTAL_QUESTIONS_MOD5; i++) {
    var key = 'Q' + i;
    var r   = scoreResult.results[key];
    row.push(r.given);
    row.push(r.correct);
  }
  // Q16 placeholder blank — preserves column alignment (1 blank pair)
  row.push('');
  row.push('');

  row.push(scoreResult.failedQNums.join(', '));
  row.push(true);
  row.push((payload.userAgent || '').slice(0, 200));
  row.push(moduleId);
  row.push(attemptNumber);

  sheet.appendRow(row);
  return ss.getUrl();
}

function sendEmails_mod5(payload, scoreResult, sheetUrl) {
  var name  = payload.name.trim();
  var email = payload.email.trim().toLowerCase();
  try {
    if (scoreResult.pass) {
      sendPassEmail_mod5(email, name, scoreResult.score, TOTAL_QUESTIONS_MOD5, scoreResult.percent);
    } else {
      sendFailEmail_mod5(email, name, scoreResult.score, TOTAL_QUESTIONS_MOD5, scoreResult.percent, scoreResult.failedQNums);
    }
    sendNotificationEmail_mod5(payload, scoreResult, sheetUrl);
    return true;
  } catch (err) {
    Logger.log('MOD 5 email error: ' + err.message);
    return false;
  }
}

function emailShell_mod5(contentHtml) {
  return '<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body style="margin:0;padding:0;background:#f0f4f8;font-family:Arial,sans-serif;">' +
    '<table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f4f8;padding:32px 0;">' +
    '<tr><td align="center">' +
    '<table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">' +
    '<tr><td style="background:#0d1b2e;padding:28px 40px;text-align:center;">' +
    '<p style="margin:0;color:#00c9a7;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">Forecast Enrichment Programme · HERO Deployment</p>' +
    '<p style="margin:8px 0 0;color:#ffffff;font-size:20px;font-weight:700;">MOD 5 Knowledge Check</p>' +
    '</td></tr>' +
    '<tr><td style="padding:40px;">' + contentHtml + '</td></tr>' +
    '<tr><td style="background:#f8f9fa;padding:20px 40px;border-top:1px solid #e9ecef;text-align:center;">' +
    '<p style="margin:0;color:#6c757d;font-size:12px;">Rene Bartoli · Demand Planning · Forecast Enrichment Program</p>' +
    '</td></tr>' +
    '</table></td></tr></table></body></html>';
}

function sendPassEmail_mod5(toEmail, name, score, total, pct) {
  var subject = '✓ MOD 5 Knowledge Check — Passed';
  var content =
    '<div style="text-align:center;margin-bottom:32px;">' +
    '<div style="display:inline-block;background:#d4edda;border-radius:50%;width:72px;height:72px;line-height:72px;font-size:36px;">✓</div>' +
    '<h2 style="margin:16px 0 4px;color:#0d1b2e;font-size:24px;">Well done, ' + name + '!</h2>' +
    '<p style="margin:0;color:#6c757d;font-size:15px;">You\'ve passed the MOD 5 knowledge check</p>' +
    '</div>' +
    '<table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f9fa;border-radius:8px;margin-bottom:28px;">' +
    '<tr>' +
    '<td style="padding:20px;text-align:center;border-right:1px solid #e9ecef;">' +
    '<p style="margin:0;font-size:32px;font-weight:700;color:#00c9a7;">' + score + '/' + total + '</p>' +
    '<p style="margin:4px 0 0;font-size:12px;color:#6c757d;text-transform:uppercase;letter-spacing:1px;">Score</p>' +
    '</td>' +
    '<td style="padding:20px;text-align:center;border-right:1px solid #e9ecef;">' +
    '<p style="margin:0;font-size:32px;font-weight:700;color:#00c9a7;">' + Math.round(pct) + '%</p>' +
    '<p style="margin:4px 0 0;font-size:12px;color:#6c757d;text-transform:uppercase;letter-spacing:1px;">Accuracy</p>' +
    '</td>' +
    '<td style="padding:20px;text-align:center;">' +
    '<p style="margin:0;font-size:32px;font-weight:700;color:#00c9a7;">PASS</p>' +
    '<p style="margin:4px 0 0;font-size:12px;color:#6c757d;text-transform:uppercase;letter-spacing:1px;">Status</p>' +
    '</td>' +
    '</tr></table>' +
    '<p style="color:#495057;font-size:15px;line-height:1.6;">You\'ve met the <strong>80% threshold</strong> for MOD 5 — Reconciliation &amp; Decision Narrative.</p>' +
    '<div style="background:#e8f8f5;border-left:4px solid #00c9a7;border-radius:4px;padding:16px 20px;margin:24px 0;">' +
    '<p style="margin:0;color:#0d1b2e;font-size:14px;font-weight:700;">What\'s next</p>' +
    '<p style="margin:6px 0 0;color:#495057;font-size:14px;">You\'re ready for the UK pilot in-person training week (Tue–Thu). Bring the references and the 7-part narrative.</p>' +
    '</div>' +
    '<p style="color:#6c757d;font-size:14px;line-height:1.6;">If you have questions about MOD 5 concepts, revisit the facilitator deck in the project SharePoint or reach out to the Demand Planning team.</p>';
  MailApp.sendEmail({ to: toEmail, subject: subject, htmlBody: emailShell_mod5(content) });
}

function sendFailEmail_mod5(toEmail, name, score, total, pct, failedQNums) {
  var subject = 'MOD 5 Knowledge Check — Please review and retry';

  var missedRows = failedQNums.map(function(num) {
    var key        = 'Q' + num;
    var qText      = QUESTION_TEXT_MOD5[key] || '';
    var refs       = SLIDE_REFS_MOD5[key] || '';
    var rationale  = RATIONALES_MOD5[key] || '';
    var slideLabel = refs.indexOf(',') > -1 ? 'Slides' : 'Slide';
    return '<tr style="border-bottom:1px solid #e9ecef;">' +
      '<td style="padding:12px 8px;color:#0d1b2e;font-weight:700;font-size:13px;white-space:nowrap;">Q' + num + '</td>' +
      '<td style="padding:12px 8px;font-size:13px;line-height:1.5;">' +
        '<div style="color:#495057;">' + qText + '</div>' +
        '<div style="color:#6c757d;font-style:italic;margin-top:6px;font-size:12px;">' + rationale + '</div>' +
      '</td>' +
      '<td style="padding:12px 8px;color:#00c9a7;font-size:13px;white-space:nowrap;">' + slideLabel + ' ' + refs + '</td>' +
      '</tr>';
  }).join('');

  var content =
    '<div style="text-align:center;margin-bottom:32px;">' +
    '<div style="display:inline-block;background:#fff3cd;border-radius:50%;width:72px;height:72px;line-height:72px;font-size:36px;">📋</div>' +
    '<h2 style="margin:16px 0 4px;color:#0d1b2e;font-size:24px;">Hi ' + name + '</h2>' +
    '<p style="margin:0;color:#6c757d;font-size:15px;">A little more review needed</p>' +
    '</div>' +
    '<table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f9fa;border-radius:8px;margin-bottom:28px;">' +
    '<tr>' +
    '<td style="padding:20px;text-align:center;border-right:1px solid #e9ecef;">' +
    '<p style="margin:0;font-size:32px;font-weight:700;color:#ffd60a;">' + score + '/' + total + '</p>' +
    '<p style="margin:4px 0 0;font-size:12px;color:#6c757d;text-transform:uppercase;letter-spacing:1px;">Score</p>' +
    '</td>' +
    '<td style="padding:20px;text-align:center;border-right:1px solid #e9ecef;">' +
    '<p style="margin:0;font-size:32px;font-weight:700;color:#ffd60a;">' + Math.round(pct) + '%</p>' +
    '<p style="margin:4px 0 0;font-size:12px;color:#6c757d;text-transform:uppercase;letter-spacing:1px;">Accuracy</p>' +
    '</td>' +
    '<td style="padding:20px;text-align:center;">' +
    '<p style="margin:0;font-size:32px;font-weight:700;color:#dc3545;">RETRY</p>' +
    '<p style="margin:4px 0 0;font-size:12px;color:#6c757d;text-transform:uppercase;letter-spacing:1px;">Status</p>' +
    '</td>' +
    '</tr></table>' +
    '<p style="color:#495057;font-size:15px;line-height:1.6;">No worries — the goal is for everyone to fully land MOD 5 before the in-person training week.</p>' +
    '<h3 style="color:#0d1b2e;font-size:16px;font-weight:700;margin:24px 0 12px;">Questions to Review to Better Your Understanding</h3>' +
    '<table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e9ecef;border-radius:8px;overflow:hidden;margin:20px 0;">' +
    '<tr style="background:#0d1b2e;">' +
    '<th style="padding:10px 8px;color:#00c9a7;font-size:11px;text-transform:uppercase;letter-spacing:1px;text-align:left;">#</th>' +
    '<th style="padding:10px 8px;color:#00c9a7;font-size:11px;text-transform:uppercase;letter-spacing:1px;text-align:left;">Question &amp; Rationale</th>' +
    '<th style="padding:10px 8px;color:#00c9a7;font-size:11px;text-transform:uppercase;letter-spacing:1px;text-align:left;">Review</th>' +
    '</tr>' +
    missedRows +
    '</table>' +
    '<div style="background:#fff3cd;border-left:4px solid #ffd60a;border-radius:4px;padding:16px 20px;margin:24px 0;">' +
    '<p style="margin:0;color:#0d1b2e;font-size:14px;font-weight:700;">Note</p>' +
    '<p style="margin:6px 0 0;color:#495057;font-size:14px;">I\'m deliberately not sharing the correct answers here — go back to the material and find them yourself. That\'s where the learning sticks.</p>' +
    '</div>' +
    '<div style="text-align:center;margin-top:28px;">' +
    '<a href="' + QUIZ_URL_MOD5 + '" style="display:inline-block;background:#ffd60a;color:#0d1b2e;font-weight:700;font-size:15px;padding:14px 32px;border-radius:8px;text-decoration:none;">Retake the Quiz →</a>' +
    '</div>';

  MailApp.sendEmail({ to: toEmail, subject: subject, htmlBody: emailShell_mod5(content) });
}

function sendNotificationEmail_mod5(payload, scoreResult, sheetUrl) {
  var name        = payload.name.trim();
  var email       = payload.email.trim().toLowerCase();
  var role        = payload.role + (payload.roleOther ? ' (' + payload.roleOther + ')' : '');
  var score       = scoreResult.score;
  var total       = TOTAL_QUESTIONS_MOD5;
  var pct         = scoreResult.percent;
  var status      = scoreResult.pass ? 'PASS' : 'FAIL';
  var failedCount = scoreResult.failedQNums.length;
  var failedList  = failedCount > 0
    ? '  (' + scoreResult.failedQNums.map(function(n) { return 'Q' + n; }).join(', ') + ')'
    : '';

  var subject = '[MOD 5 Quiz] ' + name + ' — ' + score + '/' + total + ' — ' + status;
  var body =
    name + ' (' + email + ', ' + role + ') just submitted the MOD 5 Knowledge Check.\n\n' +
    'Score: ' + score + ' / ' + total + ' (' + pct + '%)\n' +
    'Status: ' + status + '\n' +
    'Questions failed: ' + failedCount + ' of ' + total + failedList + '\n\n' +
    'Full row written to the Sheet:\n' + sheetUrl;

  MailApp.sendEmail({ to: RENE_EMAIL, cc: RENE_COPY_EMAIL, subject: subject, body: body });
}

// ══════════════════════════════════════════════════════════════════════════════
// MOD 7 — HERO Data Flow & Cycle Start (additive)
// ══════════════════════════════════════════════════════════════════════════════

const ANSWER_KEY_MOD7 = {
  Q1:'C', Q2:'B', Q3:'D', Q4:'A', Q5:'B',
  Q6:'C', Q7:'D', Q8:'B', Q9:'C', Q10:'A'
};
const TOTAL_QUESTIONS_MOD7 = 10;
const PASS_THRESHOLD_MOD7  = 8;
const QUIZ_URL_MOD7        = 'https://enerbartoli.github.io/mod1-knowledge-check/mod7.html';
// Slide refs use the deck numbering 1–23 from
// DP_MOD7_DataFlow_CycleStart_Facilitator_v1_2026-08-06.pptx
const SLIDE_REFS_MOD7 = {
  Q1:'4, 5',   Q2:'7',      Q3:'6',   Q4:'7',   Q5:'12',
  Q6:'8',      Q7:'10, 13', Q8:'15',  Q9:'16',  Q10:'14, 18'
};

const QUESTION_TEXT_MOD7 = {
  Q1: 'Which forecast array does HERO read from Logility?',
  Q2: 'Which statement describes how HERO treats UA1 across the planning horizon?',
  Q3: 'Demand Planning enters a Level 2.5 Base Trend Adjustment in the Reconciliation template. Where does it land in the Field Forecast?',
  Q4: 'You delete a Base Trend Adjustment in HERO. What actually becomes zero?',
  Q5: 'You have confirmed that a Base Trend Adjustment is stale and needs to go. How do you clear it?',
  Q6: 'A colleague changed UA1 directly in Logility inside the frozen window. What does HERO now know about that change?',
  Q7: 'A line publishes as zero in Logility. What does that tell you about the HERO inputs behind it?',
  Q8: 'Last cycle: baseline 1,000 with an L1 Base Trend Adjustment of −200, giving 800. This cycle the baseline is 900, the −200 is still there, and the preliminary forecast reads 700. The commercial reason for the −200 still applies. What do you do?',
  Q9: 'A material shows baseline 0 this cycle with a Level 2.5 Base Trend Adjustment of −24,258 still authored against it, so the preliminary forecast reads −24,258. You have confirmed with the source owner that the baseline was removed on purpose and the adjustment existed only to offset that old baseline. What do you do?',
  Q10:'You download a fresh template at cycle start and find that baseline and previous-cycle values have moved across many SKUs, several partners and more than one brand, with no business event behind it. What is the correct first action?'
};

const RATIONALES_MOD7 = {
  Q1: 'Only the Resultant, the statistical proposal loaded by Genpact, travels from Logility into HERO. Every other array you see in a template is served from HERO\'s own database. HERO reads the Resultant and never writes it, which is what protects the Genpact proposal from being overwritten.',
  Q2: 'UA1 is the one array with a window restriction. HERO writes it from month +5 onward and suppresses it from its exports inside the rolling months 0 to 4. That is deliberate: it is the only array and the only period where HERO and Logility are meant to differ, which gives the commercial team room for Non-Forecast-Related work without touching the Consensus.',
  Q3: 'What routes the value is the template, not the author. A Level 2.5 Base Trend Adjustment entered in the Reconciliation template lands in UA1 regardless of who entered it. The Marketing and Demand Planning exclusion from the Field Forecast applies only to enrichments captured in the Enrichment Capture template.',
  Q4: 'Removing a change never sends a zero to the array. It zeroes the delta that the change represented, so UA1 and the Consensus simply lose that delta\'s effect. Neither becomes zero. And on UA1 the removal only takes effect while the affected weeks are still outside the frozen window.',
  Q5: 'Enter a numeric zero. Leaving the cell blank is not a reliable instruction to clear an existing adjustment: the adjustment stays in place and you walk away believing you cleared something you did not. For enrichments there is a second valid route, setting the status to DECLINED, but reconciliation adjustments have no status field.',
  Q6: 'Nothing, and nothing will change that on its own. HERO suppresses UA1 in the frozen window so the edit is not overwritten, but HERO does not read UA1 in any window, so no download, upload or refresh will bring it in. It exists in HERO only if someone deliberately makes the equivalent change inside HERO. The only array HERO reads from Logility is the Resultant.',
  Q7: 'Nothing reassuring. Logility floors the published totals on both sides, so a negative raw HERO total can publish as zero. A negative sitting underneath positive components never surfaces downstream, nothing errors and nothing is rejected. Review the total Preliminary Consensus Forecast in HERO instead.',
  Q8: 'Confirm why the source baseline moved, then keep the adjustment and accept 700. Changing the adjustment to force the total back to 800 makes it stop representing its commercial reason and start representing "whatever gets me to last month\'s number". A baseline movement is a prompt to investigate, not evidence of an error.',
  Q9: 'Once the removal is confirmed and the adjustment existed only to offset that baseline, clear it with a numeric zero in a fresh template. Adding a positive adjustment to cancel the negative leaves two adjustments where there should be none and destroys the traceability. If the baseline should still have been there, the case goes to the squad instead.',
  Q10:'Stop, capture examples and escalate with the evidence. One odd row is a question you can work through; the same unexpected pattern across many items, partners or brands is a systemic signal. Broad compensating adjustments during an open investigation restore the number you expected and make it impossible to tell later which changes were genuine decisions.'
};

function handleMod7Post(payload) {
  try {
    var validationError = validatePayload_mod7(payload);
    if (validationError) return buildResponse({ error: validationError }, 400);

    var scoreResult = scoreSubmission_mod7(payload.answers);
    var sheetUrl    = appendToSheet_mod7(payload, scoreResult);
    sendEmails_mod7(payload, scoreResult, sheetUrl);

    return buildResponse({
      score:            scoreResult.score,
      total:            TOTAL_QUESTIONS_MOD7,
      percent:          scoreResult.percent,
      pass:             scoreResult.pass,
      failed_questions: scoreResult.failedQNums
    });
  } catch (err) {
    Logger.log('handleMod7Post error: ' + err.message + '\n' + err.stack);
    return buildResponse({ error: 'Server error. Please try again.' }, 500);
  }
}

function validatePayload_mod7(p) {
  if (!p.name || String(p.name).trim().length < 2) return 'Name is required.';
  var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!p.email || !emailRe.test(String(p.email).trim())) return 'Valid email is required.';
  if (!p.role) return 'Role is required.';
  if (!p.answers || typeof p.answers !== 'object') return 'Answers are required.';
  for (var i = 1; i <= TOTAL_QUESTIONS_MOD7; i++) {
    var key = 'Q' + i;
    var val = p.answers[key];
    if (!val || !['A','B','C','D'].includes(String(val).toUpperCase())) {
      return 'Answer for ' + key + ' is missing or invalid.';
    }
  }
  return null;
}

function scoreSubmission_mod7(answers) {
  var score = 0;
  var results = {};
  var failedQNums = [];
  for (var i = 1; i <= TOTAL_QUESTIONS_MOD7; i++) {
    var key     = 'Q' + i;
    var given   = String(answers[key] || '').toUpperCase();
    var correct = ANSWER_KEY_MOD7[key];
    var isCorrect = given === correct;
    results[key] = { given: given, correct: isCorrect };
    if (isCorrect) { score++; } else { failedQNums.push(i); }
  }
  var percent = Math.round((score / TOTAL_QUESTIONS_MOD7) * 10000) / 100;
  return { score: score, percent: percent, pass: score >= PASS_THRESHOLD_MOD7, results: results, failedQNums: failedQNums };
}

function appendToSheet_mod7(payload, scoreResult) {
  var ss    = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) { sheet = ss.insertSheet(SHEET_NAME); writeHeaders(sheet); }
  if (sheet.getLastRow() === 0) writeHeaders(sheet);

  var moduleId      = 'mod7';
  var attemptNumber = computeAttemptNumber(String(payload.email).trim().toLowerCase(), moduleId, sheet);

  var now = new Date();
  var row = [
    now, payload.name.trim(), payload.email.trim().toLowerCase(), payload.role,
    payload.roleOther || '', scoreResult.score, scoreResult.percent,
    scoreResult.pass ? 'Pass' : 'Fail'
  ];

  // Q1–Q10 answer + correct pairs
  for (var i = 1; i <= TOTAL_QUESTIONS_MOD7; i++) {
    var key = 'Q' + i;
    var r   = scoreResult.results[key];
    row.push(r.given);
    row.push(r.correct);
  }
  // Q11–Q16 placeholders blank — preserves column alignment (6 blank pairs)
  for (var j = 0; j < 6; j++) {
    row.push('');
    row.push('');
  }

  row.push(scoreResult.failedQNums.join(', '));
  row.push(true);
  row.push((payload.userAgent || '').slice(0, 200));
  row.push(moduleId);
  row.push(attemptNumber);

  sheet.appendRow(row);
  return ss.getUrl();
}

function sendEmails_mod7(payload, scoreResult, sheetUrl) {
  var name  = payload.name.trim();
  var email = payload.email.trim().toLowerCase();
  try {
    if (scoreResult.pass) {
      sendPassEmail_mod7(email, name, scoreResult.score, TOTAL_QUESTIONS_MOD7, scoreResult.percent);
    } else {
      sendFailEmail_mod7(email, name, scoreResult.score, TOTAL_QUESTIONS_MOD7, scoreResult.percent, scoreResult.failedQNums);
    }
    sendNotificationEmail_mod7(payload, scoreResult, sheetUrl);
    return true;
  } catch (err) {
    Logger.log('MOD 7 email error: ' + err.message);
    return false;
  }
}

function emailShell_mod7(contentHtml) {
  return '<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body style="margin:0;padding:0;background:#f0f4f8;font-family:Arial,sans-serif;">' +
    '<table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f4f8;padding:32px 0;">' +
    '<tr><td align="center">' +
    '<table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">' +
    '<tr><td style="background:#0d1b2e;padding:28px 40px;text-align:center;">' +
    '<p style="margin:0;color:#00c9a7;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">Forecast Enrichment Programme · HERO Deployment</p>' +
    '<p style="margin:8px 0 0;color:#ffffff;font-size:20px;font-weight:700;">MOD 7 Knowledge Check</p>' +
    '</td></tr>' +
    '<tr><td style="padding:40px;">' + contentHtml + '</td></tr>' +
    '<tr><td style="background:#f8f9fa;padding:20px 40px;border-top:1px solid #e9ecef;text-align:center;">' +
    '<p style="margin:0;color:#6c757d;font-size:12px;">Rene Bartoli · Demand Planning · Forecast Enrichment Program</p>' +
    '</td></tr>' +
    '</table></td></tr></table></body></html>';
}

function sendPassEmail_mod7(toEmail, name, score, total, pct) {
  var subject = '✓ MOD 7 Knowledge Check — Passed';
  var content =
    '<div style="text-align:center;margin-bottom:32px;">' +
    '<div style="display:inline-block;background:#d4edda;border-radius:50%;width:72px;height:72px;line-height:72px;font-size:36px;">✓</div>' +
    '<h2 style="margin:16px 0 4px;color:#0d1b2e;font-size:24px;">Well done, ' + name + '!</h2>' +
    '<p style="margin:0;color:#6c757d;font-size:15px;">You\'ve passed the MOD 7 knowledge check</p>' +
    '</div>' +
    '<table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f9fa;border-radius:8px;margin-bottom:28px;">' +
    '<tr>' +
    '<td style="padding:20px;text-align:center;border-right:1px solid #e9ecef;">' +
    '<p style="margin:0;font-size:32px;font-weight:700;color:#00c9a7;">' + score + '/' + total + '</p>' +
    '<p style="margin:4px 0 0;font-size:12px;color:#6c757d;text-transform:uppercase;letter-spacing:1px;">Score</p>' +
    '</td>' +
    '<td style="padding:20px;text-align:center;border-right:1px solid #e9ecef;">' +
    '<p style="margin:0;font-size:32px;font-weight:700;color:#00c9a7;">' + Math.round(pct) + '%</p>' +
    '<p style="margin:4px 0 0;font-size:12px;color:#6c757d;text-transform:uppercase;letter-spacing:1px;">Accuracy</p>' +
    '</td>' +
    '<td style="padding:20px;text-align:center;">' +
    '<p style="margin:0;font-size:32px;font-weight:700;color:#00c9a7;">PASS</p>' +
    '<p style="margin:4px 0 0;font-size:12px;color:#6c757d;text-transform:uppercase;letter-spacing:1px;">Status</p>' +
    '</td>' +
    '</tr></table>' +
    '<p style="color:#495057;font-size:15px;line-height:1.6;">You\'ve met the <strong>80% threshold</strong> for MOD 7 — HERO Data Flow &amp; Cycle Start.</p>' +
    '<div style="background:#e8f8f5;border-left:4px solid #00c9a7;border-radius:4px;padding:16px 20px;margin:24px 0;">' +
    '<p style="margin:0;color:#0d1b2e;font-size:14px;font-weight:700;">What\'s next</p>' +
    '<p style="margin:6px 0 0;color:#495057;font-size:14px;">Run the five-minute cycle-start check on your own scope this week, then run it live in your team\'s first meeting of the next cycle. You are the person your team will ask.</p>' +
    '</div>' +
    '<p style="color:#6c757d;font-size:14px;line-height:1.6;">If you have questions about MOD 7 concepts, revisit the facilitator deck in the project SharePoint or reach out to the Demand Planning team.</p>';
  MailApp.sendEmail({ to: toEmail, subject: subject, htmlBody: emailShell_mod7(content) });
}

function sendFailEmail_mod7(toEmail, name, score, total, pct, failedQNums) {
  var subject = 'MOD 7 Knowledge Check — Please review and retry';

  var missedRows = failedQNums.map(function(num) {
    var key        = 'Q' + num;
    var qText      = QUESTION_TEXT_MOD7[key] || '';
    var refs       = SLIDE_REFS_MOD7[key] || '';
    var rationale  = RATIONALES_MOD7[key] || '';
    var slideLabel = refs.indexOf(',') > -1 ? 'Slides' : 'Slide';
    return '<tr style="border-bottom:1px solid #e9ecef;">' +
      '<td style="padding:12px 8px;color:#0d1b2e;font-weight:700;font-size:13px;white-space:nowrap;">Q' + num + '</td>' +
      '<td style="padding:12px 8px;font-size:13px;line-height:1.5;">' +
        '<div style="color:#495057;">' + qText + '</div>' +
        '<div style="color:#6c757d;font-style:italic;margin-top:6px;font-size:12px;">' + rationale + '</div>' +
      '</td>' +
      '<td style="padding:12px 8px;color:#00c9a7;font-size:13px;white-space:nowrap;">' + slideLabel + ' ' + refs + '</td>' +
      '</tr>';
  }).join('');

  var content =
    '<div style="text-align:center;margin-bottom:32px;">' +
    '<div style="display:inline-block;background:#fff3cd;border-radius:50%;width:72px;height:72px;line-height:72px;font-size:36px;">📋</div>' +
    '<h2 style="margin:16px 0 4px;color:#0d1b2e;font-size:24px;">Hi ' + name + '</h2>' +
    '<p style="margin:0;color:#6c757d;font-size:15px;">A little more review needed</p>' +
    '</div>' +
    '<table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f9fa;border-radius:8px;margin-bottom:28px;">' +
    '<tr>' +
    '<td style="padding:20px;text-align:center;border-right:1px solid #e9ecef;">' +
    '<p style="margin:0;font-size:32px;font-weight:700;color:#ffd60a;">' + score + '/' + total + '</p>' +
    '<p style="margin:4px 0 0;font-size:12px;color:#6c757d;text-transform:uppercase;letter-spacing:1px;">Score</p>' +
    '</td>' +
    '<td style="padding:20px;text-align:center;border-right:1px solid #e9ecef;">' +
    '<p style="margin:0;font-size:32px;font-weight:700;color:#ffd60a;">' + Math.round(pct) + '%</p>' +
    '<p style="margin:4px 0 0;font-size:12px;color:#6c757d;text-transform:uppercase;letter-spacing:1px;">Accuracy</p>' +
    '</td>' +
    '<td style="padding:20px;text-align:center;">' +
    '<p style="margin:0;font-size:32px;font-weight:700;color:#dc3545;">RETRY</p>' +
    '<p style="margin:4px 0 0;font-size:12px;color:#6c757d;text-transform:uppercase;letter-spacing:1px;">Status</p>' +
    '</td>' +
    '</tr></table>' +
    '<p style="color:#495057;font-size:15px;line-height:1.6;">No worries — the goal is for everyone to fully land MOD 7 before running it live at cycle start.</p>' +
    '<h3 style="color:#0d1b2e;font-size:16px;font-weight:700;margin:24px 0 12px;">Questions to Review to Better Your Understanding</h3>' +
    '<table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e9ecef;border-radius:8px;overflow:hidden;margin:20px 0;">' +
    '<tr style="background:#0d1b2e;">' +
    '<th style="padding:10px 8px;color:#00c9a7;font-size:11px;text-transform:uppercase;letter-spacing:1px;text-align:left;">#</th>' +
    '<th style="padding:10px 8px;color:#00c9a7;font-size:11px;text-transform:uppercase;letter-spacing:1px;text-align:left;">Question &amp; Rationale</th>' +
    '<th style="padding:10px 8px;color:#00c9a7;font-size:11px;text-transform:uppercase;letter-spacing:1px;text-align:left;">Review</th>' +
    '</tr>' +
    missedRows +
    '</table>' +
    '<div style="background:#fff3cd;border-left:4px solid #ffd60a;border-radius:4px;padding:16px 20px;margin:24px 0;">' +
    '<p style="margin:0;color:#0d1b2e;font-size:14px;font-weight:700;">Note</p>' +
    '<p style="margin:6px 0 0;color:#495057;font-size:14px;">I\'m deliberately not sharing the correct answers here — go back to the material and find them yourself. That\'s where the learning sticks.</p>' +
    '</div>' +
    '<div style="text-align:center;margin-top:28px;">' +
    '<a href="' + QUIZ_URL_MOD7 + '" style="display:inline-block;background:#ffd60a;color:#0d1b2e;font-weight:700;font-size:15px;padding:14px 32px;border-radius:8px;text-decoration:none;">Retake the Quiz →</a>' +
    '</div>';

  MailApp.sendEmail({ to: toEmail, subject: subject, htmlBody: emailShell_mod7(content) });
}

function sendNotificationEmail_mod7(payload, scoreResult, sheetUrl) {
  var name        = payload.name.trim();
  var email       = payload.email.trim().toLowerCase();
  var role        = payload.role + (payload.roleOther ? ' (' + payload.roleOther + ')' : '');
  var score       = scoreResult.score;
  var total       = TOTAL_QUESTIONS_MOD7;
  var pct         = scoreResult.percent;
  var status      = scoreResult.pass ? 'PASS' : 'FAIL';
  var failedCount = scoreResult.failedQNums.length;
  var failedList  = failedCount > 0
    ? '  (' + scoreResult.failedQNums.map(function(n) { return 'Q' + n; }).join(', ') + ')'
    : '';

  var subject = '[MOD 7 Quiz] ' + name + ' — ' + score + '/' + total + ' — ' + status;
  var body =
    name + ' (' + email + ', ' + role + ') just submitted the MOD 7 Knowledge Check.\n\n' +
    'Score: ' + score + ' / ' + total + ' (' + pct + '%)\n' +
    'Status: ' + status + '\n' +
    'Questions failed: ' + failedCount + ' of ' + total + failedList + '\n\n' +
    'Full row written to the Sheet:\n' + sheetUrl;

  MailApp.sendEmail({ to: RENE_EMAIL, cc: RENE_COPY_EMAIL, subject: subject, body: body });
}

// ══════════════════════════════════════════════════════════════════════════════
// MOD 3 — HERO in Practice: which surface, and why (additive)
// ══════════════════════════════════════════════════════════════════════════════

const ANSWER_KEY_MOD3 = {
  Q1:'A', Q2:'C', Q3:'B', Q4:'D', Q5:'C',
  Q6:'A', Q7:'D', Q8:'B', Q9:'C', Q10:'A'
};
const TOTAL_QUESTIONS_MOD3 = 10;
const PASS_THRESHOLD_MOD3  = 8;
const QUIZ_URL_MOD3        = 'https://enerbartoli.github.io/mod1-knowledge-check/mod3.html';

// MOD 3 references named manual sections, not slide numbers (live practice module).
const MANUAL_REFS_MOD3 = {
  Q1: 'HERO Manual, Enrichment Capture Template (ECT), callout "Enrichments vs reconciliation"; Forecast Reconciliation Template (FRT), "When to use it"',
  Q2: 'HERO Manual, "Validation & error catalogue", error catalogue table; "Field-by-field reference", enrichment template fields',
  Q3: 'Build Learnings KB, section 13, "Mechanics - applies at every level"; HERO Manual, "Reference views & dashboards"',
  Q4: 'Canonical Facts One-Pager, "Calendar, timing and access"; HERO Manual, "Reference views & dashboards", callout "Timing"; "End-to-end user workflow"',
  Q5: 'HERO Manual, Enrichment Capture Template (ECT), table "Supported enrichment types"; Canonical Facts One-Pager, fact 25',
  Q6: 'Canonical Facts One-Pager, fact 38; Cycle Start Review Guide, "Fresh Templates and Shared Work"',
  Q7: 'HERO Manual, Enrichment Capture Template (ECT), "Cancelling or removing an enrichment"; Canonical Facts One-Pager, fact 33',
  Q8: 'HERO Manual, "Timing & system sync", "The fan-out (how Level 2.5 changes reach Level 1)"; Build Learnings KB, section 13',
  Q9: 'HERO Manual, "Timing & system sync", "Publication to Logility"',
  Q10: 'Cycle Start Review Guide, "The Five-Minute Cycle-Start Check"; Canonical Facts One-Pager, fact 36',
};

const QUESTION_TEXT_MOD3 = {
  Q1: 'You have two workbooks available: the Enrichment Capture Template (ECT) and the Forecast Reconciliation Template (FRT). Which rule of thumb tells you which one to use?',
  Q2: 'You are entering a retail promotion in the Enrichment Capture Template. How do you populate the Expected Shipment Lift?',
  Q3: 'A Key Account Manager wants to compare this cycle against the last three, look for patterns across brands, and then make a change. Where does each part of that belong?',
  Q4: 'You upload a valid workbook, then open the Power BI dashboard and the numbers do not match what you just entered. What is the most likely explanation?',
  Q5: 'A brand team confirms a customer pre-order and a pallet adjustment (TMO), and separately asks you to lift a brand\'s weekly number by a set amount with no event behind it. Where does each one go?',
  Q6: 'You downloaded an all-brands workbook this morning and kept it open while you worked. A colleague has been uploading changes for one of those brands during the same period. You now upload yours. What happens?',
  Q7: 'You need to remove two things: an enrichment that is no longer happening, and a Base Trend Adjustment that has gone stale. How do you clear each?',
  Q8: 'You upload a Level 2.5 adjustment. Twenty minutes later it is still not visible at Level 1 or in the dashboard. What do you do?',
  Q9: 'You uploaded an approved change on a Tuesday. When does it reach Logility?',
  Q10: 'It is the first day of a new planning cycle. What is the correct way to start?',
};

const RATIONALES_MOD3 = {
  Q1: 'The pocket rule is enrichments for dated business events, reconciliation when the ask is effectively "change the final number for these weeks". The level you work at is a separate choice: both templates exist at more than one level, and both accept positive and negative values.',
  Q2: 'Validation rejects the row if both lift fields are populated or if neither is. Enter one lift mode per row. A retail promotion also requires the Retail Promotion Mechanism field: each enrichment type carries its own extra required field on top of the common ones.',
  Q3: 'The reconciliation template was deliberately built as an execution interface, not an analysis tool. Analysis lives in the dashboard. This is an anti-scope-creep principle taken from a prior tool that collapsed under its own weight within a week of launch. The dashboard is a read surface: nothing is written back from it, and changes only enter HERO through a template upload.',
  Q4: 'A reported mismatch between the dashboard and a fresh template of the same scope is almost always a timing mismatch, not a data mismatch. The workbook shows authored intent immediately; the dashboard matches only after the backend processing run and the refresh, which currently runs every 90 minutes. Rejected uploads are never partially saved: HERO returns an annotated workbook instead.',
  Q5: 'Pre-orders and TMO are supported enrichment types tied to dated events, so both are captured in the Enrichment Capture Template. A request to move the final weekly number with no event behind it is a reconciliation ask and is entered as a Base Trend Adjustment. Worth remembering: TMO is the one enrichment type that never sums into the consensus the way the others do, it stays an independent adjustment.',
  Q6: 'Templates are scope-locked at download time, and HERO validates an upload against the latest backend state. In an overlapping scope, a later upload can replace work uploaded earlier by someone else. The habits that prevent this: download fresh, use the narrowest practical brand and forecast-partner selection, and agree ownership before two people edit the same partner, SKU and week scope.',
  Q7: 'Since the 20 July 2026 release, DECLINED is the recommended way to cancel an enrichment: the row stays visible in the template and the audit trail but is excluded from calculated downstream outputs. Reconciliation and Base Trend Adjustments have no status field, so they are cleared with a numeric zero. Blank is not zero, and rows are never deleted.',
  Q8: 'Level 1 reads and writes are immediate. A Level 2.5 change needs the fan-out job to distribute it down to the partner rows and refresh the Level 1 view that feeds the dashboard. The fan-out runs on a fixed schedule, several times a day on UK weekdays. If you saw the green upload confirmation your data is captured and safe; re-uploading or duplicating the entry at Level 1 creates work that then has to be undone.',
  Q9: 'Uploading a workbook does not push Logility. HERO publishes through the weekly Friday noon Eastern export pipeline, and anything authored during the week is held in HERO until that pipeline runs. The fan-out is an internal job that moves Level 2.5 changes down to Level 1; it publishes nothing externally.',
  Q10: 'The cycle-start check begins by waiting for the cycle refresh to finish, then downloading a fresh template at the narrowest practical brand and forecast-partner selection, then reviewing the total Preliminary Consensus Forecast before touching anything. Never reuse a prior-cycle workbook, and never try to make changes in the dashboard: it is a read surface and nothing is written back from it.',
};

function handleMod3Post(payload) {
  try {
    var validationError = validatePayload_mod3(payload);
    if (validationError) return buildResponse({ error: validationError }, 400);

    var scoreResult = scoreSubmission_mod3(payload.answers);
    var sheetUrl    = appendToSheet_mod3(payload, scoreResult);
    sendEmails_mod3(payload, scoreResult, sheetUrl);

    return buildResponse({
      score:            scoreResult.score,
      total:            TOTAL_QUESTIONS_MOD3,
      percent:          scoreResult.percent,
      pass:             scoreResult.pass,
      failed_questions: scoreResult.failedQNums
    });
  } catch (err) {
    Logger.log('handleMod3Post error: ' + err.message + '\n' + err.stack);
    return buildResponse({ error: 'Server error. Please try again.' }, 500);
  }
}

function validatePayload_mod3(p) {
  if (!p.name || String(p.name).trim().length < 2) return 'Name is required.';
  var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!p.email || !emailRe.test(String(p.email).trim())) return 'Valid email is required.';
  if (!p.role) return 'Role is required.';
  if (!p.answers || typeof p.answers !== 'object') return 'Answers are required.';
  for (var i = 1; i <= TOTAL_QUESTIONS_MOD3; i++) {
    var key = 'Q' + i;
    var val = p.answers[key];
    if (!val || !['A','B','C','D'].includes(String(val).toUpperCase())) {
      return 'Answer for ' + key + ' is missing or invalid.';
    }
  }
  return null;
}

function scoreSubmission_mod3(answers) {
  var score = 0;
  var results = {};
  var failedQNums = [];
  for (var i = 1; i <= TOTAL_QUESTIONS_MOD3; i++) {
    var key     = 'Q' + i;
    var given   = String(answers[key] || '').toUpperCase();
    var correct = ANSWER_KEY_MOD3[key];
    var isCorrect = given === correct;
    results[key] = { given: given, correct: isCorrect };
    if (isCorrect) { score++; } else { failedQNums.push(i); }
  }
  var percent = Math.round((score / TOTAL_QUESTIONS_MOD3) * 10000) / 100;
  return { score: score, percent: percent, pass: score >= PASS_THRESHOLD_MOD3, results: results, failedQNums: failedQNums };
}

function appendToSheet_mod3(payload, scoreResult) {
  var ss    = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) { sheet = ss.insertSheet(SHEET_NAME); writeHeaders(sheet); }
  if (sheet.getLastRow() === 0) writeHeaders(sheet);

  var moduleId      = 'mod3';
  var attemptNumber = computeAttemptNumber(String(payload.email).trim().toLowerCase(), moduleId, sheet);

  var now = new Date();
  var row = [
    now, payload.name.trim(), payload.email.trim().toLowerCase(), payload.role,
    payload.roleOther || '', scoreResult.score, scoreResult.percent,
    scoreResult.pass ? 'Pass' : 'Fail'
  ];

  // Q1–Q10 answer + correct pairs
  for (var i = 1; i <= TOTAL_QUESTIONS_MOD3; i++) {
    var key = 'Q' + i;
    var r   = scoreResult.results[key];
    row.push(r.given);
    row.push(r.correct);
  }
  // Q11–Q16 placeholders blank — preserves column alignment (6 blank pairs)
  for (var j = 0; j < 6; j++) {
    row.push('');
    row.push('');
  }

  row.push(scoreResult.failedQNums.join(', '));
  row.push(true);
  row.push((payload.userAgent || '').slice(0, 200));
  row.push(moduleId);
  row.push(attemptNumber);

  sheet.appendRow(row);
  return ss.getUrl();
}

function sendEmails_mod3(payload, scoreResult, sheetUrl) {
  var name  = payload.name.trim();
  var email = payload.email.trim().toLowerCase();
  try {
    if (scoreResult.pass) {
      sendPassEmail_mod3(email, name, scoreResult.score, TOTAL_QUESTIONS_MOD3, scoreResult.percent);
    } else {
      sendFailEmail_mod3(email, name, scoreResult.score, TOTAL_QUESTIONS_MOD3, scoreResult.percent, scoreResult.failedQNums);
    }
    sendNotificationEmail_mod3(payload, scoreResult, sheetUrl);
    return true;
  } catch (err) {
    Logger.log('MOD 3 email error: ' + err.message);
    return false;
  }
}

function emailShell_mod3(contentHtml) {
  return '<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body style="margin:0;padding:0;background:#f0f4f8;font-family:Arial,sans-serif;">' +
    '<table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f4f8;padding:32px 0;">' +
    '<tr><td align="center">' +
    '<table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">' +
    '<tr><td style="background:#0d1b2e;padding:28px 40px;text-align:center;">' +
    '<p style="margin:0;color:#00c9a7;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">Forecast Enrichment Programme · HERO Deployment</p>' +
    '<p style="margin:8px 0 0;color:#ffffff;font-size:20px;font-weight:700;">MOD 3 Knowledge Check</p>' +
    '</td></tr>' +
    '<tr><td style="padding:40px;">' + contentHtml + '</td></tr>' +
    '<tr><td style="background:#f8f9fa;padding:20px 40px;border-top:1px solid #e9ecef;text-align:center;">' +
    '<p style="margin:0;color:#6c757d;font-size:12px;">Rene Bartoli · Demand Planning · Forecast Enrichment Program</p>' +
    '</td></tr>' +
    '</table></td></tr></table></body></html>';
}

function sendPassEmail_mod3(toEmail, name, score, total, pct) {
  var subject = '✓ MOD 3 Knowledge Check — Passed';
  var content =
    '<div style="text-align:center;margin-bottom:32px;">' +
    '<div style="display:inline-block;background:#d4edda;border-radius:50%;width:72px;height:72px;line-height:72px;font-size:36px;">✓</div>' +
    '<h2 style="margin:16px 0 4px;color:#0d1b2e;font-size:24px;">Well done, ' + name + '!</h2>' +
    '<p style="margin:0;color:#6c757d;font-size:15px;">You\'ve passed the MOD 3 knowledge check</p>' +
    '</div>' +
    '<table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f9fa;border-radius:8px;margin-bottom:28px;">' +
    '<tr>' +
    '<td style="padding:20px;text-align:center;border-right:1px solid #e9ecef;">' +
    '<p style="margin:0;font-size:32px;font-weight:700;color:#00c9a7;">' + score + '/' + total + '</p>' +
    '<p style="margin:4px 0 0;font-size:12px;color:#6c757d;text-transform:uppercase;letter-spacing:1px;">Score</p>' +
    '</td>' +
    '<td style="padding:20px;text-align:center;border-right:1px solid #e9ecef;">' +
    '<p style="margin:0;font-size:32px;font-weight:700;color:#00c9a7;">' + Math.round(pct) + '%</p>' +
    '<p style="margin:4px 0 0;font-size:12px;color:#6c757d;text-transform:uppercase;letter-spacing:1px;">Accuracy</p>' +
    '</td>' +
    '<td style="padding:20px;text-align:center;">' +
    '<p style="margin:0;font-size:32px;font-weight:700;color:#00c9a7;">PASS</p>' +
    '<p style="margin:4px 0 0;font-size:12px;color:#6c757d;text-transform:uppercase;letter-spacing:1px;">Status</p>' +
    '</td>' +
    '</tr></table>' +
    '<p style="color:#495057;font-size:15px;line-height:1.6;">You\'ve met the <strong>80% threshold</strong> for MOD 3 — HERO in Practice.</p>' +
    '<div style="background:#e8f8f5;border-left:4px solid #00c9a7;border-radius:4px;padding:16px 20px;margin:24px 0;">' +
    '<p style="margin:0;color:#0d1b2e;font-size:14px;font-weight:700;">What\'s next</p>' +
    '<p style="margin:6px 0 0;color:#495057;font-size:14px;">You have the surface calls down — which template, when the dashboard reads versus when a template writes, and what HERO does after you upload. Put it to work in your next live cycle.</p>' +
    '</div>' +
    '<p style="color:#6c757d;font-size:14px;line-height:1.6;">If you have questions about MOD 3 topics, check the HERO Manual and the Canonical Facts One-Pager in the project SharePoint or reach out to the Demand Planning team.</p>';
  MailApp.sendEmail({ to: toEmail, subject: subject, htmlBody: emailShell_mod3(content) });
}

function sendFailEmail_mod3(toEmail, name, score, total, pct, failedQNums) {
  var subject = 'MOD 3 Knowledge Check — Please review and retry';

  var missedRows = failedQNums.map(function(num) {
    var key   = 'Q' + num;
    var qText = QUESTION_TEXT_MOD3[key] || '';
    var ref   = MANUAL_REFS_MOD3[key] || '';
    var rationale = RATIONALES_MOD3[key] || '';
    return '<tr style="border-bottom:1px solid #e9ecef;">' +
      '<td style="padding:12px 8px;color:#0d1b2e;font-weight:700;font-size:13px;white-space:nowrap;vertical-align:top;">Q' + num + '</td>' +
      '<td style="padding:12px 8px;font-size:13px;line-height:1.5;vertical-align:top;">' +
        '<div style="color:#495057;">' + qText + '</div>' +
        '<div style="color:#6c757d;font-style:italic;margin-top:6px;font-size:12px;">' + rationale + '</div>' +
      '</td>' +
      '<td style="padding:12px 8px;color:#00c9a7;font-size:12px;line-height:1.5;vertical-align:top;">' + ref + '</td>' +
      '</tr>';
  }).join('');

  var content =
    '<div style="text-align:center;margin-bottom:32px;">' +
    '<div style="display:inline-block;background:#fff3cd;border-radius:50%;width:72px;height:72px;line-height:72px;font-size:36px;">\U0001F4CB</div>' +
    '<h2 style="margin:16px 0 4px;color:#0d1b2e;font-size:24px;">Hi ' + name + '</h2>' +
    '<p style="margin:0;color:#6c757d;font-size:15px;">A little more review needed</p>' +
    '</div>' +
    '<table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f9fa;border-radius:8px;margin-bottom:28px;">' +
    '<tr>' +
    '<td style="padding:20px;text-align:center;border-right:1px solid #e9ecef;">' +
    '<p style="margin:0;font-size:32px;font-weight:700;color:#ffd60a;">' + score + '/' + total + '</p>' +
    '<p style="margin:4px 0 0;font-size:12px;color:#6c757d;text-transform:uppercase;letter-spacing:1px;">Score</p>' +
    '</td>' +
    '<td style="padding:20px;text-align:center;border-right:1px solid #e9ecef;">' +
    '<p style="margin:0;font-size:32px;font-weight:700;color:#ffd60a;">' + Math.round(pct) + '%</p>' +
    '<p style="margin:4px 0 0;font-size:12px;color:#6c757d;text-transform:uppercase;letter-spacing:1px;">Accuracy</p>' +
    '</td>' +
    '<td style="padding:20px;text-align:center;">' +
    '<p style="margin:0;font-size:32px;font-weight:700;color:#dc3545;">RETRY</p>' +
    '<p style="margin:4px 0 0;font-size:12px;color:#6c757d;text-transform:uppercase;letter-spacing:1px;">Status</p>' +
    '</td>' +
    '</tr></table>' +
    '<p style="color:#495057;font-size:15px;line-height:1.6;">No worries — this one is about surface choices, and they click quickly with a little review.</p>' +
    '<h3 style="color:#0d1b2e;font-size:16px;font-weight:700;margin:24px 0 12px;">Questions to Review to Better Your Understanding</h3>' +
    '<table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e9ecef;border-radius:8px;overflow:hidden;margin:20px 0;table-layout:fixed;">' +
    '<tr style="background:#0d1b2e;">' +
    '<th style="padding:10px 8px;color:#00c9a7;font-size:11px;text-transform:uppercase;letter-spacing:1px;text-align:left;width:36px;">#</th>' +
    '<th style="padding:10px 8px;color:#00c9a7;font-size:11px;text-transform:uppercase;letter-spacing:1px;text-align:left;">Question &amp; Rationale</th>' +
    '<th style="padding:10px 8px;color:#00c9a7;font-size:11px;text-transform:uppercase;letter-spacing:1px;text-align:left;">Where to look</th>' +
    '</tr>' +
    missedRows +
    '</table>' +
    '<div style="background:#fff3cd;border-left:4px solid #ffd60a;border-radius:4px;padding:16px 20px;margin:24px 0;">' +
    '<p style="margin:0;color:#0d1b2e;font-size:14px;font-weight:700;">Note</p>' +
    '<p style="margin:6px 0 0;color:#495057;font-size:14px;">I\'m deliberately not sharing the correct answers here — go back to the material and find them yourself. That\'s where the learning sticks.</p>' +
    '</div>' +
    '<div style="text-align:center;margin-top:28px;">' +
    '<a href="' + QUIZ_URL_MOD3 + '" style="display:inline-block;background:#ffd60a;color:#0d1b2e;font-weight:700;font-size:15px;padding:14px 32px;border-radius:8px;text-decoration:none;">Retake the Quiz →</a>' +
    '</div>';

  MailApp.sendEmail({ to: toEmail, subject: subject, htmlBody: emailShell_mod3(content) });
}

function sendNotificationEmail_mod3(payload, scoreResult, sheetUrl) {
  var name        = payload.name.trim();
  var email       = payload.email.trim().toLowerCase();
  var role        = payload.role + (payload.roleOther ? ' (' + payload.roleOther + ')' : '');
  var score       = scoreResult.score;
  var total       = TOTAL_QUESTIONS_MOD3;
  var pct         = scoreResult.percent;
  var status      = scoreResult.pass ? 'PASS' : 'FAIL';
  var failedCount = scoreResult.failedQNums.length;
  var failedList  = failedCount > 0
    ? '  (' + scoreResult.failedQNums.map(function(n) { return 'Q' + n; }).join(', ') + ')'
    : '';

  var subject = '[MOD 3 Quiz] ' + name + ' — ' + score + '/' + total + ' — ' + status;
  var body =
    name + ' (' + email + ', ' + role + ') just submitted the MOD 3 Knowledge Check.\n\n' +
    'Score: ' + score + ' / ' + total + ' (' + pct + '%)\n' +
    'Status: ' + status + '\n' +
    'Questions failed: ' + failedCount + ' of ' + total + failedList + '\n\n' +
    'Full row written to the Sheet:\n' + sheetUrl;

  MailApp.sendEmail({ to: RENE_EMAIL, cc: RENE_COPY_EMAIL, subject: subject, body: body });
}


// ══════════════════════════════════════════════════════════════════════════════
// REMINDER EMAILS — Dashboard "Pending Users" feature
// ══════════════════════════════════════════════════════════════════════════════

function handleSendReminders(e) {
  try {
    var dataStr = e && e.parameter && e.parameter.data ? e.parameter.data : '{}';
    var payload;
    try { payload = JSON.parse(dataStr); } catch(err) { return buildResponse({ error: 'Invalid JSON in data param.' }, 400); }

    var recipients = payload.recipients || [];
    if (!recipients.length) return buildResponse({ error: 'No recipients provided.' }, 400);

    var sent = [];
    var failed = [];
    recipients.forEach(function(r) {
      try {
        sendReminderEmailToUser(r.name, r.email, r.modules, r.type || 'never');
        sent.push(r);
      } catch(err) {
        failed.push({ email: r.email, error: err.message });
      }
    });

    sendReminderSummaryToRene(sent, failed);
    return buildResponse({ ok: true, sent: sent.length, failed: failed.length });
  } catch(err) {
    return buildResponse({ error: err.message }, 500);
  }
}

var MODULE_LABELS = {
  mod1: 'MOD 1 — Forecast Enrichment Foundations',
  mod2: 'MOD 2 — Enrichment Practice',
  mod4: 'MOD 4 — Exceptions & Customer Variations',
  mod5: 'MOD 5 — Reconciliation & Decision Narrative'
};

var MODULE_URLS = {
  mod1: 'https://enerbartoli.github.io/mod1-knowledge-check/',
  mod2: 'https://enerbartoli.github.io/mod1-knowledge-check/mod2.html',
  mod4: 'https://enerbartoli.github.io/mod1-knowledge-check/mod4.html',
  mod5: 'https://enerbartoli.github.io/mod1-knowledge-check/mod5.html'
};

function sendReminderEmailToUser(name, email, modules, type) {
  var firstName = name.split(' ')[0];
  var MATERIAL_URL = 'https://hasbroinc-my.sharepoint.com/:f:/g/personal/bartolr_na_hasbro_com/IgDTVoUhXY2yRrvpzKMu9DOlAYapr_YaxJ5FFKt3bQ4PkP0?e=4zLYnp';

  var moduleRows = modules.map(function(m) {
    var label = MODULE_LABELS[m] || m;
    var url   = MODULE_URLS[m] || '#';
    return '<tr>' +
      '<td style="padding:10px 12px;border-bottom:1px solid #e9ecef;color:#0d1b2e;font-size:14px;">' + label + '</td>' +
      '<td style="padding:10px 12px;border-bottom:1px solid #e9ecef;text-align:center;">' +
        '<a href="' + url + '" style="display:inline-block;background:#ffd60a;color:#0d1b2e;font-weight:700;font-size:13px;padding:6px 16px;border-radius:6px;text-decoration:none;">Take Quiz →</a>' +
      '</td>' +
    '</tr>';
  }).join('');

  var modTable =
    '<table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e9ecef;border-radius:8px;overflow:hidden;margin:20px 0;">' +
    '<tr style="background:#0d1b2e;">' +
    '<th style="padding:10px 12px;color:#00c9a7;font-size:11px;text-transform:uppercase;letter-spacing:1px;text-align:left;">Outstanding Module</th>' +
    '<th style="padding:10px 12px;color:#00c9a7;font-size:11px;text-transform:uppercase;letter-spacing:1px;text-align:center;">Action</th>' +
    '</tr>' +
    moduleRows +
    '</table>';

  var content, subject;

  if (type === 'failed') {
    subject = 'Action Required: Retake Your HERO Knowledge Checks Before Kick-Off';
    content =
      '<p style="color:#495057;font-size:15px;line-height:1.7;">Hi ' + firstName + ',</p>' +
      '<p style="color:#495057;font-size:15px;line-height:1.7;">This is a reminder that you have attempted the following <strong>HERO Forecast Enrichment knowledge-check module(s)</strong> but have not yet achieved a passing score:</p>' +
      modTable +
      '<p style="color:#495057;font-size:15px;line-height:1.7;">Passing all modules is a prerequisite for your account to be enabled in the <strong>production version of HERO</strong> before the Kick-Off session. Please review the material and retake the quiz at your earliest convenience.</p>' +
      '<div style="background:#fff3cd;border-left:4px solid #ffd60a;border-radius:4px;padding:16px 20px;margin:24px 0;">' +
      '<p style="margin:0;color:#0d1b2e;font-size:14px;font-weight:700;">Course material</p>' +
      '<p style="margin:6px 0 0;color:#495057;font-size:14px;">The full training material is available in the ' +
      '<a href="' + MATERIAL_URL + '" style="color:#0d7a5f;font-weight:600;">Forecast Enrichment Programme SharePoint folder</a>. ' +
      'Review the relevant slides before retaking.</p>' +
      '</div>' +
      '<p style="color:#495057;font-size:15px;line-height:1.7;">If you have any questions, please reach out to your programme lead.</p>' +
      '<p style="color:#495057;font-size:14px;line-height:1.7;margin-top:28px;">Good luck — you can do it.<br><strong>HERO Tool Notifications</strong></p>';
  } else {
    // type === 'never' (default)
    subject = 'Action Required: Complete Your HERO Knowledge Checks Before Kick-Off';
    content =
      '<p style="color:#495057;font-size:15px;line-height:1.7;">Hi ' + firstName + ',</p>' +
      '<p style="color:#495057;font-size:15px;line-height:1.7;">This is a reminder that the following <strong>HERO Forecast Enrichment knowledge-check module(s)</strong> are still outstanding for you:</p>' +
      modTable +
      '<p style="color:#495057;font-size:15px;line-height:1.7;">Passing all modules is a prerequisite for your account to be enabled in the <strong>production version of HERO</strong> before the Kick-Off session.</p>' +
      '<div style="background:#e8f5f0;border-left:4px solid #00c9a7;border-radius:4px;padding:16px 20px;margin:24px 0;">' +
      '<p style="margin:0;color:#0d1b2e;font-size:14px;font-weight:700;">Start here — course material</p>' +
      '<p style="margin:6px 0 0;color:#495057;font-size:14px;">All training materials are available in the ' +
      '<a href="' + MATERIAL_URL + '" style="color:#0d7a5f;font-weight:600;">Forecast Enrichment Programme SharePoint folder</a>. ' +
      'Review the relevant module slides before taking the quiz.</p>' +
      '</div>' +
      '<div style="background:#fff3cd;border-left:4px solid #ffd60a;border-radius:4px;padding:16px 20px;margin:24px 0;">' +
      '<p style="margin:0;color:#0d1b2e;font-size:14px;font-weight:700;">Why this matters</p>' +
      '<p style="margin:6px 0 0;color:#495057;font-size:14px;">Each module ensures you have the knowledge to use HERO confidently and accurately. Completing them before Kick-Off means you can participate fully from day one.</p>' +
      '</div>' +
      '<p style="color:#495057;font-size:15px;line-height:1.7;">If you have any questions about the material or the process, please reach out to your programme lead directly.</p>' +
      '<p style="color:#495057;font-size:14px;line-height:1.7;margin-top:28px;">Good luck — you\'ve got this.<br><strong>HERO Tool Notifications</strong></p>';
  }

  var shell = '<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body style="margin:0;padding:0;background:#f0f4f8;font-family:Calibri,Arial,sans-serif;">' +
    '<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:32px 16px;">' +
    '<table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,.08);">' +
    '<tr><td style="background:#0d1b2e;padding:28px 32px;">' +
    '<p style="margin:0;color:#00c9a7;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:2px;">Forecast Enrichment Programme · HERO Deployment</p>' +
    '<h1 style="margin:8px 0 0;color:#ffffff;font-size:22px;font-weight:700;">Knowledge Check Reminder</h1>' +
    '</td></tr>' +
    '<tr><td style="padding:32px;">' + content + '</td></tr>' +
    '<tr><td style="background:#f8f9fa;padding:20px 32px;border-top:1px solid #e9ecef;">' +
    '<p style="margin:0;color:#6c757d;font-size:12px;">This is an automated message from the HERO Forecast Enrichment Programme. Please do not reply to this email.</p>' +
    '</td></tr>' +
    '</table></td></tr></table></body></html>';

  MailApp.sendEmail({ to: email, subject: subject, htmlBody: shell });
}

function sendReminderSummaryToRene(sent, failed) {
  if (!sent.length && !failed.length) return;

  var now = new Date();
  var dateStr = Utilities.formatDate(now, Session.getScriptTimeZone(), 'dd MMM yyyy HH:mm');

  var sentRows = sent.map(function(r) {
    var mods     = (r.modules || []).map(function(m) { return MODULE_LABELS[m] || m; }).join('<br>');
    var typeLabel = r.type === 'failed' ? 'Taken — not yet passed' : 'Never attempted';
    var typeColor = r.type === 'failed' ? '#FFC72C' : '#00c9a7';
    return '<tr style="border-bottom:1px solid #e9ecef;">' +
      '<td style="padding:9px 12px;font-size:14px;color:#0d1b2e;">' + r.name + '</td>' +
      '<td style="padding:9px 12px;font-size:14px;color:#495057;">' + r.email + '</td>' +
      '<td style="padding:9px 12px;font-size:13px;color:#495057;">' + mods + '</td>' +
      '<td style="padding:9px 12px;font-size:12px;font-weight:700;color:' + typeColor + ';">' + typeLabel + '</td>' +
    '</tr>';
  }).join('');

  var failedRows = failed.length ? failed.map(function(f) {
    return '<tr><td style="padding:9px 12px;color:#dc3545;font-size:14px;">' + f.email + '</td>' +
      '<td style="padding:9px 12px;color:#dc3545;font-size:14px;">' + f.error + '</td></tr>';
  }).join('') : '';

  var body =
    '<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body style="margin:0;padding:0;background:#f0f4f8;font-family:Calibri,Arial,sans-serif;">' +
    '<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:32px 16px;">' +
    '<table width="640" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,.08);">' +
    '<tr><td style="background:#0d1b2e;padding:24px 32px;">' +
    '<p style="margin:0;color:#00c9a7;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:2px;">Dashboard · Reminder Summary</p>' +
    '<h1 style="margin:8px 0 0;color:#fff;font-size:20px;font-weight:700;">Reminder Emails Sent — ' + dateStr + '</h1>' +
    '</td></tr>' +
    '<tr><td style="padding:28px 32px;">' +
    '<p style="color:#495057;font-size:15px;"><strong>' + sent.length + '</strong> reminder email' + (sent.length !== 1 ? 's' : '') + ' sent successfully.</p>' +
    '<table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e9ecef;border-radius:8px;overflow:hidden;margin:16px 0;">' +
    '<tr style="background:#0d1b2e;"><th style="padding:9px 12px;color:#00c9a7;font-size:11px;text-transform:uppercase;letter-spacing:1px;text-align:left;">Name</th>' +
    '<th style="padding:9px 12px;color:#00c9a7;font-size:11px;text-transform:uppercase;letter-spacing:1px;text-align:left;">Email</th>' +
    '<th style="padding:9px 12px;color:#00c9a7;font-size:11px;text-transform:uppercase;letter-spacing:1px;text-align:left;">Outstanding Modules</th>' +
    '<th style="padding:9px 12px;color:#00c9a7;font-size:11px;text-transform:uppercase;letter-spacing:1px;text-align:left;">Type</th></tr>' +
    sentRows +
    '</table>' +
    (failedRows ? '<p style="color:#dc3545;font-size:14px;margin-top:20px;"><strong>' + failed.length + ' failed to send:</strong></p>' +
      '<table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #f5c6cb;border-radius:8px;overflow:hidden;">' +
      '<tr style="background:#f8d7da;"><th style="padding:9px 12px;font-size:12px;text-align:left;">Email</th><th style="padding:9px 12px;font-size:12px;text-align:left;">Error</th></tr>' +
      failedRows + '</table>' : '') +
    '</td></tr>' +
    '<tr><td style="background:#f8f9fa;padding:16px 32px;border-top:1px solid #e9ecef;">' +
    '<p style="margin:0;color:#6c757d;font-size:12px;">Sent via HERO Tool Dashboard · Forecast Enrichment Programme</p>' +
    '</td></tr></table></td></tr></table></body></html>';

  MailApp.sendEmail({
    to: RENE_COPY_EMAIL,
    subject: '[HERO Dashboard] Reminder summary — ' + sent.length + ' email(s) sent on ' + dateStr,
    htmlBody: body
  });
}
